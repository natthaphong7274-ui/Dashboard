# สารบัญ Phase Notes

Branch: `codex/phase-5`

branch นี้รวมงานตั้งแต่ Phase 0 ถึง Phase 3.5 โดยเก็บโน้ตแยกเป็นไฟล์ตาม phase เพื่อให้อ่านย้อนหลังง่าย และใช้ตรวจ dev/review ได้ว่ามีอะไรเปลี่ยนในแต่ละช่วงบ้าง

## รายการ Phase ใน branch นี้

| Phase | ไฟล์ | สรุป |
| --- | --- | --- |
| Phase 0 | [PHASE_0_NOTES.md](./PHASE_0_NOTES.md) | วางฐาน UI state helpers และ dashboard watermark base |
| Phase 1 | [PHASE_1_NOTES.md](./PHASE_1_NOTES.md) | เพิ่ม permission guard, audit, XSS protection, export guard และ token hardening |
| Phase 2 | [PHASE_2_NOTES.md](./PHASE_2_NOTES.md) | เอา mock หน้า Home ออก, ผูก Target Progress กับ target config จริง และเพิ่ม Daily Task Progress เบื้องต้น |
| Phase 3 | [PHASE_3_NOTES.md](./PHASE_3_NOTES.md) | เพิ่ม Action Center, Priority Score และ Next Follow-up แบบอ่านจากข้อมูลเดิม |
| Phase 3.5 | [PHASE_3_5_NOTES.md](./PHASE_3_5_NOTES.md) | ปรับ visualization ด้วย Home trend/forecast, priority bars และ table compact view |
| Phase 4 | [PHASE_4_NOTES.md](./PHASE_4_NOTES.md) | เริ่ม AM/Director Workspace ด้วย BD Ranking ตามสูตร D3 |
| Phase 5 | [PHASE_5_NOTES.md](./PHASE_5_NOTES.md) | เพิ่ม Report Center พร้อม preview, Tracking Report, BD Performance Report และ Weekly Summary export |

## วิธีอ่าน

1. อ่านไฟล์นี้ก่อนเพื่อดูว่า branch นี้สะสม phase อะไรไว้บ้าง
2. อ่าน note ราย phase ตามลำดับจาก Phase 0 ขึ้นไป
3. ใช้ note ราย phase เป็น checklist เวลา test บน dev หรือ review pull request

## หลักการจัดไฟล์

- `PHASE_INDEX.md` ใช้เป็นสารบัญและภาพรวมของ branch ปัจจุบัน
- `PHASE_0_NOTES.md`, `PHASE_1_NOTES.md`, `PHASE_2_NOTES.md`, `PHASE_3_NOTES.md`, `PHASE_3_5_NOTES.md`, `PHASE_4_NOTES.md`, `PHASE_5_NOTES.md`, ... ใช้เก็บรายละเอียดเฉพาะ phase นั้น
- branch ที่ใหม่กว่าจะเก็บ note ของ phase ก่อนหน้าไว้ด้วย เพื่อให้เห็นประวัติงานสะสมโดยไม่ต้องสลับ branch ไปมา
