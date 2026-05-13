# Phase 5 Notes

Branch: `codex/phase-5`

## เป้าหมายของ Phase 5

ทำ Export / Report ตาม playbook โดยใช้ข้อมูลเดิมใน Dashboard และไม่เพิ่มหรือแก้ schema ของ Google Sheet

## สิ่งที่ทำใน Phase นี้

### 1. Tracking Report

- เพิ่มปุ่ม `Tracking Report`
- Export เป็น CSV จากข้อมูล Risk/Growth tracking ใน scope ปัจจุบัน
- มี metadata: Internal Use Only, exported by, role, scope และ generated time

### 2. BD Performance Report

- เพิ่มปุ่ม `BD Performance`
- Export เป็น CSV รวมผลงานตาม BD/Zone
- แสดง Revenue, MoM, จำนวน task, follow-up completion, success rate และ risk saved

### 3. Weekly Summary

- เพิ่มปุ่ม `Weekly Summary`
- Export เป็น HTML report ที่เปิดดู/พิมพ์ต่อได้
- สรุป Revenue, Volume, Tracking Done, Success และ Top BD Performance
- ใส่ watermark ในไฟล์ HTML report

## Security / Permission

- ทุก export ต้องมี session ก่อน ไม่เช่นนั้นจะถูก deny
- Export ใช้ข้อมูลที่ถูก filter ตาม role/scope อยู่แล้ว
- ทุก export มี `_clientLog` เพื่อเก็บ audit action
- ไฟล์ report มี metadata และ Internal Use Only

## จุดที่ควรเช็กบน dev

1. Login เป็น BD แล้ว export ต้องได้เฉพาะ scope ที่ BD เห็น
2. Login เป็น AM แล้ว export ต้องได้เฉพาะ zone/team ของ AM
3. Login เป็น Director แล้ว export ได้ scope ทั้งหมด
4. ไฟล์ CSV ต้องมี metadata ด้านบน
5. Weekly Summary HTML ต้องมี watermark และเปิดดูได้
