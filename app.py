import streamlit as st
import google.generativeai as genai
from PIL import Image

# 1. ใส่ API Key ของคุณตรงนี้ (รับฟรีที่ Google AI Studio)
API_KEY = "AIzaSyAKCu4i58d2xg1U60Hkn1dsqeceJHAuosM" 
genai.configure(api_key=API_KEY)

# 2. ตั้งค่าหน้าเว็บ
st.set_page_config(page_title="Helmet Detection AI", page_icon="🏍️")
st.title("🏍️ AI ตรวจจับหมวกกันน็อก & วิเคราะห์ Bias")
st.write("อัปโหลดรูปภาพเพื่อให้ AI ช่วยตัดสินใจว่ามีการใส่หมวกกันน็อกหรือไม่ พร้อมวิเคราะห์อคติ (Bias) ที่อาจเกิดขึ้น")

# 3. ส่วนอัปโหลดรูปภาพ
uploaded_file = st.file_uploader("เลือกรูปภาพ...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # แสดงรูปที่อัปโหลด
    image = Image.open(uploaded_file)
    st.image(image, caption="ภาพที่กำลังตรวจสอบ", use_container_width=True)

    # 4. ปุ่มกดให้ AI เริ่มทำงาน
    if st.button("🔍 ตรวจสอบด้วย AI"):
        with st.spinner("AI กำลังวิเคราะห์..."):
            try:
                # เรียกใช้โมเดล Vision
                model = genai.GenerativeModel('gemini-2.5-flash')
                
                # Prompt ที่สั่งให้ AI วิเคราะห์ตามโจทย์อาจารย์
                prompt = """
                คุณคือ AI ตรวจจับการสวมหมวกกันน็อกสำหรับผู้ขับขี่มอเตอร์ไซค์ 
                โปรดวิเคราะห์ภาพนี้และตอบคำถาม 3 ข้อดังนี้:
                1. ผลการตัดสินใจ: บุคคลในภาพสวม 'หมวกกันน็อกมอเตอร์ไซค์' หรือไม่? (ตอบแค่ ใส่ / ไม่ได้ใส่ / ไม่พบคน)
                2. ความมั่นใจ: ให้คะแนนความมั่นใจกี่เปอร์เซ็นต์? (0-100%)
                3. การวิเคราะห์ Bias: มีปัจจัยอะไรในภาพนี้ที่อาจทำให้ AI อย่างคุณเกิดความสับสนหรือมี Bias ได้บ้าง? (เช่น หมวกประเภทอื่นอย่างหมวกก่อสร้าง/หมวกแก๊ป, การโพกหัว/ฮิญาบ, แสงสว่าง, มุมกล้อง หรือเงาสะท้อน)
                """
                
                response = model.generate_content([prompt, image])
                
                # แสดงผลลัพธ์
                st.success("วิเคราะห์เสร็จสิ้น!")
                st.markdown("### 📊 ผลการตัดสินใจจาก AI:")
                st.write(response.text)
                
            except Exception as e:
                st.error(f"เกิดข้อผิดพลาด: {e}")