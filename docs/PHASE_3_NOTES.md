# Phase 3 Notes

Branch: `codex/phase-3`

## เป้าหมายของ Phase 3

เพิ่มเครื่องมือช่วย BD ตัดสินใจว่าวันนี้ควรติดตามลูกค้ารายไหนก่อน โดยใช้ข้อมูลเดิมจาก Raw KPI, Tracking, TrackingGrowth และ target context ที่มีอยู่แล้ว ไม่เพิ่มชีตใหม่และไม่เปลี่ยน schema เดิม

## สิ่งที่ทำใน Phase นี้

### 1. Action Center

- เพิ่ม Action Center บนหน้า BD Home
- รวมรายการจากกลุ่ม Risk และ Growth opportunity ใน scope ของผู้ใช้
- แสดงชื่อลูกค้า, code, zone, package, revenue, เหตุผลที่ควรทำ และปุ่มไปยังหน้า Risk/Growth เดิม
- ใช้ key tracking เดิม เช่น `risk_<agentCode>_<month>` และ `growth_<agentCode>_<month>`
- dropdown สถานะใน Action Center เรียก handler เดิม `_trkChange` และ `_growthTrkChange` เพื่อบันทึกลงระบบ Tracking เดิม

### 2. Priority Score

- เพิ่ม `calcPriorityScore()` เป็นจุดคำนวณคะแนนกลาง
- คะแนนพิจารณาจาก:
  - Avg Rev/วัน ลดลงหรือเพิ่มขึ้นเทียบเดือนก่อน
  - % การเปลี่ยนแปลงของ revenue
  - ขนาดยอดของลูกค้า
  - สถานะ tracking ปัจจุบัน
  - การใกล้รอบปิดเดือน
- แสดงเหตุผลประกอบคะแนน เช่น `Avg ลด`, `ยอดลด`, `ยังไม่อัปเดตสถานะ`, `ใกล้ปิดเดือน`

### 3. Next Follow-up Date

- เพิ่มตำแหน่งแสดง Next Follow-up ใน Action Center
- อ่านจาก field ที่มีอยู่ใน tracking ถ้ามี เช่น `nextFollowUp`, `nextFollowUpDate`, `followUpDate`, `followDate`
- ถ้าไม่มี field ดังกล่าว จะแสดง `ยังไม่กำหนด`
- ยังไม่เพิ่ม field ใหม่และยังไม่เขียนค่า next follow-up ลงชีตใน phase นี้

## จุดที่ควรเช็กบน dev

1. Login เป็น BD แล้วเข้า Home ต้องเห็น Action Center
2. รายการต้องเรียงตาม Priority Score จากมากไปน้อย
3. Risk/Growth ต้องใช้ข้อมูลใน scope ของผู้ใช้เท่านั้น
4. เปลี่ยนสถานะใน Action Center แล้วต้องบันทึกลง Tracking/TrackingGrowth เดิมได้
5. ถ้าไม่มี follow-up field ต้องแสดง `ยังไม่กำหนด` และไม่ error
6. เปลี่ยนเดือน/filter แล้ว Action Center ต้องเปลี่ยนตามข้อมูลเดือนนั้น

## ข้อจำกัดที่ยังคงไว้

- ไม่เพิ่ม Google Sheet ใหม่
- ไม่เพิ่ม column ใหม่ใน Tracking หรือ TrackingGrowth
- ไม่สร้างระบบ task scheduler ใหม่
- Next Follow-up เป็น read-only placeholder จนกว่าจะมี field จริงในข้อมูลเดิมหรือ phase ถัดไปอนุมัติให้เพิ่ม schema
