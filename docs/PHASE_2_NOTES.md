# Phase 2 Notes

Branch: `codex/phase-2`

## เป้าหมายของ Phase 2

ใช้ข้อมูลจริงในหน้า Home ให้มากขึ้น และลด mock/demo ที่อาจทำให้ผู้ใช้เข้าใจผิด โดยยังไม่เปลี่ยนโครงสร้าง Google Sheet และไม่สร้างระบบซ้ำกับ Tracking, Target หรือ Login เดิม

## สิ่งที่ทำใน Phase นี้

### 1. เอา mock หน้า Home ออก

- ลบ hidden legacy `roleMapSection` ที่มีข้อมูลตัวอย่าง เช่น ร้านตัวอย่าง, target ตัวเลขจำลอง และ action plan จำลอง
- เหลือไว้เฉพาะ placeholder เปล่า เพราะ Home ปัจจุบัน render ข้อมูลจริงผ่าน `home_content`
- ลดความเสี่ยงที่ mock data จะถูกแสดงผิดจังหวะหรือทำให้สับสนระหว่าง dev/review

### 2. Target Progress ใช้ target config จริง

- แก้ logic target ให้กรณีที่ยังไม่ได้ตั้งเป้าแสดงสถานะ `ยังไม่ตั้งเป้า`
- ยกเลิก fallback เดิมที่สร้างเป้าอัตโนมัติจากเดือนก่อน +5%
- ปรับ Director, AM และ BD Home ให้ progress/percentage แสดงเฉพาะเมื่อมี target config จริง
- เมื่อยังไม่ตั้งเป้า card จะแสดงสถานะรอตั้งเป้า แทนการโชว์ 0% เหมือนเป็นข้อมูลจริง

### 3. Daily Task Progress เบื้องต้น

- เพิ่ม summary progress จาก tracking data ที่มีอยู่ในหน้า Home
- รวมจำนวนงานทั้งหมด, งานเสร็จ, งานกำลังทำ และงานที่ยังรอ
- แสดง progress bar จากสถานะ tracking จริง โดยไม่เพิ่มชีตใหม่และไม่เปลี่ยน schema เดิม

### 4. ลายน้ำกันแคปหน้าจอ

- เพิ่ม overlay ลายน้ำซ้ำทั่วหน้าจอหลัง login/session ผ่าน
- ลายน้ำแสดงชื่อผู้ใช้, role และเวลาปัจจุบัน เพื่อให้ trace ได้หากมีการแคปหรือถ่ายหน้าจอ
- overlay ใช้ `pointer-events:none` เพื่อไม่รบกวนการคลิกและการใช้งาน dashboard
- ซ่อน overlay อัตโนมัติเมื่อ logout หรือ session หมดอายุ

## จุดที่ควรเช็กบน dev

1. Login เป็น Director, AM และ BD แล้วเข้า Home
2. เดือนที่ยังไม่ได้ตั้ง target ต้องเห็นข้อความ `ยังไม่ตั้งเป้า` หรือ `รอตั้งเป้า`
3. เดือนที่ตั้ง target แล้วต้องเห็น progress bar และเปอร์เซ็นต์จาก target config จริง
4. Tracking summary ต้องแสดง Daily Task Progress เมื่อมี tracking status
5. หน้า Home ต้องไม่แสดงร้านหรือตัวเลข mock จาก legacy role map
6. หลัง login ต้องเห็นลายน้ำกันแคปกระจายบนหน้าจอ และยังคลิกใช้งาน dashboard ได้ตามปกติ

## ข้อจำกัดที่ยังคงไว้

- ไม่เพิ่ม Google Sheet ใหม่
- ไม่เปลี่ยนโครงสร้างข้อมูล target/tracking
- ไม่สร้างระบบ permission, target หรือ tracking ซ้ำ
- ยังเป็น Daily Task Progress เบื้องต้นจากสถานะ tracking ที่มีอยู่ ไม่ใช่ task scheduler เต็มรูปแบบ
