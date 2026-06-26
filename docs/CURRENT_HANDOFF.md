# Current Handoff

Last Updated: 2026-06-18

## Branch

Current branch:

```text
codex/phase-13-handover-ai-thai-polish
```

Base branch before Phase 13:

```text
phase-12_login-loading-final-polish
```

## Current Objective

รับงานต่อเข้าสู่ Phase 13 ตามแผน [PHASE_13_PLAN.md](./PHASE_13_PLAN.md)

เป้าหมายหลัก:

1. ทำ dashboard ให้เป็นภาษาไทยเป็นหลัก
2. ปรับหน้าใหม่และ AI loading/skeleton ให้ใช้งานได้เนียนขึ้น
3. แก้ flow แจ้งปัญหาให้ส่งซ้ำได้โดยไม่ต้อง refresh หน้า Apps Script
4. เตรียม AI provider abstraction เพื่อรองรับ provider อื่นนอกจาก Gemini
5. ทำเอกสาร handover สำหรับส่งมอบโครงการหรือส่งต่อให้ฝ่าย IT

## Current State

- Phase 12 มีงาน login/loading/final polish และ AI features เพิ่มเข้ามาแล้ว
- มีการถอด `data-i18n*` และ language/theme switch runtime ออกจาก `src` แล้ว
- มีแผน Phase 13 ที่ติดตามงานได้ใน `docs/PHASE_13_PLAN.md`
- Repo ยังเป็น dirty working tree จากงาน Phase 12 และงานที่ antiantigravity ทำต่อ
- มี scratch/backups/untracked files จำนวนมาก ต้องคัดก่อน stage/commit

## Done

- Renamed product surface เป็น `Customer Insight Dashboard`
- เพิ่ม/ปรับ login และ splash loading UI
- เพิ่ม Desert Horse loading mini game
- เพิ่ม interactive mouse-tracking eyes บน login
- เพิ่ม Director unlock UI ใน login card
- เพิ่ม AI-related surfaces:
  - customer card AI follow-up
  - AI insights side panel
  - AI analytics page/tab
  - issue report with AI support
- เพิ่ม `src/GeminiService.js` สำหรับ Gemini/AI service แต่ยังเป็น untracked file
- ถอด `data-i18n*` ออกจาก `src`
- ถอด language switch/runtime ที่ไม่ใช้แล้วออกจาก `src`
- ลบ CSS dead code ของ language/theme segmented controls
- สร้าง `docs/PHASE_13_PLAN.md`
- สร้างไฟล์ handoff นี้สำหรับส่งต่องานระหว่าง Codex และ antiantigravity
- แตก branch ใหม่เป็น `codex/phase-13-handover-ai-thai-polish`
- ปรับ copy สำคัญใน `src/Body.html` และ dynamic loading/error/retry copy บางส่วนใน `src/Scripts.html` ให้ไทยเป็นหลัก
- แก้ `submitSystemIssueReport()` ให้เมื่อส่งปัญหาสำเร็จแล้ว reset form, แสดง success message ในฟอร์มเดิม และส่งปัญหาใหม่ได้โดยไม่ต้อง refresh หน้า
- ปิด Workstream C ฝั่งโค้ด:
  - เพิ่ม `_systemIssueSubmitPending` กัน double submit ระหว่างส่งรายงาน
  - แยกข้อความ partial success เมื่อบันทึกรายงานสำเร็จแต่ AI ยังวิเคราะห์ไม่ได้
  - ปรับ `submitSystemIssue()` ให้บันทึกลง `System_Issues_Logs` ต่อได้ แม้ Gemini/API error
- เดิน Workstream A ต่อรอบสอง:
  - ปรับ copy ใน nav/settings/help report ให้ไทยเป็นหลักขึ้น
  - แปล empty/error/loading fallback กลางใน `src/Scripts.html`
  - แปล data quality warning และ error fallback ของ settings/issue/AI panel
  - เพิ่ม aria/title ให้ปุ่มปิด AI insights panel
- ปิด Workstream A ฝั่งโค้ด:
  - เก็บ operation dashboard/risk-growth/customer card/home quick actions ให้ไทยเป็นหลัก
  - เก็บ fallback status เช่น save failed, render error, unknown/unassigned ให้ไทย
  - เก็บ Director/AM/BD map command side panel ให้ไทยเป็นหลัก เช่น Country focus, Zone focus, Today queue, Target pace, Escalation และ action card ต่าง ๆ
  - ปรับคำใน map command side panel ให้ไทยกว่าเดิม เช่น zones/agents, Follow-up, Risk/Growth, Target, MTD/Day-1 และ push/deploy Apps Script เป็น version 70 บน deployment `+AI_V3`
  - เก็บ home/map/action-card copy เพิ่มเติมสำหรับ `/dev` เช่น เกณฑ์คะแนนบนแผนที่, การ์ดงานที่ควรทำ, popup พื้นที่, map labels, No sale/Status/Follow-up Status และ Agent Distribution
  - ลบการ์ด/ปุ่มสถานะงานติดตามออกจาก Home/map UI ทั้ง Director/AM/BD เพราะผู้ใช้ยืนยันว่าไม่ใช้ส่วนนี้แล้ว เหลือ `openTrkSummary()` เป็นฟังก์ชันภายในเท่านั้น
  - คงคำสากล/metric ที่ผู้ใช้คุ้น เช่น Revenue, Volume, Avg Rev/day, BD, AM, Director, MoM, Follow-up ในบริบทหัวข้อมูลหรือ metric
  - แปลป็อปอัปแผนที่ (Map Selection Popup Card) เป็นภาษาไทยครบถ้วน (หัวข้อการ์ด, ป้ายกำกับ, สถิติเทียบเดือนก่อน, ปุ่มดำเนินการด้านล่าง)
  - พัฒนาโครงสร้าง AI Provider Abstraction (Workstream D) สำหรับสลับใช้งาน Google Gemini และ OpenAI ได้จากหน้าตั้งค่าระบบโดยตรง
  - สร้างเอกสารส่งมอบโครงการ [PROJECT_HANDOVER.md](file:///c:/Users/User/OneDrive/Desktop/Dashboard/docs/PROJECT_HANDOVER.md) ครบถ้วนตามหัวข้อสำหรับ IT
  - deploy การปรับปรุงภาษาไทย แผนที่ และระบบ Abstraction ทั้งหมดเสร็จสิ้นด้วย clasp push
  - แก้ไขและตรวจสอบประเด็น Trailing Whitespace ในไฟล์ทำงานจริงทั้งหมดเรียบร้อยแล้ว โดยรัน `git diff --check` และ `git diff --staged --check` ผ่าน 100% ไม่มีข้อผิดพลาดค้างอยู่
  - อัปเดตไฟล์ `.gitignore` เพื่อแยกและซ่อนโฟลเดอร์ทดสอบ/ไฟล์ขยะ/ไฟล์ชั่วคราว (scratch, backups, plugin noise) ทำให้ git status คืนสถานะคลีนและปลอดภัย
  - ทดสอบการทำงานของ `clasp push` ส่งไฟล์ทั้งหมด 18 ไฟล์สำเร็จเรียบร้อยโดยไม่มีข้อผิดพลาด

## In Progress

- ทำความสะอาดและทดสอบระบบในขั้นตอนสุดท้าย (Workstream F: Final Hygiene and QA)

## Next Steps

1. ทำการทดสอบระบบ (Manual QA) ด้วย account บทบาทต่างๆ บนระบบทดสอบจริง: Director, AM, BD
2. สังเกตการณ์ใช้งานระบบ AI และพฤติกรรมของป็อปอัป Modal วิเคราะห์แบบไม่เต็มความยาวตัวอักษร
3. เตรียมการส่งมอบงานขั้นสุดท้ายให้ผู้ใช้งาน


## Touched Files Recently

- `src/Body.html`
- `src/Scripts.html`
- `src/Styles.html`
- `docs/PHASE_13_PLAN.md`
- `docs/CURRENT_HANDOFF.md`

Other modified files already present from Phase 12 / antiantigravity work:

- `.agents/skills/impeccable/scripts/critique-storage.mjs`
- `docs/UX_SPRINT_9_5_NOTES.md`
- `src/Auth.js`
- `src/Config.js`
- `src/DataReader.js`
- `src/DesignV2.html`
- `src/Tracking.js`
- `src/Scripts.html.bak_v11` deleted

Important untracked file:

- `src/GeminiService.js`

## Validation So Far

- `rg "data-i18n|setAppLang|translateDOM|data-lang-btn|TRANSLATIONS|APP_I18N" src` returned no matches after cleanup
- `rg "data-i18n|data-i18n-html|data-i18n-title|data-i18n-placeholder|data-i18n-aria|setAppLang|APP_I18N|translateDOM|data-lang-btn|I18N|TRANSLATIONS|translation|app-pref-controls|seg-control|nav-pref-controls|login-pref-controls|data-theme-btn|setAppTheme" src` returned no matches after latest cleanup
- Backend JS parse passed for:
  - `src/Auth.js`
  - `src/Config.js`
  - `src/DataReader.js`
  - `src/Tracking.js`
  - `src/GeminiService.js`
- `src/Scripts.html` inline script blocks parse passed, 5 blocks
- Workstream C code path parse passed after double-submit guard and AI-warning handling
- Workstream A scan passed for targeted user-facing English leftovers; only code comment `No data state` remained
- `git diff --check` still fails due to trailing whitespace and blank EOF lines in existing dirty files

## Known Risks

- `src/GeminiService.js` is untracked but appears to be real AI functionality, not scratch
- `.agents/scratch/`, `.impeccable/critique/`, `backups_pre_i18n/`, and `docs/oklch-color-architecture/` include many untracked files, do not stage all blindly
- PowerShell may display Thai text as mojibake, but files checked with Node are UTF-8
- Some Phase 12 notes may say `git diff --check` passed, but current working tree now fails due to whitespace
- Export/report/download code paths still exist in old code but are guarded by Phase 10 policy, do not restore them

## Do Not Touch Without Explicit Reason

- Raw KPI sheet structure or live spreadsheet data
- Export/download/report disabled paths
- Role permission guards
- Data masking / scope filtering
- Unrelated scratch files
- User changes outside the current workstream

## Handoff Protocol For Any Agent

Before starting:

1. Read `docs/PHASE_13_PLAN.md`
2. Read this file
3. Run `git status --short`
4. Work only on the current `Next Steps` unless the user says otherwise

Before stopping, switching tools, or when close to a context/usage limit:

1. Update this file
2. Add what was done under `Done`
3. Move active work into `In Progress`
4. Rewrite `Next Steps` so the next agent can continue immediately
5. Record validation commands and results

Prompt to give the next tool:

```text
อ่าน docs/PHASE_13_PLAN.md และ docs/CURRENT_HANDOFF.md ก่อน
จากนั้นดู git status
รับงานต่อจาก Next Steps เท่านั้น
ห้าม revert งานเดิม
ถ้าทำเสร็จหรือใกล้ limit ให้ update docs/CURRENT_HANDOFF.md
```
