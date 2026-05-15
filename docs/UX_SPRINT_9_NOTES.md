# UX Sprint 9 Notes — Onboarding & Help System

**Branch:** `UX_Sprint-9`
**Date:** 2026-05-15
**Focus:** ลดความสับสนของคำศัพท์และเพิ่ม Onboarding สำหรับผู้ใช้ใหม่ (Heuristic #10 Help & Documentation)

---

## เป้าหมายของ Sprint

ผู้ใช้ใหม่ (New BD) อาจจะไม่เข้าใจคำศัพท์ (Rev, Vol, Target, Threshold) หรือมองไม่เห็น Keyboard Shortcuts ที่เพิ่งเพิ่มเข้าไปในระบบ Sprint นี้มุ่งเน้นเพิ่ม Onboarding แบบไม่รบกวนการทำงาน (Non-intrusive) เพื่อสอนการใช้งานเบื้องต้น

---

## งานที่ทำ

### 1. Help & Onboarding Modal (`src/Body.html`)

สร้าง Modal มาตรฐานใหม่ `.ui-modal` เพื่อแสดง:
- **คำศัพท์ที่พบบ่อย (Glossary):** อธิบายความหมายของ Rev, Vol, Target, Threshold
- **Keyboard Shortcuts:** สรุปปุ่มลัดเพื่อเพิ่มความเร็วในการใช้งาน (สืบเนื่องจาก Sprint 8)

### 2. ปุ่มช่วยเหลือแบบ Soft-UI (`src/Body.html`)

เพิ่มปุ่ม "❓ ช่วยเหลือ" บริเวณขวาบนของ Navigation Bar (ข้างๆ ปุ่มรีเฟรช) 
- ใช้โทนสีสว่างแบบ Soft-UI (`#f8fafc`, ตัวหนังสือสีเทา `#475569`) เพื่อไม่แย่งความสนใจจากปุ่มหลัก

### 3. Auto-show Logic (`src/Scripts.html`)

ระบบจะตรวจสอบ `localStorage.getItem('hasSeenOnboarding_v1')`:
- หากผู้ใช้ยังไม่เคยเห็น (login ครั้งแรกในเบราว์เซอร์นั้น) ระบบจะแสดง Onboarding Modal ให้อัตโนมัติใน 500ms หลัง login เสร็จสิ้น
- เมื่อผู้ใช้กดปิด Modal ระบบจะจำไว้ใน `localStorage` และจะไม่เด้งขึ้นมาอีก
- ผู้ใช้สามารถเปิดอ่านใหม่ได้เสมอผ่านปุ่ม "ช่วยเหลือ" มุมขวาบน

### 4. Standard UI Modal CSS (`src/Styles.html`)

เพิ่ม CSS มาตรฐาน `.ui-overlay` และ `.ui-modal` เข้าไปในระบบ เพื่อใช้เป็นต้นแบบสำหรับการสร้าง Modal ในอนาคต (มี Backdrop filter blur, animation fade & scale ที่ดูไหลลื่น)

---

## ไฟล์ที่แก้ไข

| ไฟล์ | รายการ |
|---|---|
| `src/Body.html` | เพิ่มปุ่ม "❓ ช่วยเหลือ" และ HTML ของ `helpOverlay` |
| `src/Scripts.html` | เพิ่มฟังก์ชัน `openHelpModal`, `closeHelpModal`, และ auto-show logic ใน `_showUserBadge` |
| `src/Styles.html` | CSS `ui-overlay`, `ui-modal`, `ui-modal-header`, ฯลฯ |

---

## Critique Score ก่อน/หลัง (ประมาณการ)

| Heuristic | ก่อน | หลัง |
|---|---|---|
| #10 Help & Documentation | 2 | 3 |
| **Total** | **~30/40** | **~31/40** |
