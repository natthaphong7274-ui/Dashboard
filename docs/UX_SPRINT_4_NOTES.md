# UX Sprint 4: Overview Tab Restructuring & Enrichment

**สถานะ:** ทำแล้ว, รอทดสอบกับข้อมูลจริง
**Branch:** `UX_Sprint-4`

## สรุป
ลด Cognitive Load ของหน้า Overview โดยเปลี่ยนแถบนำทางจาก Flat 9 Tabs เป็น Grouped Two-Level Tabs แบ่งเป็น 3 กลุ่มชัดเจน (Performance, Breakdown, เปรียบเทียบ) พร้อมทั้งอัปเกรดเนื้อหาในแท็บย่อยทุกแท็บให้มีข้อมูลครบถ้วนสมมาตร รวมถึงแก้ไขการตั้งชื่อที่ทำให้สับสน

## สิ่งที่ปรับปรุง (Changelog)

### 1. Grouped Tab Bar
- เปลี่ยนรูปแบบจากปุ่มเรียงแถวเดียว 9 ปุ่ม เป็นกล่องกลุ่ม 3 ชุด:
  - **Performance:** Revenue, Volume, Avg Rev/วัน, Avg Vol/วัน, Avg Rev/ชิ้น
  - **Breakdown:** BD Zone, พื้นที่, Account, Package
  - **เปรียบเทียบ:** เครื่องมือเปรียบเทียบเดือน
- นำหลักการ **Show the next decision first** มาใช้ จัดระเบียบสายตาให้ผู้ใช้อ่านข้อมูลเป็นก้อนๆ ง่ายขึ้น

### 2. Naming Symmetry (ความสมมาตรของชื่อ)
- แก้ชื่อแท็บที่ชวนสับสน:
  - `Avg Rev` ➜ `Avg Rev/วัน` (ความเร็วเฉลี่ยรายได้ต่อวัน)
  - ให้เข้าคู่ขนานกับ `Avg Vol/วัน` (ความเร็วเฉลี่ยกล่องต่อวัน)
- ผลลัพธ์: ผู้ใช้ไม่ต้องเดาความหมายว่า Avg Rev เป็นต่อคนหรือต่อวัน เพราะเติม "/วัน" ให้ชัดเจนทั้งคู่

### 3. Breakdown Tabs Enrichment
- จัดทำ Data Architecture ของแท็บ Breakdown ใหม่ (BD Zone, พื้นที่, Account, Package)
- **Top KPI Cards:** เพิ่มการ์ดสรุป "อันดับ 1" (Top Revenue / Top Volume) ไว้ส่วนบนสุดของทุกแท็บ 
- **Ranking with MoM % Diff:** ใส่ตารางจัดอันดับไว้ส่วนล่างของทุกแท็บ พร้อมเปอร์เซ็นต์ผลต่างเทียบกับเดือนที่แล้ว (+/เขียว, -/แดง)
- **No Data States:** เพิ่มตัวจัดการข้อมูลว่างให้พื้นที่และแพ็กเกจ เพื่อป้องกัน UI แตกเมื่อข้อมูลยังไม่เข้า

## ไฟล์ที่ถูกแก้ไข
- `src/Body.html` (ปรับโครงสร้าง `.ov-tab-bar` และเพิ่ม `.kgrid`, `.ccard` สำหรับ Ranking)
- `src/Styles.html` (เพิ่ม CSS rules ใหม่สำหรับ Grouped Tab)
- `src/Scripts.html` (แก้ไขฟังก์ชัน `swSec`, เพิ่มการคำนวณ KPI และ Ranking ลงใน `renderAvgPieceSection` และ Breakdown renderers)

## Checklist สำหรับตรวจสอบ (QA)
- [ ] เมื่อเปิดหน้าภาพรวม ต้องเห็นป้าย "PERFORMANCE" และ "BREAKDOWN" ชัดเจนบนแถบเมนู
- [ ] ชื่อแท็บในกลุ่ม Performance ต้องเป็น `Revenue`, `Volume`, `Avg Rev/วัน`, `Avg Vol/วัน`, `Avg Rev/ชิ้น`
- [ ] เมื่อคลิกเข้าไปที่แท็บ "พื้นที่", "Account", "Package" จะต้องเจอการ์ดถ้วยรางวัลบอก TOP 1 และ TOP 1 ปริมาณกล่อง
- [ ] ตารางจัดอันดับด้านล่าง (Ranking) ต้องทำงานและแสดงลูกศรขึ้น/ลง สีเขียว/แดง เมื่อเทียบกับเดือนที่แล้ว (ถ้ามีข้อมูลเดือนก่อน)
