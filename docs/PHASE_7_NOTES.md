# Phase 7 Notes

Branch: `codex/phase-7-performance-security`

## Scope

เริ่ม Phase 7: Performance & Security Hardening ด้วยงานย่อย **7.1 Cache Layer** เพื่อให้ Dashboard ลดการอ่าน Google Sheets ซ้ำ และเตรียมฐานสำหรับ Data Cut-off, Lazy Loading, Masking Review และ Export Guard ในขั้นต่อไป

## 7.1 Cache Layer

งานรอบนี้เพิ่ม cache สำหรับ `getAllData()` ซึ่งเป็นจุดโหลดข้อมูลหลักของ Dashboard โดยใช้ Google Apps Script `CacheService` ตามแนวทางจาก roadmap และ input เพิ่มเติมเรื่อง `300s Cache Duration`

## Changes

### 7.1 Cache Layer

- เพิ่มไฟล์ `src/Cache.js` สำหรับ helper กลางของ cache
- ตั้งค่า TTL เริ่มต้น `300` วินาทีใน `src/Constants.js`
- เพิ่ม chunked JSON cache เพื่อรองรับ payload ที่ใหญ่กว่า limit ต่อ item ของ CacheService
- สร้าง cache key แบบ hash จาก spreadsheet, data year, role, username, zones และ month signature
- ปรับ `getAllData(token, options)` ให้รองรับ cache hit/cache miss
- เพิ่ม `forceRefresh` เพื่อให้ปุ่มรีเฟรชล้าง cache ก่อนโหลดข้อมูลใหม่
- ปรับปุ่มรีเฟรชหลักให้เรียก `loadData(true)`

### 7.2 Data Cut-off

- เพิ่ม `DASH_HOME_MONTH_CUTOFF = 6` เพื่อจำกัด payload ของ Home/Dashboard ให้ใช้เดือนล่าสุดตามที่จำเป็น
- เพิ่ม `cutOffMeta` ใน response เพื่อบอกจำนวนเดือนที่ค้นพบและจำนวนเดือนที่โหลดจริง
- ใส่ cutoff setting ลง cache key เพื่อกัน cache เก่าปนกับ policy ใหม่

### 7.3 Lazy Loading

- หยุดโหลด Tracking และ Growth Tracking ตั้งแต่ `loadData()` รอบแรก
- โหลด Tracking เฉพาะเมื่อเปิด tab risk, growth หรือ Report Center ที่ต้องใช้ status ประกอบรายงาน
- เพิ่มสถานะ `_trackingLoaded` และ `_growthTrackingLoaded` เพื่อไม่เรียกซ้ำโดยไม่จำเป็น

### 7.4 Sensitive Data Masking Review

- ขยาย masking field สำหรับเบอร์โทร เช่น `Telephone`, `Mobile`, `เบอร์โทรศัพท์`
- เพิ่ม masking สำหรับข้อมูลติดต่อเสริม เช่น `Email`, `Line`, `Line ID`
- ยังคงให้ Director/AM เห็นข้อมูลตามสิทธิ์เดิม ส่วน BD ได้ข้อมูล masked

### 7.5 Export Permission Guard

- ปรับ `_exportGuard()` ให้ block export ถ้า role ไม่ใช่ `Director` หรือ `AM`
- Report Center ยังเปิด preview ได้ตาม role/scope ผ่าน `_reportAccessGuard()`
- ปุ่ม export ที่เรียก `exportCSV`, Tracking Report, BD Performance และ Weekly Summary จะถูก deny พร้อม log ถ้า role ไม่ผ่าน

### 7.6 Audit Log

- เพิ่ม `CACHE_REFRESH` เมื่อผู้ใช้กดรีเฟรชแบบล้าง cache
- เพิ่ม `VIEW_TRACKING_DATA` และ `VIEW_GROWTH_TRACKING_DATA` เมื่อโหลด tracking data จาก server
- export deny/allow ยังส่งผ่าน `_clientLog()` เพื่อเก็บใน ActivityLog

## Security Notes

- Cache key แยกตาม `role`, `username` และ `zones` เพื่อลดความเสี่ยงข้อมูลข้าม scope
- ข้อมูลที่ cache เป็นผลลัพธ์หลังผ่าน filter/masking ของ session นั้นแล้ว ไม่ใช้ cache payload ร่วมกันระหว่างผู้ใช้
- Director, AM และ BD จะมี cache key คนละชุดตามสิทธิ์การมองเห็น
- Report Center เป็น preview ตาม scope ได้ แต่ export ถูกจำกัดเพื่อกันข้อมูลหลุด

## Files Touched

- `src/Cache.js`
- `src/Constants.js`
- `src/DataReader.js`
- `src/Scripts.html`
- `src/Body.html`
- `src/Tracking.js`
- `docs/PHASE_7_NOTES.md`

## Verification

- ตรวจ syntax ของ server-side `.js` ด้วย Node parse wrapper
- ตรวจ syntax ของ script blocks ใน `src/Scripts.html`
- ตรวจว่า `loadData()` ยังใช้ได้แบบเดิม และปุ่ม refresh ส่ง `forceRefresh`
- ตรวจ `git diff --check`

## Manual Testing Still Needed

- Login เป็น Director แล้วเปิด Home ครั้งแรก จากนั้น refresh ปกติและดูว่า cache ทำงาน
- Login เป็น BD/AM ต่าง scope แล้วตรวจว่าไม่เห็นข้อมูลข้ามสิทธิ์
- กดปุ่มรีเฟรชหลักแล้วตรวจว่าข้อมูลถูกโหลดใหม่หลัง clear cache
- ตรวจ ActivityLog ว่ามี `CACHE_REFRESH` เมื่อกดรีเฟรชแบบ force
- ทดสอบกับข้อมูลจริงว่าหน้า Home โหลดเร็วขึ้นเมื่อ cache hit
- เปิด Report Center ด้วย BD แล้วดู preview ได้ แต่ export ต้องถูกปฏิเสธ
- เปิด Report Center ด้วย Director/AM แล้ว export ได้ตาม policy
- เปิด risk/growth tab แล้วตรวจว่า tracking data โหลดตอนเปิด tab ไม่ใช่ตอน initial load
