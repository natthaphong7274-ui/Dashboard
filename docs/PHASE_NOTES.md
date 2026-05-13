# บันทึกการทำงาน Phase 0

Branch: `codex/phase-0`

Phase นี้เป็นงานวางฐานให้ Dashboard แสดงสถานะได้ชัดเจนขึ้น และเตรียม watermark สำหรับงาน security ใน phase ถัดไป

## สิ่งที่ทำ

- เพิ่ม helper กลางฝั่ง frontend สำหรับสถานะ UI:
  - `renderLoading(target, msg)`
  - `renderEmpty(target, msg)`
  - `renderError(target, msg)`
- เริ่มแทนที่ loading/error HTML แบบ inline ใน flow หลัก
- เพิ่ม container สำหรับ dashboard watermark ใน `Body.html`
- เพิ่ม style สำหรับ loading, empty, error และ watermark ใน `Styles.html`
- เพิ่ม logic แสดง watermark หลัง login หรือ session ตรวจผ่าน
- watermark แสดงข้อมูล:
  - `Internal Use Only`
  - username/display name
  - role
  - timestamp
- อัปเดต timestamp ของ watermark ทุก 1 นาที
- ซ่อน watermark เมื่อ logout หรือ session หมดอายุ
- เริ่มใช้ UI state helpers กับ `loadData()` และ `renderHome()`

## ไฟล์หลักที่แก้

- `src/Scripts.html`
- `src/Body.html`
- `src/Styles.html`

## สิ่งที่ไม่ได้ทำใน Phase นี้

- ไม่แก้ business logic หลัก
- ไม่แก้ permission guard ฝั่ง server
- ไม่แก้ Tracking/Target/Login logic
- ไม่แก้โครงสร้าง Google Sheet
- ไม่ทำ Action Center หรือ Target Progress ใหม่

## การตรวจสอบที่ทำแล้ว

- ตรวจ script blocks ทั้งหมดใน `src/Scripts.html`
- รัน `git diff --check`

## จุดที่ควรทดสอบบน dev

- Login แล้ว watermark แสดงที่มุมขวาล่าง
- timestamp ใน watermark อัปเดตได้
- Logout แล้ว watermark หาย
- กรณีโหลดข้อมูลไม่สำเร็จมี error state และปุ่ม retry
- กรณีไม่มีข้อมูลมี empty state แทนหน้าว่าง
