# UX Sprint 9.5 Notes

Branch: `UX_Sprint-9.5`

## Scope

ปรับ metric ในแผงขวาของ Home Map Focus จากยอดสะสมแบบ month-to-date ให้เป็นค่าเฉลี่ยต่อวัน เพื่อให้ผู้ใช้ Director, AM และ BD อ่าน pace การทำงานของวันนี้ได้ทันทีโดยไม่ต้องแปลงค่า MTD ในหัวเอง

## UX Rationale

แผง Map Focus เป็นพื้นที่ตัดสินใจว่า "วันนี้ควรขยับอะไรต่อ" ยอด MTD เหมาะกับรายงานรายเดือน แต่ในหน้าจอ command view รายวันอาจทำให้ตีความผิดได้ เพราะตัวเลขโตตามจำนวนวันที่ผ่านไปในเดือน ส่วน `Avg Rev/day` และ `Avg Vol/day` สอดคล้องกับบริบทหน้าจอ `Avg / Day-1`, target pace, escalation และการตัดสินใจ follow-up มากกว่า

## Changes

- เปลี่ยน `Revenue MTD` เป็น `Avg Rev/day` ใน stat ของ Map Focus
- เปลี่ยน `Volume MTD` เป็น `Avg Vol/day` ในจุดที่แผงขวาของแผนที่แสดง volume
- คำนวณค่าเฉลี่ยต่อวันจากค่า MTD ปัจจุบัน หารด้วยจำนวนวันที่ผ่านไป (`TODAY_DATE - 1` และบังคับ divisor ขั้นต่ำเป็น 1)
- เปรียบเทียบค่าเฉลี่ยต่อวันกับค่าเฉลี่ยต่อวันของเดือนก่อน แทนการเทียบยอด MTD ดิบ
- ปรับ subtext ของ stat ให้ใช้ `vs prev avg` เมื่อมีข้อมูลเดือนก่อน
- คงแนวคิดเรื่องสีสถานะเดิมไว้: ถ้าค่าเฉลี่ยต่อวันลดลงยังแสดงเป็น warning หรือ danger ตามบริบทเดิม

## Surfaces Updated

- Director `Country focus`: แสดง `Avg Rev/day` และ `Avg Vol/day`
- AM `Zone focus`: แสดง `Avg Rev/day` แทน `Revenue MTD`
- BD `Today queue`: แสดง `Avg Rev/day` และ `Avg Vol/day`

## Files Touched

- `src/Scripts.html`

## Verification

- ตรวจ syntax ของ script blocks ใน `src/Scripts.html`
- ยืนยันว่า `<script>...</script>` ทุก block ที่ parse ได้ compile ผ่านด้วย Node
- push branch `UX_Sprint-9.5` ขึ้น GitHub แล้ว

## Manual Testing Still Needed

- เปิด Director Home แล้วตรวจว่า `Country focus` แสดงค่าเฉลี่ยต่อวัน ไม่ใช่ยอด MTD รวม
- เปิด AM Home แล้วตรวจว่า `Zone focus` ยังจัด label/value ได้ไม่ล้นหรือเบียดกัน
- เปิด BD Home แล้วตรวจว่า `Today queue` แสดงการ์ดค่าเฉลี่ยต่อวันทั้งสองใบถูกต้อง
- เทียบตัวเลขกับ source data อย่างน้อย 1 เดือน เพื่อยืนยันว่า `MTD / Day-1` ตรงกับ UI
