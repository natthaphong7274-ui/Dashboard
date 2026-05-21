# Dashboard Phase 10-12 Clear Execution Plan

> เอกสารนี้เป็นแผนงานฉบับปรับให้ชัดเจนขึ้น หลัง `codex/phase-9-risk-customer-dashboard`  
> เป้าหมายหลัก: ทำให้ Codex และทีมพัฒนาเข้าใจว่าแต่ละ Phase ต้องทำอะไร ก่อน-หลังอย่างชัดเจน  
> กฎสำคัญ: ห้ามแก้ Raw KPI Sheet, ห้ามเปิด export/download กลับมา, ห้ามลด role/scope/masking

---

## 1. Current Status

Phase 9 ทำฐานของหน้า Risk/Growth แล้วบางส่วน ได้แก่:

- มีหน้า `กลุ่มเสี่ยง` และ `กลุ่มเติบโต`
- มี sub-tab พื้นฐาน เช่น `ภาพรวม`, `ติดตามลูกค้า`, `ต่อยอดลูกค้า`
- มี `Customer Card Popup`
- ใช้ `Avg Rev/day` เป็น metric หลักสำหรับ Risk/Growth
- ตารางหลักเน้น `Agent / Customer Code` เพื่อลดการเปิดเผยข้อมูลเกินจำเป็น

ดังนั้น Phase ต่อไป **ไม่ควรรื้อใหม่ทั้งหมด** แต่ควรต่อยอดจาก Phase 9 และทำให้แผนชัดเจนขึ้น โดยเฉพาะ:

1. Tracking sync
2. Export removal
3. Risk/Growth 2-layer criteria
4. Insight & Progress sub-tabs
5. Weekly / period comparison
6. Role-based tracking
7. Map criteria
8. Login/loading/final polish

---

## 2. Updated Phase Overview

| Phase | ชื่อ Phase | จุดประสงค์ | Priority | สถานะที่ควรทำ |
|---|---|---|---|---|
| Phase 10 | Tracking Sync + Risk/Growth Insight + Export Removal | แก้ฐานข้อมูลสถานะ, ลบ export, ทำ Risk/Growth ให้บอกเหตุผลและความคืบหน้าได้ | P0 | ทำก่อนทันที |
| Phase 11 | Role-based Tracking + Map + User Online | ทำให้แต่ละบทบาทใช้ dashboard ได้จริง และปรับ map/user management | P1 | ทำหลัง Phase 10 |
| Phase 12 | Login/Loading + Final Polish + Docs | ปรับหน้าตาและเตรียมส่งงาน/พรีเซนต์ | P2 | ทำท้ายสุด |

---

# 3. Phase 10 - Tracking Sync + Risk/Growth Insight + Export Removal

## 3.1 Goal

Phase 10 คือ Phase หลักที่ต้องทำก่อน เพราะเกี่ยวกับความถูกต้องของข้อมูลและความปลอดภัยของระบบ

เป้าหมายคือ:

- ทำให้ `Tracking` และ `TrackingGrowth` sync ถูกต้องระหว่าง Dashboard กับ Google Sheet
- ลบ `Report Center` และปิดทุกช่องทาง export/download
- ทำให้หน้า `กลุ่มเสี่ยง` และ `กลุ่มเติบโต` มี sub-tab ชัดเจนสำหรับดู insight, performance และความคืบหน้า
- ทำให้ Risk/Growth แบ่งเกณฑ์เป็น 2 ชั้น คือ `ระดับ` + `เหตุผล`

---

## 3.2 Phase 10 Task List

| ID | งาน | รายละเอียด | Expected Files | Priority |
|---|---|---|---|---|
| 10.1 | Verify Tracking Sync | ตรวจ Dashboard -> Sheet และ Sheet -> Dashboard | `src/Tracking.js`, `src/Scripts.html`, `src/DataReader.js` | P0 |
| 10.2 | Audit Tracking Sheets | ตรวจ `Tracking`, `TrackingGrowth`, `TrackingCutoffLog`, conflict sheet | `src/Tracking.js` | P0 |
| 10.3 | Fix Duplicate/Conflict | ป้องกัน status ซ้ำ, stale status, conflict update | `src/Tracking.js`, `src/Cache.js` | P0 |
| 10.4 | Remove Report Center UI | ลบเมนู Report Center, ปุ่ม Download, Export, Generate Report | `src/Body.html`, `src/Scripts.html`, `src/Styles.html` | P0 |
| 10.5 | Disable Export Functions | ปิด/guard function export ทุกจุด | `src/Auth.js`, `src/Tracking.js`, `src/Scripts.html` | P0 |
| 10.6 | Add Risk/Growth 2-layer Criteria | ชั้น 1 = ระดับ, ชั้น 2 = เหตุผล | `src/Scripts.html`, `src/DataReader.js` | P0 |
| 10.7 | Add Risk Sub-tabs | เพิ่ม sub-tab ในหน้า `กลุ่มเสี่ยง` | `src/Body.html`, `src/Scripts.html`, `src/Styles.html` | P0 |
| 10.8 | Add Growth Sub-tabs | เพิ่ม sub-tab ในหน้า `กลุ่มเติบโต` | `src/Body.html`, `src/Scripts.html`, `src/Styles.html` | P0 |
| 10.9 | Weekly / Period Comparison | ถ้ามีข้อมูลรายสัปดาห์ให้ทำ WoW; ถ้าไม่มีให้ใช้ MTD same-period | `src/DataReader.js`, `src/Scripts.html` | P1 |
| 10.10 | Improve Customer Popup Insight | เพิ่ม carrier movement, Avg Rev/day, Avg Vol/day, Rev/ชิ้น | `src/Scripts.html`, `src/Styles.html` | P1 |

---

## 3.3 Required Sub-tabs in Risk/Growth Pages

ส่วนนี้คือจุดที่ต้องเพิ่มให้ชัดในแผนงาน เพื่อให้หน้า `กลุ่มเสี่ยง/เติบโต` ไม่ได้มีแค่รายชื่อลูกค้า แต่มีหน้า insight และ progress สำหรับวิเคราะห์และติดตามงานจริง

---

### 3.3.1 Risk Customer Page - หน้ากลุ่มเสี่ยง

ต้องมี sub-tab อย่างน้อย 5 หน้า:

| Sub-tab | จุดประสงค์ | สิ่งที่ต้องแสดง | ใช้ตอบคำถาม |
|---|---|---|---|
| 1. ภาพรวม | ดูสถานการณ์กลุ่มเสี่ยงทั้งหมด | Risk customers, High/Medium/Early Risk, Lost Revenue, Lost Volume | ตอนนี้มีลูกค้าเสี่ยงกี่รายและกระทบเท่าไร |
| 2. วิเคราะห์สาเหตุ | ดูว่าทำไมยอดลด | Top reasons, Avg Rev/day drop, Avg Vol/day drop, Rev/ชิ้น drop, carrier drop | ยอดลดเพราะอะไร |
| 3. เปรียบเทียบรายสัปดาห์ | ดู movement ระยะสั้น | This week vs last week, MTD same-period, trend direction | สัปดาห์นี้ดีขึ้นหรือแย่ลง |
| 4. ประสิทธิภาพการติดตาม | ดู performance ของ BD | Contacted, Not contacted, Waiting, Recovered, Recovery Rate, Overdue | BD ติดตามได้คืบหน้าแค่ไหน |
| 5. รายชื่อลูกค้า | ใช้ทำงานรายลูกค้า | Customer list, status, reason, note, updatedBy, updatedAt, popup button | ต้องติดตามลูกค้าคนไหนต่อ |

#### Risk Insight Metrics

- Total Risk Customers
- High Risk / Medium Risk / Early Risk
- Lost Revenue estimate
- Lost Volume estimate
- Avg Rev/day drop
- Avg Vol/day drop
- Rev/ชิ้น drop
- Top 5 drop carriers
- Top 5 risk provinces/zones
- Top 5 risk reasons

#### Risk Progress Metrics

- Contacted customers
- Not contacted customers
- Waiting for response
- Recovered customers
- Overdue follow-up
- Recovery Rate
- Lost Revenue recovered estimate

---

### 3.3.2 Growth Customer Page - หน้ากลุ่มเติบโต

ต้องมี sub-tab อย่างน้อย 5 หน้า:

| Sub-tab | จุดประสงค์ | สิ่งที่ต้องแสดง | ใช้ตอบคำถาม |
|---|---|---|---|
| 1. ภาพรวม | ดูสถานการณ์กลุ่มเติบโตทั้งหมด | Growth customers, High/Medium/Early Growth, Growth Revenue, Growth Volume | ตอนนี้มีลูกค้าโตขึ้นกี่ราย |
| 2. วิเคราะห์สาเหตุ | ดูว่าทำไมยอดโต | Top growth reasons, Avg Rev/day increase, Avg Vol/day increase, Rev/ชิ้น increase, carrier growth | ยอดโตเพราะอะไร |
| 3. เปรียบเทียบรายสัปดาห์ | ดูว่าโตต่อเนื่องไหม | This week vs last week, trend direction, slowed growth | ลูกค้าโตต่อเนื่องหรือเริ่มชะลอ |
| 4. ประสิทธิภาพการต่อยอด | ดู performance การต่อยอดของ BD | Touched, Not touched, Converted, Pending, Growth Conversion Rate | BD ต่อยอดลูกค้าโตได้แค่ไหน |
| 5. รายชื่อลูกค้า | ใช้ทำงานรายลูกค้า | Customer list, growth status, next action, note, updatedBy, updatedAt, popup button | ควรต่อยอดลูกค้าคนไหนต่อ |

#### Growth Insight Metrics

- Total Growth Customers
- High Growth / Medium Growth / Early Growth
- Growth Revenue estimate
- Growth Volume estimate
- Avg Rev/day increase
- Avg Vol/day increase
- Rev/ชิ้น increase
- Top 5 growth carriers
- Top 5 growth provinces/zones
- Top 5 growth reasons

#### Growth Progress Metrics

- Touched customers
- Not touched customers
- Pending follow-up
- Converted / successfully expanded customers
- Growth Conversion Rate
- Revenue opportunity estimate

---

## 3.4 Risk/Growth 2-layer Criteria

### Layer 1 - Classification Level

#### Risk Customer

| Level | Rule | Label |
|---|---|---|
| High Risk | `Avg Rev/day` drops more than 40% | เสี่ยงสูง |
| Medium Risk | `Avg Rev/day` drops 20-40% | เสี่ยงกลาง |
| Early Risk | `Avg Rev/day` drops 10-20% | เริ่มเสี่ยง |
| Watchlist | Slight decrease or unstable trend | เฝ้าระวัง |

#### Growth Customer

| Level | Rule | Label |
|---|---|---|
| High Growth | `Avg Rev/day` increases more than 40% | เติบโตสูง |
| Medium Growth | `Avg Rev/day` increases 20-40% | เติบโตกลาง |
| Early Growth | `Avg Rev/day` increases 10-20% | เริ่มเติบโต |
| Stable Good | Stable revenue with good performance | คงที่ดี |

### Layer 2 - Reason / Context

#### Risk Reasons

- `Avg Rev/day` ลดลง
- `Avg Vol/day` ลดลง
- `Rev/ชิ้น` ลดลง
- Carrier หลักลดลง
- ลูกค้ายังไม่ได้รับการติดตาม
- สถานะติดตามยังค้าง
- Current month เป็น partial month ต้อง normalize ด้วยจำนวนวันที่มีข้อมูลจริง

#### Growth Reasons

- `Avg Rev/day` เพิ่มขึ้น
- `Avg Vol/day` เพิ่มขึ้น
- `Rev/ชิ้น` เพิ่มขึ้น
- Carrier หลักเติบโต
- ลูกค้ากลับมาใช้งาน
- ใช้หลาย carrier มากขึ้น
- BD follow-up แล้วเกิดผลดี

---

## 3.5 Weekly / Period Comparison Rule

ให้ใช้ logic แบบ fallback เพื่อไม่ให้ Codex ติดว่าไม่มีข้อมูลรายสัปดาห์

| Data Available | วิธีเปรียบเทียบที่ให้ใช้ |
|---|---|
| มีข้อมูลรายวัน/รายสัปดาห์ | ใช้ Week-on-Week (WoW) |
| ไม่มีข้อมูลรายสัปดาห์ แต่มี monthly KPI | ใช้ MTD same-period comparison เช่น วันที่ 1-14 เดือนนี้ เทียบวันที่ 1-14 เดือนก่อน |
| มีเฉพาะข้อมูลสรุปเดือน | ใช้ Avg Rev/day และ Avg Vol/day แทนยอดรวม |

ข้อห้าม:

- ห้ามใช้ยอดรวมเดือนปัจจุบันเทียบเดือนเต็มโดยตรง
- ห้ามทำให้ผู้ใช้เข้าใจผิดว่าเดือนปัจจุบันปิดเดือนแล้ว
- ต้องแสดง label เช่น `Avg Rev/day (14 days)` หรือ `Current month partial`

---

## 3.6 Phase 10 Acceptance Criteria

Phase 10 จะถือว่าเสร็จเมื่อ:

- Dashboard -> Sheet sync ได้ถูกต้อง
- Sheet -> Dashboard refresh แล้วเห็นข้อมูลล่าสุด
- `Tracking` และ `TrackingGrowth` ไม่เกิด duplicate status ที่ทำให้ตารางเพี้ยน
- Report Center ถูกลบจาก navigation แล้ว
- ไม่มี export/download entry point เหลืออยู่
- Function export ถูกปิดหรือ guard แล้ว
- หน้า `กลุ่มเสี่ยง` มี sub-tab ครบตาม 3.3.1
- หน้า `กลุ่มเติบโต` มี sub-tab ครบตาม 3.3.2
- Risk/Growth มี 2-layer criteria: level + reason
- Popup แสดง insight เพิ่มขึ้นแต่ยังไม่หลุด role/scope/masking

---

# 4. Phase 11 - Role-based Tracking + Map + User Online

## 4.1 Goal

Phase 11 คือการทำให้ dashboard ใช้งานจริงในแต่ละ role ได้ดีขึ้น หลังจาก Phase 10 ทำให้ข้อมูลนิ่งแล้ว

---

## 4.2 Phase 11 Task List

| ID | งาน | รายละเอียด | Expected Files | Priority |
|---|---|---|---|---|
| 11.1 | Role-based Tracking Views | แยกมุมมอง BD, AM/Manager, Director | `src/Body.html`, `src/Scripts.html` | P1 |
| 11.2 | BD Worklist | แสดงงานด่วนวันนี้, งานค้าง, ลูกค้าเสี่ยง, ลูกค้าโต | `src/Tracking.js`, `src/Scripts.html` | P1 |
| 11.3 | AM/Manager View | แสดง progress ของ BD ในทีม | `src/Scripts.html` | P1 |
| 11.4 | Director View | แสดง risk impact, growth opportunity, team summary | `src/Scripts.html` | P1 |
| 11.5 | Map Popup Improvement | popup แผนที่ต้องมีการเปรียบเทียบและอธิบายเหตุผล | `src/Scripts.html`, `src/Styles.html` | P1 |
| 11.6 | Map Criteria Redesign | ใช้ normalized metrics ไม่ใช่ยอดรวมอย่างเดียว | `src/DataReader.js`, `src/Scripts.html` | P1 |
| 11.7 | User Online Status | แสดง online/offline, last active, role, zone | `src/Auth.js`, `src/Body.html`, `src/Scripts.html` | P2 |
| 11.8 | Tracking UI Redesign | ปรับ layout, filter, priority tags, empty state | `src/Styles.html`, `src/Body.html` | P2 |

---

## 4.3 Role-based Tracking Structure

### BD View

- งานด่วนวันนี้
- ลูกค้าเสี่ยงที่ยังไม่ได้ติดต่อ
- ลูกค้าที่รอตอบกลับ
- ลูกค้าเติบโตที่ควรต่อยอด
- งานค้าง/overdue
- progress: ทำแล้ว / ทั้งหมด

### AM / Manager View

- progress ของ BD แต่ละคน
- จำนวนลูกค้าเสี่ยงที่ติดต่อแล้ว/ยังไม่ติดต่อ
- recovery rate ราย BD
- growth conversion ราย BD
- overdue task ราย BD

### Director View

- risk impact รวม
- growth opportunity รวม
- province/zone performance
- team progress summary
- high risk area / high growth area

---

## 4.4 Map Popup and Criteria

### Map Popup ต้องแสดง

- Province / Zone
- Current Avg Rev/day
- Previous Avg Rev/day
- % Change
- Risk Customer Count
- Growth Customer Count
- Top drop carrier
- Top growth carrier
- Suggested action เช่น `Focus recovery`, `Monitor`, `Growth opportunity`

### Map Criteria ใหม่

ไม่ควรใช้ยอดรวมอย่างเดียว เพราะจังหวัดใหญ่จะได้เปรียบ ควรใช้ score แบบผสม:

```text
Map Score = Avg Rev/day Change Score + Risk Count Score + Growth Count Score + Volume Movement Score
```

---

## 4.5 Phase 11 Acceptance Criteria

- BD เห็นเฉพาะงานใน scope ตัวเอง
- AM/Manager เห็นเฉพาะทีม/โซนที่เกี่ยวข้อง
- Director เห็นภาพรวมตามสิทธิ์
- Tracking แสดงงานวันนี้, งานค้าง, งานสำเร็จได้ชัด
- Map popup อธิบายได้ว่าพื้นที่นั้นเสี่ยงหรือเติบโตเพราะอะไร
- User Online Status ไม่เปิดเผยข้อมูลที่ไม่จำเป็น

---

# 5. Phase 12 - Login/Loading + Final Polish + Docs

## 5.1 Goal

Phase 12 เป็นงานท้ายสุดเพื่อทำให้ระบบพร้อมนำเสนอและพร้อมใช้งาน ไม่ควรทำก่อน Phase 10-11 เพราะ logic และ UI ยังอาจเปลี่ยน

---

## 5.2 Phase 12 Task List

| ID | งาน | รายละเอียด | Expected Files | Priority |
|---|---|---|---|---|
| 12.1 | Rename System | ตั้งชื่อระบบใหม่ให้สื่อ customer insight | `src/Body.html` | P2 |
| 12.2 | Login Redesign | ออกแบบหน้า login ใหม่ให้สะอาดและมืออาชีพ | `src/Body.html`, `src/Styles.html` | P2 |
| 12.3 | Loading Redesign | แสดง loading state ที่สื่อความหมาย | `src/Body.html`, `src/Styles.html`, `src/Scripts.html` | P2 |
| 12.4 | Final UI Polish | spacing, hierarchy, chart labels, empty state, responsive | `src/Styles.html` | P2 |
| 12.5 | Phase Notes | สร้าง/อัปเดต docs | `docs/` | P2 |
| 12.6 | Presentation Summary | สรุป problem, solution, result, benefit | `docs/` | P2 |
| 12.7 | Final QA | ทดสอบ role, tracking, risk/growth, map, login/loading, export removal | all relevant files | P2 |

---

## 5.3 Suggested System Name

Recommended:

```text
Customer Insight Dashboard
```

Other options:

- Risk & Growth Console
- BD Performance Hub
- Agent Insight Center
- Growth Recovery Dashboard

---

# 6. Recommended Branch Strategy

```bash
git checkout codex/phase-9-risk-customer-dashboard
git pull origin codex/phase-9-risk-customer-dashboard
git checkout -b codex/phase-10-tracking-risk-growth-insight
```

After Phase 10:

```bash
git checkout -b codex/phase-11-role-tracking-map-user-online
```

After Phase 11:

```bash
git checkout -b codex/phase-12-final-polish-presentation
```

---

# 7. Codex Prompt - Thai Version

```text
ให้อ่าน AGENT.md หรือ AGENT_with_skill.md ก่อน เพื่อเข้าใจกฎหลักของโปรเจกต์
จากนั้นอ่าน docs/PHASE_10_12_CLEAR_EXECUTION_PLAN.md เพื่อทำตามแผนงานล่าสุด

ใช้ branch codex/phase-9-risk-customer-dashboard เป็นฐาน
สร้าง branch ใหม่ชื่อ codex/phase-10-tracking-risk-growth-insight

ให้เริ่มทำเฉพาะ Phase 10 ก่อนเท่านั้น

Priority หลัก:
Accuracy > Security > Performance > Usability > Visual polish

งาน Phase 10 ที่ต้องทำ:
1. ตรวจ Tracking และ TrackingGrowth sync ระหว่าง Dashboard กับ Google Sheet
2. ตรวจ duplicate/conflict ของ status, reason, note, updatedBy, updatedAt
3. ลบ Report Center ออกจาก Dashboard ทั้งหมด
4. ปิดทุกช่องทาง export/download
5. ปรับ Risk/Growth เป็นเกณฑ์ 2 ชั้น คือ level + reason
6. เพิ่ม sub-tab ในหน้ากลุ่มเสี่ยง ได้แก่ ภาพรวม, วิเคราะห์สาเหตุ, เปรียบเทียบรายสัปดาห์, ประสิทธิภาพการติดตาม, รายชื่อลูกค้า
7. เพิ่ม sub-tab ในหน้ากลุ่มเติบโต ได้แก่ ภาพรวม, วิเคราะห์สาเหตุ, เปรียบเทียบรายสัปดาห์, ประสิทธิภาพการต่อยอด, รายชื่อลูกค้า
8. ปรับ Customer Popup ให้แสดง insight ชัดขึ้น เช่น Avg Rev/day, Avg Vol/day, Rev/ชิ้น, carrier movement

ข้อห้าม:
- ห้ามแก้ Raw KPI Sheet
- ห้ามเปิด export/download กลับมา
- ห้ามลด role permission
- ห้าม bypass data masking
- ห้ามให้ BD หรือ AM เห็นข้อมูลนอก scope
- ห้ามทำ UI polish ก่อนจน business logic หรือ security พัง

หลังทำเสร็จให้สรุป:
1. แก้ไฟล์อะไรบ้าง
2. เปลี่ยน logic อะไรบ้าง
3. ทดสอบอะไรแล้วบ้าง
4. มีข้อจำกัดหรือจุดที่ยังต้องตรวจต่อไหม
```

---

# 8. Do Not Do List

- Do not edit Raw KPI Sheet directly.
- Do not add or restore export/download features.
- Do not remove masking or role permission guards.
- Do not classify Risk/Growth using only total current-month revenue.
- Do not compare partial current month with full previous month without normalization.
- Do not start final polish before Tracking and Risk/Growth logic are stable.
- Do not expose customer name, phone, note, or sensitive data outside the existing scope.

---

# 9. Simple Summary for Developer

Phase 10 = ทำให้ระบบหลักถูกต้องและปลอดภัยก่อน  
Phase 11 = ทำให้แต่ละ role ใช้งานจริงได้ดีขึ้น  
Phase 12 = ทำให้ระบบสวย พร้อมส่งงาน และมีเอกสารครบ

จุดที่เพิ่มให้ชัดจากแผนเดิมคือ:

- หน้า `กลุ่มเสี่ยง` ต้องมี sub-tab สำหรับ insight และ progress ชัดเจน
- หน้า `กลุ่มเติบโต` ต้องมี sub-tab สำหรับ insight และ progress ชัดเจน
- Risk/Growth ต้องอธิบายได้ทั้งระดับและเหตุผล
- Tracking ต้อง sync ถูกก่อนจึงค่อยทำ checklist หรือ polish
