# สารบัญ Phase Notes

Branch: `codex/phase-2`

branch นี้รวมงานตั้งแต่ Phase 0 ถึง Phase 2 โดยแยกคำอธิบายแต่ละ phase เป็นไฟล์ของตัวเอง เพื่อให้อ่านง่ายและตรวจย้อนหลังได้ชัดเจน

## รายการ Phase ใน branch นี้

| Phase | ไฟล์ | สรุป |
| --- | --- | --- |
| Phase 0 | [PHASE_0_NOTES.md](./PHASE_0_NOTES.md) | วางฐาน UI state helpers และ dashboard watermark base |
| Phase 1 | [PHASE_1_NOTES.md](./PHASE_1_NOTES.md) | เพิ่ม permission guard, audit, XSS protection, export guard และ token hardening |
| Phase 2 | [PHASE_2_NOTES.md](./PHASE_2_NOTES.md) | ใช้ข้อมูลจริงใน Home/Workspace, ผูก Target Progress จริง และเพิ่ม Daily Task Progress เบื้องต้น |

## วิธีอ่าน

1. อ่านไฟล์นี้ก่อนเพื่อดูว่า branch รวม phase อะไรไว้บ้าง
2. อ่าน note ราย phase ตามลำดับจาก Phase 0 ขึ้นไป
3. ใช้ note ราย phase เป็น checklist เวลาทดสอบบน dev หรือ review PR

## หลักการจัดไฟล์

- `PHASE_INDEX.md` ใช้เป็นสารบัญและภาพรวมของ branch
- `PHASE_0_NOTES.md`, `PHASE_1_NOTES.md`, `PHASE_2_NOTES.md`, ... ใช้เก็บรายละเอียดเฉพาะ phase นั้น
- branch ที่ใหม่กว่าจะเก็บ note ของ phase ก่อนหน้าไว้ด้วย เพื่อให้เห็นประวัติสะสมของงาน
