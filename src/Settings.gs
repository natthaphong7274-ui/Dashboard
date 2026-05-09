// ============================================================
//  Settings.gs — การตั้งค่าระบบ (Director only)
//  functions: getRiskThreshold, setRiskThreshold
//              getGrowthThreshold, setGrowthThreshold
//              getMonthlyTarget, setMonthlyTarget, clearMonthlyTarget
//              getUserStatus, unlockUser, monthThName, monthEnName
// ============================================================


// heartbeat(token) — รับ ping จาก client ทุก 5 นาที
// บันทึกเฉพาะ HEARTBEAT_OPEN ครั้งแรก และ HEARTBEAT_ACTIVE ต่อๆ ไป
// ถ้า session หมดอายุ → คืน { ok:false } ให้ client หยุด ping
function heartbeat(token) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, idle: !!session.idle };
  try {
    logActivity(session.username, session.role, 'HEARTBEAT', 'ยังเปิด Dashboard อยู่ | Zone: ' + (session.zones ? session.zones.join(', ') : 'All'));
  } catch(e) {}
  return { ok: true };
}

// ============================================================
//  RISK THRESHOLD — เก็บค่าเกณฑ์กลุ่มเสี่ยงที่ Director ตั้งไว้
//  ใช้ ScriptProperties เพื่อให้ทุก role เห็นค่าเดียวกัน
// ============================================================

var RISK_THRESHOLD_KEY = 'RISK_THRESHOLD_GLOBAL';

// getRiskThreshold(token) — ดึงค่าเกณฑ์ปัจจุบัน (ทุก role เข้าถึงได้)
function getRiskThreshold(token) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  var props = PropertiesService.getScriptProperties();
  var raw   = props.getProperty(RISK_THRESHOLD_KEY);
  var val   = raw ? parseFloat(raw) : 200;
  return { ok: true, threshold: isNaN(val) ? 200 : val };
}

// setRiskThreshold(token, value) — บันทึกค่าเกณฑ์ (เฉพาะ Director)
function setRiskThreshold(token, value) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (session.role !== 'Director') return { ok: false, error: 'Permission denied: เฉพาะ Director เท่านั้น' };
  var v = parseFloat(value);
  if (isNaN(v) || v < 0) return { ok: false, error: 'ค่าไม่ถูกต้อง' };
  PropertiesService.getScriptProperties().setProperty(RISK_THRESHOLD_KEY, String(v));
  logActivity(session.username, session.role, 'SET_RISK_THRESHOLD', 'ตั้งเกณฑ์ Avg ลดลง > ' + v + ' บาท/วัน');
  return { ok: true, threshold: v };
}

var GROWTH_THRESHOLD_KEY = 'GROWTH_THRESHOLD_GLOBAL';

// getGrowthThreshold(token) — ดึงค่าเกณฑ์กลุ่มเติบโต (ทุก role เข้าถึงได้)
function getGrowthThreshold(token) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  var props = PropertiesService.getScriptProperties();
  var raw   = props.getProperty(GROWTH_THRESHOLD_KEY);
  var val   = raw ? parseFloat(raw) : 200;
  return { ok: true, threshold: isNaN(val) ? 200 : val };
}

// setGrowthThreshold(token, value) — บันทึกค่าเกณฑ์กลุ่มเติบโต (เฉพาะ Director)
function setGrowthThreshold(token, value) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (session.role !== 'Director') return { ok: false, error: 'Permission denied: เฉพาะ Director เท่านั้น' };
  var v = parseFloat(value);
  if (isNaN(v) || v < 0) return { ok: false, error: 'ค่าไม่ถูกต้อง' };
  PropertiesService.getScriptProperties().setProperty(GROWTH_THRESHOLD_KEY, String(v));
  logActivity(session.username, session.role, 'SET_GROWTH_THRESHOLD', 'ตั้งเกณฑ์ Avg เพิ่มขึ้น > ' + v + ' บาท/วัน');
  return { ok: true, threshold: v };
}

// ============================================================
//  MONTHLY TARGET — Director ตั้งเป้าหมาย Revenue รายเดือน
//  เก็บใน ScriptProperties: MONTHLY_TARGET_{YEAR}_{MONTHKEY}
//  type: 'pct'   = % ของเดือนก่อน (เช่น 105 = +5%)
//        'fixed' = ตัวเลขยอด Revenue ตรงๆ (บาท)
// ============================================================

var MONTHLY_TARGET_PREFIX = 'MONTHLY_TARGET_';

// getMonthlyTarget(token, monthKey) — ดึงเป้าของเดือนนั้น (ทุก role)
function getMonthlyTarget(token, monthKey) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  var key = MONTHLY_TARGET_PREFIX + DATA_YEAR + '_' + (monthKey || '').toLowerCase();
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) return { ok: true, target: null };
  try { return { ok: true, target: JSON.parse(raw) }; }
  catch(e) { return { ok: true, target: null }; }
}

// setMonthlyTarget(token, monthKey, type, value, note) — ตั้งเป้า (Director only)
function setMonthlyTarget(token, monthKey, type, value, note) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (session.role !== 'Director') return { ok: false, error: 'Permission denied: เฉพาะ Director เท่านั้น' };
  if (!monthKey) return { ok: false, error: 'ไม่ระบุ monthKey' };
  if (type !== 'pct' && type !== 'fixed') return { ok: false, error: 'type ต้องเป็น pct หรือ fixed' };
  var v = parseFloat(value);
  if (isNaN(v) || v <= 0) return { ok: false, error: 'ค่าไม่ถูกต้อง' };
  if (type === 'pct' && v > 1000) return { ok: false, error: '% ไม่ควรเกิน 1000' };
  var target = { type: type, value: v, note: note || '', setBy: session.username, setAt: _bkkTimestamp() };
  var key = MONTHLY_TARGET_PREFIX + DATA_YEAR + '_' + monthKey.toLowerCase();
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(target));
  var desc = type === 'pct'
    ? 'ตั้งเป้า ' + monthKey + ' = ' + v + '% ของเดือนก่อน'
    : 'ตั้งเป้า ' + monthKey + ' = ฿' + v + ' (fixed)';
  logActivity(session.username, session.role, 'SET_MONTHLY_TARGET', desc + (note ? ' | หมายเหตุ: ' + note : ''));
  return { ok: true, target: target };
}

// getAllMonthlyTargets(token) — ดึงเป้าทุกเดือนพร้อมกัน (ทุก role)
function getAllMonthlyTargets(token) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  var props = PropertiesService.getScriptProperties();
  var result = {};
  var ms = _getMonthSheets(); // auto-discover
  ms.forEach(function(m) {
    var key = MONTHLY_TARGET_PREFIX + DATA_YEAR + '_' + m.monthKey;
    var raw = props.getProperty(key);
    if (raw) { try { result[m.monthKey] = JSON.parse(raw); } catch(e) {} }
  });
  return { ok: true, targets: result };
}

// clearMonthlyTarget(token, monthKey) — ลบเป้า (Director only)
function clearMonthlyTarget(token, monthKey) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (session.role !== 'Director') return { ok: false, error: 'Permission denied: เฉพาะ Director เท่านั้น' };
  if (!monthKey) return { ok: false, error: 'ไม่ระบุ monthKey' };
  var key = MONTHLY_TARGET_PREFIX + DATA_YEAR + '_' + monthKey.toLowerCase();
  PropertiesService.getScriptProperties().deleteProperty(key);
  logActivity(session.username, session.role, 'CLEAR_MONTHLY_TARGET', 'ลบเป้าหมายเดือน ' + monthKey);
  return { ok: true };
}

// ============================================================
//  USER MANAGEMENT — Director only
// ============================================================

// getUserStatus(token) — ดึงรายชื่อ user + สถานะ lock/fail
function getUserStatus(token) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (session.role !== 'Director') return { ok: false, error: 'Permission denied: เฉพาะ Director เท่านั้น' };

  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(USERS_SHEET);
    if (!sheet) return { ok: false, error: 'ไม่พบ Users Sheet' };

    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var uIdx = headers.indexOf('Username');
    var rIdx = headers.indexOf('Role');
    var zIdx = headers.indexOf('ZoneAccess');
    if (uIdx < 0) return { ok: false, error: 'ไม่พบ column Username' };

    var props = PropertiesService.getScriptProperties();
    var now   = Date.now();
    var users = [];

    for (var i = 1; i < data.length; i++) {
      var uname = String(data[i][uIdx] || '').trim();
      if (!uname) continue;
      var uLower = uname.toLowerCase();

      // ตรวจสถานะ lock
      var locked = false;
      var remainingMin = 0;
      var lockRaw = props.getProperty(LOCK_PREFIX + uLower);
      if (lockRaw) {
        try {
          var ld = JSON.parse(lockRaw);
          var elapsed = now - ld.lockedAt;
          if (elapsed < LOCK_TTL_MS) {
            locked = true;
            remainingMin = Math.ceil((LOCK_TTL_MS - elapsed) / 60000);
          }
        } catch(e) {}
      }

      // ตรวจจำนวน login ผิด
      var failCount = 0;
      var failRaw = props.getProperty(FAIL_PREFIX + uLower);
      if (failRaw) {
        try { failCount = JSON.parse(failRaw).count || 0; } catch(e) {}
      }

      users.push({
        username:     uname,
        role:         rIdx >= 0 ? String(data[i][rIdx] || '').trim() : '—',
        zone:         zIdx >= 0 ? String(data[i][zIdx] || '').trim() : 'All',
        locked:       locked,
        remainingMin: remainingMin,
        failCount:    failCount
      });
    }

    return { ok: true, users: users };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// unlockUser(token, username) — ปลดล็อกและรีเซ็ต fail counter
function unlockUser(token, username) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (session.role !== 'Director') return { ok: false, error: 'Permission denied: เฉพาะ Director เท่านั้น' };
  if (!username) return { ok: false, error: 'ไม่ระบุ username' };

  try {
    var uLower = username.toLowerCase();
    var props  = PropertiesService.getScriptProperties();
    props.deleteProperty(LOCK_PREFIX + uLower);
    props.deleteProperty(FAIL_PREFIX + uLower);
    logActivity(session.username, session.role, 'UNLOCK_USER', 'ปลดล็อก user: ' + username);
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

function monthThName(key){
  var m={jan:'มกราคม',feb:'กุมภาพันธ์',mar:'มีนาคม',apr:'เมษายน',
         may:'พฤษภาคม',jun:'มิถุนายน',jul:'กรกฎาคม',aug:'สิงหาคม',
         sep:'กันยายน',oct:'ตุลาคม',nov:'พฤศจิกายน',dec:'ธันวาคม'};
  return m[key]||key;
}
function monthEnName(key){
  var m={jan:'Jan',feb:'Feb',mar:'Mar',apr:'Apr',
         may:'May',jun:'Jun',jul:'Jul',aug:'Aug',
         sep:'Sep',oct:'Oct',nov:'Nov',dec:'Dec'};
  return m[key]||key;
}
