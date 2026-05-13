# Phase 4 Notes

Branch: `codex/phase-4`

## เป้าหมายของ Phase 4

ต่อยอด AM/Director Workspace ตาม playbook โดยเริ่มจาก D3 `BD Ranking` ก่อน เพราะเป็นงานที่ค้างจาก Phase 3.5 และใช้ข้อมูลเดิมได้โดยไม่เพิ่มหรือแก้ schema ของ Google Sheet

## สิ่งที่ทำใน Phase นี้

### 1. BD Ranking สำหรับ Director และ AM

- เพิ่มตาราง `BD Ranking - Phase 4` ในหน้า Home ของ Director และ AM
- Director เห็น ranking ตาม scope ทั้งประเทศ ส่วน AM เห็น ranking เฉพาะข้อมูลใน scope ของตัวเอง
- Ranking aggregate ตาม BD ถ้ามีคอลัมน์ BD ในข้อมูล และ fallback เป็น Zone เมื่อข้อมูลไม่มีชื่อ BD

### 2. สูตรคะแนนรวม

คะแนนรวมคำนวณจากองค์ประกอบหลักตาม D3:

- Target achievement 35%
- Follow-up completion 25%
- Success rate 15%
- Risk saved 15%
- Data completeness 10%

ถ้ายังไม่มี target ราย BD ระบบใช้ baseline `ยอดเดือนก่อน +5%` เป็นตัวเทียบชั่วคราว เพื่อให้ ranking ทำงานได้โดยไม่ต้องเพิ่มชีตใหม่

### 3. Progress Bar ใน Ranking

- แสดง progress bar สำหรับ `%Target`, `Follow-up`, `Success`, `Risk saved` และ `Data`
- แสดง Revenue และ MoM เพื่อให้เทียบผลงานกับเดือนก่อนเร็วขึ้น

## จุดที่ควรเช็กบน dev

1. Login เป็น Director แล้ว Home ต้องเห็น `BD Ranking - Phase 4`
2. Login เป็น AM แล้ว Home ต้องเห็น ranking เฉพาะ scope ของ AM
3. คะแนนรวมต้องเปลี่ยนตามเดือน/filter/scope
4. ถ้าไม่มี target ราย BD ต้องยังแสดง ranking ได้โดยใช้ baseline เดือนก่อน +5%
5. ไม่มีการเพิ่มหรือแก้ column ใน Google Sheet

## ข้อจำกัดที่ยังคงไว้

- ยังไม่ได้ทำ S9 Director Session Management ในรอบนี้
- ยังไม่ได้ทำ Director Control Center เต็มรูปแบบ เพราะเริ่มจาก D3 ที่เป็นแกน ranking ก่อน
