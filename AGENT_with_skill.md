# AGENT.md

## Project Context

This project is a Google Apps Script + HTML/CSS/JavaScript Dashboard system for BD, AM, and Director users.

The system is used to monitor customer performance, revenue, volume, tracking status, risk customers, growth customers, report exports, and future Loss / Inactive customer analysis.

Current working branch:

```text
UX_Sprint-9.5
```

This branch continues from `UX_Sprint-9`, which focused on Help & Onboarding System, including:

- Help modal
- Glossary for dashboard terms
- Keyboard shortcut guide
- Auto-show onboarding modal for first-time users
- Soft UI help button
- Reusable modal UI styles

The next development plan focuses on improving performance, security, calculation logic, Loss Dashboard, Leads tracking, and final polish for presentation.

---

# Main Development Goal

The main goal of the next development phase is to improve the Dashboard so that it becomes:

1. Faster
2. More secure
3. More accurate in calculation
4. More useful for BD decision-making
5. More suitable for presenting as a special project / academic project

The key feature direction is to support BD users in identifying customers who are Loss or Inactive and help them prioritize follow-up actions.

---

# Priority Principle

The agent must prioritize work in this order:

```text
Accuracy > Security > Performance > Usability > Visual polish
```

Do not make the UI beautiful while breaking business logic, calculation accuracy, role permission, data masking, export permission, or data security.

---

# Important Existing Features

## Authentication and Role System

The system has role-based access control, including:

- BD
- AM
- Director

Each role should only see the data allowed by its scope.

Important rule:

```text
Never allow BD or AM to access full data outside their scope.
```

---

## Report Center

The system already has a Report Center that supports:

- Tracking Report
- BD Performance Report
- Weekly Summary
- Preview before export
- Metadata in exported reports
- Internal Use Only label
- Audit log for export actions

Any future export-related change must preserve these rules.

---

## Security and Data Masking

The system already has sensitive data masking logic.

For non-Director users:

```text
Phone numbers and sensitive customer data must be masked.
```

For Director users:

```text
Director can see full data according to permission.
```

Do not remove or bypass existing security logic.

---

## Data Quality and Sheet Health

The system already has data quality checks for:

- Missing required columns
- Missing Agent Code
- Missing Agent Name
- Missing Zone
- Missing Province
- Duplicate Agent Code
- Abnormal Rev / Vol values
- Important sheet health status

Future changes must not break the data quality panel.

---

## Tracking Conflict Protection

The system already supports conflict protection when saving tracking data.

The frontend sends:

```text
lastKnownUpdatedAt
```

The backend checks the latest `updatedAt` before writing.

If the row was already edited by another user, the system must return a conflict instead of silently overwriting data.

Do not remove this protection.

---

# Skill Usage Requirement

## Mandatory Rule

Before starting any development task, the agent must check whether there is an available skill or reference document related to the task.

The project contains skill/reference files under:

```text
.agents/skills/
```

The agent must use the most relevant skill or reference before making meaningful changes.

If no skill is relevant, the agent must explicitly write this in the phase note:

```text
No relevant skill used.
```

---

## Recommended Skill / Reference Mapping

| Task Type | Recommended Skill / Reference |
|---|---|
| UI / Layout improvement | `layout`, `responsive-design`, `spatial-design` |
| UX review | `critique`, `heuristics-scoring`, `cognitive-load` |
| Security hardening | `harden` |
| Performance optimization | `optimize` |
| Documentation | `document` |
| UI polish | `polish` |
| Interaction design | `interaction-design` |
| Onboarding / Help system | `onboard`, `teach` |
| Accessibility / color | `color-and-contrast` |
| Code quality / cleanup | `audit`, `harden` |
| Motion / animation | `motion-design`, `animate` |
| Typography | `typography`, `typeset` |
| Product thinking | `product`, `personas` |
| Visual simplification | `quieter`, `distill` |
| Visual enhancement | `bolder`, `delight`, `colorize` |

---

## Skill Usage Rules

1. Do not start major code changes without checking relevant skills.
2. Use the most relevant skill for the current task.
3. If several skills are relevant, use the one that best matches the main task.
4. If a skill conflicts with business rules, follow the business rules first.
5. Security, permission, and data masking rules always have the highest priority.
6. Mention in the phase note which skill or reference was used.
7. If no skill is relevant, write `No relevant skill used` in the phase note.
8. Do not blindly follow a skill if it would break existing Apps Script, Google Sheet, role permission, or dashboard logic.

---

## Required Skill Note Format

Every phase note or work log must include this section:

```markdown
## Skill / Reference Used

- Skill used:
- Reason:
- Key guidance applied:
- Conflict with business rules:
```

Example:

```markdown
## Skill / Reference Used

- Skill used: `optimize`
- Reason: Phase 7 focuses on reducing repeated Google Sheets reads and improving dashboard speed.
- Key guidance applied: Reduce unnecessary reads, avoid heavy frontend rendering, cache only safe scoped data.
- Conflict with business rules: None.
```

---

# Work Log Requirement

Every time the agent makes any meaningful code or documentation change, it must record the change in the current phase note.

A meaningful change includes:

- Code change
- UI change
- Logic change
- Calculation change
- Security change
- Permission change
- Export/report change
- Documentation change
- File rename/delete
- New feature
- Bug fix

For each work session, the agent must update the current phase note with:

- Date
- Branch name
- Summary of work done
- Files changed
- Skill / reference used
- Reason for the change
- Testing performed
- Remaining issues
- Next action

If the current phase note does not exist, create it first.

---

## Work Log Template

```markdown
## Work Log — YYYY-MM-DD

### Branch
`UX_Sprint-9.5` or current working branch

### Summary
Briefly describe what was changed.

### Files Changed
- `src/...`
- `docs/...`

### Skill / Reference Used
- Skill used:
- Reason:
- Key guidance applied:

### Reason for Change
Explain why the change was needed.

### Testing Performed
- Tested BD login:
- Tested AM login:
- Tested Director login:
- Checked role scope:
- Checked data masking:
- Checked dashboard rendering:
- Checked report/export:
- Other:

### Remaining Issues
- ...

### Next Action
- ...
```

---

# Development Roadmap After UX_Sprint-9.5

The next roadmap is divided into 5 major phases.

---

# Phase 7: Performance & Security Hardening

## Objective

Improve dashboard loading speed and strengthen customer data privacy.

This phase should be done before adding new major features.

## Required Skills

Before working on this phase, check and use relevant skills such as:

- `optimize`
- `harden`
- `audit`
- `document`

The phase note must include which skill was used.

## Tasks

### 1. Add Cache for Frequently Used Data

Use caching to reduce repeated Google Sheets reads.

Candidate data for caching:

- Customer data
- Revenue / volume monthly data
- Tracking data
- User role data
- Target configuration
- Dashboard summary data

Cache must respect role and scope.

Important rule:

```text
Never share cached data across roles or users if the data scope is different.
```

Example:

- BD cache must contain only BD scope
- AM cache must contain only AM/team/zone scope
- Director cache can contain full scope

### 2. Add Data Cut-off Logic

The dashboard should not load all historical data every time.

Recommended cut-off:

| Page / Module | Data Range |
|---|---|
| Home Dashboard | Latest 3-6 months |
| WoW Chart | Latest 8-12 weeks |
| Customer Table | Filtered data only |
| Report Export | Load full data only when needed |

Goal:

```text
Load only necessary data for the current view.
```

### 3. Strengthen Customer Data Privacy

Customer list should avoid showing sensitive information by default.

Recommended default display:

- Customer Code
- Province
- Customer Status
- Revenue
- Volume
- Follow-up Status
- Risk / Loss / Inactive Flag

Avoid showing directly:

- Full customer name
- Full phone number
- Personal contact detail

Use an eye icon or detail button only when the role has permission.

### 4. Restrict Report Download Permission

Only Director should be allowed to download full reports.

BD and AM may:

- View limited preview
- Export only their allowed scope
- Or be blocked from exporting, depending on requirement

Every export action must keep audit logs.

## Expected Output

After Phase 7:

- Dashboard loads faster
- Data access is safer
- Sensitive customer data is better protected
- Export permission is stricter
- Existing role-based access still works correctly

## Acceptance Criteria

- BD cannot see full phone numbers
- AM cannot see data outside their scope
- Director can still see full authorized data
- Cache does not leak data across users
- Export button respects role permission
- Refresh still updates the latest data correctly
- `docs/PHASE_7_NOTES.md` is created or updated
- `docs/PHASE_INDEX.md` is updated
- Skill / Reference Used section is included in the note

---

# Phase 8: Dashboard Logic & Calculation Refinement

## Objective

Improve calculation accuracy and make the dashboard numbers more reliable.

## Required Skills

Before working on this phase, check and use relevant skills such as:

- `audit`
- `optimize`
- `document`
- `critique`

## Tasks

### 1. Fix Average Revenue / Volume Per Day Logic

Problem:

If the current month is not complete, the system should not divide by the full number of days in the month.

Example:

If today is day 15 and data is available until day 14:

```text
Average = Total / 14
```

Not:

```text
Average = Total / 30
```

Recommended display:

```text
Avg Rev/Day (14 days)
Avg Vol/Day (14 days)
```

### 2. Add Week-on-Week Comparison

Add WoW comparison to show short-term movement.

Recommended range:

```text
8-12 weeks
```

Recommended comparison style:

- Monday vs Monday
- Tuesday vs Tuesday
- Current week vs previous week
- Current week vs average of previous weeks

Recommended metrics:

- Revenue
- Volume
- Active customers
- Inactive customers
- Loss customers
- Follow-up completion

### 3. Fix Loss Baseline Logic

Do not hard-code April as the Loss comparison baseline if April is a seasonal drop period.

Recommended baseline:

```text
March
```

But baseline should be configurable.

Display the baseline clearly:

```text
Loss baseline: Mar 2026
```

## Expected Output

After Phase 8:

- Avg Rev/Day is more accurate
- Avg Vol/Day is more accurate
- WoW trend is available
- Loss comparison uses a reasonable baseline
- Dashboard numbers are easier to explain

## Acceptance Criteria

- Current month average uses actual elapsed days
- Past month average uses full month days
- WoW chart shows at least 8 weeks
- Loss baseline is not hard-coded incorrectly
- Report Center and Dashboard use the same calculation logic
- `docs/PHASE_8_NOTES.md` is created or updated
- `docs/PHASE_INDEX.md` is updated
- Skill / Reference Used section is included in the note

---

# Phase 9: Loss Dashboard Development

## Objective

Create a dedicated Loss Dashboard to help BD and management identify lost or inactive customers, understand causes, and prioritize follow-up actions.

This is the most important phase for the special project.

## Required Skills

Before working on this phase, check and use relevant skills such as:

- `product`
- `layout`
- `interaction-design`
- `critique`
- `heuristics-scoring`
- `document`

## Tasks

### 1. Create Loss Dashboard Page

Add a new dashboard page or tab:

```text
Loss Dashboard
```

Recommended filters:

- Month
- Baseline Month
- BD
- Zone
- Province
- Customer Type
- Loss Status
- Loss Reason

Recommended summary cards:

- Total Loss Customers
- Total Inactive Customers
- Lost Revenue
- Lost Volume
- Top Priority Customers
- Recovery Rate

### 2. Add Loss Reason Chart

Show reason distribution using chart.

Recommended reasons:

- Moved to competitor
- Shipping cost too high
- Business closed
- Lower sales volume
- Cannot contact
- Service issue
- Temporary pause
- Other

Recommended chart:

```text
Bar chart is preferred if there are many reasons.
```

Pie chart can be used only when categories are few.

### 3. Add Loss Effect Analysis

Show the business impact of lost customers.

Recommended metrics:

- Baseline Revenue
- Current Revenue
- Lost Revenue
- Baseline Volume
- Current Volume
- Lost Volume
- Percentage Drop

Example table:

| Customer Code | Province | Baseline Rev | Current Rev | Lost Rev | Status |
|---|---:|---:|---:|---:|---|
| C001 | Bangkok | 50,000 | 10,000 | 40,000 | Loss |
| C002 | Chonburi | 30,000 | 0 | 30,000 | Loss |

### 4. Add Priority Score

Create a priority score to rank customers that BD should follow up first.

Possible factors:

- Lost Revenue
- Lost Volume
- Recently became Loss
- Customer used to be active
- High chance of returning
- Complaint history
- Satisfaction score
- Follow-up overdue

Example formula concept:

```text
Priority Score =
Lost Revenue Weight
+ Lost Volume Weight
+ Recent Loss Weight
+ Return Probability Weight
- Low Recovery Chance Penalty
```

The exact formula can be adjusted later.

### 5. Add "Target Customers for BD" Button

Add a button such as:

```text
ชี้เป้าลูกค้าให้ BD
```

When clicked, the system should:

1. Count Loss customers
2. Count Inactive customers
3. Identify top priority customers
4. Show a short summary alert or panel
5. Auto-scroll to the customer table
6. Highlight the recommended customers

The logic should reuse existing functions if available:

```text
isLoss
isInact
```

Do not duplicate existing logic unnecessarily.

## Expected Output

After Phase 9:

- Users can see Loss and Inactive customers clearly
- BD knows who to follow up first
- Director can see revenue and volume impact
- Loss causes can be analyzed
- The system becomes more decision-oriented

## Acceptance Criteria

- Loss Dashboard has a separate tab or section
- Summary cards display correctly
- Loss reason chart works
- Lost Revenue and Lost Volume are calculated correctly
- Priority Score is shown
- Button "ชี้เป้าลูกค้าให้ BD" works
- Auto-scroll does not break existing UI
- Role-based data scope is still respected
- `docs/PHASE_9_NOTES.md` is created or updated
- `docs/PHASE_INDEX.md` is updated
- Skill / Reference Used section is included in the note

---

# Phase 10: Leads & BD Checklist Module

## Objective

Add a module for tracking leads and daily BD tasks.

This phase is useful after the Loss Dashboard is already stable.

## Required Skills

Before working on this phase, check and use relevant skills such as:

- `product`
- `interaction-design`
- `layout`
- `document`

## Tasks

### 1. Create Lead Status Dashboard

Recommended lead statuses:

- New Lead
- Interested
- Contacted
- Follow-up
- Not Interested
- Converted
- Lost Lead

Recommended summary cards:

- Total Leads
- New Leads
- Follow-up Leads
- Converted Leads
- Conversion Rate
- Overdue Follow-up

### 2. Create BD Daily Checklist

The checklist should help BD know what to do each day.

Recommended task types:

- Contact Loss customers
- Contact Inactive customers
- Follow up existing leads
- Update customer status
- Update reason for lost customers
- Update expected return date

Recommended progress display:

```text
Completed 8 / 20 tasks = 40%
```

### 3. Add Reason and Return Probability Fields

Recommended dropdown fields:

#### Loss Reason

- Moved to competitor
- Price issue
- Shipping issue
- Service issue
- Business closed
- Low sales
- Cannot contact
- Other

#### Return Probability

- High
- Medium
- Low
- Unknown

#### Expected Return Date

Use date input.

#### BD Note

Use short text area.

## Expected Output

After Phase 10:

- BD can manage daily work better
- AM can monitor BD task progress
- Leads are easier to follow
- Loss data quality improves
- The system can support future churn prediction

## Acceptance Criteria

- Lead status summary works
- BD checklist shows task progress
- Dropdown fields save correctly
- Expected return date saves correctly
- Checklist respects role scope
- No conflict with existing Tracking module
- `docs/PHASE_10_NOTES.md` is created or updated
- `docs/PHASE_INDEX.md` is updated
- Skill / Reference Used section is included in the note

---

# Phase 11: Final Polish & Presentation Readiness

## Objective

Prepare the system for final presentation and academic submission.

## Required Skills

Before working on this phase, check and use relevant skills such as:

- `polish`
- `document`
- `typography`
- `color-and-contrast`
- `critique`

## Tasks

### 1. Add Thai / English Language Toggle

Do this only after UI becomes stable.

Recommended language toggle:

```text
TH / EN
```

Do not hard-code text repeatedly.

Use a dictionary-style structure if possible.

Example:

```javascript
const I18N = {
  th: {
    lossDashboard: "แดชบอร์ดลูกค้าที่หายไป",
    revenue: "รายได้",
    volume: "จำนวนชิ้น"
  },
  en: {
    lossDashboard: "Loss Dashboard",
    revenue: "Revenue",
    volume: "Volume"
  }
};
```

### 2. Update Documentation

Create or update these files:

```text
docs/PHASE_7_NOTES.md
docs/PHASE_8_NOTES.md
docs/PHASE_9_NOTES.md
docs/PHASE_10_NOTES.md
docs/PHASE_11_NOTES.md
docs/PHASE_INDEX.md
```

Each phase note should include:

- Objective
- What was changed
- Files changed
- Skill / Reference Used
- Testing checklist
- Known limitations
- Next steps

### 3. Prepare Final Presentation Summary

Recommended presentation structure:

1. Problem Background
2. Existing Dashboard Limitation
3. Development Objective
4. System Design
5. Key Features
6. Loss Dashboard
7. BD Checklist
8. Security and Permission
9. Result / Expected Benefit
10. Future Development

## Expected Output

After Phase 11:

- System is ready for demo
- Documentation is complete
- Presentation story is clear
- The project is suitable for academic submission

## Acceptance Criteria

- TH/EN toggle works
- All new phase notes exist
- PHASE_INDEX is updated
- Final demo flow is clear
- No unfinished test UI remains
- Skill / Reference Used section is included in the note

---

# Coding Rules for the Agent

## General Rules

1. Do not remove existing working features.
2. Do not bypass authentication or role guard.
3. Do not expose sensitive customer data.
4. Do not change Google Sheet schema unless explicitly required.
5. Prefer extending existing functions instead of duplicating logic.
6. Keep UI clean and not overcrowded.
7. Always update documentation after completing a phase.
8. Always provide testing checklist after code changes.
9. Always check and use relevant skill/reference before meaningful changes.
10. Always record the skill/reference used in the phase note.

---

# Security Rules

The agent must preserve these security principles:

```text
BD sees only BD scope.
AM sees only team/zone scope.
Director sees full authorized scope.
Sensitive data must be masked for non-Director users.
Export must respect role permission.
Audit log must be preserved for important actions.
```

Do not implement any feature that allows users to bypass these rules.

---

# UI / UX Rules

The Dashboard should be:

- Clean
- Easy to read
- Not too crowded
- Useful for daily BD work
- Clear for management summary
- Consistent with existing soft UI style

Recommended UI behavior:

- Use cards for key numbers
- Use charts for trends and comparisons
- Use tables for actionable customer lists
- Use badges for status
- Use modals only when necessary
- Use auto-scroll only when it helps the workflow

Before UI/UX work, check relevant skills such as:

- `layout`
- `responsive-design`
- `interaction-design`
- `critique`
- `cognitive-load`
- `color-and-contrast`
- `typography`

---

# Data and Calculation Rules

## Average Per Day

For current month:

```text
Average = Total / Number of actual elapsed data days
```

For completed month:

```text
Average = Total / Full days in month
```

---

## Loss Baseline

Loss baseline should be configurable.

Do not hard-code April as baseline if April is a seasonal drop period.

Recommended default:

```text
March
```

---

## Loss Status

Loss logic should reuse existing helper functions if available:

```text
isLoss
isInact
```

Avoid creating conflicting definitions of Loss and Inactive.

---

# Branch Strategy

Recommended branch sequence:

```text
UX_Sprint-9.5
codex/phase-7-performance-security
codex/phase-8-dashboard-logic
codex/phase-9-loss-dashboard
codex/phase-10-leads-checklist
codex/phase-11-final-polish
```

If continuing directly from `UX_Sprint-9.5`, create a new branch:

```bash
git checkout UX_Sprint-9.5
git pull origin UX_Sprint-9.5
git checkout -b codex/phase-7-performance-security
```

---

# Documentation Requirement

Whenever the agent completes a phase or makes any meaningful work-session change, it must create or update the corresponding documentation file.

Example:

```text
After Phase 7:
- Create or update docs/PHASE_7_NOTES.md
- Update docs/PHASE_INDEX.md
```

The note must include:

```text
- Objective
- Changes made
- Files changed
- Skill / Reference Used
- Testing checklist
- Known limitations
- Next steps
- Work Log
```

---

# Testing Checklist

Before finishing any branch, test the following:

## Login and Permission

- BD login works
- AM login works
- Director login works
- BD sees only BD scope
- AM sees only assigned scope
- Director sees full authorized scope

## Security

- Phone number masking works
- Customer name visibility follows role permission
- Export permission follows role permission
- Audit log is created for export or important actions

## Dashboard

- Home dashboard loads correctly
- Cards show correct values
- Charts render correctly
- Filters work correctly
- Refresh works correctly

## Tracking

- Tracking save works
- Conflict protection works
- Existing tracking data is not overwritten silently

## Report Center

- Preview works
- Export works according to role
- Metadata appears in report
- Scope is correct

## Loss Dashboard

- Loss customers are detected correctly
- Inactive customers are detected correctly
- Loss reason chart works
- Lost revenue and volume are correct
- Priority score appears
- "ชี้เป้าลูกค้าให้ BD" button works

---

# Final Success Criteria

The project is considered successful when:

1. Dashboard loads faster.
2. Sensitive customer data is protected.
3. Calculation logic is accurate.
4. Loss Dashboard helps identify lost customers.
5. BD can prioritize follow-up actions.
6. Director can see business impact.
7. Reports respect permission and scope.
8. Documentation is complete.
9. The system is ready for academic presentation.
10. The agent uses relevant skills before meaningful development work.
11. The agent records work logs and skill usage in phase notes.

---

# Important Reminder for Agent

This project is not only a UI improvement project.

It is a decision-support dashboard for BD operation.

The agent should prioritize:

```text
Accuracy > Security > Performance > Usability > Visual polish
```

Do not make the UI beautiful while breaking business logic or data security.
