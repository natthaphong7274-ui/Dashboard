// ============================================================
//  Config.gs — ค่าคงที่ทั้งระบบ + Auto-Discover Month Sheets
//  แก้ไข: carriers, DATA_YEAR, session timeout ที่นี่จุดเดียว
// ============================================================

// ============================================================
//  Code.gs — Customer Insight Dashboard  (Auto-discover edition)
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
  var currentIdx = _MONTH_ORDER.indexOf(String(currentMonthKey || '').toLowerCase());
  var configuredIdx = _MONTH_ORDER.indexOf(configured);
  if (configuredIdx >= 0 && (currentIdx < 0 || configuredIdx < currentIdx)) return configured;
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

var _MONTH_MAP = {
  // English Short
  'jan': 'jan', 'feb': 'feb', 'mar': 'mar', 'apr': 'apr', 'may': 'may', 'jun': 'jun',
  'jul': 'jul', 'aug': 'aug', 'sep': 'sep', 'oct': 'oct', 'nov': 'nov', 'dec': 'dec',
  // English Full
  'january': 'jan', 'february': 'feb', 'march': 'mar', 'april': 'apr', 'june': 'jun',
  'july': 'jul', 'august': 'aug', 'september': 'sep', 'october': 'oct', 'november': 'nov', 'december': 'dec',
  // Thai Full
  'มกราคม': 'jan', 'กุมภาพันธ์': 'feb', 'มีนาคม': 'mar', 'เมษายน': 'apr', 'พฤษภาคม': 'may', 'มิถุนายน': 'jun',
  'กรกฎาคม': 'jul', 'สิงหาคม': 'aug', 'กันยายน': 'sep', 'ตุลาคม': 'oct', 'พฤศจิกายน': 'nov', 'ธันวาคม': 'dec',
  // Thai Short
  'ม.ค.': 'jan', 'ก.พ.': 'feb', 'มี.ค.': 'mar', 'เม.ย.': 'apr', 'พ.ค.': 'may', 'มิ.ย.': 'jun',
  'ก.ค.': 'jul', 'ส.ค.': 'aug', 'ก.ย.': 'sep', 'ต.ค.': 'oct', 'พ.ย.': 'nov', 'ธ.ค.': 'dec',
  'มค': 'jan', 'กพ': 'feb', 'มีค': 'mar', 'เมย': 'apr', 'พค': 'may', 'มิย': 'jun',
  'กค': 'jul', 'สค': 'aug', 'กย': 'sep', 'ตค': 'oct', 'พย': 'nov', 'ธค': 'dec'
};

function getMonthNamesList(monthKey) {
  var list = [];
  var engShort = monthKey;
  var engFull = '';
  switch(monthKey) {
    case 'jan': engFull = 'january'; break;
    case 'feb': engFull = 'february'; break;
    case 'mar': engFull = 'march'; break;
    case 'apr': engFull = 'april'; break;
    case 'may': engFull = 'may'; break;
    case 'jun': engFull = 'june'; break;
    case 'jul': engFull = 'july'; break;
    case 'aug': engFull = 'august'; break;
    case 'sep': engFull = 'september'; break;
    case 'oct': engFull = 'october'; break;
    case 'nov': engFull = 'november'; break;
    case 'dec': engFull = 'december'; break;
  }
  list.push(engShort);
  if (engFull) list.push(engFull);

  var thShort = '';
  var thFull = '';
  switch(monthKey) {
    case 'jan': thShort = 'ม.ค.'; thFull = 'มกราคม'; break;
    case 'feb': thShort = 'ก.พ.'; thFull = 'กุมภาพันธ์'; break;
    case 'mar': thShort = 'มี.ค.'; thFull = 'มีนาคม'; break;
    case 'apr': thShort = 'เม.ย.'; thFull = 'เมษายน'; break;
    case 'may': thShort = 'พ.ค.'; thFull = 'พฤษภาคม'; break;
    case 'jun': thShort = 'มิ.ย.'; thFull = 'มิถุนายน'; break;
    case 'jul': thShort = 'ก.ค.'; thFull = 'กรกฎาคม'; break;
    case 'aug': thShort = 'ส.ค.'; thFull = 'สิงหาคม'; break;
    case 'sep': thShort = 'ก.ย.'; thFull = 'กันยายน'; break;
    case 'oct': thShort = 'ต.ค.'; thFull = 'ตุลาคม'; break;
    case 'nov': thShort = 'พ.ย.'; thFull = 'พฤศจิกายน'; break;
    case 'dec': thShort = 'ธ.ค.'; thFull = 'ธันวาคม'; break;
  }
  if (thShort) {
    list.push(thShort);
    list.push(thShort.replace(/\./g, ''));
  }
  if (thFull) list.push(thFull);
  return list;
}

function findHeaderIndex(headers, type, monthKey, year, isBase) {
  var monthNames = getMonthNamesList(monthKey);
  var yrShort = String(year).slice(-2);
  var yrLong = String(year);
  var cleanHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase(); });

  for (var i = 0; i < cleanHeaders.length; i++) {
    var h = cleanHeaders[i];
    if (type === 'rev' || type === 'vol') {
      var prefix = type;
      for (var j = 0; j < monthNames.length; j++) {
        var mName = monthNames[j].toLowerCase();
        if (h === prefix + ' ' + mName + ' ' + yrShort ||
            h === prefix + ' ' + mName + ' ' + yrLong) {
          return i;
        }
      }
    } else if (type === 'avg') {
      for (var j = 0; j < monthNames.length; j++) {
        var mName = monthNames[j].toLowerCase();
        if (h === 'avg rev ' + mName || h === 'avg ' + mName) {
          return i;
        }
      }
    }
  }

  // Fallback for separate monthly sheets (isBase === false) where headers might be plain 'Rev' / 'Vol' / 'Avg'
  if (isBase === false) {
    var plainKeys = [];
    if (type === 'rev') plainKeys = ['rev', 'revenue', 'ยอดขาย', 'รายได้'];
    else if (type === 'vol') plainKeys = ['vol', 'volume', 'จำนวนชิ้น', 'ออเดอร์', 'จำนวน'];
    else if (type === 'avg') plainKeys = ['avg', 'avg rev', 'avg./day', 'avg/day', 'ยอดเฉลี่ย', 'เฉลี่ยต่อวัน'];

    for (var i = 0; i < cleanHeaders.length; i++) {
      if (plainKeys.indexOf(cleanHeaders[i]) >= 0) {
        return i;
      }
    }
  }

  return -1;
}

function findCarrierHeaderIndex(headers, carrier, type, year, label) {
  var col = String(carrier + ' ' + type + ' (' + year + '-' + label + ')').toLowerCase().trim();
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i] || '').toLowerCase().trim() === col) {
      return i;
    }
  }
  return -1;
}

// ชื่อ column patterns ต่อเดือน (ปีอาจต่างกันได้ — แก้ได้ตรงนี้จุดเดียว)
// ถ้า column ใน sheet ใหม่ชื่อต่างออกไป ให้แก้ที่ _colPatterns
var _colPatterns = {
  rev:  function(m,y){ return 'Rev '+cap(m)+' '+y.slice(2); },   // Rev May 26
  vol:  function(m,y){ return 'Vol '+cap(m)+' '+y.slice(2); },   // Vol May 26
  avg:  function(m,y){ return 'Avg Rev '+cap(m); },               // Avg Rev May
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
        var m = h.match(/^Rev\s+(.+)\s+(\d{2})$/i);
        if (!m) return;
        var year = '20' + m[2];
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
    // จับชีตที่ชื่อ Raw-KPI-{MonthName} (รองรับภาษาไทยและอังกฤษตัวเต็ม/ตัวย่อ + ลบปี/ช่องว่าง)
    var m = name.match(/^Raw-KPI-(.+)$/i);
    if (!m) return;
    var rawKey = m[1].trim().toLowerCase()
                     .replace(/\s+/g, '')
                     .replace(/[-_]/g, '')
                     .replace(/\d+/g, '');
    var key = _MONTH_MAP[rawKey];
    if (key && _MONTH_ORDER.indexOf(key) >= 0) {
      rawKpiSheets[key] = name;
    }
  });

  // อ่าน Headers ของ Base Sheet ล่วงหน้าเพื่อตรวจสอบคอลัมน์ของเดือนที่ไม่มีชีตแยก
  var baseSheet = ss.getSheetByName(BASE_SHEET);
  var baseHeaders = [];
  if (baseSheet) {
    baseHeaders = baseSheet.getRange(1, 1, 1, baseSheet.getLastColumn()).getValues()[0]
      .map(function(h) { return String(h || '').trim().toLowerCase(); });
  }

  var year = _detectDataYear(ss, rawKpiSheets);
  DATA_YEAR = year;

  // เรียงลำดับและจัดเก็บเฉพาะเดือนที่มีอยู่จริง (มีชีตแยก หรือ มีคอลัมน์ใน Base Sheet)
  var sortedKeys = _MONTH_ORDER.filter(function(key) {
    if (rawKpiSheets[key]) return true;
    // ถ้าไม่มีชีตแยก ให้ดูว่ามีคอลัมน์ใน Base Sheet ไหม
    var revIdx = findHeaderIndex(baseHeaders, 'rev', key, year, true);
    return revIdx >= 0;
  });

  var lastMonthKey = sortedKeys[sortedKeys.length - 1];
  var result = [];

  sortedKeys.forEach(function(key) {
    var sheetName = rawKpiSheets[key] || null;
    var label     = _MONTH_LABEL[key] || '00';
    var isCurrent = (key === lastMonthKey);

    // ถ้าไม่มีชีตแยก แสดงว่าข้อมูลอยู่ใน Base Sheet
    var isBase = !sheetName;

    // มกราคมไม่มีข้อมูลผู้ขนส่ง (Carriers) ในระบบนี้
    var hasCarrier = (key !== 'jan');
    var hasCarrierInBase = (key === 'mar');

    result.push({
      sheetName:       sheetName,
      monthKey:        key,
      label:           label,
      isBase:          isBase,
      hasCarrier:      hasCarrier,
      hasCarrierInBase: hasCarrierInBase && isBase,
      currentMonth:    isCurrent,
      colRev:          _colPatterns.rev(key, year),
      colVol:          _colPatterns.vol(key, year),
      colAvg:          _colPatterns.avg(key, year),
      colDiff:         (key !== 'jan' && key !== 'feb') ? 'Diff Current vs (Month - 1)' : null,
      colPct:          (key !== 'jan' && key !== 'feb') ? '%Cha Current vs (Month - 1)' : null,
      colDiff2:        (key !== 'jan' && key !== 'feb') ? 'Diff Current vs (Month - 2)' : null,
      colPct2:         (key !== 'jan' && key !== 'feb') ? '%Cha Current vs (Month - 2)' : null
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
