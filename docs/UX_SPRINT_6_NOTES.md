# UX Sprint 6: Role-Based Display & Permissions

**สถานะ:** ทำแล้ว, รอทดสอบ
**Branch:** `UX_Sprint-6`

## สรุป
จัดการสิทธิ์การเข้าถึงข้อมูลและเครื่องมือตามตำแหน่ง (Role-based UI) โดยใช้แนวคิด "Show but Disable" (Muted Gray) แทนการซ่อนปุ่ม เพื่อให้ผู้ใช้ระดับปฏิบัติการรู้ว่าระบบมีฟีเจอร์นี้อยู่ แต่เป็นสิทธิ์เฉพาะ Director เท่านั้น

## สิ่งที่ปรับปรุง (Changelog)

### 1. ระบบ Muted Gray Role-based (.disabled-role)
- สร้าง CSS class `.disabled-role` (ปุ่มซีดลง 50%, กลายเป็นสีขาวดำ, และคลิกไม่ได้ด้วย `pointer-events: none`) 

### 2. นโยบายการแสดงผลใหม่ (Global Role Rules)
- **เมนู Report Center:** ให้ **ทุกคน** (BD/AM/Director) สามารถกดเข้าไปดูหน้าต่าง Report Center เพื่อดู Summary รายเดือน, Tracking, และ Ranking ได้
- **ฟังก์ชัน Export / โหลดข้อมูลดิบ:** ค้นหาปุ่มทุกปุ่มในระบบที่มีคำสั่ง "Export" (เช่น `exportCSV`, `exportTrackingReport`, `exportWeeklySummary`) แล้วสั่งให้แสดงเป็น **"สีเทาจางๆ (Muted Gray)"** อัตโนมัติหากผู้ใช้ไม่ใช่ Director
- **แท็บเปรียบเทียบ (Compare):** เปิดให้ใช้ได้ทุกคน (BD/AM/Director) ตามข้อตกลง เพื่อให้ทุกคนได้เห็นแนวโน้มผลงานของตนเอง

## ไฟล์ที่ถูกแก้ไข
- `src/Styles.html` (เพิ่มคลาส `.disabled-role`)
- `src/Scripts.html` (อัปเดตฟังก์ชัน `_applyGlobalRoleRules` สแกนปุ่ม Export และจัดการสิทธิ์แบบอัตโนมัติเมื่อระบบเริ่มทำงาน)

## Checklist สำหรับตรวจสอบ (QA)
- [ ] ล็อกอินด้วยบัญชี `BD` หรือ `AM` 
- [ ] กดเข้าไปที่ Report Center เมนูต้องกดได้ และหน้าจอแสดงผลได้ปกติ
- [ ] เลื่อนไปดูปุ่ม Export (ทั้งในหน้า รายการลูกค้า และในแท็บ Export ของ Report Center) **ทุกปุ่มต้องเป็นสีเทา กดไม่ได้**
- [ ] แท็บ "⚖️ เปรียบเทียบ" ในหน้าภาพรวม ยังคงสามารถกดเข้าไปดูได้ปกติ
- [ ] สลับล็อกอินเป็น `Director` ปุ่ม Export ทั้งหมดจะต้องกลับมามีสีสันและกดใช้งานได้ปกติ
