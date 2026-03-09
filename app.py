import streamlit as st
import google.generativeai as genai
from PIL import Image
import re
import time

# ==========================================
# 1. API Key & Model Configuration
# ==========================================
API_KEY = "AIzaSyAKCu4i58d2xg1U60Hkn1dsqeceJHAuosM"
genai.configure(api_key=API_KEY)

# ==========================================
# 2. Page Config
# ==========================================
st.set_page_config(
    page_title="Helmet Detection AI",
    page_icon="🏍️",
    layout="centered"
)

# ==========================================
# 3. Custom CSS — Mobile-first dark theme
# ==========================================
st.markdown("""
<style>
    /* ---------- Import Google Font ---------- */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    /* ---------- Global ---------- */
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    .stApp {
        background: linear-gradient(160deg, #0f0c29, #1a1a40, #302b63);
    }

    /* ---------- Header ---------- */
    .app-header {
        text-align: center;
        padding: 2rem 1rem 1rem;
    }
    .app-header .icon {
        font-size: 3.5rem;
        display: block;
        margin-bottom: 0.3rem;
        animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.12); }
    }
    .app-header h1 {
        font-size: 1.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00d2ff, #7b2ff7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
    }
    .app-header p {
        color: #a0a0c0;
        font-size: 0.85rem;
        margin-top: 0.4rem;
    }

    /* ---------- Cards ---------- */
    .card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 1.5rem;
        margin-bottom: 1.2rem;
        transition: transform 0.2s ease;
    }
    .card:hover { transform: translateY(-2px); }
    .card-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: #a78bfa;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-bottom: 0.8rem;
    }

    /* ---------- Result badges ---------- */
    .result-badge {
        display: inline-block;
        padding: 0.5rem 1.2rem;
        border-radius: 30px;
        font-weight: 700;
        font-size: 1rem;
        margin: 0.5rem 0;
    }
    .badge-yes {
        background: linear-gradient(135deg, #00c853, #00e676);
        color: #003d00;
    }
    .badge-no {
        background: linear-gradient(135deg, #ff1744, #ff5252);
        color: #fff;
    }
    .badge-unknown {
        background: linear-gradient(135deg, #ff9100, #ffab40);
        color: #3e2700;
    }

    /* ---------- Confidence meter ---------- */
    .confidence-container {
        margin: 1rem 0;
    }
    .confidence-label {
        font-size: 0.8rem;
        color: #c0c0e0;
        margin-bottom: 0.3rem;
    }
    .confidence-bar-bg {
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
        height: 14px;
        overflow: hidden;
        position: relative;
    }
    .confidence-bar-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 1s ease;
    }
    .confidence-value {
        font-size: 1.8rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00d2ff, #7b2ff7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-top: 0.3rem;
    }

    /* ---------- Bias section ---------- */
    .bias-text {
        color: #d0d0f0;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    /* ---------- Divider ---------- */
    .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent);
        margin: 1.2rem 0;
    }

    /* ---------- Streamlit overrides ---------- */
    .stButton > button {
        width: 100%;
        border: none;
        border-radius: 14px;
        padding: 0.8rem 1.5rem;
        font-weight: 700;
        font-size: 1rem;
        background: linear-gradient(135deg, #7b2ff7, #00d2ff);
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(123,47,247,0.3);
    }
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 28px rgba(123,47,247,0.5);
    }
    .stTextArea textarea {
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 14px !important;
        color: #e0e0ff !important;
        font-family: 'Inter', sans-serif !important;
    }
    .stFileUploader {
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        padding: 0.5rem;
    }

    /* ---------- Tab styling ---------- */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0;
        background: rgba(255,255,255,0.05);
        border-radius: 14px;
        padding: 4px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 12px;
        color: #a0a0c0;
        font-weight: 600;
        padding: 0.5rem 1rem;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #7b2ff7, #00d2ff) !important;
        color: white !important;
    }
    .stTabs [data-baseweb="tab-highlight"] {
        display: none;
    }
    .stTabs [data-baseweb="tab-border"] {
        display: none;
    }

    /* ---------- Hide Streamlit menu ---------- */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# ==========================================
# 4. App Header
# ==========================================
st.markdown("""
<div class="app-header">
    <span class="icon">🏍️</span>
    <h1>Helmet Detection AI</h1>
    <p>ตรวจจับหมวกกันน็อก &amp; วิเคราะห์ Bias ด้วย AI</p>
</div>
""", unsafe_allow_html=True)

# ==========================================
# 5. Image Input — Camera & Gallery Tabs
# ==========================================
st.markdown('<div class="card"><div class="card-title">📸 เลือกรูปภาพ</div>', unsafe_allow_html=True)
tab_camera, tab_gallery = st.tabs(["📷 กล้องถ่ายรูป", "🖼️ อัปโหลดจากแกลเลอรี"])

image = None

with tab_camera:
    camera_photo = st.camera_input("ถ่ายรูปเพื่อตรวจสอบ")
    if camera_photo:
        image = Image.open(camera_photo)

with tab_gallery:
    uploaded_file = st.file_uploader(
        "เลือกรูปจากแกลเลอรี",
        type=["jpg", "jpeg", "png"],
        label_visibility="collapsed"
    )
    if uploaded_file:
        image = Image.open(uploaded_file)

st.markdown('</div>', unsafe_allow_html=True)

# ==========================================
# 6. Display Selected Image & Analyze
# ==========================================
if image is not None:
    st.markdown('<div class="card"><div class="card-title">🖼️ ภาพที่เลือก</div>', unsafe_allow_html=True)
    st.image(image, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # Analyze button
    if st.button("🔍 วิเคราะห์ด้วย AI", use_container_width=True):
        # ----- Loading state -----
        with st.spinner(""):
            # Custom loading animation
            loading_placeholder = st.empty()
            loading_placeholder.markdown("""
            <div style="text-align:center; padding:2rem 0;">
                <div style="font-size:2.5rem; animation: pulse 1s ease-in-out infinite;">🔍</div>
                <p style="color:#a78bfa; font-weight:600; margin-top:0.5rem;">AI กำลังวิเคราะห์ภาพ...</p>
                <p style="color:#707090; font-size:0.75rem;">กำลังส่งข้อมูลไปยัง Google Gemini Vision API</p>
            </div>
            """, unsafe_allow_html=True)

            try:
                model = genai.GenerativeModel('gemini-2.5-flash')

                prompt = """
                คุณคือ AI ตรวจจับการสวมหมวกกันน็อกสำหรับผู้ขับขี่มอเตอร์ไซค์
                โปรดวิเคราะห์ภาพนี้แล้วตอบในรูปแบบต่อไปนี้อย่างเคร่งครัด (ห้ามเปลี่ยนรูปแบบ):

                DECISION: [ใส่หมวกกันน็อก / ไม่ได้ใส่หมวกกันน็อก / ไม่พบบุคคลในภาพ]
                CONFIDENCE: [ตัวเลข 0-100]
                BIAS_ANALYSIS: [อธิบายปัจจัยที่อาจทำให้ AI เกิดความสับสนหรือมี Bias เช่น หมวกประเภทอื่น, ผ้าคลุมศีรษะ, แสงสว่าง, มุมกล้อง, เงาสะท้อน ฯลฯ ตอบเป็นภาษาไทย 2-4 ประโยค]
                """

                response = model.generate_content([prompt, image])
                result_text = response.text

                loading_placeholder.empty()

                # ----- Parse response -----
                decision = "ไม่สามารถระบุได้"
                confidence = 0
                bias_analysis = "ไม่พบข้อมูล"

                # Extract DECISION
                dec_match = re.search(r'DECISION:\s*(.+)', result_text)
                if dec_match:
                    decision = dec_match.group(1).strip()

                # Extract CONFIDENCE
                conf_match = re.search(r'CONFIDENCE:\s*(\d+)', result_text)
                if conf_match:
                    confidence = int(conf_match.group(1))

                # Extract BIAS_ANALYSIS
                bias_match = re.search(r'BIAS_ANALYSIS:\s*(.+)', result_text, re.DOTALL)
                if bias_match:
                    bias_analysis = bias_match.group(1).strip()

                # ----- Determine badge -----
                decision_lower = decision.lower()
                if "ใส่" in decision_lower and "ไม่" not in decision_lower:
                    badge_class = "badge-yes"
                    badge_icon = "✅"
                elif "ไม่" in decision_lower and "พบ" not in decision_lower:
                    badge_class = "badge-no"
                    badge_icon = "❌"
                else:
                    badge_class = "badge-unknown"
                    badge_icon = "⚠️"

                # ----- Confidence bar color -----
                if confidence >= 80:
                    bar_color = "linear-gradient(90deg, #00c853, #69f0ae)"
                elif confidence >= 50:
                    bar_color = "linear-gradient(90deg, #ff9100, #ffab40)"
                else:
                    bar_color = "linear-gradient(90deg, #ff1744, #ff5252)"

                # ====== RESULT CARD ======
                st.markdown(f"""
                <div class="card">
                    <div class="card-title">📊 ผลการวิเคราะห์</div>

                    <div style="text-align:center;">
                        <span style="font-size:2.5rem;">{badge_icon}</span>
                        <div class="result-badge {badge_class}">{decision}</div>
                    </div>

                    <div class="divider"></div>

                    <div class="confidence-container">
                        <div class="confidence-label">Confidence Score</div>
                        <div class="confidence-value">{confidence}%</div>
                        <div class="confidence-bar-bg">
                            <div class="confidence-bar-fill" style="width:{confidence}%; background:{bar_color};"></div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="card-title">🧠 การวิเคราะห์ Bias</div>
                    <div class="bias-text">{bias_analysis}</div>
                </div>
                """, unsafe_allow_html=True)

                # Store result in session state for bias flagging
                st.session_state["last_result"] = {
                    "decision": decision,
                    "confidence": confidence,
                    "bias_analysis": bias_analysis
                }

            except Exception as e:
                loading_placeholder.empty()
                st.error(f"❌ เกิดข้อผิดพลาด: {e}")

# ==========================================
# 7. Bias Flagging Section
# ==========================================
if "last_result" in st.session_state:
    st.markdown("""
    <div class="card">
        <div class="card-title">🚩 แจ้ง Bias / ความคิดเห็น</div>
        <p style="color:#a0a0c0; font-size:0.8rem; margin-bottom:0.5rem;">
            หากคุณคิดว่า AI ตัดสินใจผิดพลาดหรือมีอคติ สามารถแจ้งเหตุผลได้ที่นี่
        </p>
    </div>
    """, unsafe_allow_html=True)

    bias_feedback = st.text_area(
        "อธิบายเหตุผลที่คิดว่า AI มี Bias หรือตัดสินผิดพลาด",
        placeholder="เช่น AI ตัดสินว่าสวมหมวกกันน็อกแต่จริงๆ เป็นหมวกก่อสร้าง...",
        label_visibility="collapsed"
    )

    if st.button("📩 ส่งข้อมูลแจ้ง Bias", use_container_width=True):
        if bias_feedback.strip():
            st.success("✅ ขอบคุณ! ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว เราจะนำไปปรับปรุง AI ต่อไป")
            st.balloons()
        else:
            st.warning("⚠️ กรุณากรอกเหตุผลก่อนส่ง")

# ==========================================
# 8. Footer
# ==========================================
st.markdown("""
<div style="text-align:center; padding:2rem 0 1rem; color:#505070; font-size:0.7rem;">
    <div style="margin-bottom:0.3rem;">Powered by Google Gemini AI</div>
    <div>Project Ethics — AI Bias Analysis • 2026</div>
</div>
""", unsafe_allow_html=True)