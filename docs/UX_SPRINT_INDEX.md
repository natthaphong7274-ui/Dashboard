# สารบัญ UX Sprint

Branch: `UX_Sprint-2`

ไฟล์นี้ใช้ติดตามงาน UX refinement ของ Dashboard Realtime ในฐานะ operational workspace โดยใช้รูปแบบคล้าย `PHASE_INDEX.md` เดิม แต่แยกชื่อเป็น UX Sprint เพื่อไม่ให้ชนกับประวัติงาน Phase 0-6

## รายการ UX Sprint

| UX Sprint | สถานะ | ไฟล์ | สรุป |
| --- | --- | --- | --- |
| UX Sprint 1 | ทำแล้ว, รอทดสอบตาม role | [UX_SPRINT_1_NOTES.md](./UX_SPRINT_1_NOTES.md) | จัด navigation ใหม่เป็นกลุ่ม Main, Work และ System; ย้าย Tracking, Report Center และ User Management ไปอยู่ตำแหน่งที่ชัดขึ้น; เพิ่ม guard ให้ User Management เปิดได้เฉพาะ Director |
| UX Sprint 2 | ทำแล้ว, รอทดสอบภาพจริง | [UX_SPRINT_2_NOTES.md](./UX_SPRINT_2_NOTES.md) | ปรับ label ของ metric ให้ชัดขึ้น และเพิ่ม metric help ที่ใช้ซ้ำได้สำหรับ MTD, Avg Rev/day, Avg Vol/day, Avg Rev/ชิ้น, Avg Rev/Agent และ Target pace |
| UX Sprint 3 | ทำแล้ว, รอทดสอบกับข้อมูลจริง | [UX_SPRINT_3_NOTES.md](./UX_SPRINT_3_NOTES.md) | ทำ Home Map ให้กดทำงานต่อได้จริง: คลิกพื้นที่บนแผนที่แล้วเปิด action card, เพิ่ม side list ที่ sync ตาม filter และ fallback list สำหรับรายการที่ไม่มีพิกัด |
| UX Sprint 4 | วางแผนแล้ว | `TBD` | ลดความแน่นของหน้า Overview โดยจัด tab เป็นกลุ่ม Performance, Breakdown และ Deep Dive |
| UX Sprint 5 | วางแผนแล้ว | `TBD` | เพิ่ม empty, warning และ error state ที่ใช้ซ้ำได้สำหรับ chart, table, map และ list |
| UX Sprint 6 | วางแผนแล้ว | `TBD` | ปรับการแสดงผลตามสิทธิ์ของ BD, AM และ Director ทั้งในเมนู ข้อมูล และ action |
| UX Sprint 7 | วางแผนแล้ว | `TBD` | ย้าย inline style ที่ซ้ำบ่อยไปเป็น class กลาง และลดปัญหา theme drift |
| UX Sprint 8 | วางแผนแล้ว | `TBD` | ปรับ motion และ performance รวมถึง reduced motion และการควบคุม render/polling |
| UX Sprint 9 | วางแผนแล้ว | `TBD` | วางแนวทางลดการใช้ Classic UI และกำหนดให้ V2 เป็นเป้าหมายหลักของ feature ใหม่ |

## วิธีอ่าน

1. อ่านไฟล์นี้ก่อนเพื่อดูว่า UX Sprint ไหนทำแล้ว วางแผนแล้ว หรือยังต้อง QA เพิ่ม
2. เปิด note ของ sprint ที่ทำแล้วเพื่อดูไฟล์ที่แก้ พฤติกรรมที่เปลี่ยน และ checklist สำหรับ manual test
3. ใช้ sprint ที่ยังเป็น `TBD` เป็น backlog งานถัดไป แล้วสร้างไฟล์ `UX_SPRINT_N_NOTES.md` เมื่อเริ่ม sprint นั้น

## การตรวจสอบล่าสุด

- งาน UX Sprint 1, 2 และ 3 อยู่บน branch `UX_Sprint-3`
- `git diff --check` ผ่านแล้ว มีแค่ warning เรื่อง LF/CRLF ของ Windows
- ตรวจ inline script syntax ผ่านแล้ว 5 script blocks ใน `src/Scripts.html`

## หลักการจัดไฟล์

- `UX_SPRINT_INDEX.md`: ใช้เป็นสารบัญและภาพรวมของ branch
- `UX_SPRINT_1_NOTES.md`, `UX_SPRINT_2_NOTES.md`, ...: ใช้เก็บ scope, ไฟล์ที่แก้, verification และ manual QA ของแต่ละ sprint
- branch ที่ใหม่กว่าควรเก็บ note ของ sprint ก่อนหน้าไว้ด้วย เพื่อให้ reviewer เห็นงาน UX ที่สะสมมาโดยไม่ต้องสลับ branch
