// ============================================================
//  Auth.gs — ระบบ Login, Session, Token
//  functions: doGet, login, logout, getSession, heartbeat
//              _makeToken, _isLocked, _incFail, _clearFail
// ============================================================

// ✅ ถูก — ต้องใช้ createTemplateFromFile แทน
function doGet(e) {
  var ui = e && e.parameter && e.parameter.ui;
  var entryFile = (ui === 'classic') ? 'Index' : 'Index_v2';
  return HtmlService.createTemplateFromFile(entryFile)
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('Customer Insight Dashboard');
}


// ============================================================
//  LOGIN — ใช้ ScriptProperties + random token
//  token เก็บใน browser (sessionStorage) แทน UserProperties
//  → แต่ละ browser tab มี token ของตัวเอง ไม่ปนกัน
// ============================================================

// สร้าง token แบบ random
function _makeToken() {
  var uuidA = Utilities.getUuid().replace(/-/g, '');
  var uuidB = Utilities.getUuid().replace(/-/g, '');
  var stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmssSSS');
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    uuidA + uuidB + stamp,
    Utilities.Charset.UTF_8
  ).map(function(b){ return ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2); }).join('');
  return TOKEN_PREFIX + uuidA + uuidB + digest.slice(0, 16);
}

function _isValidTokenFormat(token) {
  if (!token || token.indexOf(TOKEN_PREFIX) !== 0) return false;
  var body = String(token).slice(TOKEN_PREFIX.length);
  return /^[A-Fa-f0-9]{80}$/.test(body) || /^[A-Fa-f0-9]{64}$/.test(body) || /^[A-Za-z0-9]{32}$/.test(body);
}

function _loginFingerprint(userAgent) {
  var ua = String(userAgent || '').substring(0, 200);
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, ua, Utilities.Charset.UTF_8);
  return digest.map(function(b){ return ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2); }).join('').slice(0, 16);
}

function _getBruteKey(userAgent) {
  var prefix = (typeof BRUTE_PREFIX !== 'undefined') ? BRUTE_PREFIX : 'BRUTE_';
  return prefix + _loginFingerprint(userAgent);
}

function _getBruteState(userAgent) {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(_getBruteKey(userAgent));
    if (!raw) return { count: 0, blocked: false };
    var d = JSON.parse(raw);
    var ttl = (typeof BRUTE_TTL_MS !== 'undefined') ? BRUTE_TTL_MS : (10 * 60 * 1000);
    if (Date.now() - Number(d.lastFail || 0) > ttl) {
      PropertiesService.getScriptProperties().deleteProperty(_getBruteKey(userAgent));
      return { count: 0, blocked: false };
    }
    var maxFail = (typeof BRUTE_MAX_FAIL !== 'undefined') ? BRUTE_MAX_FAIL : 8;
    return { count: Number(d.count || 0), blocked: Number(d.count || 0) >= maxFail };
  } catch(e) {
    return { count: 0, blocked: false };
  }
}

function _incBruteFail(userAgent, username) {
  try {
    var props = PropertiesService.getScriptProperties();
    var state = _getBruteState(userAgent);
    var next = { count: state.count + 1, lastFail: Date.now() };
    props.setProperty(_getBruteKey(userAgent), JSON.stringify(next));
    if (next.count >= ((typeof BRUTE_MAX_FAIL !== 'undefined') ? BRUTE_MAX_FAIL : 8)) {
      logActivity(username || '-', '-', 'LOGIN_SOFT_BLOCK', 'Too many login failures | fp=' + _loginFingerprint(userAgent));
    }
    return next;
  } catch(e) {
    return { count: 0 };
  }
}

function _clearBruteFail(userAgent) {
  try {
    PropertiesService.getScriptProperties().deleteProperty(_getBruteKey(userAgent));
  } catch(e) {}
}

// ล้าง token ที่หมดอายุออกจาก ScriptProperties
function _cleanExpiredTokens() {
  try {
    var props = PropertiesService.getScriptProperties();
    var all   = props.getProperties();
    var now   = Date.now();
    Object.keys(all).forEach(function(k) {
      if (k.indexOf(TOKEN_PREFIX) !== 0) return;
      try {
        var s = JSON.parse(all[k]);
        if (now - s.loginTime > SESSION_TTL_MS) props.deleteProperty(k);
      } catch(e) { props.deleteProperty(k); }
    });
  } catch(e) {}
}

// ── Login helpers: fail counter & lock ──
function _getFailKey(u)  { return FAIL_PREFIX + u.toLowerCase(); }
function _getLockKey(u)  { return LOCK_PREFIX + u.toLowerCase(); }

function _isLocked(u) {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(_getLockKey(u));
    if (!raw) return false;
    var d = JSON.parse(raw);
    if (Date.now() - d.lockedAt < LOCK_TTL_MS) return { locked: true, remaining: Math.ceil((LOCK_TTL_MS - (Date.now() - d.lockedAt)) / 60000) };
    // หมดเวลา lock แล้ว → ล้างออก
    PropertiesService.getScriptProperties().deleteProperty(_getLockKey(u));
    PropertiesService.getScriptProperties().deleteProperty(_getFailKey(u));
    return false;
  } catch(e) { return false; }
}

function _incFail(u) {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw   = props.getProperty(_getFailKey(u));
    var count = raw ? (JSON.parse(raw).count || 0) : 0;
    count++;
    props.setProperty(_getFailKey(u), JSON.stringify({ count: count, lastFail: Date.now() }));
    if (count >= MAX_FAIL_LOGIN) {
      props.setProperty(_getLockKey(u), JSON.stringify({ lockedAt: Date.now() }));
      logActivity(u, '-', 'ACCOUNT_LOCKED', 'Login ผิด ' + count + ' ครั้ง → ถูก Lock 15 นาที');
      return { locked: true, count: count };
    }
    return { locked: false, count: count, remaining: MAX_FAIL_LOGIN - count };
  } catch(e) { return { locked: false, count: 0, remaining: MAX_FAIL_LOGIN }; }
}

function _clearFail(u) {
  try {
    var props = PropertiesService.getScriptProperties();
    props.deleteProperty(_getFailKey(u));
    props.deleteProperty(_getLockKey(u));
  } catch(e) {}
}

// login(username, password, userAgent) → { ok, token, role, zones, displayName } | { ok:false, error }
function login(username, password, userAgent) {
  try {
    var uLower = (username || '').trim().toLowerCase();
    var brute = _getBruteState(userAgent);
    if (brute.blocked) {
      logActivity(username || '-', '-', 'LOGIN_BLOCKED_SOFT', 'Soft block by user-agent fingerprint | fp=' + _loginFingerprint(userAgent));
      return { ok: false, error: 'Username หรือ Password ไม่ถูกต้อง กรุณารอสักครู่แล้วลองใหม่' };
    }

    // ── ตรวจว่า account ถูก lock ไหม (Director ข้ามขั้นตอนนี้ได้) ──
    var isDirector = false;
    try {
      var ss2 = SpreadsheetApp.getActiveSpreadsheet();
      var sh2 = ss2.getSheetByName(USERS_SHEET);
      if (sh2) {
        var d2 = sh2.getDataRange().getValues();
        var h2 = d2[0].map(function(h){ return String(h).trim(); });
        var u2 = h2.indexOf('Username'), r2 = h2.indexOf('Role');
        if (u2 >= 0 && r2 >= 0) {
          for (var j = 1; j < d2.length; j++) {
            if (String(d2[j][u2]||'').trim().toLowerCase() === uLower) {
              if (String(d2[j][r2]||'').trim() === 'Director') isDirector = true;
              break;
            }
          }
        }
      }
    } catch(e2) {}

    if (!isDirector) {
      var lockState = _isLocked(uLower);
      if (lockState && lockState.locked) {
        logActivity(username, '-', 'LOGIN_BLOCKED', 'Account ถูก Lock เหลือ ' + lockState.remaining + ' นาที | UA: ' + (userAgent||'-'));
        return { ok: false, error: 'บัญชีถูกระงับชั่วคราว กรุณารอ ' + lockState.remaining + ' นาที แล้วลองใหม่' };
      }
    }

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(USERS_SHEET);
    if (!sheet) return { ok: false, error: 'ไม่พบ Users Sheet' };

    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var uIdx = headers.indexOf('Username');
    var pIdx = headers.indexOf('Password');
    var rIdx = headers.indexOf('Role');
    var zIdx = headers.indexOf('ZoneAccess');

    if (uIdx < 0 || pIdx < 0) return { ok: false, error: 'Users Sheet ไม่มี column ที่ถูกต้อง' };

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var u   = String(row[uIdx] || '').trim();
      var p   = String(row[pIdx] || '').trim();
      if (u.toLowerCase() !== uLower) continue;

      // ── username ตรง แต่ password ผิด ──
      if (p !== password) {
        var failRes = { locked: false, count: 0, remaining: MAX_FAIL_LOGIN };
        var msg = '';
        if (isDirector) {
          // Director ไม่นับ fail และไม่ถูกล็อก
          msg = 'Password ไม่ถูกต้อง';
          logActivity(u, '-', 'LOGIN_FAIL', 'Password ผิด (Director - ไม่นับ fail) | UA: ' + (userAgent||'-'));
        } else {
          failRes = _incFail(uLower);
          _incBruteFail(userAgent, uLower);
          msg = failRes.locked
            ? 'Password ผิด — บัญชีถูกระงับ 15 นาที (ผิดครบ ' + MAX_FAIL_LOGIN + ' ครั้ง)'
            : 'Password ไม่ถูกต้อง (ผิดแล้ว ' + failRes.count + '/' + MAX_FAIL_LOGIN + ' ครั้ง)';
          logActivity(u, '-', 'LOGIN_FAIL', 'Password ผิด ครั้งที่ ' + failRes.count + ' | UA: ' + (userAgent||'-'));
        }
        return { ok: false, error: msg };
      }

      // ── Login สำเร็จ ──
      _clearFail(uLower);
      _clearBruteFail(userAgent);
      var role     = rIdx >= 0 ? String(row[rIdx] || '').trim() : 'BD';
      var zoneRaw  = zIdx >= 0 ? String(row[zIdx] || '').trim() : '';
      var zones    = zoneRaw === 'All' ? ['All'] :
        zoneRaw.split(/[\n,]+/).map(function(z){ return z.trim(); }).filter(Boolean);

      _cleanExpiredTokens();
      var token = _makeToken();
      var sessionData = JSON.stringify({
        username: u, role: role, zones: zones,
        loginTime: Date.now(), lastActive: Date.now(),
        userAgent: (userAgent || '').substring(0, 200)
      });
      PropertiesService.getScriptProperties().setProperty(token, sessionData);

      logActivity(u, role, 'LOGIN', 'เข้าสู่ระบบ | Zone: ' + (zoneRaw || 'All') + ' | UA: ' + (userAgent||'-').substring(0,120));
      return { ok: true, token: token, role: role, zones: zones, displayName: u };
    }

    // ── username ไม่มีในระบบ (นับเฉพาะ soft block fingerprint แต่ยังไม่เปิดเผยว่ามี user หรือไม่) ──
    _incBruteFail(userAgent, uLower || '-');
    logActivity(uLower || '-', '-', 'LOGIN_FAIL_UNKNOWN', 'Unknown username | fp=' + _loginFingerprint(userAgent));
    return { ok: false, error: 'Username หรือ Password ไม่ถูกต้อง' };
  } catch (err) {
    return { ok: false, error: 'เกิดข้อผิดพลาด: ' + err.message };
  }
}

// getSession(token, skipIdleCheck) → { ok, username, role, zones } | { ok:false, idle:true }
function getSession(token, skipIdleCheck) {
  if (!_isValidTokenFormat(token)) {
    if (token) logActivity('-', '-', 'INVALID_TOKEN_FORMAT', 'Rejected malformed session token');
    return { ok: false };
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var raw   = props.getProperty(token);
    if (!raw) return { ok: false };
    var s   = JSON.parse(raw);
    var now = Date.now();
    // ── เช็ค session หมดอายุ (8 ชั่วโมง) ──
    if (now - s.loginTime > SESSION_TTL_MS) {
      props.deleteProperty(token);
      logActivity(s.username, s.role, 'SESSION_EXPIRED', 'Session หมดอายุ (8 ชั่วโมง)');
      return { ok: false };
    }
    // ── เช็ค idle timeout (30 นาที) ──
    if (!skipIdleCheck && s.lastActive && (now - s.lastActive > IDLE_TTL_MS)) {
      props.deleteProperty(token);
      logActivity(s.username, s.role, 'IDLE_LOGOUT', 'Logout อัตโนมัติ — ไม่มีการใช้งาน 30 นาที');
      return { ok: false, idle: true };
    }
    // ── อัปเดต lastActive ──
    s.lastActive = now;
    props.setProperty(token, JSON.stringify(s));
    return { ok: true, username: s.username, role: s.role, zones: s.zones, userAgent: s.userAgent || '-' };
  } catch(e) {
    return { ok: false };
  }
}

function _sessionLabel(session) {
  if (!session || !session.ok) return 'anonymous/-';
  return (session.username || '-') + '/' + (session.role || '-');
}

function _auditDenied(session, action, detail) {
  try {
    logActivity(
      session && session.username ? session.username : '-',
      session && session.role ? session.role : '-',
      'PERMISSION_DENIED',
      action + (detail ? ' | ' + detail : '')
    );
  } catch(e) {}
}

function _requireSession(token, action) {
  var session = getSession(token || '');
  if (!session.ok) {
    _auditDenied({ username: '-', role: '-' }, action || 'SESSION_REQUIRED', 'Unauthorized');
    return { ok: false, error: 'Unauthorized' };
  }
  return session;
}

function _requireRole(session, roles, action) {
  roles = Array.isArray(roles) ? roles : [roles];
  if (!session || !session.ok || roles.indexOf(session.role) < 0) {
    _auditDenied(session, action || 'ROLE_REQUIRED', 'required=' + roles.join(',') + ' actor=' + _sessionLabel(session));
    return { ok: false, error: 'Permission denied' };
  }
  return { ok: true };
}

function _normalizeZoneName(zone) {
  return String(zone || '').trim().toLowerCase();
}

function _canAccessZone(session, zoneName) {
  if (!session || !session.ok) return false;
  if (session.role === 'Director' || session.role === 'AM') return true;
  var zones = session.zones || [];
  if (zones.indexOf('All') >= 0) return true;
  var target = _normalizeZoneName(zoneName);
  if (!target) return false;
  return zones.some(function(z){ return _normalizeZoneName(z) === target; });
}

function _canAccessRow(session, row) {
  if (!row) return false;
  return _canAccessZone(session, row.zoneName || row['Zone Name'] || row.zone || '');
}

function _requireRowAccess(session, row, action) {
  if (_canAccessRow(session, row)) return { ok: true };
  _auditDenied(session, action || 'ROW_ACCESS', 'zone=' + (row && (row.zoneName || row['Zone Name'] || row.zone) || '-'));
  return { ok: false, error: 'Permission denied' };
}

// logout(token)
function logout(token) {
  if (token && token.indexOf(TOKEN_PREFIX) === 0) {
    try {
      // ดึง username ก่อนลบ token เพื่อ log
      var raw = PropertiesService.getScriptProperties().getProperty(token);
      if (raw) {
        try {
          var s = JSON.parse(raw);
          logActivity(s.username, s.role, 'LOGOUT', 'ออกจากระบบ');
        } catch(e2) {}
      }
      PropertiesService.getScriptProperties().deleteProperty(token);
    } catch(e) {}
  }
  return { ok: true };
}

/**
 * Endpoint สำหรับส่งคำขอประมวลผลลูกค้าด้วย AI
 */
function requestAiFollowup(token, customerData) {
  var session = getSession(token);
  if (!session || !session.ok) {
    return { ok: false, error: 'Session ของคุณหมดอายุแล้ว กรุณาล็อกอินใหม่' };
  }

  try {
    // 1. ค้นหาอีเมลผู้รับ (จากชีต Users หรือประเมินจาก username หรือ Apps Script session)
    var recipientEmail = '';
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(USERS_SHEET);
      if (sheet) {
        var values = sheet.getDataRange().getValues();
        var headers = values[0].map(function(h) { return String(h).trim(); });
        var uIdx = headers.indexOf('Username');
        var eIdx = headers.indexOf('Email');
        if (uIdx >= 0 && eIdx >= 0) {
          var userLower = String(session.username || '').trim().toLowerCase();
          for (var i = 1; i < values.length; i++) {
            var row = values[i];
            var u = String(row[uIdx] || '').trim().toLowerCase();
            if (u === userLower) {
              recipientEmail = String(row[eIdx] || '').trim();
              break;
            }
          }
        }
      }
    } catch(e) {
      console.warn('Failed email lookup:', e.message);
    }

    // Fallbacks
    if (!recipientEmail && session.username.indexOf('@') >= 0) {
      recipientEmail = session.username;
    }
    if (!recipientEmail) {
      recipientEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    }
    if (!recipientEmail) {
      return { ok: false, error: 'ไม่พบคอนฟิกอีเมลของผู้ใช้ในระบบ และไม่สามารถอ่านอีเมล Active User ได้' };
    }

    // 2. เรียกใช้บริการ AI API เพื่อร่างแผนงาน
    var aiResult = callAiFollowupAPI(customerData);

    // 3. บันทึกข้อมูลการประมวลผลลงใน Logs Sheet
    logAiFollowupRequest(session.username, customerData, aiResult.summary);

    // 4. จัดส่งอีเมลแผนงานการติดตามลูกค้า
    sendFollowupEmail(recipientEmail, customerData, aiResult);

    // 5. บันทึก Log กิจกรรมการขอใช้งานลงในระบบ logs ของ dashboard ด้วย
    logActivity(session.username, session.role, 'AI_FOLLOWUP_REQUEST', 'ขอแนวทางติดตามลูกค้า: ' + (customerData.name || customerData.code));

    return { ok: true, summary: aiResult.summary, provider: aiResult.provider, model: aiResult.model };
  } catch(err) {
    console.error('requestAiFollowup error:', err.message);
    return { ok: false, error: err.message };
  }
}

// ============================================================

// โหลด HTML คู่มือตามบทบาทผู้ใช้
function loadRoleManualHtml(role) {
  var fileName = 'dashboard_manual_bd';
  if (role === 'AM') {
    fileName = 'dashboard_manual_am';
  } else if (role === 'Director') {
    fileName = 'dashboard_manual_director';
  }
  try {
    var content = HtmlService.createHtmlOutputFromFile(fileName).getContent();
    var bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
    return content;
  } catch (e) {
    return '<h3>ไม่พบไฟล์คู่มือการใช้งานสำหรับสิทธิ์ ' + role + '</h3><p>' + e.toString() + '</p>';
  }
}
