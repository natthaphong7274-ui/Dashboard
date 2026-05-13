# บันทึกการทำงาน Phase 1

Branch: `codex/phase-1`

Phase นี้ต่อยอดจาก `codex/phase-0` โดยเน้นงาน Security และการกันระบบพังตามแผนงานหลัก

## สิ่งที่ทำ

- เพิ่ม helper กลางฝั่ง server สำหรับตรวจสิทธิ์:
  - `_requireSession`
  - `_requireRole`
  - `_canAccessZone`
  - `_canAccessRow`
  - `_requireRowAccess`
- บังคับให้การโหลดข้อมูลหลักต้องมี session ที่ถูกต้อง
- กรองข้อมูล Tracking และ Growth Tracking ตาม role/zone
- กันไม่ให้ BD/AM บันทึก Tracking หรือ Growth Tracking นอก zone ที่มีสิทธิ์
- คงสิทธิ์ Director ให้เห็นและจัดการข้อมูลได้ตามเดิม
- เพิ่ม audit log สำหรับ action ที่ถูกปฏิเสธด้วย `PERMISSION_DENIED`
- ปรับ action ฝั่ง Settings ที่เป็น Director-only ให้ใช้ permission guard กลาง
- ปรับการ escape ข้อมูลในตารางสำคัญเพื่อลดความเสี่ยง XSS
- เพิ่ม guard ตอน export CSV ให้ต้องมี session ก่อน export
- เพิ่ม metadata ลงใน CSV export:
  - `Internal Use Only`
  - ผู้ export
  - role
  - scope
  - เวลาที่สร้างไฟล์
- escape ค่าใน CSV ให้ปลอดภัยกับเครื่องหมาย quote
- เปลี่ยนการสร้าง token จาก `Math.random()` เป็น `Utilities.getUuid()`
- ตรวจ format ของ token ก่อนอ่าน session จาก ScriptProperties
- log token ที่รูปแบบผิดเป็น `INVALID_TOKEN_FORMAT`

## ไฟล์หลักที่แก้

- `src/Auth.js`
- `src/DataReader.js`
- `src/Settings.js`
- `src/Tracking.js`
- `src/Scripts.html`

## สิ่งที่ไม่ได้ทำใน Phase นี้

- ไม่แก้โครงสร้าง Google Sheet
- ไม่สร้างระบบ Tracking, Target, Login หรือ New Agent ใหม่
- ไม่ทำ AM/Director workspace
- ไม่ทำ Action Center
- ไม่ทำ report/export ชุดใหม่ นอกจากเสริม CSV export เดิม

## การตรวจสอบที่ทำแล้ว

- ตรวจ syntax ไฟล์ server-side ที่แก้
- ตรวจ script blocks ทั้งหมดใน `src/Scripts.html`
- รัน `git diff --check`
- อัปขึ้น Apps Script dev แล้ว

## จุดที่ควรทดสอบบน dev

- Login ด้วย Director, AM และ BD
- BD/AM เห็นข้อมูลเฉพาะ zone ตัวเอง
- BD/AM บันทึก Tracking นอก zone ไม่ได้
- Director ยังใช้งาน target, threshold และ user unlock ได้
- Export CSV แล้วมี metadata ด้านบนไฟล์
- ใส่ข้อความลักษณะ `<script>alert(1)</script>` ใน note แล้วไม่ execute
