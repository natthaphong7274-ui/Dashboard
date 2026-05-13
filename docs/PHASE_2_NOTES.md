# บันทึกการทำงาน Phase 2

Branch: `codex/phase-2`

Phase นี้ทำตาม `dashboard_improvement_execution_playbook` โดยเน้น “ใช้ข้อมูลจริงและเอา Mock ออก” สำหรับหน้า BD/Home/Workspace โดยยังไม่ทำ Action Center เต็มรูปแบบ เพราะ Action Center + Priority Score ถูกวางไว้เป็น Phase 3

## Scope ของ Phase นี้

- A1 Remove Mock Data / ใช้ข้อมูลจริง
- E1 Target Progress จริง
- B5 Daily Task Progress เบื้องต้น

## สิ่งที่ทำ

- กำหนดขอบเขต Phase 2 ให้ตรงกับ playbook
- เตรียม checklist สำหรับตรวจหน้า BD/Home/Workspace ว่าไม่ใช้ข้อมูลตัวอย่างหรือเลข fake
- ใช้ข้อมูลจริงจาก `FR`, `R`, `MONTHS`, Tracking และ Target เดิมเป็นแหล่งหลัก
- ถ้าไม่มีข้อมูลให้แสดง Empty State แทนการแสดงค่าตัวอย่าง
- ผูก Target Progress กับ target backend เดิมผ่าน `_monthlyTargets` และ `_bdMonthlyTargets`
- คำนวณ actual revenue, percent, remaining และ required per day ตาม scope ของผู้ใช้
- เตรียม Daily Task Progress เบื้องต้นจากข้อมูล Tracking/Action rows ที่มีอยู่ โดยไม่สร้างชีตใหม่

## ไฟล์หลักที่คาดว่าจะแก้

- `src/Scripts.html`
- `src/Body.html`
- `src/Styles.html`
- `src/DesignV2.html` ถ้าต้องปรับ layout/card เพิ่มเติม
- `src/Settings.js` เฉพาะกรณีต้องเสริม target loading หรือ guard เดิม

## สิ่งที่ไม่ได้ทำใน Phase นี้

- ไม่ทำระบบ New Agent
- ไม่แก้โครงสร้าง Google Sheet
- ไม่สร้าง Tracking/Target/Login ใหม่
- ไม่ทำ Action Center เต็มรูปแบบ
- ไม่ทำ Priority Score เต็มรูปแบบ
- ไม่ทำ Next Follow-up Date แบบเขียนข้อมูลใหม่
- ไม่ทำ AM/Director Workspace เต็มรูปแบบ
- ไม่ทำ Export/Report ชุดใหม่

## เกณฑ์ผ่านงาน

- BD login แล้วไม่เห็นร้านหรือตัวเลขตัวอย่างที่ไม่มีในข้อมูลจริง
- เปลี่ยน filter/month แล้วตัวเลขใน workspace เปลี่ยนตาม
- ถ้าไม่มีข้อมูล ต้องขึ้น Empty State ไม่ใช่เลข fake
- ไม่มี target แล้วแสดงข้อความ “ยังไม่ตั้งเป้า” หรือข้อความเทียบเท่า
- ตั้ง target แล้ว Target Progress เปลี่ยนตามข้อมูลจริง
- Daily Task Progress รวมตัวเลข done/pending/success/fail/noStatus ได้จากข้อมูลจริง
- Tracking save/load เดิมยังทำงาน
- Target เดิมยังตั้งค่าและอ่านได้
- ไม่มีการแก้โครงสร้างชีต

## จุดที่ควรทดสอบบน dev

- Login ด้วย BD แล้วตรวจหน้า Home/Workspace
- Login ด้วย AM/Director แล้วตรวจว่า scope ของข้อมูลถูกต้อง
- เปลี่ยนเดือนและ filter แล้ว Target Progress กับ Daily Progress refresh ตาม
- เคลียร์ target แล้ว UI ไม่พังและไม่แสดงเลข fake
- ไม่มีข้อมูลหลัง filter แล้วแสดง Empty State
- Tracking status เปลี่ยนแล้ว Daily Task Progress เปลี่ยนตามหลัง reload
