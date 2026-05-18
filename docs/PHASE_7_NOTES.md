# Phase 7 Notes

Branch: `codex/phase-7-performance-security`

## Scope

เริ่ม Phase 7: Performance & Security Hardening ด้วยงานย่อย **7.1 Cache Layer** เพื่อให้ Dashboard ลดการอ่าน Google Sheets ซ้ำ และเตรียมฐานสำหรับ Data Cut-off, Lazy Loading, Masking Review และ Export Guard ในขั้นต่อไป

## 7.1 Cache Layer

งานรอบนี้เพิ่ม cache สำหรับ `getAllData()` ซึ่งเป็นจุดโหลดข้อมูลหลักของ Dashboard โดยใช้ Google Apps Script `CacheService` ตามแนวทางจาก roadmap และ input เพิ่มเติมเรื่อง `300s Cache Duration`

## Changes

- เพิ่มไฟล์ `src/Cache.js` สำหรับ helper กลางของ cache
- ตั้งค่า TTL เริ่มต้น `300` วินาทีใน `src/Constants.js`
- เพิ่ม chunked JSON cache เพื่อรองรับ payload ที่ใหญ่กว่า limit ต่อ item ของ CacheService
- สร้าง cache key แบบ hash จาก spreadsheet, data year, role, username, zones และ month signature
- ปรับ `getAllData(token, options)` ให้รองรับ cache hit/cache miss
- เพิ่ม `forceRefresh` เพื่อให้ปุ่มรีเฟรชล้าง cache ก่อนโหลดข้อมูลใหม่
- ปรับปุ่มรีเฟรชหลักให้เรียก `loadData(true)`

## Security Notes

- Cache key แยกตาม `role`, `username` และ `zones` เพื่อลดความเสี่ยงข้อมูลข้าม scope
- ข้อมูลที่ cache เป็นผลลัพธ์หลังผ่าน filter/masking ของ session นั้นแล้ว ไม่ใช้ cache payload ร่วมกันระหว่างผู้ใช้
- Director, AM และ BD จะมี cache key คนละชุดตามสิทธิ์การมองเห็น

## Files Touched

- `src/Cache.js`
- `src/Constants.js`
- `src/DataReader.js`
- `src/Scripts.html`
- `src/Body.html`
- `docs/PHASE_7_NOTES.md`

## Verification

- ตรวจ syntax ของ server-side `.js` ด้วย Node parse wrapper
- ตรวจ syntax ของ script blocks ใน `src/Scripts.html`
- ตรวจว่า `loadData()` ยังใช้ได้แบบเดิม และปุ่ม refresh ส่ง `forceRefresh`

## Manual Testing Still Needed

- Login เป็น Director แล้วเปิด Home ครั้งแรก จากนั้น refresh ปกติและดูว่า cache ทำงาน
- Login เป็น BD/AM ต่าง scope แล้วตรวจว่าไม่เห็นข้อมูลข้ามสิทธิ์
- กดปุ่มรีเฟรชหลักแล้วตรวจว่าข้อมูลถูกโหลดใหม่หลัง clear cache
- ตรวจ ActivityLog ว่ามี `CACHE_REFRESH` เมื่อกดรีเฟรชแบบ force
- ทดสอบกับข้อมูลจริงว่าหน้า Home โหลดเร็วขึ้นเมื่อ cache hit
