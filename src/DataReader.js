// ============================================================
//  DataReader.gs — โหลดข้อมูลจาก Spreadsheet
//  functions: getAllData, getCarrierData
//              logActivity, getActivityLog, _getOrCreateLogSheet
// ============================================================

//  getAllData(token) — กรองตาม Zone
// ============================================================
function getAllData(token) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── AUTO-DISCOVER: สร้าง MONTH_SHEETS จากชีตที่มีอยู่จริง ──
  MONTH_SHEETS = buildMonthSheets(ss);
  CARRIER_MONTHS = MONTH_SHEETS.filter(function(m){ return m.hasCarrier; })
    .map(function(m){ return { key:m.monthKey, label:m.label }; });

  // ── ตรวจ session จาก token ──
  var session = _requireSession(token || '', 'GET_ALL_DATA');
  if (!session.ok) return session;
  var allowedZones = null;
  if (session.role !== 'Director') {
    if (session.zones && session.zones[0] !== 'All') {
      allowedZones = session.zones;
    }
  }

  // บันทึก Log การดูข้อมูล Dashboard
  var zoneDesc = (session.zones && session.zones[0] !== 'All')
    ? 'Zone: ' + session.zones.join(', ')
    : 'Zone: All';
  logActivity(session.username, session.role, 'VIEW_DASHBOARD', 'โหลดข้อมูล Dashboard | ' + zoneDesc);

  // ── ดึง BASE SHEET ──
  var baseSheet   = ss.getSheetByName(BASE_SHEET);
  if (!baseSheet) throw new Error('ไม่พบ Sheet: ' + BASE_SHEET);
  var baseData    = baseSheet.getDataRange().getValues();
  var baseHeaders = baseData[0].map(function(h){ return String(h).trim(); });
  var agentIdx    = baseHeaders.indexOf('Agent Code');
  var zoneIdx     = baseHeaders.indexOf('Zone Name');

  // wantedCols
  var wantedCols = STATIC_COLS.slice();
  MONTH_SHEETS.filter(function(m){ return m.isBase; }).forEach(function(m){
    [m.colRev,m.colVol,m.colAvg,m.colDiff,m.colPct]
      .forEach(function(c){ if(c && wantedCols.indexOf(c)<0) wantedCols.push(c); });
  });
  MONTH_SHEETS.filter(function(m){ return (m.isBase || m.hasCarrierInBase) && m.hasCarrier; }).forEach(function(m){
    CARRIERS.forEach(function(carrier){
      ['Rev','Vol'].forEach(function(type){
        var col = carrier+' '+type+' ('+DATA_YEAR+'-'+m.label+')';
        if(wantedCols.indexOf(col)<0) wantedCols.push(col);
      });
    });
  });
  var baseColIdx = {};
  baseHeaders.forEach(function(h,i){ if(wantedCols.indexOf(h)>=0) baseColIdx[h]=i; });

  // ── extra sheets ──
  var sheetCache    = {};
  var agentExtraMap = {};
  var extraCols     = [];

  MONTH_SHEETS.filter(function(m){ return !m.isBase; }).forEach(function(m){
    if(!sheetCache[m.sheetName]){
      var sh = ss.getSheetByName(m.sheetName);
      if(!sh){ Logger.log('ไม่พบ: '+m.sheetName); return; }
      var d = sh.getDataRange().getValues();
      var h = d[0].map(function(x){ return String(x).trim(); });
      sheetCache[m.sheetName] = { data:d, headers:h, aIdx:h.indexOf('Agent Code') };
    }
    var cache = sheetCache[m.sheetName];
    if(!cache || cache.aIdx<0) return;

    var kpiCols = [];
    [m.colRev,m.colVol,m.colAvg,m.colDiff,m.colPct,m.colDiff2,m.colPct2].forEach(function(c){
      if(!c) return;
      var idx = cache.headers.indexOf(c);
      if(idx>=0) kpiCols.push({name:c, idx:idx});
      if(extraCols.indexOf(c)<0) extraCols.push(c);
    });
    if(m.hasCarrier){
      CARRIERS.forEach(function(carrier){
        ['Rev','Vol'].forEach(function(type){
          var col = carrier+' '+type+' ('+DATA_YEAR+'-'+m.label+')';
          var idx = cache.headers.indexOf(col);
          // ★ แก้: push เฉพาะ column ที่มีอยู่จริงใน sheet เท่านั้น
          if(idx>=0){
            kpiCols.push({name:col, idx:idx});
            if(extraCols.indexOf(col)<0) extraCols.push(col);
          }
        });
      });
    }
    for(var i=1; i<cache.data.length; i++){
      var row  = cache.data[i];
      var code = String(row[cache.aIdx]||'').trim();
      if(!code) continue;
      if(!agentExtraMap[code]) agentExtraMap[code] = {};
      kpiCols.forEach(function(c){
        var v   = row[c.idx];
        var val = (v!==null && v!==undefined && v!=='') ? v : 0;
        if(!agentExtraMap[code][c.name] && val) agentExtraMap[code][c.name] = val;
        else if(agentExtraMap[code][c.name] === undefined) agentExtraMap[code][c.name] = val;
      });
    }
  });

  // extraStaticMap — ดึง static info ต่อ agent
  // ลำดับความสำคัญ: Jan (มี static ครบ) → ชีตใหม่ล่าสุด (auto-discover)
  var extraStaticMap = {};
  // สร้าง staticPriority จาก MONTH_SHEETS ที่ discover แล้ว (ไม่ hardcode)
  var staticPriority = MONTH_SHEETS
    .filter(function(m){ return m.sheetName && !m.isBase; })
    .map(function(m){ return m.sheetName; })
    .filter(function(n,i,a){ return a.indexOf(n)===i; }); // unique
  staticPriority.forEach(function(shName){
    var cache = sheetCache[shName];
    if(!cache || cache.aIdx<0) return;
    var staticKeys = ['Agent Name','Package','City','Province','Zone Name','AREA','21.00','Avg./Day>20'];
    for(var i=1; i<cache.data.length; i++){
      var row  = cache.data[i];
      var code = String(row[cache.aIdx]||'').trim();
      if(!code) continue;
      if(!extraStaticMap[code]) extraStaticMap[code] = {};
      staticKeys.forEach(function(k){
        // ถ้ายังไม่มีค่า → เติมจาก sheet นี้
        if(extraStaticMap[code][k]!==undefined && extraStaticMap[code][k]!=='') return;
        var idx = cache.headers.indexOf(k);
        if(idx>=0 && row[idx]!==null && row[idx]!==undefined && row[idx]!=='')
          extraStaticMap[code][k]=row[idx];
      });
    }
  });

  function zoneAllowed(zoneName) {
    if (!allowedZones) return true;
    return allowedZones.indexOf(String(zoneName||'').trim()) >= 0;
  }

  // สร้าง rows
  var allAgentCodes = [];
  var rows = [];

  for(var i=1; i<baseData.length; i++){
    var row = baseData[i];
    if(!row[0] && !row[1]) continue;
    var code = String(row[agentIdx]||'').trim();
    if(!code) continue;
    var zoneName = zoneIdx>=0 ? String(row[zoneIdx]||'').trim() : '';
    if(!zoneAllowed(zoneName)) continue;
    allAgentCodes.push(code);
    var obj = {};
    wantedCols.forEach(function(col){
      if(baseColIdx[col]!==undefined) obj[col]=row[baseColIdx[col]];
    });
    var ex = agentExtraMap[code]||{};
    extraCols.forEach(function(c){ obj[c]=ex[c]!==undefined?ex[c]:0; });
    rows.push(obj);
  }

  Object.keys(agentExtraMap).forEach(function(code){
    if(allAgentCodes.indexOf(code)>=0) return;
    var sInfo = extraStaticMap[code]||{};
    if(!zoneAllowed(sInfo['Zone Name'])) return;
    var obj = {};
    wantedCols.forEach(function(col){ obj[col]=sInfo[col]!==undefined?sInfo[col]:0; });
    obj['Agent Code'] = code;
    var ex = agentExtraMap[code]||{};
    extraCols.forEach(function(c){ obj[c]=ex[c]!==undefined?ex[c]:0; });
    rows.push(obj);
  });

  var allHeaders = wantedCols.concat(
    extraCols.filter(function(c){ return wantedCols.indexOf(c)<0; })
  );

  var palette = [
    {color:'rgba(99,102,241,0.85)',  colorVol:'rgba(139,92,246,0.85)',  colorAvg:'rgba(168,85,247,0.85)'},
    {color:'rgba(14,165,233,0.85)',  colorVol:'rgba(6,182,212,0.85)',   colorAvg:'rgba(20,184,166,0.85)'},
    {color:'rgba(16,185,129,0.85)',  colorVol:'rgba(52,211,153,0.85)',  colorAvg:'rgba(110,231,183,0.85)'},
    {color:'rgba(245,158,11,0.85)',  colorVol:'rgba(251,191,36,0.85)',  colorAvg:'rgba(252,211,77,0.85)'},
    {color:'rgba(239,68,68,0.85)',   colorVol:'rgba(248,113,113,0.85)', colorAvg:'rgba(252,165,165,0.85)'}
  ];
  var months = MONTH_SHEETS.map(function(m,i){
    var cl = palette[i % palette.length];
    return { key:m.monthKey, th:monthThName(m.monthKey), en:monthEnName(m.monthKey),
      colRev:m.colRev, colVol:m.colVol, colAvg:m.colAvg,
      colDiff:m.colDiff||null, colPct:m.colPct||null,
      colDiff2:m.colDiff2||null, colPct2:m.colPct2||null,
      currentMonth:!!m.currentMonth,
      color:cl.color, colorVol:cl.colorVol, colorAvg:cl.colorAvg };
  });

  return { headers:allHeaders, rows:rows, months:months,
           carriers:CARRIERS, carrierMonths:CARRIER_MONTHS, dataYear:DATA_YEAR,
           userInfo: session.ok ? { username:session.username, role:session.role, zones:session.zones } : null };
}

function getCarrierData(){ return {carrierCols:[],carrierRows:[]}; }

// ============================================================
//  ACTIVITY LOG — บันทึกการใช้งาน Dashboard
// ============================================================

// สร้างหรือดึง Sheet 'ActivityLog' (headers แถวแรก)
function _getOrCreateLogSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET);
    // สร้าง Header row
    var headers = ['Timestamp','Username','Role','Action','Detail','User-Agent','Token (Short)'];
    sheet.appendRow(headers);
    // จัดรูปแบบ Header
    var hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setBackground('#003F5C');
    hRange.setFontColor('white');
    hRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    // ปรับ column width
    sheet.setColumnWidth(1, 170); // Timestamp
    sheet.setColumnWidth(2, 120); // Username
    sheet.setColumnWidth(3, 80);  // Role
    sheet.setColumnWidth(4, 130); // Action
    sheet.setColumnWidth(5, 260); // Detail
    sheet.setColumnWidth(6, 220); // User-Agent
    sheet.setColumnWidth(7, 120); // Token Short
  }
  return sheet;
}

// logActivity(username, role, action, detail, token)
// action: 'LOGIN' | 'LOGOUT' | 'VIEW_DASHBOARD' | ...
function logActivity(username, role, action, detail, token) {
  try {
    var sheet = _getOrCreateLogSheet();
    // Format timestamp เป็น Bangkok time (UTC+7)
    var now = new Date();
    var bkkOffset = 7 * 60; // นาที
    var bkkTime   = new Date(now.getTime() + (bkkOffset + now.getTimezoneOffset()) * 60000);
    var ts = Utilities.formatDate(bkkTime, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
    // Token แสดงแค่ 8 ตัวท้าย (privacy)
    var tokenShort = token ? ('...' + String(token).slice(-8)) : '-';
    // ดึง userAgent จาก session ถ้ามี (pass เข้ามาเป็น param ที่ 6)
    var ua = (arguments.length >= 6 && arguments[5]) ? String(arguments[5]).substring(0,200) : '-';
    sheet.appendRow([ts, username || '-', role || '-', action, detail || '', ua, tokenShort]);
  } catch(e) {
    // ถ้า log ไม่ได้ก็ไม่ให้ crash ระบบหลัก
    Logger.log('logActivity error: ' + e.message);
  }
}

// getActivityLog(token, limit) — ดึง log ล่าสุด (เฉพาะ Director/Admin)
function getActivityLog(token, limit) {
  var session = _requireSession(token || '', 'GET_ACTIVITY_LOG');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director', 'Admin'], 'GET_ACTIVITY_LOG');
  if (!roleCheck.ok) return roleCheck;
  try {
    var sheet = _getOrCreateLogSheet();
    var data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, headers: data[0] || [], rows: [] };
    var headers = data[0];
    // คืนข้อมูลจาก row ล่าสุดขึ้นมา (ไม่รวม header)
    var maxRows = Math.min(limit || 500, data.length - 1);
    var rows    = data.slice(1).reverse().slice(0, maxRows);
    return { ok: true, headers: headers, rows: rows };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}
