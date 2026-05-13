# Phase 3.5 Notes

Branch: `codex/phase-3.5`

## เป้าหมายของ Phase 3.5

ปรับ visualization ให้ dashboard อ่านง่ายขึ้นและช่วยตัดสินใจเร็วขึ้น โดยต่อยอด chart/table/list เดิม ไม่สร้างข้อมูลใหม่และไม่เปลี่ยน schema ของ Google Sheet

## สิ่งที่ทำใน Phase นี้

### 1. Home Trend + Target Pace

- เพิ่ม visualization section บน Home ของ Director, AM และ BD
- แสดง Revenue, Volume และ Avg Rev/Vol ย้อนหลัง 6 เดือนตาม scope ปัจจุบัน
- เพิ่ม Target Pace panel ที่แสดง Actual MTD, Forecast, Target และ Required/day
- Forecast ใช้ยอด MTD เทียบจำนวนวันที่ผ่านไป ถ้าเป็นเดือนย้อนหลังจะใช้ actual จริง

### 2. Action Center Priority Visualization

- ปรับ Action Center ให้เห็น Priority Score ชัดขึ้นด้วย progress bar
- ยังใช้สูตร Priority Score และ tracking handler เดิมจาก Phase 3
- ไม่เพิ่ม task storage ใหม่

### 3. Table Compact View

- เพิ่มปุ่มสลับ `มุมมองกระชับ` / `มุมมองเต็ม` ในตารางรายการลูกค้า
- ค่า default เป็นมุมมองกระชับ เพื่อลดจำนวน column ที่เห็นพร้อมกัน
- มุมมองเต็มยังเปิดดูคอลัมน์เสริม เช่น province, previous month, Avg/Vol/day, Avg Rev และ Avg/ชิ้น ได้
- จำ preference ด้วย `localStorage`

### 4. Role-based Visualization Cleanup

- ปรับหน้า `ภาพรวม` ให้ BD ไม่เห็นกราฟสรุปแบบราย Zone เช่น `Revenue ราย Zone`, `Volume ราย Zone`, `Avg Rev ราย Zone`, `Avg Rev/ชิ้น ราย Zone` และ `Avg Vol/วัน ราย Zone`
- Ranking ในหน้า `ภาพรวม` สำหรับ BD เปลี่ยนจากการจัดอันดับราย Zone เป็นราย Agent เพื่อให้ตรงกับพอร์ตที่ BD ต้องดูแล
- ซ่อนแท็บ `BD Zone` ให้เหลือเฉพาะ Director เพราะเป็นมุมมองเปรียบเทียบระดับทีม/Zone มากกว่างานประจำของ BD และ AM
- ปรับหน้า `ขนส่ง` ให้ BD ไม่เห็นแท็บ `ราย Zone` เพราะเป็นการเปรียบเทียบระดับพื้นที่ ไม่ใช่มุมมองที่เหมาะกับ role BD

### 5. KPI Trend Cards

- เพิ่ม helper กลางสำหรับ KPI card แบบ `ตัวเลขหลัก + mini bar รายเดือน + line % growth`
- ใช้ helper นี้กับ KPI cards ในหน้า `ภาพรวม` ได้แก่ Revenue, Volume, Avg Rev/Day, Avg Rev/ชิ้น และ Avg Vol/วัน
- ใช้ helper เดียวกันกับหน้า `ขนส่ง` ได้แก่ Volume, Revenue, Avg Rev/Day, การ์ดรายขนส่ง, Avg Rev/Vol และ Avg Vol/วัน
- แท่งใน mini chart แสดงค่าจริงย้อนหลัง และเส้นแสดงการเติบโตแบบ MoM เพื่อให้เห็น trend โดยไม่ต้องเปิดกราฟใหญ่

## งานใน roadmap ที่แตะในรอบนี้

- I2 Revenue/Volume Monthly Trend
- I3 Avg Rev/Avg Vol Trend
- I5 Action Center เป็น Priority List
- I10 Target Progress + Forecast Chart
- I11 Column Visibility แบบเริ่มต้นด้วย compact/full view
- Role-based visualization cleanup สำหรับหน้า Overview และ Carrier
- KPI mini trend card สำหรับ Overview และ Carrier

## จุดที่ควรเช็กบน dev

1. Login เป็น Director, AM และ BD แล้ว Home ต้องเห็น trend chart ตาม scope ของ role
2. Target Pace ต้องแสดง `ยังไม่ตั้งเป้า` หากเดือนนั้นยังไม่มี target
3. เดือนที่มี target ต้องเห็น Forecast และ Required/day
4. Action Center ต้องมี Priority bar โดยไม่กระทบการ save tracking
5. ตารางรายการลูกค้ากดสลับมุมมองกระชับ/เต็มได้ และ refresh แล้วยังจำค่า
6. Login เป็น BD แล้วหน้า `ภาพรวม` ต้องไม่เห็นกราฟ/ตารางราย Zone และ ranking ต้องเป็นราย Agent
7. Login เป็น BD แล้วหน้า `ขนส่ง` ต้องไม่เห็นแท็บ `ราย Zone`; Director/AM ยังเห็นแท็บนี้ได้
8. หน้า `ภาพรวม` และ `ขนส่ง` ต้องเห็น mini chart ใน KPI cards โดย layout ไม่ล้นบน desktop/mobile

## ข้อจำกัดที่ยังคงไว้

- ยังไม่ทำ visualization ครบทุกข้อ I1-I11 ในรอบเดียว
- ยังไม่สร้าง BD Leaderboard สูตรเต็มใหม่ เพราะมีส่วน ranking เดิมอยู่แล้วและ Phase 4/D3 จะต่อยอดได้ชัดกว่า
- ไม่เพิ่มหรือแก้ column ใน Google Sheet
