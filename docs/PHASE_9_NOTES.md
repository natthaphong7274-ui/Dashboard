# Phase 9 Notes

Branch: `codex/phase-9-risk-customer-dashboard`

## Scope

Phase 9 รอบนี้พัฒนา flow สำหรับ Risk / Growth Customer ให้ใช้งานง่ายขึ้น โดยแยกหน้าสรุปออกจากหน้าทำงาน และเพิ่ม `Customer Card Popup` เพื่อให้ผู้ใช้กดดูรายละเอียดลูกค้าได้จากรายการหลักโดยไม่ต้องอัดข้อมูลทั้งหมดลงในตาราง

## สิ่งที่ทำไปแล้ว

- ปรับหน้า `กลุ่มเสี่ยง` และ `กลุ่มเติบโต`
  - เพิ่ม sub tab `ภาพรวม` และ `ติดตามลูกค้า` / `ต่อยอดลูกค้า`
  - ตารางทำงานเน้น `Agent / Customer Code`, metric สำคัญ และ action ก่อน
  - เพิ่มปุ่มรูปตาเพื่อเปิด customer popup

- เพิ่ม `Customer Card Popup`
  - แสดงข้อมูลลูกค้าตาม scope เดิมจาก `FR`
  - ใช้ avatar แบบตัวการ์ตูนกลาง ไม่ใช้ตัวอักษรแรกของชื่อ
  - Performance Delta เน้น `Avg Rev/day`, `Avg Vol/day`, และ `Rev/ชิ้น`
  - Revenue / Volume ยังแสดงเป็น context แต่ไม่ใช่ตัวหลักในการตัดสิน เพราะเดือนปัจจุบันอาจยังไม่ครบเดือน
  - ปุ่มด้านล่าง popup พากลับไปยังหน้าทำงานหรือรายการลูกค้าที่เกี่ยวข้อง และ highlight แถวเป้าหมาย

- เพิ่ม popup ให้จุดที่เป็นรายชื่อลูกค้าหลัก
  - ตารางรายชื่อลูกค้า
  - ตารางขนส่ง
  - drilldown / compare drill ที่เป็นรายการลูกค้า
  - ตาราง Risk Customer
  - ตาราง Growth Customer
  - ปรับ list/table อื่น ๆ ที่เคยโชว์ชื่อ Agent ให้เป็น code-first แล้วดูรายละเอียดผ่านปุ่มรูปตา
  - ปรับ `Avg Rev/ชิ้น Ranking` สำหรับ BD ให้แสดง `Agent / Customer Code` พร้อมปุ่มรูปตา แทนการ group และแสดงชื่อ Agent

- ปรับ logic เปรียบเทียบให้ยึด `Avg Rev/day`
  - `riskDelta(...)` ใช้ Revenue ต่อวันของ baseline เทียบกับเดือนปัจจุบัน
  - `growthDelta(...)` ใช้ Revenue ต่อวันของเดือนปัจจุบันเทียบกับเดือนก่อน
  - `calcPriorityScore(...)` ใช้ Avg Rev/day เป็นฐาน score/reason
  - ตาราง Risk / Growth แสดง Avg Rev/day จาก Revenue ÷ จำนวนวันที่ใช้คำนวณจริง

## Security / Scope

- ไม่แก้ server-side permission
- ไม่แก้ data masking
- popup ใช้ข้อมูลจาก `FR` ที่ผ่าน scope / masking มาแล้ว
- ไม่เพิ่มช่องทางให้ BD หรือ AM เห็นข้อมูลนอก scope
- log ตอนเปิด popup เก็บแค่ชนิด popup และ agent code ไม่ log ชื่อ เบอร์ หรือ note

## Files Changed

- `src/Body.html`
  - เพิ่มโครง popup และ pane/subtab สำหรับ Risk / Growth

- `src/Scripts.html`
  - เพิ่ม helper สำหรับ customer popup
  - เพิ่ม avg/day helpers สำหรับ popup และ scoring
  - เพิ่มปุ่ม popup ในรายการลูกค้าหลักหลายจุด
  - ปรับ risk/growth delta ให้ใช้ Avg Rev/day
  - ลดการแสดง `Agent Name` บนตารางหลัก เหลือ `Agent / Customer Code` เพื่อให้หน้าทำงานสแกนง่ายและรักษา privacy มากขึ้น
  - เพิ่ม `mkCustomerRank(...)` สำหรับ ranking แบบรายลูกค้าที่ต้องเปิดรายละเอียดผ่าน popup

- `src/Styles.html`
  - เพิ่ม style popup, avatar, highlight row, responsive layout

- `docs/PHASE_INDEX.md`
  - เพิ่ม entry ของ Phase 9

- `docs/PHASE_9_NOTES.md`
  - note งาน Phase 9 และรายการแก้ล่าสุด

## Skill / Reference Used

- Skill: `impeccable`
- Reference:
  - `.agents/skills/impeccable/references/product.md`

แนวทางที่นำมาใช้คือให้ตารางเป็นพื้นที่ทำงานแบบ scan เร็ว ส่วนรายละเอียดลึกให้ไปอยู่ใน popup ที่มี hierarchy ชัดเจน ลด cognitive load และยังรักษา privacy/scope เดิมของระบบ

## Verification

- ตรวจ syntax ของ inline script ใน `src/Scripts.html`
- ตรวจ `git diff --check`
- ตรวจว่าปุ่ม popup ไม่ทำให้ตาราง Risk / Growth column เพี้ยน
- ตรวจว่า popup ใช้ `Avg Rev/day` เป็น metric หลัก

## Limitations / Next Step

- ยังไม่ได้ทดสอบผ่าน session login จริงครบทุก role ใน browser
- ควรทดสอบจริงอีกครั้งด้วย BD, AM และ Director
- ถ้าต้องการต่อยอด อาจเพิ่ม quick action ใน popup เช่น copy agent code หรือ filter ตารางตาม zone/province เดียวกัน
