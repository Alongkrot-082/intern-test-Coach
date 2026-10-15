# Project Task Access

แอปตัวอย่างจัดการ Task พร้อมการแบ่งสิทธิ์ Admin และ Employee ตามโจทย์ internship-test-v2

## วิธีรัน

ต้องใช้ Node.js 20 ขึ้นไป

```bash
cd section-3
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติคือ `http://localhost:5173`)

## บัญชีทดสอบ

ระบบเป็น Mock API ที่ทำงานใน browser จึงไม่ต้องใช้รหัสผ่าน

| Username | Role | ความสามารถ |
| --- | --- | --- |
| `admin` | Admin | ดู Task ทั้งหมดและสร้าง Task ให้ Employee |
| `employee` | Employee | ดู Task ของตนเองและเปลี่ยน To Do เป็น Done |
| `employee2` | Employee | ดู Task ของตนเองและเปลี่ยน To Do เป็น Done |

กรอก username ในหน้า Login; username ที่ไม่มีในระบบจะแสดงข้อผิดพลาด

## Tech stack

- JavaScript + React: แยกหน้าจอและ state ของ session/task เป็น component ได้ตรงกับแอปขนาดเล็ก
- Vite: มี dev server พร้อมใช้งานโดยไม่ต้องตั้งค่า bundler เพิ่ม
- React Router: จัด route ตาม role และทำ redirect ใน guard โดยตรง
- Mock API (`Promise` + `setTimeout`): จำลอง latency, loading และ error โดยยังไม่ต้องมี backend

## โครงสร้าง

- `section-1/`: flowchart และบันทึกการตัดสินใจ
- `section-2/`: PostgreSQL schema สำหรับระบบจริง
- `section-3/`: แอป React ที่ใช้ mock data
- `section-4/`: โค้ด backend/frontend ที่แก้แล้วและรายการบั๊กของโจทย์

ข้อมูล mock จะ reset เมื่อ reload หน้าเว็บ; ไม่ได้จัดเก็บในฐานข้อมูลจริง
