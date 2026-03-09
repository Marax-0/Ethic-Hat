"""
Helmet Detection API — Backend Server
FastAPI + Google Gemini Vision API
"""

import os
import re
import json
import base64
import datetime
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai
import uvicorn

# ==========================================
# Config
# ==========================================
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

genai.configure(api_key=API_KEY)

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(title="Helmet Detection API")

# CORS — allow frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
FRONTEND_DIR = Path(__file__).parent / "frontend"
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

BIAS_REPORTS_FILE = Path(__file__).parent / "bias_reports.json"


# ==========================================
# Routes
# ==========================================
@app.get("/")
async def serve_index():
    """Serve the frontend index.html"""
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Receive an image, send to Gemini Vision API, return structured result.
    """
    try:
        # Read image
        contents = await file.read()
        image = Image.open(BytesIO(contents))

        # Call Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = """
        คุณคือ AI ตรวจจับการสวมหมวกกันน็อกสำหรับผู้ขับขี่มอเตอร์ไซค์
        โปรดวิเคราะห์ภาพนี้แล้วตอบในรูปแบบต่อไปนี้อย่างเคร่งครัด (ห้ามเปลี่ยนรูปแบบ):

        DECISION: [ใส่หมวกกันน็อก / ไม่ได้ใส่หมวกกันน็อก / ไม่พบบุคคลในภาพ]
        CONFIDENCE: [ตัวเลข 0-100]
        BIAS_ANALYSIS: [อธิบายปัจจัยที่อาจทำให้ AI เกิดความสับสนหรือมี Bias เช่น หมวกประเภทอื่น, ผ้าคลุมศีรษะ, แสงสว่าง, มุมกล้อง, เงาสะท้อน ฯลฯ ตอบเป็นภาษาไทย 2-4 ประโยค]
        """

        response = model.generate_content([prompt, image])
        result_text = response.text

        # Parse response
        decision = "ไม่สามารถระบุได้"
        confidence = 0
        bias_analysis = "ไม่พบข้อมูล"

        dec_match = re.search(r"DECISION:\s*(.+)", result_text)
        if dec_match:
            decision = dec_match.group(1).strip()

        conf_match = re.search(r"CONFIDENCE:\s*(\d+)", result_text)
        if conf_match:
            confidence = int(conf_match.group(1))

        bias_match = re.search(r"BIAS_ANALYSIS:\s*(.+)", result_text, re.DOTALL)
        if bias_match:
            bias_analysis = bias_match.group(1).strip()

        # Determine badge type
        decision_lower = decision.lower()
        if "ใส่" in decision_lower and "ไม่" not in decision_lower:
            badge = "yes"
        elif "ไม่" in decision_lower and "พบ" not in decision_lower:
            badge = "no"
        else:
            badge = "unknown"

        return {
            "success": True,
            "decision": decision,
            "confidence": confidence,
            "bias_analysis": bias_analysis,
            "badge": badge,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/report-bias")
async def report_bias(
    decision: str = Form(""),
    confidence: int = Form(0),
    feedback: str = Form(...),
):
    """
    Save user's bias feedback to a JSON file.
    """
    if not feedback.strip():
        raise HTTPException(status_code=400, detail="กรุณากรอกเหตุผลก่อนส่ง")

    report = {
        "timestamp": datetime.datetime.now().isoformat(),
        "decision": decision,
        "confidence": confidence,
        "feedback": feedback.strip(),
    }

    # Load existing reports
    reports = []
    if BIAS_REPORTS_FILE.exists():
        try:
            reports = json.loads(BIAS_REPORTS_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, Exception):
            reports = []

    reports.append(report)
    BIAS_REPORTS_FILE.write_text(
        json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return {"success": True, "message": "ขอบคุณ! ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว"}


# ==========================================
# Run
# ==========================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
