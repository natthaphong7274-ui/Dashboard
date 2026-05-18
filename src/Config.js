// ============================================================
//  Config.gs — ค่าคงที่ทั้งระบบ + Auto-Discover Month Sheets
//  แก้ไข: carriers, DATA_YEAR, session timeout ที่นี่จุดเดียว
// ============================================================

// ============================================================
//  Code.gs — Dashboard Realtime  (Auto-discover edition)
//  ✅ รองรับการเพิ่มชีตใหม่ Raw-KPI-XXX โดยอัตโนมัติ
//     ไม่ต้องแก้โค้ดเมื่อเพิ่มเดือนใหม่
//  Sheet mapping (auto-detected):
//    BASE  ← Raw-KPI-Mar  (ชีตหลักที่มี Agent ครบ)
//    อื่นๆ ← Raw-KPI-Jan, Raw-KPI-Apr, Raw-KPI-May, ...
//  Auth: ScriptProperties + browser sessionStorage token
// ============================================================

var BASE_SHEET  = 'Raw-KPI-Mar';
var USERS_SHEET = 'Users';

var CARRIERS = [
  'THAIPOST','KERRY_OFFLINE','KEX FRUIT','FLASH','MSBEST','MYSAVEFRUIT',
  'FLASHFRUIT','FLASHBULKY','KERRY_ONLINE','OTHER',
  'BEST','DHL','EASYPOSTFRUIT','ECO','INTER','JT','LALAMOVE',
  'SHIPPOPFRUIT','SHOPEE','SHOPEEOFFLINE'
];

var DATA_YEAR = '2026';

// Phase 8: default baseline for loss/inactive analysis.
// Keep this configurable so seasonal drops do not accidentally become the comparison base.
var LOSS_BASELINE_MONTH_KEY = 'mar';
function getLossBaselineMonthKey(currentMonthKey) {
  var configured = String(LOSS_BASELINE_MONTH_KEY || '').toLowerCase();
  if (_MONTH_ORDER.indexOf(configured) >= 0) return configured;
  var currentIdx = _MONTH_ORDER.indexOf(String(currentMonthKey || '').toLowerCase());
  return currentIdx > 0 ? _MONTH_ORDER[currentIdx - 1] : 'mar';
}

// ============================================================
//  AUTO-DISCOVER: สร้าง MONTH_SHEETS จากชีตที่มีอยู่จริงใน Spreadsheet
//  รูปแบบชีต: Raw-KPI-{MonthName}  เช่น Raw-KPI-Jan, Raw-KPI-May
//  ไม่ต้องแก้โค้ดเมื่อเพิ่มเดือนใหม่ — เพียงสร้างชีตใหม่ก็พอ
// ============================================================

// ลำดับเดือน (ใช้ตัดสิน currentMonth และเรียงลำดับ)
var _MONTH_ORDER = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
var _MONTH_LABEL = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
                    jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};

// ชื่อ column patterns ต่อเดือน (ปีอาจต่างกันได้ — แก้ได้ตรงนี้จุดเดียว)
// ถ้า column ใน sheet ใหม่ชื่อต่างออกไป ให้แก้ที่ _colPatterns
var _colPatterns = {
  rev:  function(m,y){ return 'Rev '+cap(m)+' '+y.slice(2); },   // Rev May 26
  vol:  function(m,y){ return 'Vol '+cap(m)+' '+y.slice(2); },   // Vol May 26
  avg:  function(m,y){ return 'Avg Rev '+cap(m); },               // Avg Rev May                     // ยอดลดลง may
};

function cap(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase(); }

// ── ใช้ function นี้ใน GAS editor เพื่อทดสอบ buildMonthSheets ──
function testBuildMonthSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = buildMonthSheets(ss);
  Logger.log('MONTH_SHEETS built: ' + result.length + ' เดือน');
  result.forEach(function(m) {
    Logger.log(m.monthKey + ' | colRev=' + m.colRev + ' | sheet=' + m.sheetName + ' | current=' + m.currentMonth);
  });
}

// ============================================================
//  buildMonthSheets() — เรียก 1 ครั้งต่อ request ใน getAllData()
//  ค้นหาชีต Raw-KPI-* ทั้งหมด แล้วสร้าง config อัตโนมัติ
// ============================================================
function _detectDataYear(ss, rawKpiSheets) {
  var counts = {};
  Object.keys(rawKpiSheets || {}).forEach(function(key) {
    try {
      var sh = ss.getSheetByName(rawKpiSheets[key]);
      if (!sh) return;
      var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
        .map(function(h){ return String(h || '').trim(); });
      headers.forEach(function(h) {
        var m = h.match(/^Rev\s+[A-Za-z]{3,9}\s+(\d{2})$/i);
        if (!m) return;
        var year = '20' + m[1];
        counts[year] = (counts[year] || 0) + 1;
      });
    } catch(e) {}
  });
  var best = DATA_YEAR;
  Object.keys(counts).forEach(function(y) {
    if (!counts[best] || counts[y] > counts[best] || (counts[y] === counts[best] && y > best)) best = y;
  });
  return best || DATA_YEAR;
}

function buildMonthSheets(ss) {
  var allSheets = ss.getSheets();
  var rawKpiSheets = {};  // { 'may': 'Raw-KPI-May', ... }

  allSheets.forEach(function(sh) {
    var name = sh.getName();
    // จับชีตที่ชื่อ Raw-KPI-{MonthName}
    var m = name.match(/^Raw-KPI-([A-Za-z]+)$/i);
    if (!m) return;
    var key = m[1].toLowerCase();
    if (_MONTH_ORDER.indexOf(key) >= 0) {
      rawKpiSheets[key] = name;
    }
  });

  // เรียงตามลำดับเดือน
  var sortedKeys = _MONTH_ORDER.filter(function(k) {
    return rawKpiSheets[k] || k === 'feb'; // feb ใช้ BASE_SHEET ไม่มีชีตแยก
  });
  // กรอง: เอาเฉพาะเดือนที่มีชีตจริง + feb (base)
  sortedKeys = _MONTH_ORDER.filter(function(k) {
    return rawKpiSheets[k] !== undefined || k === 'feb';
  });

  // หาเดือนล่าสุด (currentMonth) = เดือนสุดท้ายใน sortedKeys
  var lastMonthKey = sortedKeys[sortedKeys.length - 1];

  var result = [];
  var year = _detectDataYear(ss, rawKpiSheets);
  DATA_YEAR = year;

  sortedKeys.forEach(function(key, idx) {
    var sheetName = rawKpiSheets[key] || null;
    var label     = _MONTH_LABEL[key] || '00';
    var isCurrent = (key === lastMonthKey);

    // ── Jan: ชีตแยก ไม่มี carrier ──
    if (key === 'jan') {
      result.push({
        sheetName:    sheetName,
        monthKey:     key,
        label:        label,
        isBase:       false,
        hasCarrier:   false,
        currentMonth: isCurrent,
        colRev:       _colPatterns.rev(key, year),
        colVol:       _colPatterns.vol(key, year),
        colAvg:       _colPatterns.avg(key, year)
      });
      return;
    }

    // ── Feb: BASE_SHEET ──
    if (key === 'feb') {
      result.push({
        sheetName:    null,           // ใช้ BASE_SHEET
        monthKey:     key,
        label:        label,
        isBase:       true,
        hasCarrier:   true,
        currentMonth: isCurrent,
        colRev:       _colPatterns.rev(key, year),
        colVol:       _colPatterns.vol(key, year),
        colAvg:       _colPatterns.avg(key, year)
      });
      return;
    }

    // ── Mar+: ชีตแยก มี carrier มี Diff/Pct ──
    // Mar: hasCarrierInBase=true (ข้อมูล carrier อยู่ใน Base ด้วย)
    var hasCarrierInBase = (key === 'mar');

    result.push({
      sheetName:       sheetName,
      monthKey:        key,
      label:           label,
      isBase:          false,
      hasCarrier:      true,
      hasCarrierInBase: hasCarrierInBase,
      currentMonth:    isCurrent,
      colRev:          _colPatterns.rev(key, year),
      colVol:          _colPatterns.vol(key, year),
      colAvg:          _colPatterns.avg(key, year),
      colDiff:         'Diff Current vs (Month - 1)',
      colPct:          '%Cha Current vs (Month - 1)',
      colDiff2:        'Diff Current vs (Month - 2)',
      colPct2:         '%Cha Current vs (Month - 2)'
    });
  });

  return result;
}

// MONTH_SHEETS จะถูก populate ตอน getAllData() เรียก buildMonthSheets()
// ตัวแปรนี้ยังคงไว้เพื่อ backward compat กับ functions อื่นที่ใช้ MONTH_SHEETS
var MONTH_SHEETS = [];

// helper: รับ MONTH_SHEETS ที่ populate แล้ว (ใช้ใน getAllMonthlyTargets etc.)
function _getMonthSheets(ss) {
  if (MONTH_SHEETS.length > 0) return MONTH_SHEETS;
  if (ss) {
    MONTH_SHEETS = buildMonthSheets(ss);
  } else {
    MONTH_SHEETS = buildMonthSheets(SpreadsheetApp.getActiveSpreadsheet());
  }
  return MONTH_SHEETS;
}
