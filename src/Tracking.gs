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
                   'key','status','reason','note','updatedBy','updatedAt'];
    sheet.appendRow(headers);
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
    // ── ใส่ dropdown ──
    _setDropdown(sheet, 9,  STATUS_OPTIONS);
    _setDropdown(sheet, 10, REASON_OPTIONS);
  } else {
    // ตรวจว่า sheet เก่ายังไม่มี columns ใหม่ → เพิ่มให้อัตโนมัติ
    var hRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var hStr = hRow.map(function(h){ return String(h).trim(); });
    var newCols = ['21.00','agentCode','package','agentName','city','province','zoneName'];
    newCols.forEach(function(col) {
      if (hStr.indexOf(col) < 0) {
        var nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue(col)
          .setBackground('#003F5C').setFontColor('white').setFontWeight('bold');
        sheet.setColumnWidth(nextCol, col === 'agentName' ? 200 : col === '21.00' ? 80 : 120);
        hStr.push(col);
      }
    });
    // ── ใส่ dropdown ให้ sheet เก่าที่ยังไม่มี validation ──
    var sIdx = hStr.indexOf('status');
    var rIdx = hStr.indexOf('reason');
    if (sIdx >= 0) _setDropdown(sheet, sIdx + 1, STATUS_OPTIONS);
    if (rIdx >= 0) _setDropdown(sheet, rIdx + 1, REASON_OPTIONS);
  }
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
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };

  try {
    var sheet = _getOrCreateTrackingSheet();
    var data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, data: [] };

    var headers = data[0].map(function(h){ return String(h).trim(); });
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

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var key = String(r[kIdx] || '').trim();
      if (!key) continue;
      rows.push({
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
        zoneName:  znIdx  >= 0 ? String(r[znIdx]  || '') : ''
      });
    }
    return { ok: true, data: rows };
  } catch(e) {
    return { ok: false, error: e.message };
  }
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
function saveTrackingRow(token, payload) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (!payload || !payload.key) return { ok: false, error: 'ไม่มี key' };

  try {
    var sheet   = _getOrCreateTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var kIdx    = headers.indexOf('key');

    // หาแถวที่มี key ตรงกัน (upsert)
    var targetRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][kIdx] || '').trim() === String(payload.key).trim()) {
        targetRow = i + 1; // sheet row index (1-based)
        break;
      }
    }

    var rowData = [
      payload.agentCode || '',
      payload.agentName || '',
      payload.v21       || '',
      payload.package   || '',
      payload.city      || '',
      payload.province  || '',
      payload.zoneName  || '',
      payload.key,
      _statusLabel(payload.status || ''),  // เก็บ label ไทย ตรงกับ dropdown ใน Sheet
      _reasonLabel(payload.reason || ''),  // เก็บ label ไทย ตรงกับ dropdown ใน Sheet
      payload.note      || '',
      session.username,             // บันทึกจาก session จริง (ไม่เชื่อ client)
      _bkkTimestamp()
    ];

    if (targetRow > 0) {
      // update แถวที่มีอยู่แล้ว
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // เพิ่มแถวใหม่
      sheet.appendRow(rowData);
    }

    logActivity(session.username, session.role, 'TRACKING_SAVE',
      'บันทึกติดตาม: ' + payload.key + ' → ' + (payload.status || '(ว่าง)'));
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// saveTrackingBatch(token, batch) — upsert หลายแถวพร้อมกัน (กด "💾 บันทึกทั้งหมด")
// batch: [{ key, status, reason, note }, ...]
function saveTrackingBatch(token, batch) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (!batch || !batch.length) return { ok: false, error: 'ไม่มีข้อมูล' };

  try {
    var sheet   = _getOrCreateTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var kIdx    = headers.indexOf('key');
    var now     = _bkkTimestamp();
    var updater = session.username;

    // สร้าง map key → rowIndex (1-based, ข้าม header)
    var existingMap = {};
    for (var i = 1; i < data.length; i++) {
      var k = String(data[i][kIdx] || '').trim();
      if (k) existingMap[k] = i + 1;
    }

    var toAppend  = [];
    var savedCount = 0;

    batch.forEach(function(payload) {
      if (!payload.key) return;
      var rowData = [
        payload.agentCode || '',
        payload.agentName || '',
        payload.v21       || '',
        payload.package   || '',
        payload.city      || '',
        payload.province  || '',
        payload.zoneName  || '',
        payload.key,
        _statusLabel(payload.status || ''),  // เก็บ label ไทย ตรงกับ dropdown ใน Sheet
        _reasonLabel(payload.reason || ''),  // เก็บ label ไทย ตรงกับ dropdown ใน Sheet
        payload.note    || '',
        updater,
        now
      ];

      if (existingMap[payload.key]) {
        // update แถวที่มีอยู่
        sheet.getRange(existingMap[payload.key], 1, 1, rowData.length).setValues([rowData]);
      } else {
        toAppend.push(rowData);
      }
      savedCount++;
    });

    // append แถวใหม่ทั้งหมดในคราวเดียว
    if (toAppend.length) {
      sheet.getRange(
        sheet.getLastRow() + 1, 1, toAppend.length, toAppend[0].length
      ).setValues(toAppend);
    }

    logActivity(session.username, session.role, 'TRACKING_BATCH_SAVE',
      'บันทึกติดตาม batch ' + savedCount + ' รายการ');
    return { ok: true, saved: savedCount };
  } catch(e) {
    return { ok: false, error: e.message };
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
                   'key','status','key_success','note','updatedBy','updatedAt'];
    sheet.appendRow(headers);
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
    _setDropdown(sheet, 9,  GROWTH_STATUS_OPTIONS);
    _setDropdown(sheet, 10, GROWTH_REASON_OPTIONS);
  } else {
    var hRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var hStr = hRow.map(function(h){ return String(h).trim(); });
    var newCols = ['21.00','agentCode','package','agentName','city','province','zoneName'];
    newCols.forEach(function(col) {
      if (hStr.indexOf(col) < 0) {
        var nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue(col)
          .setBackground('#085041').setFontColor('white').setFontWeight('bold');
        sheet.setColumnWidth(nextCol, col === 'agentName' ? 200 : col === '21.00' ? 80 : 120);
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
  return sheet;
}

// getGrowthTrackingData(token) — โหลดข้อมูลทั้งหมดจาก TrackingGrowth sheet
function getGrowthTrackingData(token) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };

  try {
    var sheet = _getOrCreateGrowthTrackingSheet();
    var data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, data: [] };

    var headers = data[0].map(function(h){ return String(h).trim(); });
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

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var key = String(r[kIdx] || '').trim();
      if (!key) continue;
      rows.push({
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
        zoneName:    znIdx  >= 0 ? String(r[znIdx]  || '') : ''
      });
    }
    return { ok: true, data: rows };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// saveGrowthTrackingRow(token, payload) — upsert แถวเดียว (auto-save)
function saveGrowthTrackingRow(token, payload) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (!payload || !payload.key) return { ok: false, error: 'ไม่มี key' };

  try {
    var sheet   = _getOrCreateGrowthTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var kIdx    = headers.indexOf('key');

    var targetRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][kIdx] || '').trim() === String(payload.key).trim()) {
        targetRow = i + 1;
        break;
      }
    }

    var rowData = [
      payload.agentCode  || '',
      payload.agentName  || '',
      payload.v21        || '',
      payload.package    || '',
      payload.city       || '',
      payload.province   || '',
      payload.zoneName   || '',
      payload.key,
      _growthStatusLabel(payload.status      || ''),
      _growthReasonLabel(payload.key_success || payload.reason || ''),
      payload.note       || '',
      session.username,
      _bkkTimestamp()
    ];

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    logActivity(session.username, session.role, 'GROWTH_TRACKING_SAVE',
      'บันทึกติดตาม(เติบโต): ' + payload.key + ' → ' + (payload.status || '(ว่าง)'));
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// saveGrowthTrackingBatch(token, batch) — upsert หลายแถวพร้อมกัน
function saveGrowthTrackingBatch(token, batch) {
  var session = getSession(token || '');
  if (!session.ok) return { ok: false, error: 'Unauthorized' };
  if (!batch || !batch.length) return { ok: false, error: 'ไม่มีข้อมูล' };

  try {
    var sheet   = _getOrCreateGrowthTrackingSheet();
    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var kIdx    = headers.indexOf('key');
    var now     = _bkkTimestamp();
    var updater = session.username;

    var existingMap = {};
    for (var i = 1; i < data.length; i++) {
      var k = String(data[i][kIdx] || '').trim();
      if (k) existingMap[k] = i + 1;
    }

    var toAppend  = [];
    var savedCount = 0;

    batch.forEach(function(payload) {
      if (!payload.key) return;
      var rowData = [
        payload.agentCode  || '',
        payload.agentName  || '',
        payload.v21        || '',
        payload.package    || '',
        payload.city       || '',
        payload.province   || '',
        payload.zoneName   || '',
        payload.key,
        _growthStatusLabel(payload.status      || ''),
        _growthReasonLabel(payload.key_success || payload.reason || ''),
        payload.note    || '',
        updater,
        now
      ];

      if (existingMap[payload.key]) {
        sheet.getRange(existingMap[payload.key], 1, 1, rowData.length).setValues([rowData]);
      } else {
        toAppend.push(rowData);
      }
      savedCount++;
    });

    if (toAppend.length) {
      sheet.getRange(
        sheet.getLastRow() + 1, 1, toAppend.length, toAppend[0].length
      ).setValues(toAppend);
    }

    logActivity(session.username, session.role, 'GROWTH_TRACKING_BATCH_SAVE',
      'บันทึกติดตาม(เติบโต) batch ' + savedCount + ' รายการ');
    return { ok: true, saved: savedCount };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}