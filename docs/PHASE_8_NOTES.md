# Phase 8 Notes

Branch: `codex/phase-8`

## Scope

Phase 8 เริ่มงาน Dashboard Logic & Calculation Refinement โดยเน้นให้ตัวเลข `Avg/day` ไม่ทำให้ผู้ใช้เข้าใจผิด และเตรียมฐานสำหรับ Loss Baseline ก่อน Phase 9

## Changes

- เพิ่ม helper กลางใน `src/Scripts.html`
  - `getDayDivisorMeta(monthKey)` คืนจำนวนวันที่ใช้หาร พร้อมสถานะว่าเป็นเดือนที่ยังไม่ครบหรือไม่
  - `avgRevDayTotal(rows, month)` ใช้สูตร `SUM(Revenue) ÷ actual day divisor`
  - `avgVolDayTotal(rows, month)` ใช้สูตร `SUM(Volume) ÷ actual day divisor`
  - `grpAvgRevDay(rows, groupCol, month)` ใช้สูตรเดียวกันกับ card/chart/table รายกลุ่ม
- ปรับ KPI หน้า `ภาพรวม`
  - `AVG REV/DAY` ไม่ใช้ `SUM(Avg Rev จากชีต)` แล้ว
  - ใช้ `SUM(Revenue) ÷ จำนวนวันที่ใช้จริง`
  - subtitle แสดงจำนวนวันที่ใช้หาร เช่น `Revenue ÷ 17 วัน (เดือนยังไม่ครบ)`
  - `AVG VOL/วัน` ใช้ helper กลางและ label จำนวนวันแบบเดียวกัน
- ปรับ section `Avg Rev/day`
  - chart ราย Zone, Package, Province และ ranking ใช้ `SUM(Revenue) ÷ days`
  - ลดความเสี่ยงที่ card กับ chart ใช้สูตรไม่ตรงกัน
- ปรับ surface เพิ่มเติมที่ยังใช้ `colAvg` แบบรวมค่าอยู่
  - compare ราย 2 เดือน และ compare หลายเดือน เปลี่ยน `Avg Rev/day` เป็น `Revenue ÷ จำนวนวัน`
  - package summary, BD Zone score และ map province status ใช้ logic รวมแบบเดียวกันมากขึ้น
  - tooltip และ label ช่วยอธิบายว่า `Avg Rev/day` เป็นค่าเฉลี่ยต่อวันของทั้งกลุ่ม ไม่ใช่ผลรวม avg จากชีต
- เพิ่ม config สำหรับ Loss Baseline
  - `LOSS_BASELINE_MONTH_KEY = 'mar'`
  - `getLossBaselineMonthKey(currentMonthKey)` เพื่อไม่ hard-code baseline ใน Phase 9

## Notes

- งานนี้เป็นก้อนแรกของ Phase 8 ยังไม่ได้ปิดทั้ง Phase
- WoW Comparison ยังต้องดูแหล่งข้อมูลรายวัน/รายสัปดาห์เพิ่มเติม เพราะข้อมูล KPI หลักปัจจุบันเป็นรายเดือน

## Verification

- ต้องตรวจ syntax ของ script blocks ใน `src/Scripts.html`
- ต้องตรวจ `git diff --check`
- Manual QA ที่ควรทำ: เปิดหน้า `ภาพรวม`, ตรวจ KPI `AVG REV/DAY`, `AVG VOL/วัน`, chart Avg Rev/day ราย Zone/Package/Province และ ranking ว่าค่าหารด้วยจำนวนวันเดียวกัน
