// ============================================================
//  Tracking.gs — ระบบติดตามลูกค้า (Risk) + Growth Tracking
//  Sheet: "Tracking" (กลุ่มเสี่ยง) + "TrackingGrowth" (กลุ่มเติบโต)
//  functions: getTrackingData, saveTrackingRow, saveTrackingBatch
//              getGrowthTrackingData, saveGrowthTrackingRow, saveGrowthTrackingBatch
// ============================================================


// ============================================================
//  TRACKING SYSTEM — ระบบบันทึกสถานะการติดตามลูกค้า
//  Sheet: "Tracking"
//  Columns: key | status | reason | note | updatedBy | updatedAt
// ============================================================

var TRACKING_SHEET = 'Tracking';
var TRACKING_CUTOFF_LOG_SHEET = 'TrackingCutoffLog';
var TRACKING_HISTORY_SHEET = 'TrackingStatusHistory';
var TRACKING_CRITERIA_COLUMNS = [
  'criteriaType',
  'criteriaMetric',
  'criteriaThreshold',
  'criteriaSnapshot',
  'criteriaVersion',
  'activeInCurrentCriteria',
  'firstMatchedAt',
  'lastMatchedAt'
];
var TRACKING_STATUS_META_COLUMNS = [
  'statusSource',
  'statusVersion',
  'lastDashboardSyncAt',
  'lastSheetEditAt'
];
var TRACKING_WEEKLY_SHEET = 'TrackingWeeklyCriteria';
var TRACKING_MONTHLY_SHEET = 'TrackingMonthlyCriteria';
var TRACKING_WEEKLY_META_COLUMNS = [
  'weeklyState',
  'streakWeeks',
  'totalMatchedWeeks',
  'maxStreakWeeks',
  'matchedWeeksInMonth',
  'weekKey',
  'weekStart',
  'weekEnd',
  'monthlyContext'
];
var TRACKING_MONTHLY_META_COLUMNS = [
  'monthlyState',
  'streakMonths',
  'totalMatchedMonths',
  'maxStreakMonths',
  'firstMatchedMonth',
  'lastMatchedMonth',
  'matchedMonthsLabel'
];
var TRACKING_WEEKLY_COLUMNS = [
  'kind',
  'agentCode',
  'key',
  'monthKey',
  'weekKey',
  'weekStart',
  'weekEnd',
  'criteriaMetric',
  'criteriaThreshold',
  'matched',
  'level',
  'streakWeeks',
  'totalMatchedWeeks',
  'maxStreakWeeks',
  'matchedWeeksInMonth',
  'activeInCurrentWeek',
  'snapshot',
  'updatedBy',
  'updatedAt'
];
var TRACKING_MONTHLY_COLUMNS = [
  'kind',
  'agentCode',
  'key',
  'monthKey',
  'baselineMonth',
  'criteriaMetric',
  'criteriaThreshold',
  'matched',
  'level',
  'streakMonths',
  'totalMatchedMonths',
  'maxStreakMonths',
  'firstMatchedMonth',
  'lastMatchedMonth',
  'monthlyState',
  'activeInCurrentMonth',
  'snapshot',
  'updatedBy',
  'updatedAt'
];
var TRACKING_THAI_HEADERS = {
  agentCode: 'รหัส Agent',
  agentName: 'ชื่อลูกค้า',
  '21.00': 'รหัสลูกค้า',
  package: 'แพ็กเกจ',
  city: 'อำเภอ/เขต',
  province: 'จังหวัด',
  zoneName: 'Zone',
  key: 'Key',
  status: 'สถานะติดตาม',
  reason: 'เหตุผล',
  key_success: 'ปัจจัยเติบโต',
  note: 'หมายเหตุ',
  updatedBy: 'แก้ไขโดย',
  updatedAt: 'แก้ไขล่าสุด',
  cutoffPeriod: 'รอบข้อมูล',
  criteriaType: 'ประเภทเกณฑ์',
  criteriaMetric: 'เกณฑ์ที่ใช้',
  criteriaThreshold: 'ค่าเกณฑ์',
  criteriaSnapshot: 'รายละเอียดเกณฑ์',
  criteriaVersion: 'เวอร์ชันเกณฑ์',
  activeInCurrentCriteria: 'ยังอยู่ในเกณฑ์ปัจจุบัน',
  firstMatchedAt: 'เข้าเกณฑ์ครั้งแรก',
  lastMatchedAt: 'เข้าเกณฑ์ล่าสุด',
  statusSource: 'แหล่งที่มาสถานะ',
  statusVersion: 'เวอร์ชันสถานะ',
  lastDashboardSyncAt: 'ซิงก์จาก Dashboard ล่าสุด',
  lastSheetEditAt: 'แก้จาก Sheet ล่าสุด',
  weeklyState: 'สถานะรายสัปดาห์',
  streakWeeks: 'ต่อเนื่องกี่สัปดาห์',
  totalMatchedWeeks: 'เข้าเกณฑ์รวมกี่สัปดาห์',
  maxStreakWeeks: 'ต่อเนื่องสูงสุด',
  matchedWeeksInMonth: 'เข้าเกณฑ์ในเดือนนี้',
  weekKey: 'สัปดาห์',
  weekStart: 'วันที่เริ่มสัปดาห์',
  weekEnd: 'วันที่สิ้นสุดสัปดาห์',
  monthlyContext: 'บริบทรายเดือน',
  monthlyState: 'สถานะรายเดือน',
  streakMonths: 'ต่อเนื่องกี่เดือน',
  totalMatchedMonths: 'เข้าเกณฑ์รวมกี่เดือน',
  maxStreakMonths: 'ต่อเนื่องสูงสุดกี่เดือน',
  firstMatchedMonth: 'เดือนแรกที่เข้าเกณฑ์',
  lastMatchedMonth: 'เดือนล่าสุดที่เข้าเกณฑ์',
  matchedMonthsLabel: 'สรุปเดือนที่เข้าเกณฑ์',
  baselineMonth: 'เดือนฐานเปรียบเทียบ',
  activeInCurrentMonth: 'อยู่ในเดือนปัจจุบัน',
  kind: 'ประเภทกลุ่ม',
  monthKey: 'เดือน',
  matched: 'เข้าเกณฑ์',
  level: 'ระดับสัญญาณ',
  activeInCurrentWeek: 'ยังอยู่ในสัปดาห์ปัจจุบัน',
  snapshot: 'สรุปสถานะ'
};
var TRACKING_HEADER_ALIASES = {};
Object.keys(TRACKING_THAI_HEADERS).forEach(function(key) {
  TRACKING_HEADER_ALIASES[TRACKING_THAI_HEADERS[key]] = key;
});

function _trackingPad2(n) {
  return ('0' + n).slice(-2);
}

function _trackingCutoffPeriodKey(dateOpt) {
  var now = dateOpt || new Date();
  var tz = 'Asia/Bangkok';
  var y = Utilities.formatDate(now, tz, 'yyyy');
  var m = Utilities.formatDate(now, tz, 'MM');
  var d = parseInt(Utilities.formatDate(now, tz, 'd'), 10);
  if (d < 8) {
    var prevY = parseInt(y, 10);
    var prevM = parseInt(m, 10) - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY--;
    }
    return prevY + '-' + _trackingPad2(prevM) + '-22';
  }
  return y + '-' + m + '-' + (d < 22 ? '08' : '22');
}

function _trackingNormalizeCutoffPeriod(value) {
  if (value === null || value === undefined || value === '') return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  var raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  var parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  return raw;
}

function _trackingPreviousCutoffPeriodKey(dateOpt) {
  var current = _trackingCutoffPeriodKey(dateOpt);
  var parts = current.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  var slot = parts[2];
  if (slot === '22') return y + '-' + _trackingPad2(m) + '-08';
  m--;
  if (m < 1) {
    m = 12;
    y--;
  }
  return y + '-' + _trackingPad2(m) + '-22';
}

function _isTrackingCutoffDate(dateOpt) {
  var d = parseInt(Utilities.formatDate(dateOpt || new Date(), 'Asia/Bangkok', 'd'), 10);
  return d === 8 || d === 22;
}

function _trackingDateKey(y, m, d) {
  return y + '-' + _trackingPad2(m) + '-' + _trackingPad2(d);
}

function _trackingDateFromKey(key) {
  var p = String(key || '').split('-');
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}

function _trackingCutoffMeta(dateOpt) {
  var now = dateOpt || new Date();
  var tz = 'Asia/Bangkok';
  var y = parseInt(Utilities.formatDate(now, tz, 'yyyy'), 10);
  var m = parseInt(Utilities.formatDate(now, tz, 'MM'), 10);
  var d = parseInt(Utilities.formatDate(now, tz, 'd'), 10);
  var nextY = y;
  var nextM = m;
  var nextD = 8;
  if (d === 8 || d === 22) {
    nextD = d;
  } else if (d > 8 && d < 22) {
    nextD = 22;
  } else if (d > 22) {
    nextM++;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    }
  }
  var todayKey = _trackingDateKey(y, m, d);
  var nextKey = _trackingDateKey(nextY, nextM, nextD);
  var daysUntilReset = Math.max(0, Math.round((_trackingDateFromKey(nextKey) - _trackingDateFromKey(todayKey)) / 86400000));
  return {
    cutoffPeriod: _trackingCutoffPeriodKey(now),
    previousCutoffPeriod: _trackingPreviousCutoffPeriodKey(now),
    nextResetDate: nextKey,
    daysUntilReset: daysUntilReset,
    isResetToday: daysUntilReset === 0,
    timezone: tz
  };
}

function _ensureTrackingCutoffColumn(sheet, headerColor) {
  var hRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var hStr = hRow.map(function(h){ return String(h).trim(); });
  if (hStr.indexOf('cutoffPeriod') < 0) {
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue('cutoffPeriod')
      .setBackground(headerColor || '#003F5C').setFontColor('white').setFontWeight('bold');
    sheet.setColumnWidth(nextCol, 120);
  }
}

function _trackingHeaderKey(header) {
  var s = String(header || '').trim();
  if (TRACKING_HEADER_ALIASES[s]) return TRACKING_HEADER_ALIASES[s];
  return (s === '21' || s === '21.00') ? '21.00' : s;
}

function _trackingHeaderLabel(key) {
  return TRACKING_THAI_HEADERS[key] || key;
}

function _trackingFormatTextColumns(sheet, columns) {
  try {
    var meta = _trackingHeaderMap(sheet);
    (columns || []).forEach(function(col) {
      var idx = meta.map[col];
      if (idx >= 0 && sheet.getMaxRows() > 1) {
        sheet.getRange(2, idx + 1, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
      }
    });
  } catch(e) {}
}

function _logTrackingCutoff(kind) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TRACKING_CUTOFF_LOG_SHEET);
    var headers;
    if (!sheet) {
      sheet = ss.insertSheet(TRACKING_CUTOFF_LOG_SHEET);
      sheet.appendRow(['kind','cutoffPeriod','previousCutoffPeriod','event','loggedAt','resetEffective']);
      sheet.getRange(1,1,1,6).setBackground('#1f2937').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
      headers = ['kind','cutoffPeriod','previousCutoffPeriod','event','loggedAt','resetEffective'];
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
        .map(function(h){ return String(h).trim(); });
      ['previousCutoffPeriod','event','resetEffective'].forEach(function(col) {
        if (headers.indexOf(col) < 0) {
          var nextCol = sheet.getLastColumn() + 1;
          sheet.getRange(1, nextCol).setValue(col)
            .setBackground('#1f2937').setFontColor('white').setFontWeight('bold');
          headers.push(col);
        }
      });
    }
    var period = _trackingCutoffPeriodKey();
    var previousPeriod = _trackingPreviousCutoffPeriodKey();
    var event = 'CUTOFF_RESET';
    var resetEffective = _isTrackingCutoffDate() ? 'YES' : 'YES_ON_PERIOD_CHANGE';
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === kind && _trackingNormalizeCutoffPeriod(data[i][1]) === period) return;
    }
    var row = [];
    for (var j = 0; j < headers.length; j++) row.push('');
    row[headers.indexOf('kind')] = kind;
    row[headers.indexOf('cutoffPeriod')] = period;
    row[headers.indexOf('previousCutoffPeriod')] = previousPeriod;
    row[headers.indexOf('event')] = event;
    row[headers.indexOf('loggedAt')] = _bkkTimestamp();
    row[headers.indexOf('resetEffective')] = resetEffective;
    sheet.appendRow(row);
  } catch(e) {}
}

function runTrackingCutoffReset() {
  _getOrCreateTrackingSheet();
  _getOrCreateGrowthTrackingSheet();
  return {
    ok: true,
    cutoffPeriod: _trackingCutoffPeriodKey(),
    previousCutoffPeriod: _trackingPreviousCutoffPeriodKey(),
    resetEffective: _isTrackingCutoffDate(),
    loggedAt: _bkkTimestamp()
  };
}

// สร้างหรือดึง Sheet 'Tracking' พร้อม headers
// ── Status / Reason options (ตรงกับ Dashboard dropdown) ──
// ── Tracking (Risk / Loss) ──
var STATUS_OPTIONS = [
  'รอดำเนินการ',
  'ติดต่อแล้ว รอตอบกลับ',
  'กำลังแก้ปัญหา',
  'สำเร็จ (ดึงยอดกลับได้)',
  'ไม่สำเร็จ (ย้ายค่าย)'
];
var REASON_OPTIONS = [
  'ราคาแพงไป',
  'รถรับช้า',
  'สินค้าเสียหาย',
  'บริการไม่ดี',
  'คู่แข่งดีกว่า',
  'ร้านปิด/หยุดกิจการ',
  'สาเหตุอื่น'
];

// ── Growth Tracking ──
var GROWTH_STATUS_OPTIONS = [
  'รอดำเนินการ',
  'ติดต่อแล้ว / รอสัมภาษณ์',
  'เก็บข้อมูลสำเร็จ / ถอดบทเรียนแล้ว',
  'มอบรางวัล / เสนอสิทธิพิเศษแล้ว',
  'เสนอแพ็กเกจเพิ่มสำเร็จ',
  'ติดต่อไม่ได้ / ไม่สะดวกให้ข้อมูล'
];
var GROWTH_REASON_OPTIONS = [
  // Seasonal & Location
  'ฤดูกาลสินค้าเกษตร / ผลไม้ตามฤดูกาล',
  'เทศกาล / แคมเปญพิเศษในพื้นที่',
  'คู่แข่งในพื้นที่ปิดตัว / มีปัญหา',
  // Customer Driven
  'ได้ลูกค้ารายใหญ่ (VIP/B2B) เพิ่ม',
  'ลูกค้า E-commerce / ไลฟ์สดยอดพุ่ง',
  'ลูกค้าย้ายค่ายมาจากคู่แข่ง',
  // Agent Capabilities
  'ตัวแทนทำโปรโมชัน / การตลาดได้ดี',
  'ขยายขีดความสามารถ (รถ/พนักงาน/พื้นที่)',
  'บริการดีเยี่ยม / Word of Mouth',
  // Other
  'ปัจจัยอื่นๆ'
];

// ใส่ Data Validation dropdown ให้ column (colNum = 1-based) ตั้งแต่แถว 2 ลงไป
function _setDropdown(sheet, colNum, options) {
  var maxRow  = Math.max(sheet.getMaxRows(), 1000);
  var range   = sheet.getRange(2, colNum, maxRow - 1, 1);
  var rule    = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)   // true = แสดง dropdown arrow
    .setAllowInvalid(true)               // อนุญาตค่าอื่น (เผื่อ normalize)
    .setHelpText('เลือกค่าจาก dropdown หรือพิมพ์เองได้')
    .build();
  range.setDataValidation(rule);
}

function _getOrCreateTrackingSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TRACKING_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(TRACKING_SHEET);
    var headers = ['agentCode','agentName','21.00','package','city','province','zoneName',
                   'key','status','reason','note','updatedBy','updatedAt','cutoffPeriod']
                   .concat(TRACKING_CRITERIA_COLUMNS)
                   .concat(TRACKING_STATUS_META_COLUMNS)
                   .concat(TRACKING_WEEKLY_META_COLUMNS)
                   .concat(TRACKING_MONTHLY_META_COLUMNS);
    sheet.appendRow(headers.map(_trackingHeaderLabel));
    // จัดรูปแบบ header
    var hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setBackground('#003F5C');
    hRange.setFontColor('white');
    hRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1,  100); // agentCode
    sheet.setColumnWidth(2,  200); // agentName
    sheet.setColumnWidth(3,   80); // 21.00
    sheet.setColumnWidth(4,  130); // package
    sheet.setColumnWidth(5,  110); // city
    sheet.setColumnWidth(6,  120); // province
    sheet.setColumnWidth(7,  140); // zoneName
    sheet.setColumnWidth(8,  200); // key
    sheet.setColumnWidth(9,  180); // status
    sheet.setColumnWidth(10, 200); // reason
    sheet.setColumnWidth(11, 260); // note
    sheet.setColumnWidth(12, 110); // updatedBy
    sheet.setColumnWidth(13, 160); // updatedAt
    sheet.setColumnWidth(14, 120); // cutoffPeriod
    sheet.setColumnWidth(18, 320); // criteriaSnapshot
    // ── ใส่ dropdown ──
    _setDropdown(sheet, 9,  STATUS_OPTIONS);
    _setDropdown(sheet, 10, REASON_OPTIONS);
  } else {
    // ตรวจว่า sheet เก่ายังไม่มี columns ใหม่ → เพิ่มให้อัตโนมัติ
    var hRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var hStr = hRow.map(_trackingHeaderKey);
    var newCols = ['21.00','agentCode','package','agentName','city','province','zoneName','cutoffPeriod']
      .concat(TRACKING_CRITERIA_COLUMNS)
      .concat(TRACKING_STATUS_META_COLUMNS)
      .concat(TRACKING_WEEKLY_META_COLUMNS)
      .concat(TRACKING_MONTHLY_META_COLUMNS);
    newCols.forEach(function(col) {
      if (hStr.indexOf(col) < 0) {
        var nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue(_trackingHeaderLabel(col))
          .setBackground('#003F5C').setFontColor('white').setFontWeight('bold');
        var widths = _trackingColumnWidthMap();
        sheet.setColumnWidth(nextCol, widths[col] || (col === 'agentName' ? 200 : col === '21.00' ? 80 : 120));
        hStr.push(col);
      }
    });
    // ── ใส่ dropdown ให้ sheet เก่าที่ยังไม่มี validation ──
    var sIdx = hStr.indexOf('status');
    var rIdx = hStr.indexOf('reason');
    if (sIdx >= 0) _setDropdown(sheet, sIdx + 1, STATUS_OPTIONS);
    if (rIdx >= 0) _setDropdown(sheet, rIdx + 1, REASON_OPTIONS);
  }
  _ensureTrackingCutoffColumn(sheet, '#003F5C');
  _ensureTrackingColumns(sheet, TRACKING_CRITERIA_COLUMNS.concat(TRACKING_STATUS_META_COLUMNS).concat(TRACKING_WEEKLY_META_COLUMNS).concat(TRACKING_MONTHLY_META_COLUMNS), '#003F5C', _trackingColumnWidthMap());
  _trackingFormatTextColumns(sheet, ['cutoffPeriod']);
  _logTrackingCutoff('risk');
  return sheet;
}

// ============================================================
//  _normalizeStatus / _normalizeReason
//  แปลงค่าที่กรอกตรงใน Sheet (ภาษาไทย / label เต็ม / ตัวพิมพ์ใหญ่เล็ก)
//  ให้ตรงกับ key ที่ Dashboard ใช้: wait | contact | solving | success | fail
// ============================================================
// ── _normalizeStatus: แปลงค่าใน Sheet → key ที่ Dashboard ใช้ ──
// รับได้ทั้ง: key สั้น (success), label ไทยเต็ม (สำเร็จ (ดึงยอดกลับได้)), หรือ label ย่อ
function _normalizeStatus(raw) {
  if (!raw) return '';
  // ── pass-through key สั้น ──
  var exact = { wait:1, contact:1, solving:1, success:1, fail:1 };
  var trimmed = raw.trim().toLowerCase();
  if (exact[trimmed]) return trimmed;

  // ── ตัด emoji และ normalize space (ไม่ตัด space ทิ้งเพราะภาษาไทยต้องการ) ──
  var s = trimmed
    .replace(/[⏳📞🔧✅❌]/g, '')
    .replace(/\(.*?\)/g, '')   // ตัดวงเล็บ เช่น (ดึงยอดกลับได้) / (ย้ายค่าย)
    .replace(/\s+/g, ' ')
    .trim();
  if (exact[s]) return s;

  // ── map ครอบคลุมทั้ง label เต็มจาก Sheet dropdown และ label ย่อ ──
  var map = {
    // wait
    'รอดำเนินการ'              : 'wait',
    'รอ'                       : 'wait',
    'ยังไม่ได้ติดต่อ'          : 'wait',
    // contact
    'ติดต่อแล้ว รอตอบกลับ'    : 'contact',
    'ติดต่อแล้วรอตอบกลับ'     : 'contact',
    'ติดต่อแล้ว'               : 'contact',
    'ติดต่อ'                   : 'contact',
    'กำลังติดต่อ'              : 'contact',
    // solving
    'กำลังแก้ปัญหา'            : 'solving',
    'กำลังแก้'                 : 'solving',
    'แก้ปัญหา'                 : 'solving',
    'solving'                  : 'solving',
    // success
    'สำเร็จ'                   : 'success',
    'ดึงยอดกลับได้'            : 'success',
    'แก้แล้ว'                  : 'success',
    // fail
    'ไม่สำเร็จ'                : 'fail',
    'ย้ายค่าย'                 : 'fail',
    'เสีย'                     : 'fail',
    'หาย'                      : 'fail'
    };

  if (map[s]) return map[s];

  // ── fallback: ลอง match กับ raw ที่ไม่ lowercase (ภาษาไทย case-insensitive ใน map แล้ว) ──
  var rawClean = raw.trim().replace(/[⏳📞🔧✅❌]/g,'').replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();
  if (map[rawClean]) return map[rawClean];
  if (map[rawClean.toLowerCase()]) return map[rawClean.toLowerCase()];

  return raw.trim();
}

// ── _normalizeReason: แปลงค่าใน Sheet → key ที่ Dashboard ใช้ ──
function _normalizeReason(raw) {
  if (!raw) return '';
  var exact = { price:1, slow:1, damage:1, service:1, competitor:1, closed:1, other:1 };
  var trimmed = raw.trim().toLowerCase();
  if (exact[trimmed]) return trimmed;

  var s = trimmed.replace(/[💸🚚📦😤🏢🔒❓]/g,'').replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();
  if (exact[s]) return s;

  var map = {
    // price
    'ราคาแพงไป'        : 'price',
    'ราคาแพง'          : 'price',
    'แพง'              : 'price',
    // slow
    'รถรับช้า'         : 'slow',
    'ช้า'              : 'slow',
    'ขนส่งช้า'         : 'slow',
    // damage
    'สินค้าเสียหาย'    : 'damage',
    'เสียหาย'          : 'damage',
    'ของแตก'           : 'damage',
    // service
    'บริการไม่ดี'      : 'service',
    'บริการ'           : 'service',
    // competitor
    'คู่แข่งดีกว่า'    : 'competitor',
    'คู่แข่ง'          : 'competitor',
    // closed
    'ร้านปิด/หยุดกิจการ': 'closed',
    'ร้านปิด'          : 'closed',
    'ปิดกิจการ'        : 'closed',
    'หยุดกิจการ'       : 'closed',
    // other
    'สาเหตุอื่น'       : 'other',
    'อื่น'             : 'other',
    'อื่นๆ'            : 'other'
    };

  if (map[s]) return map[s];
  var rawClean = raw.trim().replace(/[💸🚚📦😤🏢🔒❓]/g,'').replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();
  if (map[rawClean]) return map[rawClean];
  if (map[rawClean.toLowerCase()]) return map[rawClean.toLowerCase()];

  return raw.trim();
}

// getTrackingData(token) — โหลดข้อมูลทั้งหมดจาก Tracking sheet
// เปิดให้ทุก role (BD / AM / Director) เข้าถึงได้
function getTrackingData(token) {
  var session = _requireSession(token || '', 'GET_TRACKING_DATA');
  if (!session.ok) return session;

  try {
    var sheet = _getOrCreateTrackingSheet();
    var data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, data: [], cutoff: _trackingCutoffMeta() };

    var headers = data[0].map(_trackingHeaderKey);
    var kIdx   = headers.indexOf('key');
    var sIdx   = headers.indexOf('status');
    var rIdx   = headers.indexOf('reason');
    var nIdx   = headers.indexOf('note');
    var ubIdx  = headers.indexOf('updatedBy');
    var uaIdx  = headers.indexOf('updatedAt');
    var v21Idx = headers.indexOf('21.00');
    var acIdx  = headers.indexOf('agentCode');
    var pkIdx  = headers.indexOf('package');
    var anIdx  = headers.indexOf('agentName');
    var ctIdx  = headers.indexOf('city');
    var pvIdx  = headers.indexOf('province');
    var znIdx  = headers.indexOf('zoneName');
    var cpIdx  = headers.indexOf('cutoffPeriod');
    var cTypeIdx = headers.indexOf('criteriaType');
    var cMetricIdx = headers.indexOf('criteriaMetric');
    var cThresholdIdx = headers.indexOf('criteriaThreshold');
    var cSnapshotIdx = headers.indexOf('criteriaSnapshot');
    var cVersionIdx = headers.indexOf('criteriaVersion');
    var cActiveIdx = headers.indexOf('activeInCurrentCriteria');
    var cFirstIdx = headers.indexOf('firstMatchedAt');
    var cLastIdx = headers.indexOf('lastMatchedAt');
    var srcIdx = headers.indexOf('statusSource');
    var verIdx = headers.indexOf('statusVersion');
    var dashSyncIdx = headers.indexOf('lastDashboardSyncAt');
    var sheetEditIdx = headers.indexOf('lastSheetEditAt');
    var weeklyIdx = {};
    TRACKING_WEEKLY_META_COLUMNS.forEach(function(col){ weeklyIdx[col] = headers.indexOf(col); });
    var monthlyIdx = {};
    TRACKING_MONTHLY_META_COLUMNS.forEach(function(col){ monthlyIdx[col] = headers.indexOf(col); });
    var curCutoff = _trackingCutoffPeriodKey();

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var key = String(r[kIdx] || '').trim();
      if (!key) continue;
      var cutoffPeriod = cpIdx >= 0 ? _trackingNormalizeCutoffPeriod(r[cpIdx]) : '';
      if (cutoffPeriod !== curCutoff) continue;
      var rowObj = {
        key:       key,
        status:    sIdx  >= 0 ? _normalizeStatus(String(r[sIdx]  || '')) : '',
        reason:    rIdx  >= 0 ? _normalizeReason(String(r[rIdx]  || '')) : '',
        note:      nIdx  >= 0 ? String(r[nIdx]  || '') : '',
        updatedBy: ubIdx >= 0 ? String(r[ubIdx] || '') : '',
        updatedAt: uaIdx >= 0 ? String(r[uaIdx] || '') : '',
        v21:       v21Idx >= 0 ? String(r[v21Idx] || '') : '',
        agentCode: acIdx  >= 0 ? String(r[acIdx]  || '') : '',
        package:   pkIdx  >= 0 ? String(r[pkIdx]  || '') : '',
        agentName: anIdx  >= 0 ? String(r[anIdx]  || '') : '',
        city:      ctIdx  >= 0 ? String(r[ctIdx]  || '') : '',
        province:  pvIdx  >= 0 ? String(r[pvIdx]  || '') : '',
        zoneName:  znIdx  >= 0 ? String(r[znIdx]  || '') : '',
        cutoffPeriod: cutoffPeriod,
        criteriaType: cTypeIdx >= 0 ? String(r[cTypeIdx] || '') : '',
        criteriaMetric: cMetricIdx >= 0 ? String(r[cMetricIdx] || '') : '',
        criteriaThreshold: cThresholdIdx >= 0 ? String(r[cThresholdIdx] || '') : '',
        criteriaSnapshot: cSnapshotIdx >= 0 ? String(r[cSnapshotIdx] || '') : '',
        criteriaVersion: cVersionIdx >= 0 ? String(r[cVersionIdx] || '') : '',
        activeInCurrentCriteria: cActiveIdx >= 0 ? String(r[cActiveIdx] || '') : '',
        firstMatchedAt: cFirstIdx >= 0 ? String(r[cFirstIdx] || '') : '',
        lastMatchedAt: cLastIdx >= 0 ? String(r[cLastIdx] || '') : '',
        statusSource: srcIdx >= 0 ? String(r[srcIdx] || '') : '',
        statusVersion: verIdx >= 0 ? String(r[verIdx] || '') : '',
        lastDashboardSyncAt: dashSyncIdx >= 0 ? String(r[dashSyncIdx] || '') : '',
        lastSheetEditAt: sheetEditIdx >= 0 ? String(r[sheetEditIdx] || '') : ''
      };
      TRACKING_WEEKLY_META_COLUMNS.forEach(function(col) {
        rowObj[col] = weeklyIdx[col] >= 0 ? String(r[weeklyIdx[col]] || '') : '';
      });
      TRACKING_MONTHLY_META_COLUMNS.forEach(function(col) {
        rowObj[col] = monthlyIdx[col] >= 0 ? String(r[monthlyIdx[col]] || '') : '';
      });
      if (_canAccessRow(session, rowObj)) rows.push(rowObj);
    }
    rows = _dedupeTrackingRows(rows);
    logActivity(session.username, session.role, 'VIEW_TRACKING_DATA', 'risk rows=' + rows.length + ' cutoff=' + curCutoff);
    return { ok: true, data: rows, cutoff: _trackingCutoffMeta(), syncVersion: 'phase10' };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

function _trackingHeaderMap(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(_trackingHeaderKey);
  var map = {};
  headers.forEach(function(h, i) { if (h && map[h] === undefined) map[h] = i; });
  return { headers: headers, map: map };
}

function _ensureTrackingColumns(sheet, columns, headerColor, widthMap) {
  var meta = _trackingHeaderMap(sheet);
  var headers = meta.headers;
  (columns || []).forEach(function(col) {
    if (headers.indexOf(col) >= 0) return;
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue(_trackingHeaderLabel(col))
      .setBackground(headerColor || '#003F5C').setFontColor('white').setFontWeight('bold');
    sheet.setColumnWidth(nextCol, widthMap && widthMap[col] ? widthMap[col] : 140);
    headers.push(col);
  });
}

function _trackingCriteriaWidthMap() {
  return {
    criteriaType: 110,
    criteriaMetric: 140,
    criteriaThreshold: 130,
    criteriaSnapshot: 320,
    criteriaVersion: 150,
    activeInCurrentCriteria: 170,
    firstMatchedAt: 160,
    lastMatchedAt: 160
  };
}

function _trackingColumnWidthMap() {
  var widths = _trackingCriteriaWidthMap();
  widths.statusSource = 130;
  widths.statusVersion = 120;
  widths.lastDashboardSyncAt = 170;
  widths.lastSheetEditAt = 170;
  widths.weeklyState = 150;
  widths.streakWeeks = 150;
  widths.totalMatchedWeeks = 170;
  widths.maxStreakWeeks = 150;
  widths.matchedWeeksInMonth = 170;
  widths.weekKey = 120;
  widths.weekStart = 140;
  widths.weekEnd = 140;
  widths.monthlyContext = 220;
  widths.monthlyState = 170;
  widths.streakMonths = 150;
  widths.totalMatchedMonths = 170;
  widths.maxStreakMonths = 170;
  widths.firstMatchedMonth = 160;
  widths.lastMatchedMonth = 160;
  widths.matchedMonthsLabel = 260;
  return widths;
}

function _getOrCreateTrackingHistorySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TRACKING_HISTORY_SHEET);
  var headers = [
    'loggedAt','kind','key','cutoffPeriod','field','oldValue','newValue',
    'source','changedBy','role','zoneName','agentCode',
    'statusBefore','statusAfter','reasonBefore','reasonAfter',
    'noteBefore','noteAfter','criteriaSnapshot'
  ];
  if (!sheet) {
    sheet = ss.insertSheet(TRACKING_HISTORY_SHEET);
    sheet.appendRow(headers.map(_trackingHeaderLabel));
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#334155').setFontColor('white').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(7, 180);
    sheet.setColumnWidth(19, 320);
  } else {
    var existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function(h){ return String(h).trim(); });
    headers.forEach(function(col) {
      if (existing.indexOf(col) >= 0) return;
      var nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(col)
        .setBackground('#334155').setFontColor('white').setFontWeight('bold');
      existing.push(col);
    });
  }
  _trackingFormatTextColumns(sheet, ['cutoffPeriod']);
  return sheet;
}

function _trackingCell(headers, row, col) {
  var idx = headers.indexOf(col);
  return idx >= 0 && row ? row[idx] : '';
}

function _trackingTrackedFields(kind) {
  return kind === 'growth' ? ['status','key_success','note'] : ['status','reason','note'];
}

function _trackingNormalizeFieldValue(kind, field, value) {
  value = String(value || '');
  if (field === 'status') return kind === 'growth' ? _normalizeGrowthStatus(value) : _normalizeStatus(value);
  if (field === 'reason') return _normalizeReason(value);
  if (field === 'key_success') return _normalizeGrowthReason(value);
  return value;
}

function _trackingDisplayFieldValue(kind, field, value) {
  var normalized = _trackingNormalizeFieldValue(kind, field, value);
  if (field === 'status') return kind === 'growth' ? _growthStatusLabel(normalized) : _statusLabel(normalized);
  if (field === 'reason') return _reasonLabel(normalized);
  if (field === 'key_success') return _growthReasonLabel(normalized);
  return normalized;
}

function _trackingNextVersion(headers, existingRow) {
  var raw = _trackingCell(headers, existingRow, 'statusVersion');
  var n = parseInt(raw || '0', 10);
  if (isNaN(n)) n = 0;
  return String(n + 1);
}

function _trackingBuildHistoryEntries(kind, key, cutoffPeriod, headers, oldRow, newRow, session, source, now) {
  var entries = [];
  var fields = _trackingTrackedFields(kind);
  var reasonCol = kind === 'growth' ? 'key_success' : 'reason';
  fields.forEach(function(field) {
    var oldVal = _trackingNormalizeFieldValue(kind, field, _trackingCell(headers, oldRow, field));
    var newVal = _trackingNormalizeFieldValue(kind, field, _trackingCell(headers, newRow, field));
    if (oldVal === newVal) return;
    entries.push([
      now,
      kind,
      key || _trackingCell(headers, newRow, 'key'),
      cutoffPeriod || _trackingCell(headers, newRow, 'cutoffPeriod'),
      field,
      _trackingDisplayFieldValue(kind, field, oldVal),
      _trackingDisplayFieldValue(kind, field, newVal),
      source || 'DASHBOARD',
      session && session.username ? session.username : '-',
      session && session.role ? session.role : '-',
      _trackingCell(headers, newRow, 'zoneName'),
      _trackingCell(headers, newRow, 'agentCode'),
      _trackingDisplayFieldValue(kind, 'status', _trackingCell(headers, oldRow, 'status')),
      _trackingDisplayFieldValue(kind, 'status', _trackingCell(headers, newRow, 'status')),
      _trackingDisplayFieldValue(kind, reasonCol, _trackingCell(headers, oldRow, reasonCol)),
      _trackingDisplayFieldValue(kind, reasonCol, _trackingCell(headers, newRow, reasonCol)),
      _trackingCell(headers, oldRow, 'note'),
      _trackingCell(headers, newRow, 'note'),
      _trackingCell(headers, newRow, 'criteriaSnapshot')
    ]);
  });
  return entries;
}

function _trackingAppendHistory(entries) {
  if (!entries || !entries.length) return;
  var sheet = _getOrCreateTrackingHistorySheet();
  sheet.getRange(sheet.getLastRow() + 1, 1, entries.length, entries[0].length).setValues(entries);
}

function _trackingWeekMeta(dateOpt) {
  var d = dateOpt ? new Date(dateOpt) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  var tz = 'Asia/Bangkok';
  var local = new Date(Utilities.formatDate(d, tz, 'yyyy/MM/dd HH:mm:ss'));
  var day = local.getDay();
  var mondayOffset = day === 0 ? -6 : 1 - day;
  var start = new Date(local.getFullYear(), local.getMonth(), local.getDate() + mondayOffset);
  var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  var oneJan = new Date(start.getFullYear(), 0, 1);
  var weekNo = Math.ceil((((start - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
  var weekKey = start.getFullYear() + '-W' + _trackingPad2(weekNo);
  return {
    weekKey: weekKey,
    weekStart: Utilities.formatDate(start, tz, 'yyyy-MM-dd'),
    weekEnd: Utilities.formatDate(end, tz, 'yyyy-MM-dd')
  };
}

function _trackingMonthKeyFromPayload(payload, cutoffPeriod) {
  var key = String(payload && payload.key || '');
  var parts = key.split('_');
  if (parts.length >= 3) return parts[parts.length - 1];
  var cp = _trackingNormalizeCutoffPeriod(cutoffPeriod || '');
  return cp ? cp.slice(0, 7) : '';
}

function _getOrCreateWeeklyCriteriaSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TRACKING_WEEKLY_SHEET);
  var labels = TRACKING_WEEKLY_COLUMNS.map(_trackingHeaderLabel);
  if (!sheet) {
    sheet = ss.insertSheet(TRACKING_WEEKLY_SHEET);
    sheet.appendRow(labels);
    sheet.getRange(1, 1, 1, labels.length)
      .setBackground('#1f2937').setFontColor('white').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 110);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(17, 320);
  } else {
    _ensureTrackingColumns(sheet, TRACKING_WEEKLY_COLUMNS, '#1f2937', _trackingColumnWidthMap());
  }
  _trackingFormatTextColumns(sheet, ['weekStart', 'weekEnd']);
  return sheet;
}

function _getOrCreateMonthlyCriteriaSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TRACKING_MONTHLY_SHEET);
  var labels = TRACKING_MONTHLY_COLUMNS.map(_trackingHeaderLabel);
  if (!sheet) {
    sheet = ss.insertSheet(TRACKING_MONTHLY_SHEET);
    sheet.appendRow(labels);
    sheet.getRange(1, 1, 1, labels.length)
      .setBackground('#334155').setFontColor('white').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 110);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(17, 320);
  } else {
    _ensureTrackingColumns(sheet, TRACKING_MONTHLY_COLUMNS, '#334155', _trackingColumnWidthMap());
  }
  return sheet;
}

function _weeklyRecordFromRow(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i]; });
  return obj;
}

function _monthlyRecordFromRow(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i]; });
  return obj;
}

function _trackingWeeklyState(summary) {
  var streak = Number(summary && summary.streakWeeks || 0);
  if (streak >= 3) return 'ต่อเนื่อง 3+ สัปดาห์';
  if (streak >= 2) return 'ต่อเนื่อง ' + streak + ' สัปดาห์';
  return 'เพิ่งเข้าเกณฑ์';
}

function _trackingMonthlySummaryFromPayload(payload) {
  var streak = Number(payload && payload.streakMonths || 0);
  var total = Number(payload && payload.totalMatchedMonths || 0);
  if (payload && payload.monthlyState) return String(payload.monthlyState);
  if (streak >= 3) return 'ต่อเนื่อง 3+ เดือน';
  if (streak >= 2) return 'ต่อเนื่อง ' + streak + ' เดือน';
  if (total > 1) return 'กลับมาเข้าเกณฑ์อีกครั้ง';
  return 'เพิ่งเข้าเกณฑ์เดือนนี้';
}

function _syncMonthlyCriteria(kind, session, batch, cutoffPeriod, now) {
  var sheet = _getOrCreateMonthlyCriteriaSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data.length ? data[0].map(_trackingHeaderKey) : TRACKING_MONTHLY_COLUMNS.slice();
  var map = {};
  headers.forEach(function(h, i) { if (h && map[h] === undefined) map[h] = i; });
  var existingByKey = {};
  var activeRows = [];
  var canDeactivateMonthly = String(session && session.role || '').toLowerCase() === 'director';
  var activeMonth = batch && batch.length ? _trackingMonthKeyFromPayload(batch[0], cutoffPeriod) : '';

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rec = _monthlyRecordFromRow(headers, row);
    if (String(rec.kind || '') !== kind) continue;
    var rowId = String(rec.key || '') + '|' + String(rec.monthKey || '');
    if (rowId !== '|') existingByKey[rowId] = { row: i + 1, rec: rec };
    if (canDeactivateMonthly && activeMonth && String(rec.monthKey || '') === activeMonth
        && String(rec.activeInCurrentMonth || '').toUpperCase() === 'TRUE') {
      activeRows.push(i + 1);
    }
  }

  var currentKeys = {};
  var writes = [];
  (batch || []).forEach(function(payload) {
    if (!payload || !payload.key || !payload.agentCode) return;
    var monthKey = _trackingMonthKeyFromPayload(payload, cutoffPeriod);
    var state = _trackingMonthlySummaryFromPayload(payload);
    currentKeys[payload.key + '|' + monthKey] = true;
    var rowObj = {
      kind: kind,
      agentCode: payload.agentCode,
      key: payload.key,
      monthKey: monthKey,
      baselineMonth: payload.baselineMonth || '',
      criteriaMetric: payload.criteriaMetric || 'Avg Rev/day',
      criteriaThreshold: payload.criteriaThreshold || '',
      matched: 'TRUE',
      level: payload.criteriaLevel || '',
      streakMonths: payload.streakMonths || '',
      totalMatchedMonths: payload.totalMatchedMonths || '',
      maxStreakMonths: payload.maxStreakMonths || '',
      firstMatchedMonth: payload.firstMatchedMonth || '',
      lastMatchedMonth: payload.lastMatchedMonth || monthKey,
      monthlyState: state,
      activeInCurrentMonth: 'TRUE',
      snapshot: payload.criteriaSnapshot || '',
      updatedBy: session.username,
      updatedAt: now
    };
    var rowData = TRACKING_MONTHLY_COLUMNS.map(function(col) { return rowObj[col] != null ? rowObj[col] : ''; });
    var existing = existingByKey[payload.key + '|' + monthKey];
    writes.push({ rowNo: existing ? existing.row : 0, row: rowData });
  });

  activeRows.forEach(function(rowNo) {
    var keyIdx = map.key;
    var monthIdx = map.monthKey;
    var activeIdx = map.activeInCurrentMonth;
    if (keyIdx < 0 || monthIdx < 0 || activeIdx < 0) return;
    var row = data[rowNo - 1];
    var rowKey = String(row[keyIdx] || '') + '|' + String(row[monthIdx] || '');
    if (!currentKeys[rowKey]) sheet.getRange(rowNo, activeIdx + 1).setValue('FALSE');
  });

  var appends = [];
  writes.forEach(function(item) {
    if (item.rowNo) sheet.getRange(item.rowNo, 1, 1, item.row.length).setValues([item.row]);
    else appends.push(item.row);
  });
  if (appends.length) sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, appends[0].length).setValues(appends);
}

function _syncWeeklyCriteria(kind, session, batch, cutoffPeriod, now) {
  var sheet = _getOrCreateWeeklyCriteriaSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data.length ? data[0].map(_trackingHeaderKey) : TRACKING_WEEKLY_COLUMNS.slice();
  var map = {};
  headers.forEach(function(h, i) { if (h && map[h] === undefined) map[h] = i; });
  var week = _trackingWeekMeta(new Date());
  var existingByKey = {};
  var historyByAgent = {};
  var activeRows = [];
  var canDeactivateWeekly = String(session && session.role || '').toLowerCase() === 'director';

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rec = _weeklyRecordFromRow(headers, row);
    var rowKind = String(rec.kind || '');
    var agentCode = String(rec.agentCode || '');
    var key = String(rec.key || '');
    if (rowKind !== kind || !agentCode || !key) continue;
    var wk = String(rec.weekKey || '');
    var rowId = key + '|' + wk;
    existingByKey[rowId] = { row: i + 1, data: row, rec: rec };
    if (!historyByAgent[agentCode]) historyByAgent[agentCode] = [];
    historyByAgent[agentCode].push(rec);
    if (canDeactivateWeekly && wk === week.weekKey && String(rec.activeInCurrentWeek || '').toUpperCase() === 'TRUE') activeRows.push(i + 1);
  }

  var summaries = {};
  var currentKeys = {};
  var writes = [];
  (batch || []).forEach(function(payload) {
    if (!payload || !payload.key || !payload.agentCode) return;
    var agentCode = String(payload.agentCode);
    var monthKey = _trackingMonthKeyFromPayload(payload, cutoffPeriod);
    var hist = historyByAgent[agentCode] || [];
    var priorMatched = {};
    hist.forEach(function(rec) {
      if (String(rec.matched || '').toUpperCase() === 'TRUE') priorMatched[String(rec.weekKey || '')] = rec;
    });
    var previous = null;
    hist.forEach(function(rec) {
      if (String(rec.weekKey || '') < week.weekKey && (!previous || String(rec.weekKey || '') > String(previous.weekKey || ''))) previous = rec;
    });
    var prevStreak = previous && String(previous.matched || '').toUpperCase() === 'TRUE' ? Number(previous.streakWeeks || 0) : 0;
    priorMatched[week.weekKey] = true;
    var total = Object.keys(priorMatched).length;
    var monthTotal = Object.keys(priorMatched).filter(function(wk) {
      var rec = wk === week.weekKey ? { monthKey: monthKey } : priorMatched[wk];
      return String(rec.monthKey || '') === String(monthKey || '');
    }).length;
    var streak = prevStreak + 1;
    var maxStreak = Math.max(streak, Number(previous && previous.maxStreakWeeks || 0), Number(previous && previous.streakWeeks || 0));
    var state = _trackingWeeklyState({ streakWeeks: streak });
    var summary = {
      weeklyState: state,
      streakWeeks: streak,
      totalMatchedWeeks: total,
      maxStreakWeeks: maxStreak,
      matchedWeeksInMonth: monthTotal,
      weekKey: week.weekKey,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      monthlyContext: monthKey ? monthKey + ': เข้าเกณฑ์ ' + monthTotal + ' สัปดาห์' : ''
    };
    summaries[payload.key] = summary;
    currentKeys[payload.key + '|' + week.weekKey] = true;

    var rowObj = {
      kind: kind,
      agentCode: agentCode,
      key: payload.key,
      monthKey: monthKey,
      weekKey: week.weekKey,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      criteriaMetric: payload.criteriaMetric || 'Avg Rev/day',
      criteriaThreshold: payload.criteriaThreshold || '',
      matched: 'TRUE',
      level: payload.criteriaLevel || '',
      streakWeeks: streak,
      totalMatchedWeeks: total,
      maxStreakWeeks: maxStreak,
      matchedWeeksInMonth: monthTotal,
      activeInCurrentWeek: 'TRUE',
      snapshot: payload.criteriaSnapshot || '',
      updatedBy: session.username,
      updatedAt: now
    };
    var row = TRACKING_WEEKLY_COLUMNS.map(function(col) { return rowObj[col] != null ? rowObj[col] : ''; });
    var existing = existingByKey[payload.key + '|' + week.weekKey];
    writes.push({ rowNo: existing ? existing.row : 0, row: row });
  });

  activeRows.forEach(function(rowNo) {
    var keyIdx = map.key;
    var wkIdx = map.weekKey;
    var activeIdx = map.activeInCurrentWeek;
    if (keyIdx < 0 || wkIdx < 0 || activeIdx < 0) return;
    var row = data[rowNo - 1];
    var rowKey = String(row[keyIdx] || '') + '|' + String(row[wkIdx] || '');
    if (!currentKeys[rowKey]) sheet.getRange(rowNo, activeIdx + 1).setValue('FALSE');
  });

  var appends = [];
  writes.forEach(function(item) {
    if (item.rowNo) sheet.getRange(item.rowNo, 1, 1, item.row.length).setValues([item.row]);
    else appends.push(item.row);
  });
  if (appends.length) sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, appends[0].length).setValues(appends);
  return summaries;
}

// ── แปลง key → label ภาษาไทย (ตรงกับ dropdown ทั้งใน Sheet และแดชบอร์ด) ──
function _statusLabel(key) {
  var map = {
    'wait'   : 'รอดำเนินการ',
    'contact': 'ติดต่อแล้ว รอตอบกลับ',
    'solving': 'กำลังแก้ปัญหา',
    'success': 'สำเร็จ (ดึงยอดกลับได้)',
    'fail'   : 'ไม่สำเร็จ (ย้ายค่าย)'
  };
  return map[key] || key || '';
}

function _reasonLabel(key) {
  var map = {
    'price'     : 'ราคาแพงไป',
    'slow'      : 'รถรับช้า',
    'damage'    : 'สินค้าเสียหาย',
    'service'   : 'บริการไม่ดี',
    'competitor': 'คู่แข่งดีกว่า',
    'closed'    : 'ร้านปิด/หยุดกิจการ',
    'other'     : 'สาเหตุอื่น'
  };
  return map[key] || key || '';
}

// ── Growth Status: normalize Sheet label → key ──
function _normalizeGrowthStatus(raw) {
  if (!raw) return '';
  var exact = { wait:1, contacted:1, data_collected:1, rewarded:1, upsold:1, unreachable:1 };
  var t = raw.trim().toLowerCase().replace(/[⏳📞📋🎁📦📵]/g,'').replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();
  if (exact[t]) return t;
  var map = {
    'รอดำเนินการ'                         : 'wait',
    'รอ'                                   : 'wait',
    'ติดต่อแล้ว / รอสัมภาษณ์'             : 'contacted',
    'ติดต่อแล้ว/รอสัมภาษณ์'               : 'contacted',
    'ติดต่อแล้ว'                           : 'contacted',
    'ติดต่อแล้ว รอสัมภาษณ์'               : 'contacted',
    'เก็บข้อมูลสำเร็จ / ถอดบทเรียนแล้ว'  : 'data_collected',
    'เก็บข้อมูลสำเร็จ/ถอดบทเรียนแล้ว'    : 'data_collected',
    'เก็บข้อมูลสำเร็จ'                     : 'data_collected',
    'ถอดบทเรียนแล้ว'                       : 'data_collected',
    'มอบรางวัล / เสนอสิทธิพิเศษแล้ว'     : 'rewarded',
    'มอบรางวัล/เสนอสิทธิพิเศษแล้ว'       : 'rewarded',
    'มอบรางวัลแล้ว'                        : 'rewarded',
    'เสนอสิทธิพิเศษแล้ว'                  : 'rewarded',
    'เสนอแพ็กเกจเพิ่มสำเร็จ'              : 'upsold',
    'upsold'                               : 'upsold',
    'cross-sold'                           : 'upsold',
    'ติดต่อไม่ได้ / ไม่สะดวกให้ข้อมูล'   : 'unreachable',
    'ติดต่อไม่ได้/ไม่สะดวกให้ข้อมูล'     : 'unreachable',
    'ติดต่อไม่ได้'                         : 'unreachable',
    'ไม่สะดวกให้ข้อมูล'                   : 'unreachable'
    };
  if (map[raw.trim()]) return map[raw.trim()];
  if (map[t]) return map[t];
  return raw.trim();
}

function _growthStatusLabel(key) {
  var map = {
    'wait'          : 'รอดำเนินการ',
    'contacted'     : 'ติดต่อแล้ว / รอสัมภาษณ์',
    'data_collected': 'เก็บข้อมูลสำเร็จ / ถอดบทเรียนแล้ว',
    'rewarded'      : 'มอบรางวัล / เสนอสิทธิพิเศษแล้ว',
    'upsold'        : 'เสนอแพ็กเกจเพิ่มสำเร็จ',
    'unreachable'   : 'ติดต่อไม่ได้ / ไม่สะดวกให้ข้อมูล'
  };
  return map[key] || key || '';
}

// ── Growth Reason: normalize Sheet label → key ──
function _normalizeGrowthReason(raw) {
  if (!raw) return '';
  var exact = { seasonal:1, festival:1, competitor_closed:1, vip_customer:1, ecommerce:1, switched:1, promotion:1, expanded:1, word_of_mouth:1, other_growth:1 };
  var t = raw.trim().toLowerCase().replace(/[🌾🎉🏢👑📱🔄📣🚛🗣️❓]/g,'').replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();
  if (exact[t]) return t;
  var map = {
    'ฤดูกาลสินค้าเกษตร / ผลไม้ตามฤดูกาล'          : 'seasonal',
    'ฤดูกาลสินค้าเกษตร/ผลไม้ตามฤดูกาล'              : 'seasonal',
    'ฤดูกาล'                                          : 'seasonal',
    'ผลไม้ตามฤดูกาล'                                  : 'seasonal',
    'เทศกาล / แคมเปญพิเศษในพื้นที่'                  : 'festival',
    'เทศกาล/แคมเปญพิเศษในพื้นที่'                    : 'festival',
    'เทศกาล'                                          : 'festival',
    'แคมเปญพิเศษ'                                     : 'festival',
    'คู่แข่งในพื้นที่ปิดตัว / มีปัญหา'               : 'competitor_closed',
    'คู่แข่งในพื้นที่ปิดตัว/มีปัญหา'                 : 'competitor_closed',
    'คู่แข่งปิดตัว'                                    : 'competitor_closed',
    'ได้ลูกค้ารายใหญ่ (vip/b2b) เพิ่ม'              : 'vip_customer',
    'ได้ลูกค้ารายใหญ่'                                : 'vip_customer',
    'vip'                                             : 'vip_customer',
    'b2b'                                             : 'vip_customer',
    'ลูกค้า e-commerce / ไลฟ์สดยอดพุ่ง'              : 'ecommerce',
    'ลูกค้า e-commerce/ไลฟ์สดยอดพุ่ง'                : 'ecommerce',
    'e-commerce'                                      : 'ecommerce',
    'ไลฟ์สด'                                          : 'ecommerce',
    'ลูกค้าย้ายค่ายมาจากคู่แข่ง'                     : 'switched',
    'ย้ายค่าย'                                        : 'switched',
    'ตัวแทนทำโปรโมชัน / การตลาดได้ดี'               : 'promotion',
    'ตัวแทนทำโปรโมชัน/การตลาดได้ดี'                  : 'promotion',
    'โปรโมชัน'                                        : 'promotion',
    'การตลาดในพื้นที่'                                : 'promotion',
    'ขยายขีดความสามารถ (รถ/พนักงาน/พื้นที่)'         : 'expanded',
    'ขยายขีดความสามารถ'                               : 'expanded',
    'เพิ่มรถ'                                         : 'expanded',
    'เพิ่มพนักงาน'                                    : 'expanded',
    'บริการดีเยี่ยม / word of mouth'                  : 'word_of_mouth',
    'บริการดีเยี่ยม/word of mouth'                    : 'word_of_mouth',
    'word of mouth'                                   : 'word_of_mouth',
    'บอกต่อ'                                          : 'word_of_mouth',
    'ปัจจัยอื่นๆ'                                     : 'other_growth',
    'อื่นๆ'                                           : 'other_growth',
    'อื่น'                                            : 'other_growth'
    };
  if (map[raw.trim()]) return map[raw.trim()];
  if (map[t]) return map[t];
  return raw.trim();
}

function _growthReasonLabel(key) {
  var map = {
    'seasonal'         : 'ฤดูกาลสินค้าเกษตร / ผลไม้ตามฤดูกาล',
    'festival'         : 'เทศกาล / แคมเปญพิเศษในพื้นที่',
    'competitor_closed': 'คู่แข่งในพื้นที่ปิดตัว / มีปัญหา',
    'vip_customer'     : 'ได้ลูกค้ารายใหญ่ (VIP/B2B) เพิ่ม',
    'ecommerce'        : 'ลูกค้า E-commerce / ไลฟ์สดยอดพุ่ง',
    'switched'         : 'ลูกค้าย้ายค่ายมาจากคู่แข่ง',
    'promotion'        : 'ตัวแทนทำโปรโมชัน / การตลาดได้ดี',
    'expanded'         : 'ขยายขีดความสามารถ (รถ/พนักงาน/พื้นที่)',
    'word_of_mouth'    : 'บริการดีเยี่ยม / Word of Mouth',
    'other_growth'     : 'ปัจจัยอื่นๆ'
  };
  return map[key] || key || '';
}

// saveTrackingRow(token, payload) — upsert แถวเดียว (auto-save ตอนเปลี่ยน status)
// payload: { key, status, reason, note, updatedBy, updatedAt }
function _trackingConflictResult(kind, payload, currentUpdatedAt) {
  return {
    ok: false,
    conflict: true,
    error: 'This row was updated by someone else. Please refresh before saving.',
    key: payload && payload.key,
    kind: kind,
    currentUpdatedAt: currentUpdatedAt || ''
  };
}

function _hasTrackingConflict(payload, currentUpdatedAt) {
  var known = String((payload && payload.lastKnownUpdatedAt) || (payload && payload.updatedAt) || '').trim();
  var current = String(currentUpdatedAt || '').trim();
  return !!(known && current && known !== current);
}

function _dedupeTrackingRows(rows) {
  var map = {};
  (rows || []).forEach(function(row) {
    var key = String(row && row.key || '').trim();
    if (!key) return;
    var prev = map[key];
    if (!prev || String(row.updatedAt || '') >= String(prev.updatedAt || '')) {
      map[key] = row;
    }
  });
  return Object.keys(map).map(function(key){ return map[key]; });
}

function _trackingFindLatestRow(data, kIdx, cpIdx, uaIdx, key, cutoffPeriod) {
  var target = -1;
  var targetUpdatedAt = '';
  var duplicates = [];
  var wantedKey = String(key || '').trim();
  for (var i = 1; i < data.length; i++) {
    var rowKey = String(data[i][kIdx] || '').trim();
    if (rowKey !== wantedKey) continue;
    var rowCutoff = cpIdx >= 0 ? _trackingNormalizeCutoffPeriod(data[i][cpIdx]) : cutoffPeriod;
    if (rowCutoff !== cutoffPeriod) continue;
    var rowNo = i + 1;
    var updatedAt = uaIdx >= 0 ? String(data[i][uaIdx] || '') : '';
    if (target < 0 || updatedAt >= targetUpdatedAt) {
      if (target > 0) duplicates.push(target);
      target = rowNo;
      targetUpdatedAt = updatedAt;
    } else {
      duplicates.push(rowNo);
    }
  }
  return { row: target, updatedAt: targetUpdatedAt, duplicates: duplicates };
}

function _trackingDeleteRowsDescending(sheet, rows) {
  (rows || []).sort(function(a, b) { return b - a; }).forEach(function(rowNo) {
    try { sheet.deleteRow(rowNo); } catch(e) {}
  });
}

function _trackingValueForColumn(kind, payload, col, now, cutoffPeriod, existingRow, headerMap) {
  var idx = headerMap[col];
  var existing = idx >= 0 && existingRow ? existingRow[idx] : '';
  var isGrowth = kind === 'growth';
  switch (col) {
    case 'agentCode': return payload.agentCode || existing || '';
    case 'agentName': return payload.agentName || existing || '';
    case '21.00': return payload.v21 || existing || '';
    case 'package': return payload.package || existing || '';
    case 'city': return payload.city || existing || '';
    case 'province': return payload.province || existing || '';
    case 'zoneName': return payload.zoneName || existing || '';
    case 'key': return payload.key || existing || '';
    case 'status': return isGrowth ? _growthStatusLabel(payload.status || '') : _statusLabel(payload.status || '');
    case 'reason': return _reasonLabel(payload.reason || '');
    case 'key_success': return _growthReasonLabel(payload.key_success || payload.reason || '');
    case 'note': return payload.note || '';
    case 'updatedBy': return payload.syncMode === 'queue' && existing ? existing : (payload.updatedBy || '');
    case 'updatedAt': return payload.syncMode === 'queue' && existing ? existing : (now || '');
    case 'cutoffPeriod': return _trackingNormalizeCutoffPeriod(cutoffPeriod) || '';
    case 'criteriaType': return payload.criteriaType || existing || (isGrowth ? 'growth' : 'risk');
    case 'criteriaMetric': return payload.criteriaMetric || existing || 'Avg Rev/day';
    case 'criteriaThreshold': return payload.criteriaThreshold != null ? payload.criteriaThreshold : existing || '';
    case 'criteriaSnapshot': return payload.criteriaSnapshot || existing || '';
    case 'criteriaVersion': return payload.criteriaVersion || existing || 'phase10-v1';
    case 'activeInCurrentCriteria': return payload.activeInCurrentCriteria != null ? payload.activeInCurrentCriteria : existing || 'TRUE';
    case 'firstMatchedAt': return existing || now || '';
    case 'lastMatchedAt': return now || '';
    case 'statusSource': return payload.statusSource || existing || '';
    case 'statusVersion': return payload.statusVersion || existing || '';
    case 'lastDashboardSyncAt': return payload.lastDashboardSyncAt || existing || '';
    case 'lastSheetEditAt': return payload.lastSheetEditAt || existing || '';
    case 'weeklyState': return payload.weeklyState || existing || '';
    case 'streakWeeks': return payload.streakWeeks != null ? payload.streakWeeks : existing || '';
    case 'totalMatchedWeeks': return payload.totalMatchedWeeks != null ? payload.totalMatchedWeeks : existing || '';
    case 'maxStreakWeeks': return payload.maxStreakWeeks != null ? payload.maxStreakWeeks : existing || '';
    case 'matchedWeeksInMonth': return payload.matchedWeeksInMonth != null ? payload.matchedWeeksInMonth : existing || '';
    case 'weekKey': return payload.weekKey || existing || '';
    case 'weekStart': return payload.weekStart || existing || '';
    case 'weekEnd': return payload.weekEnd || existing || '';
    case 'monthlyContext': return payload.monthlyContext || existing || '';
    case 'monthlyState': return payload.monthlyState || existing || '';
    case 'streakMonths': return payload.streakMonths != null ? payload.streakMonths : existing || '';
    case 'totalMatchedMonths': return payload.totalMatchedMonths != null ? payload.totalMatchedMonths : existing || '';
    case 'maxStreakMonths': return payload.maxStreakMonths != null ? payload.maxStreakMonths : existing || '';
    case 'firstMatchedMonth': return payload.firstMatchedMonth || existing || '';
    case 'lastMatchedMonth': return payload.lastMatchedMonth || existing || '';
    case 'matchedMonthsLabel': return payload.matchedMonthsLabel || existing || '';
    default: return existing || '';
  }
}

function _trackingBuildRow(kind, headers, payload, session, now, cutoffPeriod, existingRow) {
  var headerMap = {};
  headers.forEach(function(h, i) { headerMap[h] = i; });
  var safePayload = Object.assign({}, payload || {}, { updatedBy: session.username });
  return headers.map(function(col) {
    return _trackingValueForColumn(kind, safePayload, col, now, cutoffPeriod, existingRow, headerMap);
  });
}

function _trackingBaseObjectFromSheetRow(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i]; });
  return {
    zoneName: String(obj.zoneName || ''),
    agentCode: String(obj.agentCode || ''),
    key: String(obj.key || '')
  };
}

function saveTrackingRow(token, payload) {
  var session = _requireSession(token || '', 'SAVE_TRACKING_ROW');
  if (!session.ok) return session;
  if (!payload || !payload.key) return { ok: false, error: 'ไม่มี key' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet   = _getOrCreateTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(_trackingHeaderKey);
    var kIdx    = headers.indexOf('key');
    var cpIdx   = headers.indexOf('cutoffPeriod');
    var znIdx   = headers.indexOf('zoneName');
    var ubIdx   = headers.indexOf('updatedBy');
    var uaIdx   = headers.indexOf('updatedAt');
    var cutoffPeriod = _trackingCutoffPeriodKey();

    var found = _trackingFindLatestRow(data, kIdx, cpIdx, uaIdx, payload.key, cutoffPeriod);
    var targetRow = found.row;

    var existingZone = targetRow > 0 && znIdx >= 0 ? String(data[targetRow - 1][znIdx] || '') : '';
    var accessCheck = _requireRowAccess(session, { zoneName: existingZone || payload.zoneName || '' }, 'SAVE_TRACKING_ROW');
    if (!accessCheck.ok) return accessCheck;
    var currentUpdatedAt = targetRow > 0 ? found.updatedAt : '';
    var currentUpdatedBy = targetRow > 0 && ubIdx >= 0 ? String(data[targetRow - 1][ubIdx] || '') : '';
    if (_hasTrackingConflict(payload, currentUpdatedAt) && currentUpdatedBy !== session.username) {
      logActivity(session.username, session.role, 'TRACKING_CONFLICT', 'key=' + payload.key + ' current=' + currentUpdatedAt + ' known=' + (payload.lastKnownUpdatedAt || payload.updatedAt || ''));
      return _trackingConflictResult('risk', payload, currentUpdatedAt);
    }

    var now = _bkkTimestamp();
    var existingRow = targetRow > 0 ? data[targetRow - 1] : null;
    var writePayload = Object.assign({}, payload, {
      statusSource: 'DASHBOARD',
      statusVersion: _trackingNextVersion(headers, existingRow),
      lastDashboardSyncAt: now
    });
    var rowData = _trackingBuildRow('risk', headers, writePayload, session, now, cutoffPeriod, existingRow);
    var historyEntries = _trackingBuildHistoryEntries('risk', payload.key, cutoffPeriod, headers, existingRow, rowData, session, 'DASHBOARD', now);

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      _trackingDeleteRowsDescending(sheet, found.duplicates);
    } else {
      sheet.appendRow(rowData);
    }
    _trackingAppendHistory(historyEntries);

    logActivity(session.username, session.role, 'TRACKING_SAVE',
      'บันทึกติดตาม: ' + payload.key + ' → ' + (payload.status || '(ว่าง)'));
    return { ok: true, updatedAt: now };
  } catch(e) {
    return { ok: false, error: e.message };
  } finally {
    try { lock.releaseLock(); } catch(e2) {}
  }
}
// saveTrackingBatch(token, batch) — upsert หลายแถวพร้อมกัน (กด "💾 บันทึกทั้งหมด")
// batch: [{ key, status, reason, note }, ...]
function saveTrackingBatch(token, batch) {
  var session = _requireSession(token || '', 'SAVE_TRACKING_BATCH');
  if (!session.ok) return session;
  if (!batch || !batch.length) return { ok: false, error: 'ไม่มีข้อมูล' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet   = _getOrCreateTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(_trackingHeaderKey);
    var kIdx    = headers.indexOf('key');
    var cpIdx   = headers.indexOf('cutoffPeriod');
    var znIdx   = headers.indexOf('zoneName');
    var ubIdx   = headers.indexOf('updatedBy');
    var uaIdx   = headers.indexOf('updatedAt');
    var cutoffPeriod = _trackingCutoffPeriodKey();
    var now     = _bkkTimestamp();

    var existingMap = {};
    var duplicateRows = [];
    for (var i = 1; i < data.length; i++) {
      var k = String(data[i][kIdx] || '').trim();
      var cp = cpIdx >= 0 ? _trackingNormalizeCutoffPeriod(data[i][cpIdx]) : '';
      if (k && cp === cutoffPeriod) {
        var old = existingMap[k];
        var updatedAt = uaIdx >= 0 ? String(data[i][uaIdx] || '') : '';
        if (old && String(old.updatedAt || '') > updatedAt) {
          duplicateRows.push(i + 1);
          continue;
        }
        if (old && old.row) duplicateRows.push(old.row);
        existingMap[k] = {
          row: i + 1,
          zoneName: znIdx >= 0 ? String(data[i][znIdx] || '') : '',
          updatedAt: updatedAt,
          updatedBy: ubIdx >= 0 ? String(data[i][ubIdx] || '') : ''
        };
      }
    }

    var writable = [];
    var conflicts = [];
    batch.forEach(function(payload) {
      if (!payload.key) return;
      var existing = existingMap[payload.key];
      if (!_canAccessRow(session, { zoneName: (existing && existing.zoneName) || payload.zoneName || '' })) {
        _auditDenied(session, 'SAVE_TRACKING_BATCH', 'key=' + payload.key + ' zone=' + ((existing && existing.zoneName) || payload.zoneName || '-'));
        return;
      }
      if (existing && _hasTrackingConflict(payload, existing.updatedAt) && existing.updatedBy !== session.username) {
        logActivity(session.username, session.role, 'TRACKING_BATCH_CONFLICT', 'key=' + payload.key + ' current=' + existing.updatedAt + ' known=' + (payload.lastKnownUpdatedAt || payload.updatedAt || ''));
        conflicts.push(_trackingConflictResult('risk', payload, existing.updatedAt));
        return;
      }
      writable.push({ payload: payload, existing: existing });
    });

    if (conflicts.length) return { ok: false, conflict: true, conflicts: conflicts, error: 'Some rows were updated by someone else. Please refresh before saving.' };

    var toAppend = [];
    var savedCount = 0;
    var historyEntries = [];
    writable.forEach(function(item) {
      var existingRow = item.existing ? data[item.existing.row - 1] : null;
      var writePayload = Object.assign({}, item.payload, {
        statusSource: 'DASHBOARD',
        statusVersion: _trackingNextVersion(headers, existingRow),
        lastDashboardSyncAt: now
      });
      var rowData = _trackingBuildRow('risk', headers, writePayload, session, now, cutoffPeriod, existingRow);
      var rowHistory = _trackingBuildHistoryEntries('risk', item.payload.key, cutoffPeriod, headers, existingRow, rowData, session, 'DASHBOARD', now);
      Array.prototype.push.apply(historyEntries, rowHistory);
      if (item.existing) sheet.getRange(item.existing.row, 1, 1, rowData.length).setValues([rowData]);
      else toAppend.push(rowData);
      savedCount++;
    });

    _trackingDeleteRowsDescending(sheet, duplicateRows);
    if (toAppend.length) sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, toAppend[0].length).setValues(toAppend);
    _trackingAppendHistory(historyEntries);

    logActivity(session.username, session.role, 'TRACKING_BATCH_SAVE', 'บันทึกติดตาม batch ' + savedCount + ' รายการ');
    return { ok: true, saved: savedCount };
  } catch(e) {
    return { ok: false, error: e.message };
  } finally {
    try { lock.releaseLock(); } catch(e2) {}
  }
}
// helper: timestamp สำหรับ Bangkok timezone
function _bkkTimestamp() {
  var now    = new Date();
  return Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
}

// ============================================================
//  GROWTH TRACKING — Sheet: "TrackingGrowth"
//  แยกจาก Sheet "Tracking" (กลุ่มเสี่ยง) อย่างสมบูรณ์
// ============================================================

var TRACKING_GROWTH_SHEET = 'TrackingGrowth';

// สร้างหรือดึง Sheet 'TrackingGrowth' พร้อม headers (format เดียวกับ Tracking)
function _getOrCreateGrowthTrackingSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TRACKING_GROWTH_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(TRACKING_GROWTH_SHEET);
    var headers = ['agentCode','agentName','21.00','package','city','province','zoneName',
                   'key','status','key_success','note','updatedBy','updatedAt','cutoffPeriod']
                   .concat(TRACKING_CRITERIA_COLUMNS)
                   .concat(TRACKING_STATUS_META_COLUMNS)
                   .concat(TRACKING_WEEKLY_META_COLUMNS)
                   .concat(TRACKING_MONTHLY_META_COLUMNS);
    sheet.appendRow(headers.map(_trackingHeaderLabel));
    var hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setBackground('#085041');   // สีเขียวเข้ม — แยกจาก Tracking (navy)
    hRange.setFontColor('white');
    hRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1,  100);
    sheet.setColumnWidth(2,  200);
    sheet.setColumnWidth(3,   80);
    sheet.setColumnWidth(4,  130);
    sheet.setColumnWidth(5,  110);
    sheet.setColumnWidth(6,  120);
    sheet.setColumnWidth(7,  140);
    sheet.setColumnWidth(8,  200);
    sheet.setColumnWidth(9,  200);  // status (wider for growth labels)
    sheet.setColumnWidth(10, 260);  // key_success
    sheet.setColumnWidth(11, 260);  // note
    sheet.setColumnWidth(12, 110);
    sheet.setColumnWidth(13, 160);
    sheet.setColumnWidth(18, 320);
    _setDropdown(sheet, 9,  GROWTH_STATUS_OPTIONS);
    _setDropdown(sheet, 10, GROWTH_REASON_OPTIONS);
  } else {
    var hRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var hStr = hRow.map(_trackingHeaderKey);
    var newCols = ['21.00','agentCode','package','agentName','city','province','zoneName','cutoffPeriod']
      .concat(TRACKING_CRITERIA_COLUMNS)
      .concat(TRACKING_STATUS_META_COLUMNS)
      .concat(TRACKING_WEEKLY_META_COLUMNS)
      .concat(TRACKING_MONTHLY_META_COLUMNS);
    newCols.forEach(function(col) {
      if (hStr.indexOf(col) < 0) {
        var nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue(_trackingHeaderLabel(col))
          .setBackground('#085041').setFontColor('white').setFontWeight('bold');
        var widths = _trackingColumnWidthMap();
        sheet.setColumnWidth(nextCol, widths[col] || (col === 'agentName' ? 200 : col === '21.00' ? 80 : 120));
        hStr.push(col);
      }
    });
    // migrate old 'reason' header → 'key_success'
    var oldRIdx = hStr.indexOf('reason');
    if (oldRIdx >= 0) {
      sheet.getRange(1, oldRIdx + 1).setValue('key_success');
      hStr[oldRIdx] = 'key_success';
    }
    var sIdx = hStr.indexOf('status');
    var ksIdx = hStr.indexOf('key_success');
    if (sIdx  >= 0) _setDropdown(sheet, sIdx  + 1, GROWTH_STATUS_OPTIONS);
    if (ksIdx >= 0) _setDropdown(sheet, ksIdx + 1, GROWTH_REASON_OPTIONS);
  }
  _ensureTrackingCutoffColumn(sheet, '#085041');
  _ensureTrackingColumns(sheet, TRACKING_CRITERIA_COLUMNS.concat(TRACKING_STATUS_META_COLUMNS).concat(TRACKING_WEEKLY_META_COLUMNS).concat(TRACKING_MONTHLY_META_COLUMNS), '#085041', _trackingColumnWidthMap());
  _trackingFormatTextColumns(sheet, ['cutoffPeriod']);
  _logTrackingCutoff('growth');
  return sheet;
}

// getGrowthTrackingData(token) — โหลดข้อมูลทั้งหมดจาก TrackingGrowth sheet
function getGrowthTrackingData(token) {
  var session = _requireSession(token || '', 'GET_GROWTH_TRACKING_DATA');
  if (!session.ok) return session;

  try {
    var sheet = _getOrCreateGrowthTrackingSheet();
    var data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, data: [], cutoff: _trackingCutoffMeta() };

    var headers = data[0].map(_trackingHeaderKey);
    var kIdx   = headers.indexOf('key');
    var sIdx   = headers.indexOf('status');
    var rIdx   = headers.indexOf('key_success') >= 0 ? headers.indexOf('key_success') : headers.indexOf('reason');
    var nIdx   = headers.indexOf('note');
    var ubIdx  = headers.indexOf('updatedBy');
    var uaIdx  = headers.indexOf('updatedAt');
    var v21Idx = headers.indexOf('21.00');
    var acIdx  = headers.indexOf('agentCode');
    var pkIdx  = headers.indexOf('package');
    var anIdx  = headers.indexOf('agentName');
    var ctIdx  = headers.indexOf('city');
    var pvIdx  = headers.indexOf('province');
    var znIdx  = headers.indexOf('zoneName');
    var cpIdx  = headers.indexOf('cutoffPeriod');
    var cTypeIdx = headers.indexOf('criteriaType');
    var cMetricIdx = headers.indexOf('criteriaMetric');
    var cThresholdIdx = headers.indexOf('criteriaThreshold');
    var cSnapshotIdx = headers.indexOf('criteriaSnapshot');
    var cVersionIdx = headers.indexOf('criteriaVersion');
    var cActiveIdx = headers.indexOf('activeInCurrentCriteria');
    var cFirstIdx = headers.indexOf('firstMatchedAt');
    var cLastIdx = headers.indexOf('lastMatchedAt');
    var srcIdx = headers.indexOf('statusSource');
    var verIdx = headers.indexOf('statusVersion');
    var dashSyncIdx = headers.indexOf('lastDashboardSyncAt');
    var sheetEditIdx = headers.indexOf('lastSheetEditAt');
    var weeklyIdx = {};
    TRACKING_WEEKLY_META_COLUMNS.forEach(function(col){ weeklyIdx[col] = headers.indexOf(col); });
    var monthlyIdx = {};
    TRACKING_MONTHLY_META_COLUMNS.forEach(function(col){ monthlyIdx[col] = headers.indexOf(col); });
    var curCutoff = _trackingCutoffPeriodKey();

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var key = String(r[kIdx] || '').trim();
      if (!key) continue;
      var cutoffPeriod = cpIdx >= 0 ? _trackingNormalizeCutoffPeriod(r[cpIdx]) : '';
      if (cutoffPeriod !== curCutoff) continue;
      var rowObj = {
        key:         key,
        status:      sIdx  >= 0 ? _normalizeGrowthStatus(String(r[sIdx]  || '')) : '',
        key_success: rIdx  >= 0 ? _normalizeGrowthReason(String(r[rIdx]  || '')) : '',
        note:        nIdx  >= 0 ? String(r[nIdx]  || '') : '',
        updatedBy:   ubIdx >= 0 ? String(r[ubIdx] || '') : '',
        updatedAt:   uaIdx >= 0 ? String(r[uaIdx] || '') : '',
        v21:         v21Idx >= 0 ? String(r[v21Idx] || '') : '',
        agentCode:   acIdx  >= 0 ? String(r[acIdx]  || '') : '',
        package:     pkIdx  >= 0 ? String(r[pkIdx]  || '') : '',
        agentName:   anIdx  >= 0 ? String(r[anIdx]  || '') : '',
        city:        ctIdx  >= 0 ? String(r[ctIdx]  || '') : '',
        province:    pvIdx  >= 0 ? String(r[pvIdx]  || '') : '',
        zoneName:    znIdx  >= 0 ? String(r[znIdx]  || '') : '',
        cutoffPeriod: cutoffPeriod,
        criteriaType: cTypeIdx >= 0 ? String(r[cTypeIdx] || '') : '',
        criteriaMetric: cMetricIdx >= 0 ? String(r[cMetricIdx] || '') : '',
        criteriaThreshold: cThresholdIdx >= 0 ? String(r[cThresholdIdx] || '') : '',
        criteriaSnapshot: cSnapshotIdx >= 0 ? String(r[cSnapshotIdx] || '') : '',
        criteriaVersion: cVersionIdx >= 0 ? String(r[cVersionIdx] || '') : '',
        activeInCurrentCriteria: cActiveIdx >= 0 ? String(r[cActiveIdx] || '') : '',
        firstMatchedAt: cFirstIdx >= 0 ? String(r[cFirstIdx] || '') : '',
        lastMatchedAt: cLastIdx >= 0 ? String(r[cLastIdx] || '') : '',
        statusSource: srcIdx >= 0 ? String(r[srcIdx] || '') : '',
        statusVersion: verIdx >= 0 ? String(r[verIdx] || '') : '',
        lastDashboardSyncAt: dashSyncIdx >= 0 ? String(r[dashSyncIdx] || '') : '',
        lastSheetEditAt: sheetEditIdx >= 0 ? String(r[sheetEditIdx] || '') : ''
      };
      TRACKING_WEEKLY_META_COLUMNS.forEach(function(col) {
        rowObj[col] = weeklyIdx[col] >= 0 ? String(r[weeklyIdx[col]] || '') : '';
      });
      TRACKING_MONTHLY_META_COLUMNS.forEach(function(col) {
        rowObj[col] = monthlyIdx[col] >= 0 ? String(r[monthlyIdx[col]] || '') : '';
      });
      if (_canAccessRow(session, rowObj)) rows.push(rowObj);
    }
    rows = _dedupeTrackingRows(rows);
    logActivity(session.username, session.role, 'VIEW_GROWTH_TRACKING_DATA', 'growth rows=' + rows.length + ' cutoff=' + curCutoff);
    return { ok: true, data: rows, cutoff: _trackingCutoffMeta(), syncVersion: 'phase10' };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// saveGrowthTrackingRow(token, payload) — upsert แถวเดียว (auto-save)
function saveGrowthTrackingRow(token, payload) {
  var session = _requireSession(token || '', 'SAVE_GROWTH_TRACKING_ROW');
  if (!session.ok) return session;
  if (!payload || !payload.key) return { ok: false, error: 'ไม่มี key' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet   = _getOrCreateGrowthTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(_trackingHeaderKey);
    var kIdx    = headers.indexOf('key');
    var cpIdx   = headers.indexOf('cutoffPeriod');
    var znIdx   = headers.indexOf('zoneName');
    var ubIdx   = headers.indexOf('updatedBy');
    var uaIdx   = headers.indexOf('updatedAt');
    var cutoffPeriod = _trackingCutoffPeriodKey();

    var found = _trackingFindLatestRow(data, kIdx, cpIdx, uaIdx, payload.key, cutoffPeriod);
    var targetRow = found.row;

    var existingZone = targetRow > 0 && znIdx >= 0 ? String(data[targetRow - 1][znIdx] || '') : '';
    var accessCheck = _requireRowAccess(session, { zoneName: existingZone || payload.zoneName || '' }, 'SAVE_GROWTH_TRACKING_ROW');
    if (!accessCheck.ok) return accessCheck;
    var currentUpdatedAt = targetRow > 0 ? found.updatedAt : '';
    var currentUpdatedBy = targetRow > 0 && ubIdx >= 0 ? String(data[targetRow - 1][ubIdx] || '') : '';
    if (_hasTrackingConflict(payload, currentUpdatedAt) && currentUpdatedBy !== session.username) {
      logActivity(session.username, session.role, 'GROWTH_TRACKING_CONFLICT', 'key=' + payload.key + ' current=' + currentUpdatedAt + ' known=' + (payload.lastKnownUpdatedAt || payload.updatedAt || ''));
      return _trackingConflictResult('growth', payload, currentUpdatedAt);
    }

    var now = _bkkTimestamp();
    var existingRow = targetRow > 0 ? data[targetRow - 1] : null;
    var writePayload = Object.assign({}, payload, {
      statusSource: 'DASHBOARD',
      statusVersion: _trackingNextVersion(headers, existingRow),
      lastDashboardSyncAt: now
    });
    var rowData = _trackingBuildRow('growth', headers, writePayload, session, now, cutoffPeriod, existingRow);
    var historyEntries = _trackingBuildHistoryEntries('growth', payload.key, cutoffPeriod, headers, existingRow, rowData, session, 'DASHBOARD', now);

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      _trackingDeleteRowsDescending(sheet, found.duplicates);
    } else {
      sheet.appendRow(rowData);
    }
    _trackingAppendHistory(historyEntries);

    logActivity(session.username, session.role, 'GROWTH_TRACKING_SAVE',
      'บันทึกติดตาม(เติบโต): ' + payload.key + ' → ' + (payload.status || '(ว่าง)'));
    return { ok: true, updatedAt: now };
  } catch(e) {
    return { ok: false, error: e.message };
  } finally {
    try { lock.releaseLock(); } catch(e2) {}
  }
}
// saveGrowthTrackingBatch(token, batch) — upsert หลายแถวพร้อมกัน
function saveGrowthTrackingBatch(token, batch) {
  var session = _requireSession(token || '', 'SAVE_GROWTH_TRACKING_BATCH');
  if (!session.ok) return session;
  if (!batch || !batch.length) return { ok: false, error: 'ไม่มีข้อมูล' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet   = _getOrCreateGrowthTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(_trackingHeaderKey);
    var kIdx    = headers.indexOf('key');
    var cpIdx   = headers.indexOf('cutoffPeriod');
    var znIdx   = headers.indexOf('zoneName');
    var ubIdx   = headers.indexOf('updatedBy');
    var uaIdx   = headers.indexOf('updatedAt');
    var cutoffPeriod = _trackingCutoffPeriodKey();
    var now     = _bkkTimestamp();

    var existingMap = {};
    var duplicateRows = [];
    for (var i = 1; i < data.length; i++) {
      var k = String(data[i][kIdx] || '').trim();
      var cp = cpIdx >= 0 ? _trackingNormalizeCutoffPeriod(data[i][cpIdx]) : '';
      if (k && cp === cutoffPeriod) {
        var old = existingMap[k];
        var updatedAt = uaIdx >= 0 ? String(data[i][uaIdx] || '') : '';
        if (old && String(old.updatedAt || '') > updatedAt) {
          duplicateRows.push(i + 1);
          continue;
        }
        if (old && old.row) duplicateRows.push(old.row);
        existingMap[k] = {
          row: i + 1,
          zoneName: znIdx >= 0 ? String(data[i][znIdx] || '') : '',
          updatedAt: updatedAt,
          updatedBy: ubIdx >= 0 ? String(data[i][ubIdx] || '') : ''
        };
      }
    }

    var writable = [];
    var conflicts = [];
    batch.forEach(function(payload) {
      if (!payload.key) return;
      var existing = existingMap[payload.key];
      if (!_canAccessRow(session, { zoneName: (existing && existing.zoneName) || payload.zoneName || '' })) {
        _auditDenied(session, 'SAVE_GROWTH_TRACKING_BATCH', 'key=' + payload.key + ' zone=' + ((existing && existing.zoneName) || payload.zoneName || '-'));
        return;
      }
      if (existing && _hasTrackingConflict(payload, existing.updatedAt) && existing.updatedBy !== session.username) {
        logActivity(session.username, session.role, 'GROWTH_TRACKING_BATCH_CONFLICT', 'key=' + payload.key + ' current=' + existing.updatedAt + ' known=' + (payload.lastKnownUpdatedAt || payload.updatedAt || ''));
        conflicts.push(_trackingConflictResult('growth', payload, existing.updatedAt));
        return;
      }
      writable.push({ payload: payload, existing: existing });
    });

    if (conflicts.length) return { ok: false, conflict: true, conflicts: conflicts, error: 'Some rows were updated by someone else. Please refresh before saving.' };

    var toAppend = [];
    var savedCount = 0;
    var historyEntries = [];
    writable.forEach(function(item) {
      var existingRow = item.existing ? data[item.existing.row - 1] : null;
      var writePayload = Object.assign({}, item.payload, {
        statusSource: 'DASHBOARD',
        statusVersion: _trackingNextVersion(headers, existingRow),
        lastDashboardSyncAt: now
      });
      var rowData = _trackingBuildRow('growth', headers, writePayload, session, now, cutoffPeriod, existingRow);
      var rowHistory = _trackingBuildHistoryEntries('growth', item.payload.key, cutoffPeriod, headers, existingRow, rowData, session, 'DASHBOARD', now);
      Array.prototype.push.apply(historyEntries, rowHistory);
      if (item.existing) sheet.getRange(item.existing.row, 1, 1, rowData.length).setValues([rowData]);
      else toAppend.push(rowData);
      savedCount++;
    });

    _trackingDeleteRowsDescending(sheet, duplicateRows);
    if (toAppend.length) sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, toAppend[0].length).setValues(toAppend);
    _trackingAppendHistory(historyEntries);

    logActivity(session.username, session.role, 'GROWTH_TRACKING_BATCH_SAVE', 'บันทึกติดตาม(เติบโต) batch ' + savedCount + ' รายการ');
    return { ok: true, saved: savedCount };
  } catch(e) {
    return { ok: false, error: e.message };
  } finally {
    try { lock.releaseLock(); } catch(e2) {}
  }
}
function _syncTrackingQueueForSheet(kind, token, batch) {
  var action = kind === 'growth' ? 'SYNC_GROWTH_TRACKING_QUEUE' : 'SYNC_TRACKING_QUEUE';
  var session = _requireSession(token || '', action);
  if (!session.ok) return session;
  batch = batch || [];

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var isGrowth = kind === 'growth';
    var sheet = isGrowth ? _getOrCreateGrowthTrackingSheet() : _getOrCreateTrackingSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(_trackingHeaderKey);
    var meta = _trackingHeaderMap(sheet);
    headers = meta.headers;
    var map = meta.map;
    var kIdx = map.key;
    var cpIdx = map.cutoffPeriod;
    var uaIdx = map.updatedAt;
    var activeIdx = map.activeInCurrentCriteria;
    var cutoffPeriod = _trackingCutoffPeriodKey();
    var now = _bkkTimestamp();
    var existingMap = {};
    var duplicateRows = [];
    var deactivated = 0;
    var weeklySummaries = _syncWeeklyCriteria(kind, session, batch, cutoffPeriod, now);
    _syncMonthlyCriteria(kind, session, batch, cutoffPeriod, now);

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var key = kIdx >= 0 ? String(row[kIdx] || '').trim() : '';
      var cp = cpIdx >= 0 ? _trackingNormalizeCutoffPeriod(row[cpIdx]) : '';
      if (!key || cp !== cutoffPeriod) continue;
      if (!_canAccessRow(session, _trackingBaseObjectFromSheetRow(headers, row))) continue;
      if (activeIdx >= 0 && String(row[activeIdx] || '').toUpperCase() !== 'FALSE') {
        sheet.getRange(i + 1, activeIdx + 1).setValue('FALSE');
        deactivated++;
      }
      var old = existingMap[key];
      var updatedAt = uaIdx >= 0 ? String(row[uaIdx] || '') : '';
      if (old && String(old.updatedAt || '') > updatedAt) {
        duplicateRows.push(i + 1);
        continue;
      }
      if (old && old.row) duplicateRows.push(old.row);
      existingMap[key] = { row: i + 1, updatedAt: updatedAt, data: row };
    }

    var toAppend = [];
    var synced = 0;
    batch.forEach(function(payload) {
      if (!payload || !payload.key) return;
      if (!_canAccessRow(session, { zoneName: payload.zoneName || '' })) {
        _auditDenied(session, action, 'key=' + payload.key + ' zone=' + (payload.zoneName || '-'));
        return;
      }
      var existing = existingMap[payload.key];
      var weekly = weeklySummaries[payload.key] || {};
      var enriched = Object.assign({}, payload, {
        status: existing && map.status >= 0 ? _normalizeStatus(String(existing.data[map.status] || '')) : '',
        reason: !isGrowth && existing && map.reason >= 0 ? _normalizeReason(String(existing.data[map.reason] || '')) : (payload.reason || ''),
        key_success: isGrowth && existing && map.key_success >= 0 ? _normalizeGrowthReason(String(existing.data[map.key_success] || '')) : (payload.key_success || payload.reason || ''),
        note: existing && map.note >= 0 ? String(existing.data[map.note] || '') : (payload.note || ''),
        activeInCurrentCriteria: 'TRUE',
        syncMode: 'queue',
        statusSource: existing ? '' : 'SYNC',
        statusVersion: existing ? '' : '0',
        lastDashboardSyncAt: now
      }, weekly);
      if (isGrowth) {
        enriched.status = existing && map.status >= 0 ? _normalizeGrowthStatus(String(existing.data[map.status] || '')) : '';
      }
      var rowData = _trackingBuildRow(kind, headers, enriched, session, now, cutoffPeriod, existing ? existing.data : null);
      if (existing) {
        sheet.getRange(existing.row, 1, 1, rowData.length).setValues([rowData]);
      } else {
        toAppend.push(rowData);
      }
      synced++;
    });

    _trackingDeleteRowsDescending(sheet, duplicateRows);
    if (toAppend.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, toAppend[0].length).setValues(toAppend);
    }
    logActivity(session.username, session.role, action, 'synced=' + synced + ' appended=' + toAppend.length + ' inactive=' + deactivated + ' cutoff=' + cutoffPeriod);
    return { ok: true, synced: synced, appended: toAppend.length, inactive: deactivated, cutoff: _trackingCutoffMeta() };
  } catch(e) {
    return { ok: false, error: e.message };
  } finally {
    try { lock.releaseLock(); } catch(e2) {}
  }
}

function syncTrackingQueue(token, batch) {
  return _syncTrackingQueueForSheet('risk', token, batch);
}

function syncGrowthTrackingQueue(token, batch) {
  return _syncTrackingQueueForSheet('growth', token, batch);
}

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    if (sheetName !== TRACKING_SHEET && sheetName !== TRACKING_GROWTH_SHEET) return;
    if (e.range.getRow() <= 1) return;

    var kind = sheetName === TRACKING_GROWTH_SHEET ? 'growth' : 'risk';
    sheet = kind === 'growth' ? _getOrCreateGrowthTrackingSheet() : _getOrCreateTrackingSheet();
    var meta = _trackingHeaderMap(sheet);
    var headers = meta.headers;
    var map = meta.map;
    var tracked = _trackingTrackedFields(kind);
    var startCol = e.range.getColumn();
    var numCols = e.range.getNumColumns();
    var changedFields = [];
    for (var c = 0; c < numCols; c++) {
      var header = headers[startCol + c - 1];
      if (tracked.indexOf(header) >= 0) changedFields.push({ field: header, col: startCol + c });
    }
    if (!changedFields.length) return;

    var actor = 'Sheet';
    try {
      actor = Session.getActiveUser().getEmail() || 'Sheet';
    } catch(e2) {}
    var now = _bkkTimestamp();
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var rowStart = e.range.getRow();
      var rowCount = e.range.getNumRows();
      var historyEntries = [];
      for (var r = 0; r < rowCount; r++) {
        var rowNo = rowStart + r;
        var current = sheet.getRange(rowNo, 1, 1, headers.length).getValues()[0];
        var oldRow = current.slice();
        changedFields.forEach(function(changed) {
          var idx = changed.col - 1;
          var rawNew = current[idx];
          if (rowCount === 1 && numCols === 1 && e.oldValue !== undefined) oldRow[idx] = e.oldValue;
          var display = _trackingDisplayFieldValue(kind, changed.field, rawNew);
          current[idx] = display;
        });
        if (map.updatedBy >= 0) current[map.updatedBy] = actor;
        if (map.updatedAt >= 0) current[map.updatedAt] = now;
        if (map.statusSource >= 0) current[map.statusSource] = 'SHEET';
        if (map.statusVersion >= 0) current[map.statusVersion] = _trackingNextVersion(headers, oldRow);
        if (map.lastSheetEditAt >= 0) current[map.lastSheetEditAt] = now;
        sheet.getRange(rowNo, 1, 1, headers.length).setValues([current]);

        var key = map.key >= 0 ? String(current[map.key] || '') : '';
        var cutoffPeriod = map.cutoffPeriod >= 0 ? _trackingNormalizeCutoffPeriod(current[map.cutoffPeriod]) : _trackingCutoffPeriodKey();
        Array.prototype.push.apply(historyEntries, _trackingBuildHistoryEntries(kind, key, cutoffPeriod, headers, oldRow, current, {
          ok: true,
          username: actor,
          role: 'Sheet'
        }, 'SHEET', now));
      }
      _trackingAppendHistory(historyEntries);
      logActivity(actor, 'Sheet', kind === 'growth' ? 'SHEET_EDIT_GROWTH_TRACKING' : 'SHEET_EDIT_TRACKING', 'rows=' + rowCount + ' fields=' + changedFields.map(function(x){ return x.field; }).join(','));
    } finally {
      try { lock.releaseLock(); } catch(e3) {}
    }
  } catch(err) {
    try { logActivity('Sheet', '-', 'TRACKING_ONEDIT_ERROR', err.message || String(err)); } catch(e4) {}
  }
}
