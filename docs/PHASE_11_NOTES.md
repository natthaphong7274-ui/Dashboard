# Phase 11 Notes: Role Tracking Map User Online

Branch: `phase-11_role-tracking-map-user-online`

Base branch: `10.5_new`

## Scope

Phase 11 starts from the cleaned Phase 10.5 base plus tracking status reliability. The intent is to improve role-based operating views without bringing back the later Phase 10 cache, prepared payload, or ready-payload complexity.

## Skill / Reference Used

- Skill used: `impeccable`
- Register: product
- Context used: `PRODUCT.md`
- Reference used: `reference/product.md`

Design direction: calm operational dashboard, dense but readable, role-first clarity, familiar product UI controls.

## What Changed

- Added a Phase 11 role summary strip to Risk and Growth work views.
- The strip adapts to the current role:
  - BD: shows scoped worklist context.
  - AM: shows team view context and zone support cue.
  - Director: shows overview and escalation cue.
- Added role-scoped work metrics:
  - open work count
  - reason coverage
  - primary account or top zone inside the already scoped rows
- Added responsive styling for the role strip across desktop, tablet, and mobile.
- Removed the standalone `Tracking` sidebar entry because Risk/Growth work tabs now own the customer follow-up workflow.
- Normalized Package grouping in charts and drills:
  - Package cells with comma-separated values are split into individual package labels.
  - Revenue and volume are allocated evenly across split package labels to avoid inflated package totals.
  - Empty package values show as `ไม่ระบุ Package` instead of `?`.
  - Package drill-down still includes rows where the clicked package appears inside a multi-package cell.
- Added Phase 11 map criteria:
  - Map action cards now calculate a `Map Score` from Avg Rev/day movement, Risk count, Growth count, and Avg Vol/day movement.
  - Map action cards show Avg Rev/day, Avg Vol/day, Risk/Growth count, and suggested action.
  - Map action cards show top drop carrier and top growth carrier using normalized carrier revenue/day movement.
  - The map criteria legend now explains `Map Score` instead of Avg Rev/day-only color rules.
  - Map focus list now ranks areas by Map Score before action count and revenue.
- Renamed prominent Home shortcuts from `Tracking` to `สรุปงานติดตาม` so the sidebar removal does not leave a duplicate mental model.
- Added Director-only User Management online/last-active visibility:
  - Active sessions are indexed from existing token script properties.
  - Online status uses the heartbeat window, with last active time in Asia/Bangkok.
  - User rows sort locked users first, then failed-login risk, then online users.
- Added Phase 11 team pulse inside Risk/Growth customer work views:
  - BD sees the same scoped queue grouped by province.
  - AM sees team progress grouped by zone from scoped rows only.
  - Director sees zone workload progress sorted by open workload and impact/day.
  - The pulse shows open work, touched rate, reason coverage, and recovery/conversion.
- Renamed key Home follow-up shortcuts and status cards away from standalone `Tracking` wording.
- Aligned Report Center, weekly summary, customer card, and help text wording toward `Follow-up` while keeping internal sheet/function names unchanged.

## Guardrails Kept

- Raw KPI sheets were not changed.
- Role scope and masking were not loosened.
- No export or download entry point was restored.
- Disabled export/report code paths remain disabled by design for Phase 11 scope safety.
- No Phase 10.6-10.23 cache, prepared data, or ready payload code was reintroduced.
- The new strip uses only rows already visible to the current client scope.
- Team pulse aggregation uses only the current scoped Risk/Growth rows and existing tracking status data.
- User online/last-active stays inside the existing Director-only server endpoint and does not expose user agent details.

## Validation

- Backend Apps Script parse passed for `Tracking.js`, `DataReader.js`, `Auth.js`, `Settings.js`, and `Constants.js`.
- Inline scripts in `Scripts.html` parse passed.
- `git diff --check` passed with LF-to-CRLF normalization warnings only.

## Phase 11 Closure

- Phase 11 is functionally complete against the local plan.
- BD daily worklist is covered by Risk/Growth work cards plus the province queue pulse; keep a separate dedicated BD-only section as a future enhancement only if field use shows the cards are not enough.
- Next recommended work is Phase 12: login/loading polish, final responsive QA, and final docs/presentation summary.
