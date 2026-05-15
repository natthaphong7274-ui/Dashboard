# UX Sprint 7: CSS Refactoring & Theme Sync

**สถานะ:** ทำแล้ว
**Branch:** `UX_Sprint-7`

## สรุป
ทำการ Refactor CSS ทั้งโปรเจกต์ เพื่อแก้ไขปัญหา Theme Drift และจัดระเบียบ Inline Styles ที่ซ้ำซ้อนให้เป็น Class กลางตามหลัก "Single Source of Truth" 

## สิ่งที่ปรับปรุง (Changelog)

### 1. Global Color Theme Sync (แก้ไข Hardcoded Colors)
- สแกนและแทนที่รหัสสีที่ถูก Hardcoded (เช่น `#003f5c`, `#16a34a`, `#dc2626`) ใน `Body.html` และ `Scripts.html` ให้เปลี่ยนไปใช้ CSS Variables ของระบบทั้งหมด
- **การเปลี่ยนแปลงที่ได้:**
  - `var(--pr)` (Deep Navy) แทน `#003F5C`
  - `var(--ac)` (Teal) แทน `#009B9B`
  - `var(--rd)` (Red) แทน `#dc2626` / `#fca5a5` (ขอบเขตสีแจ้งเตือนบางส่วน)
  - `var(--gn)` (Green) แทน `#16a34a` / `#86efac`
  - `var(--t2)` (Muted Text) แทน `#5a7280`
  - `var(--bd)` (Border) แทน `#CDD8D8`

### 2. ย้าย Inline Style เป็น Utility Classes (Styles.html)
จัดกลุ่มและสร้างคลาส CSS ใหม่ใน `Styles.html` สำหรับชุดคำสั่งหน้าตาที่ใช้ซ้ำๆ (เช่นในหน้า "ลูกค้าเสี่ยง" และ "ลูกค้าเติบโต"):
- **Status Badges:** สร้าง `.badge-risk`, `.badge-growth`, `.badge-risk-count`, `.badge-growth-count`
- **Days Remaining Bar:** สร้าง `.days-bar-risk`, `.days-bar-growth` และ `.projection-label-risk`
- **Threshold Inputs:** สร้าง `.threshold-input-risk`, `.threshold-input-growth`
- **Nav & Layout Elements:** สร้าง `.trk-poll-badge`, `.btn-logout`, `.dir-unlock-panel`, `.card-panel`

### 3. ประยุกต์ใช้ Class กับ HTML (Body.html)
- ทำการแทนที่คำสั่ง `style="..."` ที่มีความยาวมากๆ ใน `Body.html` (โดยเฉพาะในโซนกลุ่มเสี่ยงและเติบโต) ให้ไปเรียกใช้คลาสใหม่จากข้อ 2 แทน ทำให้ไฟล์ `Body.html` สะอาดขึ้น อ่านง่ายขึ้น และพร้อมรับการอัปเดตสีในอนาคตโดยแก้ที่เดียว (`Styles.html`)

## ไฟล์ที่ถูกแก้ไข
- `refactor-theme.js` (Script ที่ใช้แปลงสี)
- `src/Styles.html` (เพิ่ม Utility classes ใหม่)
- `src/Scripts.html` (แปลงสีเป็นตัวแปร CSS)
- `src/Body.html` (ล้าง Inline styles และเปลี่ยนมาใช้ Class)
