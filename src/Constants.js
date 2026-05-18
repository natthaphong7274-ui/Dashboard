// ============================================================
//  Constants.gs — ค่าคงที่ระบบที่ใช้ร่วมกันทุกไฟล์
//  ★ ไฟล์นี้ต้อง deploy คู่กับ Auth.gs, DataReader.gs, Settings.gs
//    หากไม่มีไฟล์นี้ ระบบจะ error: TOKEN_PREFIX is not defined
// ============================================================

// ── Auth / Session ──────────────────────────────────────────
var TOKEN_PREFIX      = 'DASH_';        // prefix ของ token ใน ScriptProperties
var FAIL_PREFIX       = 'FAIL_';        // prefix ของ failed-login counter key
var LOCK_PREFIX       = 'LOCK_';        // prefix ของ lock key (brute-force protection)
var LOCK_TTL_MS       = 15 * 60 * 1000; // lock duration: 15 นาที
var SESSION_TTL_MS    = 8 * 60 * 60 * 1000;   // session timeout: 8 ชั่วโมง
var IDLE_TTL_MS       = 30 * 60 * 1000;       // idle timeout: 30 นาที
var MAX_FAIL_LOGIN    = 5;              // จำนวนครั้งที่ login ผิดก่อนล็อกบัญชี
var HEARTBEAT_MS      = 5 * 60 * 1000; // heartbeat interval: 5 นาที (client-side)
var BRUTE_PREFIX      = 'BRUTE_';       // soft block counter by user-agent fingerprint
var BRUTE_MAX_FAIL    = 8;              // failed login attempts before temporary soft block
var BRUTE_TTL_MS      = 10 * 60 * 1000; // soft block window: 10 minutes

// ── Dashboard Cache ─────────────────────────────────────────
var DASH_CACHE_TTL_SECONDS = 300;       // Phase 7.1: 5-minute CacheService TTL
var DASH_CACHE_CHUNK_CHARS = 25000;     // keep chunks safely below CacheService item limits
var DASH_CACHE_MAX_CHUNKS  = 80;        // guard against runaway payloads
var DASH_HOME_MONTH_CUTOFF = 6;         // Phase 7.2: keep recent months for initial dashboard payload
var DASH_TREND_MONTH_CUTOFF = 12;       // reserved for WoW/trend-heavy modules

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
