# Phase 5 Notes

Branch: `codex/phase-5`

## เป้าหมายของ Phase 5

ทำ Export / Report ตาม playbook โดยใช้ข้อมูลเดิมใน Dashboard และไม่เพิ่มหรือแก้ schema ของ Google Sheet

รอบล่าสุดของ phase นี้ขยับจาก "ปุ่ม export แยกกัน" ไปเป็น "Report Center" เพื่อให้ผู้ใช้ดู preview ก่อน export ได้ใน flow เดียว

## สิ่งที่ทำใน Phase นี้

### 1. Tracking Report

- รวมอยู่ใน `Report Center`
- Export เป็น CSV จากข้อมูล Risk/Growth tracking ใน scope ปัจจุบัน
- มี metadata: Internal Use Only, exported by, role, scope และ generated time

### 2. BD Performance Report

- รวมอยู่ใน `Report Center`
- Export เป็น CSV รวมผลงานตาม BD/Zone
- แสดง Revenue, MoM, จำนวน task, follow-up completion, success rate และ risk saved

### 3. Weekly Summary

- รวมอยู่ใน `Report Center`
- Export เป็น HTML report ที่เปิดดู/พิมพ์ต่อได้
- สรุป Revenue, Volume, Tracking Done, Success และ Top BD Performance
- ใส่ watermark ในไฟล์ HTML report

### 4. Report Center Preview

- เปลี่ยน toolbar จากปุ่มรายงาน 3 ปุ่ม เป็นปุ่ม `Report Center` ปุ่มเดียว
- เพิ่ม modal preview แบบ tab:
  `Summary`, `Tracking`, `BD Performance`, `Export`
- `Summary` มีกราฟแท่ง+เส้นสำหรับ Revenue และ Volume รายเดือน
- `Tracking` มีกราฟแท่ง+เส้นสำหรับจำนวน task และ follow-up completion
- `BD Performance` มีกราฟแท่ง+เส้นสำหรับ Revenue ของ BD และ MoM growth
- `Export` แสดง metadata ของ session/scope ที่จะถูกใช้ตอน generate ไฟล์
- ใช้ข้อมูลจาก filter และ role scope ปัจจุบันโดยตรง ไม่สร้าง datasource ใหม่

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
6. ปุ่ม `Report Center` ต้องเปิด preview ได้ครบทุก tab
7. กราฟใน preview ต้องเปลี่ยนตามเดือนและ scope ปัจจุบัน
