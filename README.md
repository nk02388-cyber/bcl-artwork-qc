# BCL Artwork QC — OpenAI

หน้าเว็บตรวจ Artwork ภาษาไทย พร้อมเทียบภาพ เทียบข้อความ Checklist 16 ข้อ และประวัติที่เก็บในเบราว์เซอร์

## เปิดใช้งาน

หน้าเว็บ GitHub Pages ใช้เทียบภาพ/ข้อความและ Checklist ได้ทันที ส่วน AI ต้องตั้งเซิร์ฟเวอร์ก่อน

1. Import repository นี้เข้า Vercel (Framework: Other) โดยใช้ `vercel.json` ที่ให้ไว้
2. ตั้ง Environment Variables ที่ Vercel:
   - `OPENAI_API_KEY`: คีย์ OpenAI ของบัญชีที่เปิดใช้งาน API billing
   - `APP_ACCESS_TOKEN`: ตั้งรหัสเข้าใช้ AI ที่ยาวและคาดเดายาก แล้วแจ้งเฉพาะผู้ใช้งาน
   - `ALLOWED_ORIGIN`: `https://nk02388-cyber.github.io`
   - `OPENAI_MODEL`: ไม่ระบุจะใช้ `gpt-4.1-mini`
   - `OPENAI_DETAIL_MODEL`: ไม่ระบุจะใช้ `gpt-4.1`
3. Deploy / Redeploy หลังตั้งค่า เปิด URL Vercel แล้วตรวจว่าเซิร์ฟเวอร์พร้อม
4. ที่หน้า GitHub Pages กรอก URL Vercel หลัก (เช่น `https://your-project.vercel.app`) และรหัสเข้าใช้ AI กดเชื่อมต่อ
5. เลือกภาพใหม่ในช่อง B และต้นฉบับ A หากมี แล้วกดให้ AI ตรวจ artwork

ห้ามใส่ OpenAI API Key ลง HTML, repository หรือช่องรหัสเข้าใช้ AI คีย์อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น รหัสเข้าใช้ AI ไม่ถูกบันทึกลง localStorage

## รันบนเครื่อง (Node.js 22.9 ขึ้นไป)

คัดลอก `.env.example` เป็น `.env` แล้วตั้งค่าบนเครื่อง จากนั้นรัน `npm start` และเปิด `http://127.0.0.1:8765` ทดสอบด้วย `npm test` ไม่ต้องติดตั้ง dependency

## ขอบเขต

- เมื่อกดตรวจ ภาพและข้อความต้นฉบับจะส่งไป OpenAI มีค่าบริการตามบัญชี API
- PDF ตรวจเฉพาะหน้าที่เลือก ภาพย่อด้านยาวสูงสุด 1800 px และส่งภาพขยายช่วยอ่าน รวมไม่เกิน 6 ภาพ / payload 4 MB หากตัวอักษรเล็กเกินไปควรแยกงาน
- ผล AI เป็นข้อเสนอแนะ ไม่ใช่การยืนยันกับฐานข้อมูล อย. หรือผลรับรองข้อกฎหมาย ต้องตรวจของจริงก่อนสั่งพิมพ์
- ประวัติอยู่ในเบราว์เซอร์เดิม ไม่ซิงก์ร่วมกับทีม
- การหยุดรอผลจะยกเลิกคำขอฝั่งเว็บ/เซิร์ฟเวอร์ แต่อาจยังมีค่าใช้จ่ายจากงานที่ OpenAI ประมวลผลไปแล้ว
- รหัสร่วมเป็นการจำกัดการใช้ขั้นต้น หากต้องการบัญชีผู้ใช้หรือข้อจำกัดโควตารายคนให้เพิ่มระบบยืนยันตัวตนก่อนใช้งานวงกว้าง ตั้งวงเงิน/แจ้งเตือนการใช้ API ที่บัญชี OpenAI
- ไลบรารีเทียบข้อความ, PDF และฟอนต์โหลดจาก CDN ต้องใช้อินเทอร์เน็ต

เอกสาร: [OpenAI Vision](https://developers.openai.com/api/docs/guides/images-vision), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
