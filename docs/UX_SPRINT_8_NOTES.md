# UX Sprint 8 Notes — Keyboard Power User Experience

**Branch:** `UX_Sprint-8`
**Date:** 2026-05-15
**Focus:** ลด friction สำหรับ Power Users (Director/AM) ที่ใช้งาน Dashboard ทุกวัน

---

## เป้าหมายของ Sprint

จาก Critique Score 29/40 พบว่า Heuristic #7 (Flexibility & Efficiency) ได้คะแนนต่ำสุด (2/4) เพราะไม่มี Keyboard Shortcuts เลย ทำให้ผู้ใช้ระดับ Power User ต้องคลิกเมาส์ทุกอย่าง Sprint นี้จึงโฟกัสที่การเพิ่มความเร็วในการทำงาน

---

## งานที่ทำ

### 1. Global Keyboard Shortcuts (`src/Scripts.html`)

เพิ่ม `keydown` listener ระดับ document ครอบคลุม 3 กลุ่ม:

| Shortcut | Action |
|---|---|
| `1` | สลับไปหน้า Home |
| `2` | สลับไปหน้า Overview |
| `3` | สลับไปหน้า ขนส่ง (CR) |
| `4` | สลับไปหน้า กลุ่มเสี่ยง |
| `5` | สลับไปหน้า กลุ่มเติบโต |
| `Ctrl+K` / `Cmd+K` | โฟกัส Agent Search input |
| `Esc` | ปิด Modal, ปิด Autocomplete, blur input |

**Design decision:** Number keys ทำงานเฉพาะเมื่อ focus ไม่ได้อยู่ใน input/textarea/select เพื่อไม่รบกวนการพิมพ์ข้อมูล

### 2. Keyboard Hint Bar (`src/Body.html` + `src/Styles.html`)

แถบเล็กๆ ใต้ Nav bar แสดงปุ่มลัดที่มี:
- ซ่อนอยู่ก่อน login (ใช้ class `.logged-in` บน `body`)
- แสดงผลเมื่อ login สำเร็จโดยอัตโนมัติ
- ออกแบบให้บางเบา ไม่รบกวน content หลัก

### 3. Auto-focus Modal Input (`src/Scripts.html`)

เมื่อ Target Setting Modal เปิด ระบบจะโฟกัสไปที่ช่องกรอกตัวเลขทันที (ด้วย `setTimeout` 80ms) ทำให้ผู้ใช้พิมพ์เป้าหมายได้เลยโดยไม่ต้องคลิกก่อน

---

## AM Permission Elevation (งานต่อจาก Sprint 7)

ทำก่อนเริ่ม Sprint 8 อย่างเป็นทางการ:

- **`src/Scripts.html`**: `_applyGlobalRoleRules`, `swMain`, BD tab, polling skip — ทุกจุดที่ check `=== 'Director'` ถูกขยายให้รวม `=== 'AM'` ด้วย
- **`src/DataReader.js`**: `allowedZones` filter — AM ได้รับข้อมูลทุก Zone เหมือน Director
- **`src/Auth.js`**: `_canAccessZone` — AM pass zone check ทุก zone โดยอัตโนมัติ
- **`src/DataReader.js`**: `_maskPhoneForRole` และ `_maskSensitiveRowForSession` — AM เห็นเบอร์โทรแบบเต็มเหมือน Director

---

## ไฟล์ที่แก้ไข

| ไฟล์ | รายการ |
|---|---|
| `src/Scripts.html` | Global keyboard shortcuts, auto-focus, logged-in class, AM permission elevation |
| `src/Body.html` | Keyboard hint bar HTML |
| `src/Styles.html` | `.kb-hint-bar`, `kbd`, `.logged-in` CSS |
| `src/DataReader.js` | AM zone filter + phone masking |
| `src/Auth.js` | AM zone access |

---

## Critique Score ก่อน/หลัง (ประมาณการ)

| Heuristic | ก่อน | หลัง |
|---|---|---|
| #7 Flexibility & Efficiency | 2 | 3 |
| **Total** | **29/40** | **~30/40** |

---

## ขั้นตอนต่อไป (Sprint 9 candidate)

- Onboarding / Empty State สำหรับ BD ใหม่ที่เพิ่งเข้าระบบ
- Help tooltip สำหรับ threshold และ Rev/Vol abbreviation
- Heuristic #10 Help & Documentation (ปัจจุบัน 2/4)
