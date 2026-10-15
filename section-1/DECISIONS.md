# Decision Log

## D1: จะเก็บข้อมูลผู้ใช้ที่ Login ไว้ที่ไหน
- ทางเลือกที่คิดไว้: (A) React Context (B) Redux/Zustand (C) ส่ง props ต่อกัน
- เลือก: A — Context
- เพราะ: session มีผู้ใช้และ token ชุดเดียวที่หลาย route ต้องอ่านและเปลี่ยนเฉพาะตอน login/logout จึงใช้ Context โดยไม่เพิ่ม dependency
- ข้อเสียของ A ที่ยอมรับ: เมื่อ auth state เปลี่ยน component ที่อ่าน Context จะ render ใหม่; ขนาดแอปนี้ยังไม่มี state ใหญ่พอให้ต้องเพิ่ม store

## D2: จะทำ routing และจำกัด route ตาม role อย่างไร
- ทางเลือกที่คิดไว้: (A) ตรวจ role ในทุกหน้า (B) ใช้ route guard กลาง (C) ซ่อนลิงก์อย่างเดียว
- เลือก: B — React Router guard
- เพราะ: guard ใช้ซ้ำได้และครอบคลุมการเปิด URL โดยตรง ไม่พึ่งเพียงการซ่อนเมนู
- ข้อเสียของ B ที่ยอมรับ: ต้องจัดการ redirect state และต้องทำ authorization ซ้ำที่ backend จริง เพราะ client guard ไม่ใช่ขอบเขตความปลอดภัย

## D3: ออกแบบความสัมพันธ์ Task กับผู้รับผิดชอบอย่างไร
- ทางเลือกที่คิดไว้: (A) เก็บชื่อผู้รับผิดชอบเป็น text ใน task (B) เก็บ `assigned_to` เป็น FK ไป users (C) เก็บรายชื่อเป็น JSON
- เลือก: B — FK ไป `users.id`
- เพราะ: ป้องกันการอ้างถึงบัญชีที่ไม่มีอยู่และค้น Task ของ Employee ด้วย index ได้
- ข้อเสียของ B ที่ยอมรับ: การอ่านชื่อผู้รับผิดชอบต้อง join ตาราง และการลบบัญชีต้องกำหนดนโยบาย FK ให้ชัด

## D4: จะจัดการการเรียก API จำลองและสถานะ loading/error อย่างไร
- ทางเลือกที่คิดไว้: (A) เขียน timeout ในแต่ละ component (B) รวมไว้ใน mock API module (C) ใช้ service worker
- เลือก: B — mock API module
- เพราะ: รวม latency, validation และกฎสิทธิ์ไว้จุดเดียว ทำให้หน้า UI ทดสอบ success/error ผ่าน interface เดียวกัน
- ข้อเสียของ B ที่ยอมรับ: state อยู่ในหน่วยความจำและ reset เมื่อ reload จึงไม่ทดแทน backend หรือ persistence จริง

## D5: จะอัปเดตหน้าหลังสร้าง/เปลี่ยน Task อย่างไร
- ทางเลือกที่คิดไว้: (A) refresh ทั้งหน้า (B) ปรับ React state จากผล API (C) เพิ่ม state library
- เลือก: B — ใช้ผลตอบกลับจาก mock API ปรับ state
- เพราะ: UI ตอบสนองทันทีและไม่มี request โหลดซ้ำที่ไม่จำเป็น โดยยังแสดง error ได้เมื่อ API ปฏิเสธ
- ข้อเสียของ B ที่ยอมรับ: หากมีหลาย client พร้อมกันจะไม่มี realtime sync; ระบบจริงควร refetch หรือใช้ event/push เมื่อจำเป็น

## การใช้ AI

ใช้ AI ช่วยสรุปข้อกำหนด วางโครงเอกสาร และตรวจ edge cases ของ role guard กับการเปลี่ยนสถานะ  
ตรวจและปรับโค้ด/เอกสารให้ตรงกับข้อกำหนดก่อนส่ง และควรอธิบายการตัดสินใจแต่ละข้อได้
