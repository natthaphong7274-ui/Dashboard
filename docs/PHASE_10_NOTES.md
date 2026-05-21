# Phase 10 Notes: Tracking Risk/Growth Insight

Branch: `codex/phase-10-tracking-risk-growth-insight`

Base branch: `codex/phase-9-risk-customer-dashboard`

## Scope

Phase 10 รอบนี้ทำเฉพาะงาน Tracking, Risk/Growth insight และการปิด export/download ตามแผน `docs/PHASE_10_12_CLEAR_EXECUTION_PLAN.md` โดยไม่แก้ Raw KPI Sheet, ไม่เปิด export/download กลับมา และไม่ลด role permission หรือ data masking เดิม

## Skill / Reference Used

- Skill used: `impeccable`
- References used: `product.md`, `harden.md`, `interaction-design.md`
- เหตุผลที่ใช้: งานนี้เป็นทั้ง product flow, UI/interaction ของ Risk/Growth และ security hardening สำหรับการปิด report/export
- หลักที่นำมาใช้: ให้ command path ชัดเจน, ลด entry point ที่เสี่ยง, ทำ disabled/blocked state ให้ predictable, และคง privacy-by-default ในรายชื่อลูกค้า

## What Changed

- สร้าง branch ใหม่จาก `codex/phase-9-risk-customer-dashboard`
- ลบ entry point ของ Report Center ออกจาก sidebar และ toolbar รายการลูกค้า
- ปิด export/download ทั้งหมดที่ฝั่ง client:
  - `exportCSV`
  - `exportTrackingReport`
  - `exportBDPerformanceReport`
  - `exportWeeklySummary`
  - `_downloadReportFile`
  - `openReportCenter`
- เพิ่ม global export policy guard `EXPORTS_DISABLED = true`
- ปรับ quick actions บน Home/Map command ที่เคยเปิด Report Center ให้ไปที่ Tracking summary แทน
- เพิ่ม sub-tab ในหน้ากลุ่มเสี่ยงและกลุ่มเติบโต:
  - `ภาพรวม`
  - `Operation Dashboard` รวม Insight, เปรียบเทียบช่วงเวลา และ Progress ไว้ใน flow เดียว
  - `ติดตามลูกค้า` / `ต่อยอดลูกค้า`
- ออกแบบ `Operation Dashboard` ใหม่ให้เป็นหน้าอ่านเร็ว:
  - Command summary บอกงานที่ควรทำก่อน
  - Priority lanes แยก High / Medium / Early / Watchlist หรือ Stable
  - Top action list เปิด Customer Popup ได้ทันที
  - Progress pulse สรุป touched / success / pending
  - Top reasons และ Avg/day normalization อยู่ในหน้าเดียว
- Added Reason Intelligence into `Operation Dashboard`:
  - `Reason coverage` shows how many scoped customers have a recorded Tracking/TrackingGrowth reason.
  - `Recorded reason mix` groups existing `reason` / `key_success` values without changing sheet schema.
  - Reason impact uses Avg Rev/day delta so partial-month comparison does not mislead.
  - `Next best action` suggests the next operating move from the most impactful recorded reason.
  - `System signals` stays separate from recorded reasons, so users can distinguish calculated signals from BD-entered reasons.
- Reworked Operation Dashboard layout:
  - Command summary now stays full width instead of stretching the left column into empty space.
  - Action list, progress, recorded reasons, and system signals are grouped in the next row for faster scanning.
  - Added `?` helper tooltips to explain metric meaning and calculation for Queue, Touched, Recovery/Conversion, Reason coverage, Priority lanes, reason impact, system signals, and Avg/day period comparison.
- Reworked Risk/Growth work tracking flow:
  - Added workflow command panel above the tracking table.
  - Shows current `cutoffPeriod`, next reset date, and reminder that saved status remains after refresh until the cutoff changes.
  - Added status filters for all, not started, waiting, active, success, and failed/unreachable.
  - Status rows now carry a workflow group so users can filter work without losing role scope or masking.
- Redesigned the Risk/Growth customer tracking worklist:
  - Replaced the wide spreadsheet-style work table with dense task cards for each customer.
  - Each card keeps the privacy-first Agent/Customer code, popup eye action, level, insight reason, Avg/day metrics, status buttons, reason/factor, and note in one scan path.
  - Risk and Growth now share the same work pattern, with Growth using positive wording and color treatment.
  - Added responsive card breakpoints so the worklist collapses cleanly instead of creating wasted horizontal space.
  - No Raw KPI Sheet schema, role permission, data masking, cutoff persistence, or `lastKnownUpdatedAt` conflict logic was changed.
- Redesigned the global filter panel into a compact workspace command bar:
  - Kept the existing filter logic and event handlers unchanged to avoid scope/masking regressions.
  - Made search the primary control, tightened filter sizing, and reduced the visual weight of the result count.
  - Improved focus/hover states and responsive wrapping so the filter area uses less vertical space on dashboard pages.
  - Updated autocomplete suggestions to hide customer names and phone numbers. Search can still match name/phone/code, but suggestions and selected values show code only.
- Fixed Tracking/TrackingGrowth status persistence:
  - Save operations now write stable status/reason keys to `Tracking` and `TrackingGrowth` instead of localized labels.
  - This avoids refresh-time normalization mismatch where a saved status could look blank after the dashboard reloads.
  - Existing role scope checks, cutoff period logic, and conflict protection are unchanged.
  - Added cutoff-scoped browser fallback persistence for Tracking/TrackingGrowth edits. Status, reason/factor, and note hydrate after Ctrl+R while the dashboard syncs back from Sheet.
  - Server-loaded rows are also merged by stable key aliases (`kind_agentCode_month`) so previously saved rows survive minor key format differences.
- เพิ่ม Risk/Growth 2-layer criteria:
  - Layer 1: Avg Rev/day delta เป็นสัญญาณหลัก
  - Layer 2: Tracking status/progress เป็นสัญญาณประกอบ
  - Risk levels: High risk, Medium risk, Early warning, Watchlist
  - Growth levels: High growth, Medium growth, Early growth, Stable good
- เพิ่ม insight ในตาราง Risk/Growth:
  - Level badge
  - Reason summary จาก Avg Rev/day, Avg Vol/day, Rev/ชิ้น และ tracking signal
- ปรับ Customer Popup ให้มีส่วน `Insight` เพิ่ม:
  - criteria level
  - Avg/day signal
  - reasons
  - tracking signal
- ปรับ Tracking/TrackingGrowth sync:
  - response ส่ง `syncVersion: phase10`
  - read-time dedupe ตาม `key` และเลือกแถวที่ `updatedAt` ล่าสุด
  - batch save เลือก duplicate ล่าสุดใน cutoff เดียวกันเพื่อกัน conflict/overwrite ผิดแถว

- Tracking duplicate-row hardening:
  - Added server-side `LockService` around single-row and batch Tracking/TrackingGrowth saves to prevent concurrent auto-save appends for the same key.
  - Save now updates the latest row for the same `key + cutoffPeriod` and removes older duplicate rows for that key/cutoff.
  - Same-user rapid auto-saves can continue without false conflict when the stale `lastKnownUpdatedAt` belongs to the same logged-in user.

## Permission / Masking Notes

- ไม่แก้ `_canAccessRow`, `_requireRowAccess`, role scope หรือ data masking
- ตารางหลักยังแสดงแบบ privacy-first ตาม Phase 9 คือใช้ Agent/Customer code และเปิดรายละเอียดผ่าน customer card ตามสิทธิ์เดิม
- Tracking/TrackingGrowth ยังคัดข้อมูลตาม session scope จาก backend เหมือนเดิม

## Testing Checklist

- ตรวจว่า sidebar ไม่มี Report Center
- ตรวจว่าหน้ารายการลูกค้าไม่มี Export CSV / Report Center
- ตรวจว่า function export/report/download ทุกตัวถูก block ด้วย Phase 10 policy
- ตรวจว่า Risk/Growth sub-tab ใหม่เปิดได้
- ตรวจว่า Insight/Period/Progress render จาก rows ที่ถูก scope แล้ว
- Check that Operation Dashboard shows Reason coverage, Recorded reason mix, Reason impact/day, Next best action, and System signals.
- Check that every Operation Dashboard `?` helper opens on hover/focus and does not hide important text.
- Refresh the Risk/Growth work tab after saving status and confirm saved status loads back from the same cutoff period.
- Use workflow filters and confirm they only hide/show rows already present in the scoped table.
- ตรวจว่า Customer Popup แสดง Insight เพิ่ม
- ตรวจว่า Tracking และ TrackingGrowth ยัง save ด้วย `lastKnownUpdatedAt`
- ตรวจว่า BD/AM/Director ยังใช้ scope เดิม
- ตรวจว่า Report Center / หน้าเดิมไม่เปิด export/download กลับมา

## Known Limitations

- Weekly comparison ยังเป็น fallback ระดับ monthly Avg/day เพราะ Raw KPI Sheet ไม่มี daily/weekly grain ใน phase นี้
- Carrier movement reason ยังสรุปจาก metric หลักเป็นหลัก หากต้องการเจาะ carrier รายลูกค้าต้องมี column carrier ต่อ customer ที่ชัดเจนกว่านี้

## Next Step

- ทดสอบผ่าน Apps Script UI ด้วย role BD, AM, Director
- ถ้าต้องการ weekly insight จริง ให้เพิ่มแหล่งข้อมูล daily/weekly ใน phase ถัดไปโดยไม่เปลี่ยน Raw KPI Sheet เดิม

## Work Log - Tracking Sheet Criteria Sync

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `product.md`, `harden.md`, `document.md`
- Purpose: make the BD/AM/Director tracking workflow easier while preventing duplicate rows, stale status, scope leakage, and confusing reset behavior.

### What Changed

- Added criteria metadata columns to both `Tracking` and `TrackingGrowth`: `criteriaType`, `criteriaMetric`, `criteriaThreshold`, `criteriaSnapshot`, `criteriaVersion`, `activeInCurrentCriteria`, `firstMatchedAt`, `lastMatchedAt`.
- Added Dashboard-to-Sheet queue sync for Risk and Growth lists.
- Sync now upserts by `key + cutoffPeriod` instead of appending a new row every refresh/save.
- Existing status, reason/factor, and note are preserved when the same customer is still in the current criteria.
- If a threshold changes and a customer no longer matches the current criteria, the row is kept but marked `activeInCurrentCriteria = FALSE`.
- New customers that match the current dashboard criteria are added to the Sheet automatically.
- Duplicate rows for the same customer/cutoff are cleaned by keeping the newest `updatedAt` row.
- Sheet values for `status` and `reason` are written as readable Thai labels, while Dashboard loading still normalizes them back to stable internal keys.
- The sync is role-scoped. BD/AM only sync rows inside their accessible scope, while Director can sync the full scoped view.
- Cutoff behavior remains period-based. On a new cutoff period, old rows stay in the old `cutoffPeriod`; the new period starts its own working queue.

### Behavior Examples

- If the Risk threshold changes from 200 to 300, customers still matching 300 remain active and keep saved status/reason/note; customers that only matched 200 are not deleted, but become inactive for the current criteria; new matching customers are inserted once.
- If the page is refreshed with Ctrl+R, saved rows are loaded from `Tracking` / `TrackingGrowth` for the current cutoff, then the dashboard list syncs back to the same rows.
- If the cutoff date changes, the previous period stays as history and current dashboard work starts under the new `cutoffPeriod`.

### Validation

- Parsed `src/Tracking.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.

### Guardrails Kept

- Raw KPI Sheet was not changed.
- Export/download remains disabled.
- Existing role permission and masking functions were not loosened.
- Tracking write access still passes through backend session and row-scope checks.

## Work Log - Two-way Tracking Status Sync

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `product.md`, `harden.md`
- Purpose: make Dashboard, Tracking Sheets, and Seed-style sheet edits share one current status source while keeping history and conflict protection.

### Current Design

- Current state remains in `Tracking` and `TrackingGrowth`. Dashboard reads these sheets and normalizes Thai labels or stable keys before rendering.
- System/computed status remains separate from user status: criteria fields describe why a customer is in Risk/Growth, while `status`, `reason` / `key_success`, and `note` are user-entered work status.
- Added status metadata columns: `statusSource`, `statusVersion`, `lastDashboardSyncAt`, `lastSheetEditAt`.
- Added `TrackingStatusHistory` for old value -> new value audit history.

### What Changed

- Dashboard saves now stamp source as `DASHBOARD`, increment `statusVersion`, and append status/reason/note changes to `TrackingStatusHistory`.
- Manual edits in the `Tracking` or `TrackingGrowth` sheets are handled by `onEdit(e)`: status/reason labels are normalized, `updatedAt` is refreshed, source is stamped as `SHEET`, version increments, and history is appended.
- Queue sync from Dashboard no longer overwrites `updatedAt` / `updatedBy` for existing rows just because the page rendered. This prevents background sync from hiding a Sheet edit or creating false conflicts.
- Local browser fallback state now yields to newer Sheet data, especially rows marked `statusSource = SHEET`, so Ctrl+R does not revive stale local values.
- Sheet health now includes `TrackingStatusHistory` so missing history setup is visible as a warning until the sheet is created.

### Conflict Behavior

- If a user has old Dashboard data open and another person edits the same row in Sheet first, Sheet `onEdit` updates `updatedAt`.
- The next Dashboard save sends `lastKnownUpdatedAt`; backend compares it with the latest `updatedAt` and returns conflict instead of silently overwriting.
- Same-user rapid Dashboard auto-saves still keep the existing guard from earlier Phase 10 work.

### Permission / Guardrails

- Raw KPI Sheet was not changed.
- Role and zone scope checks for Dashboard writes remain in `_requireRowAccess` / `_canAccessRow`.
- Sheet-side edits rely on Google Sheet permissions; they are stamped as `SHEET` and audited in history.
- Export/download remains disabled.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, and `src/Auth.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.

## Work Log - Google Sheet Tracking Health Check

### Skill / Reference Used

- Skill used: `google-drive:google-drive`, `google-drive:google-sheets`
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`
- Purpose: inspect the live Google Sheet state for Tracking criteria sync without editing the sheet.

### Problem Found

- `Tracking` now has 114 active rows for risk criteria threshold 200, matching the Dashboard count.
- Older threshold 150 rows are preserved with `activeInCurrentCriteria = FALSE`, so criteria history is not lost.
- `TrackingStatusHistory` is correctly acting as an audit/history sheet, not the current-status source.
- `TrackingGrowth` currently only has headers in the inspected range.
- `Tracking` had many duplicated `21` header columns because Google Sheets displays the `21.00` header as `21`, while the code only checked for `21.00`.
- `TrackingCutoffLog` had repeated rows because cutoff values can be returned as Date objects by Sheets and needed normalization before comparison.

### What Changed

- Added header normalization so `21` and `21.00` are treated as the same Tracking header.
- Reused cutoff-period normalization when checking existing cutoff log rows.

### Validation

- Inspected live sheet metadata and selected ranges from `Tracking`, `TrackingGrowth`, `TrackingStatusHistory`, and `TrackingCutoffLog` through the Google Drive plugin.
- Parsed `src/Tracking.js`, `src/DataReader.js`, `src/Auth.js`, and `src/Settings.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.

## Work Log - Weekly Risk/Growth Streak Design

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`, `PRODUCT.md`
- Purpose: make Risk/Growth tracking prioritize weekly continuity while keeping monthly context as secondary information.

### What Changed

- Added Thai/English header alias mapping for Tracking-related sheets so the system can read Thai display headers and older English headers safely.
- New Tracking/Growth columns created by the code now use Thai display labels where possible.
- Added `TrackingWeeklyCriteria` as a weekly criteria history sheet with Thai headers.
- Weekly sync now records each active Risk/Growth customer by week, threshold, metric, level, matched state, streak count, total matched weeks, max streak, and monthly context.
- `Tracking` and `TrackingGrowth` rows now receive weekly summary fields such as `สถานะรายสัปดาห์`, `ต่อเนื่องกี่สัปดาห์`, `เข้าเกณฑ์รวมกี่สัปดาห์`, and `เข้าเกณฑ์ในเดือนนี้`.
- The customer work list now shows a weekly signal badge and filter chips for:
  - ใหม่สัปดาห์นี้
  - ต่อเนื่อง 2+ สัปดาห์
  - ต่อเนื่อง 3+ สัปดาห์
- Customer popup now includes a Weekly signal panel with current week, streak, monthly context, and total matched weeks.

### Safety Notes

- Raw KPI sheets were not edited.
- Role scope still runs through existing backend session and row-scope checks before sync writes.
- Weekly active-row cleanup is limited to Director scope, so BD/AM queue sync cannot deactivate weekly records outside their visible scope.
- Manual tracking status, reason, and note remain separate from computed weekly criteria status.
- Existing English headers remain supported through alias mapping.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, `src/Auth.js`, and `src/Settings.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.

## Work Log - Monthly Continuity From Historical KPI Months

### Skill / Reference Used

- Skill used: `impeccable`
- Google Drive / Sheets context used: live spreadsheet structure was previously inspected through the Google Drive plugin.
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`, `PRODUCT.md`
- Purpose: let Risk/Growth tracking answer how many months a customer has repeatedly entered the criteria while keeping weekly tracking as the working view.

### What Changed

- Added monthly continuity calculation in the Dashboard from discovered `Raw-KPI-*` month metadata, so new month sheets can be included without hardcoding one fixed month.
- Risk uses the existing risk baseline logic; Growth uses previous-month comparison.
- Added monthly summary fields to `Tracking` and `TrackingGrowth`:
  - monthly state
  - current monthly streak
  - total matched months
  - max monthly streak
  - first matched month
  - latest matched month
  - matched month label
- Added `TrackingMonthlyCriteria` as a monthly criteria snapshot sheet with Thai headers.
- Customer work cards now show both weekly signal and monthly continuity.
- Customer popup now includes a Monthly continuity panel above the Weekly signal panel.

### Safety Notes

- Raw KPI sheets were not edited.
- Monthly continuity is computed from the already scoped Dashboard rows, so BD/AM visibility follows existing scope filtering.
- Monthly snapshot cleanup is limited to Director scope to avoid BD/AM deactivating records outside their visible scope.
- Manual status, reason, and note are still separate from computed monthly/weekly criteria signals.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, `src/Auth.js`, and `src/Settings.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.

## Work Log - Criteria Threshold Sync Reliability

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`
- Purpose: make Risk/Growth threshold changes reliably refresh the working queue in `Tracking` / `TrackingGrowth`.

### Problem Found

- Threshold changes were saved to Apps Script asynchronously, while the page rendered and attempted to sync the Tracking sheet immediately.
- The queue sync signature was marked before the server confirmed success. If the sync failed or ran with stale threshold state, later renders could skip the needed Sheet update.
- Director/AM tabs did not poll threshold changes, so multiple open tabs could keep an old threshold value.

### What Changed

- Risk/Growth threshold saves now wait for server confirmation before updating the UI and re-rendering.
- On confirmed threshold changes, queue sync signatures are reset so `Tracking` / `TrackingGrowth` are re-synced with the new criteria.
- Queue sync is now marked complete only after the server returns `ok`; failed syncs clear the signature so the next render can retry.
- Threshold polling now also applies to Director/AM tabs. When another tab changes the threshold, the current tab detects it, resets sync state, and re-renders.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, `src/Auth.js`, and `src/Settings.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.

## Work Log - Ctrl+R Stale Tracking Flash Fix

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`
- Purpose: prevent a stale tracking state from briefly appearing after a browser refresh.

### Problem Found

- On Ctrl+R, the Risk/Growth tab could render before the latest `Tracking` / `TrackingGrowth` rows returned from Apps Script.
- Browser localStorage could briefly show an older status, such as `success`, before the server response corrected the row.

### What Changed

- Risk/Growth tab switching now loads tracking state from Sheet first, then renders the page and selected sub-tab.
- Removed post-load local cache hydration from `loadTrackingData()` and `loadGrowthTrackingData()` so server/Sheet state is the first source of truth after refresh.
- Local cache remains only as a short-lived client fallback while editing, not as an initial render source after Ctrl+R.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, and `src/Auth.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.

## Work Log - Faster Sheet-to-Dashboard Status Refresh

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`
- Purpose: make the tracking workspace feel current when status is edited from Google Sheet while keeping local fallback safe.

### Problem Found

- Dashboard loaded fresh rows from `Tracking` / `TrackingGrowth`, then applied browser localStorage again.
- If the browser cache had no fresh `updatedAt`, it could still overwrite newer Sheet data in memory, making Sheet edits look delayed or inconsistent.
- The tracking poll interval was 60 seconds, so manual Sheet edits could feel very slow unless the user refreshed the Dashboard.

### What Changed

- Local tracking cache now applies only when it is newer than server/Sheet state. Newer Sheet rows, especially `statusSource = SHEET`, win over local cache.
- Tracking poll interval changed from 60 seconds to 8 seconds while Risk/Growth pages are active.
- Polling now avoids overlapping requests, so a slow Apps Script call will not start another tracking load on top of it.
- When the browser tab becomes visible again, Dashboard immediately reloads Risk/Growth tracking data instead of waiting for the next interval.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, and `src/Auth.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.

## Work Log - Sheet Edit Not Updating Dashboard Fix

### Skill / Reference Used

- Skill used: `impeccable`
- References used: `AGENT_with_skill.md`, `PHASE_10_12_CLEAR_EXECUTION_PLAN.md`
- Purpose: keep Sheet-to-Dashboard sync accurate without changing Raw KPI data, role scope, masking, or export rules.

### Problem Found

- Google Sheets can auto-convert `cutoffPeriod` values such as `2026-05-08` into Date values.
- Dashboard loading compared the raw Sheet value directly with the current cutoff string. When the Sheet value became a Date object, it looked like `Fri May 08 2026`, so the row was filtered out and Dashboard did not show the latest Sheet status.
- The screenshot was on `TrackingStatusHistory`, which is an audit/history sheet. Dashboard current status is read from `Tracking` and `TrackingGrowth`; history rows are not the source of truth.

### What Changed

- Added `_trackingNormalizeCutoffPeriod()` to normalize both text and Date-style cutoff values into `yyyy-MM-dd` before comparison.
- Applied cutoff normalization in Risk/Growth data loading, upsert matching, batch matching, queue sync, and Sheet edit history logging.
- Set `cutoffPeriod` columns to text format in `Tracking`, `TrackingGrowth`, and `TrackingStatusHistory` to reduce future auto-date conversion.

### Validation

- Parsed `src/Tracking.js`, `src/DataReader.js`, and `src/Auth.js` with Node `vm.Script`.
- Parsed all inline scripts in `src/Scripts.html` with Node `vm.Script`.
- Ran `git diff --check`; only Windows CRLF warnings remain, with no whitespace errors.
