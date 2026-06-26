# Phase 13 Plan: Thai-first Handover, AI, and Final QA

Branch แนะนำ: `codex/phase-13-handover-ai-thai-polish`

## เป้าหมาย

ทำให้ `Customer Insight Dashboard` พร้อมส่งมอบและดูแลต่อได้จริง โดยเน้น 5 เรื่องหลัก:

1. แดชบอร์ดเป็นภาษาไทยเป็นหลัก
2. หน้าใหม่และฟีเจอร์ AI มี loading/skeleton ที่นิ่งและเข้ากับระบบ
3. Flow แจ้งปัญหาสามารถส่งซ้ำได้โดยไม่ต้อง refresh หน้า Apps Script
4. AI service รองรับ provider อื่นนอกจาก Gemini ในอนาคต
5. มีเอกสาร Handover Markdown สำหรับส่งงานหรือส่งต่อให้ฝ่าย IT

## หลักการทำงาน

- ห้ามแก้ Raw KPI Sheet โดยตรง
- ห้ามเปิด export/download/report path ที่ Phase 10 ปิดไว้กลับมา
- ห้ามลด role permission, scope guard หรือ data masking
- ให้ภาษาไทยเป็น default copy ของระบบ
- ทำทีละชั้น: UX correctness ก่อน visual polish, แล้วค่อยเอกสารส่งมอบ
- ทุกข้อที่แก้ต้องมี validation อย่างน้อย parse/smoke test หรือ manual QA note

## Workstream A: Thai-first UI Cleanup

### Scope

ไล่ข้อความที่เหลือจาก i18n/ภาษาอังกฤษในหน้าจอจริงให้เป็นภาษาไทยหลัก โดยยังคงคำศัพท์สากลที่ผู้ใช้คุ้น เช่น Revenue, Volume, Avg Rev/day, BD, AM, Director

### Checklist

- [x] ถอด `data-i18n*` ออกจาก `src`
- [x] ถอด language switch/runtime ที่ไม่ใช้แล้วออกจาก `src`
- [x] ตรวจ `Body.html` ทุกหน้าหลักให้ copy เป็นไทยหรือ bilingual อย่างตั้งใจ
- [x] ตรวจข้อความ dynamic ใน `Scripts.html` เช่น toast, error, empty state, loading, button state
- [x] ตรวจ help modal และ issue report wording ให้ไทยชัด อ่านง่าย
- [x] ตรวจ AI panel copy ให้ไทยเป็นหลัก และไม่ใช้คำอังกฤษยาวเกินจำเป็น
- [x] ตรวจ placeholder/title/aria-label สำคัญให้ยังมีข้อความที่เหมาะสม

### Files Expected

- `src/Body.html`
- `src/Scripts.html`
- `src/Styles.html`
- `src/DesignV2.html` ถ้ามี copy หรือ style ที่เกี่ยวกับหน้าใหม่

### Acceptance Criteria

- `rg "data-i18n|setAppLang|translateDOM|data-lang-btn|TRANSLATIONS|APP_I18N" src` ไม่เจอผลลัพธ์
- หน้าหลัก, login, loading, help, issue report, AI panel อ่านเป็นไทยหลัก
- ไม่มีปุ่มภาษา/theme switch ที่ไม่ทำงานค้างใน UI
- Script parse ผ่าน

## Workstream B: AI Loading and New Page Polish

### Scope

หน้า/ฟีเจอร์ AI ที่เพิ่มเข้ามาต้องไม่รู้สึกเป็นส่วนแปะเพิ่ม ต้องมี loading, empty state, error state และ skeleton ที่เข้ากับ dashboard เดิม

### Checklist

- [x] ตรวจหน้า `ai_analytics` ว่าเปิดได้เฉพาะ Director/AM ตาม guard
- [x] เพิ่มหรือปรับ skeleton/loading state สำหรับ AI analytics
- [x] ปรับ AI insights side panel ให้มี empty state, loading state, error state และ retry/copy ที่ชัด
- [x] ปรับ customer card AI follow-up loading ให้ไม่ทำให้ layout กระโดด
- [x] ทำ global loader ให้ reusable และไม่ค้างหลัง failure
- [x] ตรวจ responsive ของ AI side panel บนจอแคบ

### Files Expected

- `src/Body.html`
- `src/Scripts.html`
- `src/Styles.html`
- `src/DesignV2.html`
- `src/GeminiService.js`
- `src/Auth.js`

### Acceptance Criteria

- AI actions แสดงสถานะกำลังประมวลผลชัดเจน
- ถ้า AI error ต้องไม่ค้าง loading
- ถ้าไม่มีข้อมูล ต้องมี empty state ที่บอกผู้ใช้ว่าทำอะไรต่อ
- Role guard ของ AI analytics ไม่เปิดข้อมูลนอก scope

## Workstream C: Issue Report Flow

### Scope

แก้ flow แจ้งปัญหาให้ส่งรายงานแล้วสามารถส่งใหม่ได้โดยไม่ต้อง refresh หน้า Apps Script และไม่ทำให้ปุ่ม/ฟอร์มค้าง disabled

### Checklist

- [x] อ่าน implementation ของ `submitSystemIssueReport()`
- [x] ตรวจ server endpoint สำหรับ issue report ใน `GeminiService.js` หรือไฟล์ที่เกี่ยวข้อง
- [x] หลังส่งสำเร็จ ต้อง reset form หรือมีปุ่ม "แจ้งปัญหาใหม่"
- [x] หลังส่งล้มเหลว ต้อง re-enable ปุ่มและรักษาข้อความที่ผู้ใช้กรอกไว้
- [x] ป้องกัน double submit ระหว่างกำลังส่ง
- [x] Toast/result message ต้องบอกสถานะชัด
- [x] ถ้า AI provider error แต่บันทึก issue สำเร็จ ต้องแยกข้อความให้เข้าใจ

### Files Expected

- `src/Body.html`
- `src/Scripts.html`
- `src/GeminiService.js`
- `src/Auth.js` ถ้ามี endpoint รวม

### Acceptance Criteria

- ส่ง report ครั้งที่ 1 สำเร็จ
- ส่ง report ครั้งที่ 2 ได้ใน session เดิมโดยไม่ต้อง refresh
- Failure path ไม่ทำให้ฟอร์มตาย
- ไม่มี duplicate submit จากการกดรัว

## Workstream D: AI Provider Abstraction

### Scope

ทำให้ระบบ AI ไม่ผูกกับ Gemini อย่างเดียว โดยยังให้ Gemini เป็น default provider และเปิดทางให้เพิ่ม provider อื่น เช่น OpenAI ได้ภายหลัง

### Design Direction

เพิ่มชั้นกลางประมาณนี้:

```text
AI settings -> provider config -> callAiGenerate()
Gemini provider -> callGeminiGenerate()
Future provider -> callOpenAiGenerate() / callOtherProvider()
```

### Checklist

- [x] สำรวจทุกจุดที่เรียก Gemini โดยตรง
- [x] สร้าง config key เช่น `AI_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_DEFAULT_MODEL`
- [x] แยก function กลางสำหรับเรียก AI ตาม provider
- [x] คง behavior เดิมของ Gemini ให้ไม่ถอย
- [x] เตรียม stub/provider interface สำหรับ provider อื่นโดยยังไม่ต้องเปิดใช้ถ้า key ไม่พร้อม
- [x] ปรับ settings UI ถ้ามี เพื่อแสดง provider/model อย่างปลอดภัย
- [x] Error message ต้องระบุ provider และสาเหตุแบบผู้ใช้เข้าใจ

### Files Expected

- `src/GeminiService.js`
- `src/Auth.js`
- `src/Body.html`
- `src/Scripts.html`

### Acceptance Criteria

- Gemini ยังใช้งานได้เหมือนเดิม
- มีจุดเดียวที่เลือก provider ก่อนเรียก AI
- ไม่มี API key ถูกส่งไป client
- Provider อื่นสามารถเพิ่มต่อโดยไม่ต้องรื้อ customer card/help/AI panel ใหม่

## Workstream E: Project Handover Markdown

### Scope

จัดทำเอกสารส่งมอบฉบับ Markdown สำหรับใช้เขียนรายงานโครงการหรือส่งให้ฝ่าย IT ดูแลต่อ

### Proposed File

`docs/PROJECT_HANDOVER.md`

### Required Sections

- [x] Executive summary
- [x] System purpose and user roles
- [x] Architecture overview
- [x] Apps Script file map
- [x] Google Sheets structure
- [x] Role, scope, permission, and masking policy
- [x] Tracking and cutoff period logic
- [x] Risk/Growth logic summary
- [x] AI features and provider configuration
- [x] Script Properties / configuration guide
- [x] Deployment and clasp workflow
- [x] QA checklist
- [x] Known limitations and future improvements
- [x] Maintenance handoff notes for IT

### Sources To Read

- `PRODUCT.md`
- `DESIGN.md`
- `docs/PHASE_10_12_CLEAR_EXECUTION_PLAN.md`
- `docs/PHASE_10_NOTES.md`
- `docs/PHASE_11_NOTES.md`
- `docs/PHASE_12_NOTES.md`
- `docs/PHASE_12_PRESENTATION_SUMMARY.md`
- `docs/CLASP.md`
- `src/*.js`
- `src/*.html`

### Acceptance Criteria

- เอกสารอ่านต่อได้โดยคนที่ไม่ได้เขียนโค้ดเอง
- มีรายการ sheet/config/role ที่ตรวจสอบได้
- ไม่เปิดเผย secret หรือ API key จริง
- มี checklist ส่งมอบและวิธี deploy/update

## Workstream F: Final Hygiene and QA

### Checklist

- [ ] ตัดสินใจว่าจะ commit `src/GeminiService.js` หรือไม่
- [ ] จัดการ scratch/backups ว่าจะเก็บ, ignore หรือไม่ stage
- [ ] แก้ trailing whitespace ในไฟล์งานจริง
- [ ] รัน parse check ของ Apps Script files
- [ ] รัน parse check ของ inline scripts
- [ ] ตรวจ `git diff --check`
- [ ] ตรวจ rename/copy search รอบสุดท้าย
- [ ] Visual QA login/loading/AI panel/help modal
- [ ] Manual QA role: Director, AM, BD
- [ ] Manual QA issue report submit twice
- [ ] Manual QA export/download ยังถูก block

## Suggested Order

1. เปิด branch ใหม่ `codex/phase-13-handover-ai-thai-polish`
2. ทำ Workstream A ให้จบก่อน เพื่อปิดเรื่องภาษาไทยและ i18n residue
3. ทำ Workstream C เพราะเป็น bug flow ที่ผู้ใช้เจอได้ตรง
4. ทำ Workstream B เพื่อ polish หน้าใหม่และ loading
5. ทำ Workstream D เมื่อ flow เดิมนิ่งแล้ว
6. ทำ Workstream E จากระบบที่เสถียรแล้ว
7. ปิดด้วย Workstream F

## Progress Log

### 2026-06-18

- สรุป scope จากไฟล์ `คู่มือสรุปการเข้าทำงานและการส่งมอบโ.txt`
- สร้าง Phase 13 plan สำหรับติดตามงานต่อ
- สถานะล่าสุดก่อนเริ่ม Phase 13:
  - `data-i18n*` ถูกถอดออกจาก `src`
  - language/theme switch runtime ไม่พบใน `src`
  - ยังมี trailing whitespace จากงาน Phase 12 หลายไฟล์
  - `src/GeminiService.js` ยังเป็นไฟล์ใหม่ที่ต้องตัดสินใจ stage/commit
- แตก branch ใหม่เป็น `codex/phase-13-handover-ai-thai-polish`
- เริ่ม Thai-first UI cleanup รอบแรกใน `src/Body.html` และ `src/Scripts.html`
- แก้ issue report success flow ให้ส่งสำเร็จแล้ว reset form และส่งรายงานใหม่ได้โดยไม่ต้อง refresh
- ปิด Workstream C ฝั่งโค้ด:
  - เพิ่ม client-side pending guard กัน double submit
  - แยก partial success เมื่อบันทึกรายงานสำเร็จแต่ AI วิเคราะห์ไม่ได้
  - ทำให้ `submitSystemIssue()` ยังบันทึกรายงานลง `System_Issues_Logs` ได้ แม้ Gemini/API error
- เดิน Workstream A ต่อ:
  - ปรับ label เมนู/settings/help report ให้ไทยเป็นหลัก
  - แปล empty/error/loading fallback กลางใน `Scripts.html`
  - แปล data quality warning และ error fallback ของ settings/issue/AI panel
  - เพิ่ม aria/title ให้ปุ่มปิด AI insights panel
- ปิด Workstream A ฝั่งโค้ด:
  - เก็บ operation dashboard/risk-growth/customer card/home quick actions ให้ไทยเป็นหลัก
  - เก็บ fallback status เช่น save failed, render error, unknown/unassigned ให้ไทย
  - เก็บ Director/AM/BD map command side panel ให้ไทยเป็นหลัก เช่น Country focus, Zone focus, Today queue, Target pace, Escalation และ action card ต่าง ๆ
  - ปรับคำใน map command side panel ให้ไทยกว่าเดิม เช่น zones/agents, Follow-up, Risk/Growth, Target, MTD/Day-1 และ push/deploy Apps Script เป็น version 70 บน deployment `+AI_V3`
  - เก็บ home/map/action-card copy เพิ่มเติมสำหรับ `/dev` เช่น เกณฑ์คะแนนบนแผนที่, การ์ดงานที่ควรทำ, popup พื้นที่, map labels, No sale/Status/Follow-up Status และ Agent Distribution
  - ลบการ์ด/ปุ่มสถานะงานติดตามออกจาก Home/map UI ทั้ง Director/AM/BD เพราะผู้ใช้ยืนยันว่าไม่ใช้ส่วนนี้แล้ว เหลือ `openTrkSummary()` เป็นฟังก์ชันภายในเท่านั้น
  - คงคำสากล/metric ที่ผู้ใช้คุ้น เช่น Revenue, Volume, Avg Rev/day, BD, AM, Director, MoM, Follow-up ในบริบทที่เป็นหัวข้อมูลหรือ metric
  - รอบ scan ล่าสุดเหลือเฉพาะ comment `No data state` ไม่ใช่ข้อความผู้ใช้เห็นจริง
- Validation ล่าสุด:
  - ไม่พบ `data-i18n*`/language runtime/theme switch residue ใน `src`
  - Backend JS parse ผ่าน รวม `src/GeminiService.js`
  - `src/Scripts.html` inline script blocks parse ผ่าน 5 blocks
  - `git diff --check` ยังไม่ผ่านเพราะ trailing whitespace เดิมใน working tree
