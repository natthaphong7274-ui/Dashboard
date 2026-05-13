# Phase 6 Notes

Branch: `codex/phase-6`

## เป้าหมายของ Phase 6

ทำงานส่วน Performance + Quality + Security เสริมตาม `dashboard_improvement_execution_playbook` โดยไม่แก้ schema ของ Google Sheet และต่อยอดจากระบบเดิมที่มีอยู่แล้ว

## สิ่งที่ทำใน Phase นี้

### 1. ลด Polling ตาม Active Tab

- ปรับ polling ของ Tracking/Risk/Growth ให้ทำงานเฉพาะตอนเปิด tab ที่เกี่ยวข้อง
- เมื่อสลับ tab จะหยุด polling เก่าก่อน แล้วค่อยเริ่ม polling ของ tab ปัจจุบัน
- เมื่อกลับมาจากหน้า browser hidden จะเรียก `_refreshDashboardPolling()` เพื่อเริ่มเฉพาะ polling ที่จำเป็น
- ลด Growth threshold polling จาก 30 วินาทีเป็น 60 วินาที

### 2. Data Year ไม่ผูกกับปีเดียว

- เพิ่ม `_detectDataYear()` ใน `Config.js`
- อ่านปีจาก header เช่น `Rev May 26` แล้วส่ง `dataYear` กลับ frontend
- frontend ยังใช้ `DATA_YEAR` ตัวเดิม แต่ค่าจะมาจากข้อมูลจริงผ่าน `getAllData()`

### 3. Data Quality และ Sheet Health

- เพิ่ม `dataQuality` และ `sheetHealth` ในผลลัพธ์ `getAllData()`
- ตรวจ missing required columns, missing Agent Code/Name/Zone/Province, duplicate Agent Code และค่า Rev/Vol ที่ผิดปกติ
- ตรวจ sheet สำคัญ เช่น Users, Base, Tracking, TrackingGrowth, ActivityLog และ latest month sheet
- เพิ่ม panel เตือนด้านบน dashboard เมื่อพบ warning/error

### 4. Sensitive Data Masking

- เพิ่ม `_maskSensitiveRowForSession()`
- role ที่ไม่ใช่ Director จะเห็นเบอร์โทรแบบ masked เช่น `081***99`
- Director ยังเห็นข้อมูลเต็มตามสิทธิ์

### 5. Token และ Brute-force Hardening

- token ใหม่เพิ่ม digest suffix เพื่อให้เดายากขึ้น
- ยังคงรองรับ token format เก่าเพื่อไม่ทำให้ session เดิมพังทันที
- เพิ่ม soft block ตาม user-agent fingerprint สำหรับ login fail ถี่
- unknown username ใช้ error generic และนับ soft block โดยไม่เปิดเผยว่ามี username จริงหรือไม่

### 6. Conflict Protection สำหรับ Tracking

- frontend ส่ง `lastKnownUpdatedAt` ตอน save tracking/growth
- backend เทียบกับ `updatedAt` ล่าสุดใน sheet ก่อนเขียน
- ถ้าข้อมูลถูกแก้จากหน้าต่างอื่น จะ return conflict แทนการเขียนทับเงียบ ๆ
- เมื่อ save สำเร็จ frontend อัปเดต `updatedAt` กลับเข้า `_trkData`

## จุดที่ควรเช็กบน dev

1. Login เป็น BD/AM แล้วเบอร์โทรในตารางและ action views ต้องถูก mask
2. Login เป็น Director แล้วเบอร์โทรต้องยังเห็นเต็ม
3. เปิด tab Risk/Growth แล้ว polling ต้องทำงานเฉพาะ tab นั้น
4. Logout แล้ว polling ต้องหยุด
5. ลองแก้ tracking row เดียวกันจากสองหน้าต่าง ต้องมี conflict แทนการทับข้อมูลเงียบ ๆ
6. ใส่ username ผิด/ไม่มีจริงซ้ำหลายครั้ง ต้องถูก soft block แบบข้อความ generic
7. Data quality panel ต้องแสดงเฉพาะเมื่อพบ warning/error
8. ปีบน UI ต้องตรงกับ dataYear จากข้อมูลจริง

## ข้อจำกัดที่ยังคงไว้

- ยังไม่แก้โครงสร้าง Google Sheet
- ยังไม่เพิ่ม sheet ใหม่
- Data quality เป็น warning/read-only เท่านั้น ยังไม่ auto repair ข้อมูล
