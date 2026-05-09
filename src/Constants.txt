// ============================================================
//  Constants.gs — ค่าคงที่ระบบที่ใช้ร่วมกันทุกไฟล์
//  ★ ไฟล์นี้ต้อง deploy คู่กับ Auth.gs, DataReader.gs, Settings.gs
//    หากไม่มีไฟล์นี้ ระบบจะ error: TOKEN_PREFIX is not defined
// ============================================================

// ── Auth / Session ──────────────────────────────────────────
var TOKEN_PREFIX      = 'DASH_';        // prefix ของ token ใน ScriptProperties
var LOCK_PREFIX       = 'LOCK_';        // prefix ของ lock key (brute-force protection)
var SESSION_TTL_MS    = 8 * 60 * 60 * 1000;   // session timeout: 8 ชั่วโมง
var IDLE_TTL_MS       = 30 * 60 * 1000;       // idle timeout: 30 นาที
var MAX_FAIL_LOGIN    = 5;              // จำนวนครั้งที่ login ผิดก่อนล็อกบัญชี
var HEARTBEAT_MS      = 5 * 60 * 1000; // heartbeat interval: 5 นาที (client-side)

// ── Spreadsheet ──────────────────────────────────────────────
var LOG_SHEET         = 'ActivityLog';  // ชื่อ sheet สำหรับ Activity Log

// ── Static Columns ── column เหล่านี้ดึงจาก BASE_SHEET เสมอ
var STATIC_COLS = [
  'Agent Name',
  'Agent Code',
  'Zone Name',
  'Package',
  'Province',
  'City',
  'AREA',
  '21.00',
  'Phone',
  'Avg./Day>20'
];
