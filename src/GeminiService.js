// ============================================================
//  GeminiService.gs — บริการเรียกใช้ AI (Gemini API), บันทึก Logs และส่งอีเมล
// ============================================================

/**
 * เรียกใช้ Gemini API เพื่อวิเคราะห์ข้อมูลของลูกค้า และร่างแผนงานติดตาม
 * @param {Object} customerData ข้อมูลตัวชี้วัดของลูกค้าจากฝั่ง client
 * @returns {Object} JSON object ที่มี summary และ guideline
 */
function callGeminiFollowupAPI(customerData) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('ไม่พบข้อมูล GEMINI_API_KEY ใน Script Properties กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าคีย์');
  }

  var pctChangeText = '—';
  if (customerData.prevAvg && customerData.prevAvg > 0) {
    var pct = (customerData.diffAvg / customerData.prevAvg) * 100;
    pctChangeText = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  }

  var jsonInstruction = '\n\n' +
           'กรุณาตอบกลับเป็นรูปแบบ JSON ดิบเท่านั้น ห้ามมีคำอธิบายประกอบหน้าหลัง ห้ามมี markdown code blocks (```json ... ```) ครอบเด็ดขาด โดยมีโครงสร้างดังนี้:\n' +
           '{\n' +
           '  "summary": "ข้อสรุปทิศทางปัญหาของลูกค้ารายนี้ (ภาษาไทย สรุปกระชับความยาว 2-3 บรรทัด สำหรับแสดงผลบนมือถือ/หน้าเว็บ)",\n' +
           '  "guideline": "แนวทางการปฏิบัติและการติดตามลูกค้าอย่างละเอียดเป็นข้อๆ สำหรับส่งเข้าอีเมล (ภาษาไทย ประกอบด้วยหัวข้อย่อยเช่น: 1. การวิเคราะห์ปัญหาเบื้องต้น 2. บทสนทนาการโทรเจรจา (Call Script) 3. ข้อเสนอหรือสิทธิประโยชน์ที่แนะนำเพื่อช่วยฟื้นฟูหรือกระตุ้นยอดขาย)"\n' +
           '}';

  var customPrompt = PropertiesService.getScriptProperties().getProperty('SYSTEM_PROMPT_FOLLOWUP');
  var prompt = '';
  if (customPrompt) {
    prompt = customPrompt + '\n\n' +
             'ชื่อลูกค้า: ' + (customerData.name || '-') + ' (รหัส: ' + (customerData.code || '-') + ')\n' +
             'กลุ่มประเภท: ' + (customerData.segment === 'risk' ? 'กลุ่มเสี่ยง (ยอดขายตก)' : customerData.segment === 'growth' ? 'กลุ่มเติบโต (ยอดขายเพิ่มขึ้น/มีโอกาสต่อยอด)' : 'ปกติ') + '\n' +
             'ผู้ดูแล (Agent Name): ' + (customerData.agentName || '-') + '\n' +
             'พิกัดที่ตั้ง: โซน ' + (customerData.zone || '-') + ' / จังหวัด ' + (customerData.province || '-') + '\n' +
             'แพ็กเกจปัจจุบัน: ' + (customerData.package || '-') + '\n\n' +
             'เปรียบเทียบยอดขายเฉลี่ยรายวัน (Revenue/day MTD):\n' +
             '- เดือนฐานเปรียบเทียบ: ' + Math.round(customerData.prevAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- เดือนปัจจุบัน: ' + Math.round(customerData.curAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- ผลต่างเฉลี่ยต่อวัน: ' + Math.round(customerData.diffAvg || 0).toLocaleString() + ' บาท/วัน (' + pctChangeText + ')\n\n' +
             'เปรียบเทียบจำนวนชิ้นเฉลี่ยหรือสะสมรายเดือน:\n' +
             '- จำนวนชิ้นเดือนฐาน: ' + Math.round(customerData.prevVol || 0).toLocaleString() + ' ชิ้น\n' +
             '- จำนวนชิ้นเดือนปัจจุบัน: ' + Math.round(customerData.curVol || 0).toLocaleString() + ' ชิ้น\n\n' +
             'สัญญาณเตือนหรือเหตุผลการจัดกลุ่ม: ' + (customerData.priority || 'ติดตามสถานะทั่วไป') +
             jsonInstruction;
  } else {
    prompt = 'คุณเป็นผู้เชี่ยวชาญด้านกลยุทธ์การบริหารความสัมพันธ์ลูกค้า (CRM) และการฟื้นฟูยอดขายในประเทศไทย\n' +
             'กรุณาวิเคราะห์ข้อมูลตัวชี้วัดของลูกค้ารายนี้ เพื่อร่างแผนงานติดตามและบทสนทนาการเจรจาเจาะลึกเฉพาะราย:\n\n' +
             'ชื่อลูกค้า: ' + (customerData.name || '-') + ' (รหัส: ' + (customerData.code || '-') + ')\n' +
             'กลุ่มประเภท: ' + (customerData.segment === 'risk' ? 'กลุ่มเสี่ยง (ยอดขายตก)' : customerData.segment === 'growth' ? 'กลุ่มเติบโต (ยอดขายเพิ่มขึ้น/มีโอกาสต่อยอด)' : 'ปกติ') + '\n' +
             'ผู้ดูแล (Agent Name): ' + (customerData.agentName || '-') + '\n' +
             'พิกัดที่ตั้ง: โซน ' + (customerData.zone || '-') + ' / จังหวัด ' + (customerData.province || '-') + '\n' +
             'แพ็กเกจปัจจุบัน: ' + (customerData.package || '-') + '\n\n' +
             'เปรียบเทียบยอดขายเฉลี่ยรายวัน (Revenue/day MTD):\n' +
             '- เดือนฐานเปรียบเทียบ: ' + Math.round(customerData.prevAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- เดือนปัจจุบัน: ' + Math.round(customerData.curAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- ผลต่างเฉลี่ยต่อวัน: ' + Math.round(customerData.diffAvg || 0).toLocaleString() + ' บาท/วัน (' + pctChangeText + ')\n\n' +
             'เปรียบเทียบจำนวนชิ้นเฉลี่ยหรือสะสมรายเดือน:\n' +
             '- จำนวนชิ้นเดือนฐาน: ' + Math.round(customerData.prevVol || 0).toLocaleString() + ' ชิ้น\n' +
             '- จำนวนชิ้นเดือนปัจจุบัน: ' + Math.round(customerData.curVol || 0).toLocaleString() + ' ชิ้น\n\n' +
             'สัญญาณเตือนหรือเหตุผลการจัดกลุ่ม: ' + (customerData.priority || 'ติดตามสถานะทั่วไป') +
             jsonInstruction;
  }

  var payload = {
    "contents": [{
      "parts": [{ "text": prompt }]
    }],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  };

  var defaultModel = PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash';
  var models = [defaultModel];
  var backups = ['gemini-2.0-flash', 'gemini-2.5-flash'];
  backups.forEach(function(m) {
    if (models.indexOf(m) < 0) models.push(m);
  });
  var lastError = '';
  var _quotaHit = false;

  for (var mIdx = 0; mIdx < models.length; mIdx++) {
    if (_quotaHit) break;
    var modelName = models[mIdx];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;

    // ลองเรียก 3 ครั้งต่อ 1 โมเดล (มีระยะหน่วงเวลาก่อนลองใหม่)
    for (var attempt = 1; attempt <= 3; attempt++) {
      try {
        var options = {
          "method": "post",
          "contentType": "application/json",
          "payload": JSON.stringify(payload),
          "muteHttpExceptions": true
        };

        var response = UrlFetchApp.fetch(url, options);
        var code = response.getResponseCode();
        var text = response.getContentText();

        if (code === 200) {
          var rawText = text;
          if (rawText.indexOf('```') >= 0) {
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          var jsonParsed = JSON.parse(rawText);

          if (jsonParsed.candidates && jsonParsed.candidates[0] && jsonParsed.candidates[0].content) {
            var innerText = jsonParsed.candidates[0].content.parts[0].text;
            if (innerText.indexOf('```') >= 0) {
              innerText = innerText.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            return JSON.parse(innerText);
          }

          if (jsonParsed.summary && jsonParsed.guideline) {
            return jsonParsed;
          }
          throw new Error('โครงสร้างข้อความไม่ตรงกับเป้าหมาย');
        }

        // เก็บประวัติความผิดพลาดเพื่อวิเคราะห์
        var errMsg = 'HTTP ' + code;
        try {
          var errJson = JSON.parse(text);
          if (errJson.error && errJson.error.message) {
            errMsg = errJson.error.message;
          }
        } catch(e) {}

        lastError += '\n• [' + modelName + ' (รอบที่ ' + attempt + ')] ' + errMsg;

        // ตรวจจับ Quota Exceeded (Free Tier) — quota เป็น account-wide ไม่ต้องลองโมเดลอื่นเพิ่ม
        if (code === 429 && (errMsg.indexOf('free_tier') >= 0 || errMsg.toLowerCase().indexOf('quota exceeded') >= 0)) {
          _quotaHit = true;
          break;
        }
        // หากเป็นความผิดพลาดประเภทระบบงานฝั่งเซิร์ฟเวอร์เต็ม (503 / 429) ให้หน่วงเวลาและวนลูปใหม่
        if (code === 503 || code === 429 || code === 500) {
          Utilities.sleep(attempt * 1200); // ดีเลย์ 1.2s, 2.4s, 3.6s
          continue;
        } else {
          // หากเป็นความผิดพลาดอื่นๆ (เช่น Key ผิด/Prompt ไม่ผ่าน) ไม่ควรวนซ้ำบนโมเดลนี้ ให้ข้ามไปโมเดลถัดไปเลย
          break;
        }
      } catch(e) {
        lastError += '\n• [' + modelName + ' (รอบที่ ' + attempt + ')] Exception: ' + e.message;
        Utilities.sleep(attempt * 1200);
      }
    }
  }

  if (_quotaHit) {
    throw new Error('⚠️ AI ใช้งานเกิน quota ของ Free Tier แล้ว (ขีดจำกัด 20 ครั้ง/นาที) กรุณารอ 1-2 นาทีแล้วลองใหม่ หรือติดต่อผู้ดูแลระบบเพื่ออัปเกรด Gemini API plan');
  }
  throw new Error('การส่งข้อมูลให้ AI วิเคราะห์ล้มเหลวทุกช่องทาง:' + lastError);
}

/**
 * บันทึกประวัติการเรียกใช้แนวทางจาก AI ลงใน Google Sheets ชื่อ AI_Followup_Logs
 */
function logAiFollowupRequest(username, customerData, summary) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AI_Followup_Logs');

    if (!sheet) {
      sheet = ss.insertSheet('AI_Followup_Logs');
      sheet.appendRow([
        'Timestamp',
        'ผู้ขอรายงาน',
        'รหัสลูกค้า',
        'ชื่อลูกค้า',
        'Segment',
        'ยอดขายเฉลี่ยวันเดือนฐาน',
        'ยอดขายเฉลี่ยวันปัจจุบัน',
        'ผลต่างเฉลี่ยต่อวัน',
        'สรุปวิเคราะห์จาก AI',
        'สถานะการส่งอีเมล',
        'สถานะการติดตาม'
      ]);

      // จัดการความสวยงามของหัวข้อตาราง
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#eff6ff').setFontColor('#1e3a8a');
      sheet.setFrozenRows(1);
    } else {
      var lastCol = sheet.getLastColumn();
      if (lastCol < 11) {
        sheet.getRange(1, 11).setValue('สถานะการติดตาม').setFontWeight('bold').setBackground('#eff6ff').setFontColor('#1e3a8a');
      }
    }

    var isAudit = (summary === '🔍 ดึงข้อมูล/ดูนามบัตรลูกค้า');
    sheet.appendRow([
      new Date(),
      username || '-',
      customerData.code || '-',
      customerData.name || '-',
      customerData.segment === 'risk' ? '🔴 กลุ่มเสี่ยง' : customerData.segment === 'growth' ? '🟢 กลุ่มเติบโต' : 'ทั่วไป',
      customerData.prevAvg || 0,
      customerData.curAvg || 0,
      customerData.diffAvg || 0,
      summary || '-',
      isAudit ? '-' : 'ส่งสำเร็จ',
      isAudit ? '-' : 'รอดำเนินการ'
    ]);
  } catch(e) {
    console.error('Failed to log AI Followup request:', e.message);
  }
}

/**
 * บันทึกการเข้าถึงข้อมูล/ดึงข้อมูลนามบัตรลูกค้า (Audit Log)
 */
function logCustomerAccess(token, customerData) {
  // T13: ปิดระบบบันทึกการเปิดดูการ์ดลูกค้าเพื่อความเป็นส่วนตัวและตามคำขอของผู้ใช้
  return { ok: true };
}

/**
 * ส่งแผนการติดตามลูกค้าในรูปแบบ HTML สวยงามทางอีเมลของผู้ใช้งาน
 */
function sendFollowupEmail(recipientEmail, customerData, aiResult) {
  try {
    var subject = '🤖 แผนและแนวทางการติดตามลูกค้า: ' + (customerData.name || customerData.code) + ' (โดย AI)';

    var pctChangeText = '—';
    if (customerData.prevAvg && customerData.prevAvg > 0) {
      var pct = (customerData.diffAvg / customerData.prevAvg) * 100;
      pctChangeText = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
    }

    var summaryText = String(aiResult && aiResult.summary ? aiResult.summary : 'ไม่มีบทสรุปวิเคราะห์จาก AI');
    var guidelineText = String(aiResult && aiResult.guideline ? aiResult.guideline : 'ไม่มีแนวทางการติดตามลูกค้าจาก AI');

    var htmlBody =
      '<div style="font-family: \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">' +
      '  <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 20px; border-radius: 12px; color: #ffffff; margin-bottom: 24px;">' +
      '    <h2 style="margin: 0; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">✨ แผนงานการติดตามลูกค้าโดย AI</h2>' +
      '    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85;">สร้างแผนงานและบทสนทนาเฉพาะรายโดยอัตโนมัติด้วยโมเดล Gemini</p>' +
      '  </div>' +
      '  ' +
      '  <div style="margin-bottom: 24px;">' +
      '    <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 4px;">📊 ข้อมูลลูกค้า</h3>' +
      '    <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">' +
      '      <tr style="border-bottom: 1px solid #f8fafc;"><td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 140px;">ลูกค้า:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">' + (customerData.name || '-') + ' (' + (customerData.code || '-') + ')</td></tr>' +
      '      <tr style="border-bottom: 1px solid #f8fafc;"><td style="padding: 6px 0; font-weight: bold; color: #64748b;">กลุ่ม segment:</td><td style="padding: 6px 0;"><span style="padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: bold; ' +
               (customerData.segment === 'risk' ? 'background: #fff1f2; color: #b91c1c;' : customerData.segment === 'growth' ? 'background: #ecfdf5; color: #047857;' : 'background: #f1f5f9; color: #475569;') + '">' +
               (customerData.segment === 'risk' ? '🔴 กลุ่มเสี่ยง' : customerData.segment === 'growth' ? '🟢 กลุ่มเติบโต' : 'ทั่วไป') + '</span></td></tr>' +
      '      <tr style="border-bottom: 1px solid #f8fafc;"><td style="padding: 6px 0; font-weight: bold; color: #64748b;">โซน / จังหวัด:</td><td style="padding: 6px 0; color: #334155;">โซน ' + (customerData.zone || '-') + ' / จังหวัด ' + (customerData.province || '-') + '</td></tr>' +
      '      <tr style="border-bottom: 1px solid #f8fafc;"><td style="padding: 6px 0; font-weight: bold; color: #64748b;">แพ็กเกจปัจจุบัน:</td><td style="padding: 6px 0; color: #334155;">' + (customerData.package || '-') + '</td></tr>' +
      '      <tr style="border-bottom: 1px solid #f8fafc;"><td style="padding: 6px 0; font-weight: bold; color: #64748b;">ผลต่างเฉลี่ย:</td><td style="padding: 6px 0; font-weight: bold; ' + (customerData.diffAvg >= 0 ? 'color: #15803d;' : 'color: #b91c1c;') + '">' +
               (customerData.diffAvg >= 0 ? '+' : '') + Math.round(customerData.diffAvg).toLocaleString() + ' บาท/วัน (' + pctChangeText + ')</td></tr>' +
      '    </table>' +
      '  </div>' +
      '  ' +
      '  <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 4px 12px 12px 4px; padding: 16px; margin-bottom: 24px;">' +
      '    <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #1e3a8a; font-weight: bold; text-transform: uppercase;">🤖 บทสรุปข้อเสนอแนะโดยสังเขป</h4>' +
      '    <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.55;">' + summaryText.replace(/\n/g, '<br>') + '</p>' +
      '  </div>' +
      '  ' +
      '  <div style="margin-bottom: 24px;">' +
      '    <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 4px;">📋 แผนปฏิบัติการและแนวทางเจรจา (Action Plan)</h3>' +
      '    <div style="font-size: 13.5px; color: #334155; line-height: 1.6; white-space: pre-line;">' + guidelineText + '</div>' +
      '  </div>' +
      '  ' +
      '  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">' +
      '    <p style="margin: 0;">อีเมลฉบับนี้ถูกส่งอัตโนมัติจากระบบวิเคราะห์ข้อมูลลูกค้าผ่าน AI (Customer Insight Dashboard)</p>' +
      '    <p style="margin: 4px 0 0 0;">กรุณาปรับปรุงข้อมูลแนวการเจรจาให้เข้ากับสถานการณ์ขายตามความเหมาะสมของหน้างาน</p>' +
      '  </div>' +
      '</div>';

    try {
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: htmlBody
      });
    } catch (mailErr) {
      console.warn('MailApp.sendEmail failed, trying GmailApp fallback:', mailErr.message);
      try {
        GmailApp.sendEmail(recipientEmail, subject, '', {
          htmlBody: htmlBody
        });
      } catch (gmailErr) {
        console.error('GmailApp fallback also failed:', gmailErr.message);
        throw new Error('การส่งอีเมลล้มเหลวทั้งระบบ MailApp และ GmailApp: ' + gmailErr.message);
      }
    }
    return true;
  } catch(e) {
    console.error('Failed to send email:', e.message);
    throw new Error('ไม่สามารถส่งแผนงานทางอีเมลได้: ' + e.message);
  }
}

/**
 * ดึงรายการ AI Followup Logs ทั้งหมดสำหรับบทบาท Director หรือ AM
 */
function getAiFollowupLogs(token) {
  var session = _requireSession(token || '', 'GET_AI_LOGS');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director', 'AM', 'BD'], 'GET_AI_LOGS');
  if (!roleCheck.ok) return roleCheck;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AI_Followup_Logs');
    if (!sheet) {
      return { ok: true, rows: [] };
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { ok: true, rows: [] };
    }

    var headers = data[0].map(function(h) { return String(h).trim(); });
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // แปลงข้อมูลแถวเป็น object
      rows.push({
        id: i + 1, // index ของแถวในชีต (1-indexed)
        timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
        requester: String(row[1] || '-'),
        code: String(row[2] || '-'),
        name: String(row[3] || '-').replace(/\s*\(<div[\s\S]*<\/div>\)/gi, ''),
        segment: String(row[4] || '-'),
        prevAvg: Number(row[5] || 0),
        curAvg: Number(row[6] || 0),
        diffAvg: Number(row[7] || 0),
        summary: String(row[8] || '-'),
        emailStatus: String(row[9] || '-'),
        status: String(row[10] || 'รอดำเนินการ') // หากว่างให้คืนเป็น 'รอดำเนินการ'
      });
    }

    // คืนข้อมูลแบบเรียงลำดับใหม่สุดขึ้นก่อน
    rows.reverse();
    return { ok: true, rows: rows };
  } catch(e) {
    console.error('getAiFollowupLogs error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * ดึงคำวิเคราะห์ AI ล่าสุดสำหรับรหัสลูกค้ารายเจาะจง (ใช้สิทธิ์ของทุกคนรวมถึง BD)
 */
function getLatestAiSummary(token, customerCode) {
  var session = _requireSession(token || '', 'GET_LATEST_AI_SUMMARY');
  if (!session.ok) return session;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AI_Followup_Logs');
    if (!sheet) {
      return { ok: true, summary: '' };
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { ok: true, summary: '' };
    }

    var targetCode = String(customerCode || '').trim();
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var code = String(row[2] || '').trim();
      var summary = String(row[8] || '').trim();
      if (code === targetCode && summary && summary !== '🔍 ดึงข้อมูล/ดูนามบัตรลูกค้า') {
        return { ok: true, summary: summary };
      }
    }
    return { ok: true, summary: '' };
  } catch(e) {
    console.error('getLatestAiSummary error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * อัปเดตสถานะการติดตามลูกค้า (สถานะคอลัมน์ที่ 11) ตาม row index ในชีต AI_Followup_Logs
 */
function updateAiFollowupStatus(token, rowIndex, newStatus) {
  var session = _requireSession(token || '', 'UPDATE_AI_STATUS');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director', 'AM'], 'UPDATE_AI_STATUS');
  if (!roleCheck.ok) return roleCheck;

  if (newStatus !== 'รอดำเนินการ' && newStatus !== 'เสร็จสิ้น') {
    return { ok: false, error: 'สถานะไม่ถูกต้อง' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AI_Followup_Logs');
    if (!sheet) {
      return { ok: false, error: 'ไม่พบตารางข้อมูล AI Logs' };
    }

    // ตรวจสอบว่า rowIndex สมเหตุสมผลหรือไม่
    var lastRow = sheet.getLastRow();
    if (rowIndex < 2 || rowIndex > lastRow) {
      return { ok: false, error: 'ตำแหน่งแถวข้อมูลไม่ถูกต้อง' };
    }

    // อัปเดตค่าสถานะในคอลัมน์ที่ 11 (สถานะการติดตาม)
    sheet.getRange(rowIndex, 11).setValue(newStatus);

    // บันทึกกิจกรรม
    logActivity(session.username, session.role, 'AI_FOLLOWUP_UPDATE', 'อัปเดตสถานะการติดตาม แถว ' + rowIndex + ' เป็น ' + newStatus);

    return { ok: true };
  } catch(e) {
    console.error('updateAiFollowupStatus error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * วิเคราะห์รายงานปัญหาของผู้ใช้งานและร่างคู่มือแนวทางแก้ไขปัญหาเชิงเทคนิค
 */
function callGeminiTroubleAPI(category, customerCode, description) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('ไม่พบข้อมูล GEMINI_API_KEY ใน Script Properties กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าคีย์');
  }

  var jsonInstruction = '\n\n' +
           'กรุณาวิเคราะห์เพื่อช่วยสรุปและแก้ไขปัญหานี้ โดยส่งผลลัพธ์กลับเป็นรูปแบบ JSON ดิบเท่านั้น ห้ามมีคำอธิบายประกอบหน้าหลัง ห้ามมี markdown code blocks (```json ... ```) ครอบเด็ดขาด โดยมีโครงสร้างดังนี้:\n' +
           '{\n' +
           '  "summary": "สรุปประเด็นปัญหาเชิงเทคนิคแบบกระชับความยาว 1-2 บรรทัด (ภาษาไทย)",\n' +
           '  "troubleshooting": "แนวทางการตรวจสอบเบื้องต้นและวิธีแก้ไขปัญหาแบบทีละขั้นตอนเป็นข้อๆ สำหรับส่งอีเมลตอบกลับผู้ใช้งาน (ภาษาไทย ประกอบด้วยหัวข้อย่อยและขั้นตอนที่ชัดเจน เช่น 1. การตั้งค่าเบื้องต้น 2. ขั้นตอนแก้ไข 3. คำแนะนำเพิ่มเติม)"\n' +
           '}';

  var customPrompt = PropertiesService.getScriptProperties().getProperty('SYSTEM_PROMPT_TROUBLE');
  var prompt = '';
  if (customPrompt) {
    prompt = customPrompt + '\n\n' +
             '- หมวดหมู่ปัญหา: ' + (category || '-') + '\n' +
             '- รหัสลูกค้าที่พบปัญหา (ถ้ามี): ' + (customerCode || '-') + '\n' +
             '- รายละเอียดของปัญหา: ' + (description || '-') +
             jsonInstruction;
  } else {
    prompt = 'คุณเป็นผู้เชี่ยวชาญการช่วยเหลือเชิงเทคนิคและซอฟต์แวร์ขององค์กร (Technical Support Expert)\n' +
             'ผู้ใช้งานระบบได้ส่งรายงานปัญหาเข้ามา ดังนี้:\n\n' +
             '- หมวดหมู่ปัญหา: ' + (category || '-') + '\n' +
             '- รหัสลูกค้าที่พบปัญหา (ถ้ามี): ' + (customerCode || '-') + '\n' +
             '- รายละเอียดของปัญหา: ' + (description || '-') +
             jsonInstruction;
  }

  var payload = {
    "contents": [{
      "parts": [{ "text": prompt }]
    }],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  };

  var defaultModel = PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash';
  var models = [defaultModel];
  var backups = ['gemini-2.0-flash', 'gemini-2.5-flash'];
  backups.forEach(function(m) {
    if (models.indexOf(m) < 0) models.push(m);
  });
  var lastError = '';
  var _quotaHit = false;

  for (var mIdx = 0; mIdx < models.length; mIdx++) {
    if (_quotaHit) break;
    var modelName = models[mIdx];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;

    for (var attempt = 1; attempt <= 3; attempt++) {
      try {
        var options = {
          "method": "post",
          "contentType": "application/json",
          "payload": JSON.stringify(payload),
          "muteHttpExceptions": true
        };

        var response = UrlFetchApp.fetch(url, options);
        var code = response.getResponseCode();
        var text = response.getContentText();

        if (code === 200) {
          var rawText = text;
          if (rawText.indexOf('```') >= 0) {
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          var jsonParsed = JSON.parse(rawText);

          if (jsonParsed.candidates && jsonParsed.candidates[0] && jsonParsed.candidates[0].content) {
            var innerText = jsonParsed.candidates[0].content.parts[0].text;
            if (innerText.indexOf('```') >= 0) {
              innerText = innerText.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            return JSON.parse(innerText);
          }

          if (jsonParsed.summary && jsonParsed.troubleshooting) {
            return jsonParsed;
          }
          throw new Error('โครงสร้างข้อความไม่ตรงกับเป้าหมาย');
        }

        var errMsg = 'HTTP ' + code;
        try {
          var errJson = JSON.parse(text);
          if (errJson.error && errJson.error.message) {
            errMsg = errJson.error.message;
          }
        } catch(e) {}

        lastError += '\n• [' + modelName + ' (รอบที่ ' + attempt + ')] ' + errMsg;

        // ตรวจจับ Quota Exceeded (Free Tier) — quota เป็น account-wide ไม่ต้องลองโมเดลอื่นเพิ่ม
        if (code === 429 && (errMsg.indexOf('free_tier') >= 0 || errMsg.toLowerCase().indexOf('quota exceeded') >= 0)) {
          _quotaHit = true;
          break;
        }
        if (code === 503 || code === 429 || code === 500) {
          Utilities.sleep(attempt * 1200);
          continue;
        } else {
          break;
        }
      } catch(e) {
        lastError += '\n• [' + modelName + ' (รอบที่ ' + attempt + ')] Exception: ' + e.message;
        Utilities.sleep(attempt * 1200);
      }
    }
  }

  if (_quotaHit) {
    throw new Error('⚠️ AI ใช้งานเกิน quota ของ Free Tier แล้ว (ขีดจำกัด 20 ครั้ง/นาที) กรุณารอ 1-2 นาทีแล้วลองใหม่ หรือติดต่อผู้ดูแลระบบเพื่ออัปเกรด Gemini API plan');
  }
  throw new Error('การส่งข้อมูลให้ AI วิเคราะห์ล้มเหลวทุกช่องทาง:' + lastError);
}

/**
 * ผู้ส่งแจ้งปัญหารายงานเข้าระบบ: เรียกใช้ AI ทำการสรุปและแจ้งกลับทางอีเมล และส่งบันทึกลงชีต System_Issues_Logs
 */
function submitSystemIssue(token, issueData) {
  var session = getSession(token);
  if (!session || !session.ok) {
    return { ok: false, error: 'Session ของคุณหมดอายุแล้ว กรุณาล็อกอินใหม่' };
  }

  try {
    var category = issueData.category || '-';
    var customerCode = issueData.customerCode || '-';
    var description = issueData.description || '-';

    // 1. ค้นหาอีเมลผู้แจ้งรายงาน (จากชีต Users หรือ fallbacks)
    var reporterEmail = '';
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
            if (String(values[i][uIdx] || '').trim().toLowerCase() === userLower) {
              reporterEmail = String(values[i][eIdx] || '').trim();
              break;
            }
          }
        }
      }
    } catch(e) {
      console.warn('Failed email lookup:', e.message);
    }
    if (!reporterEmail && session.username.indexOf('@') >= 0) {
      reporterEmail = session.username;
    }
    if (!reporterEmail) {
      reporterEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    }

    // 2. เรียก AI วิเคราะห์ปัญหา ถ้า AI ล้มเหลว ยังต้องบันทึกรายงานให้สำเร็จ
    var aiResult = null;
    var aiWarning = '';
    var userEmailSent = false;
    var emailWarning = '';
    try {
      aiResult = callAiTroubleAPI(category, customerCode, description);
    } catch (aiErr) {
      aiWarning = aiErr && aiErr.message ? aiErr.message : 'AI วิเคราะห์ปัญหาไม่ได้ในครั้งนี้';
      console.warn('submitSystemIssue AI analysis failed:', aiWarning);
    }

    var summaryText = String(aiResult && aiResult.summary ? aiResult.summary : 'บันทึกรายงานแล้ว แต่ AI ยังไม่สามารถสรุปปัญหาได้ในครั้งนี้');
    var troubleshootingText = String(aiResult && aiResult.troubleshooting ? aiResult.troubleshooting : 'โปรดให้ผู้ดูแลระบบตรวจสอบรายละเอียดจากรายงานที่บันทึกไว้');

    // 3. บันทึกปัญหาลงชีต System_Issues_Logs
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var issuesSheet = ss.getSheetByName('System_Issues_Logs');
    if (!issuesSheet) {
      issuesSheet = ss.insertSheet('System_Issues_Logs');
      issuesSheet.appendRow([
        'Timestamp',
        'ผู้แจ้ง',
        'หมวดหมู่',
        'รหัสลูกค้า',
        'รายละเอียดปัญหา',
        'สถานะ',
        'สรุปปัญหาโดย AI',
        'แนวทางการแก้ไขโดย AI'
      ]);
      issuesSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f1f5f9').setFontColor('#334155');
      issuesSheet.setFrozenRows(1);
    }
    issuesSheet.appendRow([
      new Date(),
      session.username,
      category,
      customerCode,
      description,
      'รอดำเนินการ',
      summaryText,
      troubleshootingText
    ]);

    // 4. ค้นหาอีเมลผู้ดูแลระบบ (Admin Email)
    var adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
    if (!adminEmail) {
      adminEmail = Session.getEffectiveUser().getEmail(); // fallback to spreadsheet owner
    }

    // 5. ส่งอีเมลแจ้งเตือนแอดมิน (Admin Notification Email)
    if (adminEmail) {
      var adminSubject = '🛠️ แจ้งปัญหาระบบใหม่: [' + category + '] โดย ' + session.username;
      var adminHtml =
        '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">' +
        '  <h2 style="color: #ef4444; border-bottom: 2px solid #fee2e2; padding-bottom: 8px; margin-top: 0;">🛠️ แจ้งรายงานปัญหาระบบใหม่</h2>' +
        '  <table style="width: 100%; font-size: 13.5px; border-collapse: collapse; margin-bottom: 20px;">' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 130px;">ผู้แจ้งรายงาน:</td><td style="padding: 6px 0; color: #0f172a;">' + session.username + ' (' + session.role + ')</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; font-weight: bold; color: #64748b;">หมวดหมู่ปัญหา:</td><td style="padding: 6px 0; color: #0f172a; font-weight: bold;">' + category + '</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; font-weight: bold; color: #64748b;">รหัสลูกค้าที่เกี่ยวข้อง:</td><td style="padding: 6px 0; color: #0f172a;">' + customerCode + '</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; font-weight: bold; color: #64748b; vertical-align: top;">รายละเอียดปัญหา:</td><td style="padding: 6px 0; color: #334155; white-space: pre-line;">' + description + '</td></tr>' +
        '  </table>' +
        '  <div style="background: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px; border-radius: 4px; margin-bottom: 20px;">' +
        '    <h4 style="margin: 0 0 4px 0; color: #475569;">สรุปวิเคราะห์เบื้องต้นโดย AI:</h4>' +
        '    <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">' + summaryText + '</p>' +
        '  </div>' +
        '  <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">' +
        '    ระบบแจ้งเตือนอัตโนมัติ Customer Insight Dashboard | กรุณาเข้าตรวจสอบที่ Google Sheet' +
        '  </div>' +
        '</div>';

      try {
        MailApp.sendEmail({
          to: adminEmail,
          subject: adminSubject,
          htmlBody: adminHtml
        });
      } catch (adminMailErr) {
        console.warn('MailApp admin email failed, trying GmailApp fallback:', adminMailErr.message);
        try {
          GmailApp.sendEmail(adminEmail, adminSubject, '', {
            htmlBody: adminHtml
          });
        } catch (gmailErr) {
          console.error('GmailApp admin email fallback also failed:', gmailErr.message);
        }
      }
    }

    // 6. ส่งอีเมลคู่มือแก้ไขเบื้องต้นกลับหาผู้แจ้งรายงาน (User Troubleshooting Email)
    if (reporterEmail) {
      var userSubject = '🤖 คู่มือแก้ไขปัญหาเบื้องต้น: แจ้งปัญหาระบบของท่าน';
      var userHtml =
        '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">' +
        '  <div style="background: linear-gradient(135deg, #1e293b, #475569); padding: 18px; border-radius: 12px; color: #ffffff; margin-bottom: 20px;">' +
        '    <h3 style="margin: 0; font-size: 18px;">🤖 คู่มือการแก้ไขปัญหาเบื้องต้นโดย AI</h3>' +
        '    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.85;">ร่างแนวทางการแก้ปัญหาจากรายงานปัญหาของท่านอัตโนมัติด้วย AI</p>' +
        '  </div>' +
        '  <div style="margin-bottom: 20px;">' +
        '    <h4 style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">ปัญหาที่ท่านได้รับแจ้ง:</h4>' +
        '    <div style="font-size: 13.5px; font-weight: bold; color: #0f172a; padding-left: 4px;">' + category + '</div>' +
        '    <p style="margin: 4px 0 0 4px; font-size: 13px; color: #475569; font-style: italic;">"' + description + '"</p>' +
        '  </div>' +
        '  <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px 12px 12px 4px; padding: 16px; margin-bottom: 20px;">' +
        '    <h4 style="margin: 0 0 8px 0; font-size: 13.5px; color: #14532d; font-weight: bold;">📝 แนวทางการตรวจสอบและแก้ไขเบื้องต้น:</h4>' +
        '    <div style="font-size: 13px; color: #166534; line-height: 1.6; white-space: pre-line;">' + troubleshootingText + '</div>' +
        '  </div>' +
        '  <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">* ปัญหานี้ได้รับการบันทึกลงในระบบเรียบร้อยแล้ว แอดมินผู้พัฒนาจะดำเนินการตรวจสอบความผิดพลาดเพิ่มเติมในคราวถัดไป</p>' +
        '  <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">' +
        '    อีเมลฉบับนี้ถูกส่งอัตโนมัติจากระบบแจ้งเตือนของ Customer Insight Dashboard' +
        '  </div>' +
        '</div>';

      try {
        MailApp.sendEmail({
          to: reporterEmail,
          subject: userSubject,
          htmlBody: userHtml
        });
        userEmailSent = true;
      } catch (mailErr) {
        emailWarning = mailErr && mailErr.message ? mailErr.message : 'ส่งอีเมลแนวทางแก้ไขเบื้องต้นไม่สำเร็จ';
        console.warn('submitSystemIssue user email failed:', emailWarning);
      }
    } else {
      emailWarning = 'ไม่พบอีเมลผู้แจ้งสำหรับส่งแนวทางแก้ไขเบื้องต้น';
    }

    var provider = PropertiesService.getScriptProperties().getProperty('AI_PROVIDER') || 'gemini';
    var model = provider === 'openai'
      ? (PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini')
      : (PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash');

    logActivity(session.username, session.role, 'SYSTEM_ISSUE_SUBMIT', 'ส่งรายงานปัญหาระบบ: ' + category);
    return {
      ok: true,
      summary: aiResult && aiResult.summary ? aiResult.summary : '',
      aiWarning: aiWarning,
      emailWarning: emailWarning,
      userEmailSent: userEmailSent,
      provider: provider,
      model: model
    };
  } catch(err) {
    console.error('submitSystemIssue error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * ดึงประวัติรายงานปัญหาระบบทั้งหมดเฉพาะ Director หรือ AM
 */
function getSystemIssuesLogs(token) {
  var session = _requireSession(token || '', 'GET_SYSTEM_ISSUES');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director', 'AM'], 'GET_SYSTEM_ISSUES');
  if (!roleCheck.ok) return roleCheck;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('System_Issues_Logs');
    if (!sheet) {
      return { ok: true, rows: [] };
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { ok: true, rows: [] };
    }

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      rows.push({
        id: i + 1, // row index in sheet (1-based)
        timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
        reporter: String(row[1] || '-'),
        category: String(row[2] || '-'),
        customerCode: String(row[3] || '-'),
        description: String(row[4] || '-'),
        status: String(row[5] || 'รอดำเนินการ'),
        summary: String(row[6] || '-'),
        troubleshooting: String(row[7] || '-')
      });
    }

    rows.reverse();
    return { ok: true, rows: rows };
  } catch(e) {
    console.error('getSystemIssuesLogs error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * อัปเดตสถานะปัญหา (คอลัมน์ที่ 6) ในตาราง System_Issues_Logs
 */
function updateSystemIssueStatus(token, rowIndex, newStatus) {
  var session = _requireSession(token || '', 'UPDATE_ISSUE_STATUS');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director', 'AM'], 'UPDATE_ISSUE_STATUS');
  if (!roleCheck.ok) return roleCheck;

  if (newStatus !== 'รอดำเนินการ' && newStatus !== 'แก้ไขแล้ว') {
    return { ok: false, error: 'สถานะปัญหาระบบไม่ถูกต้อง' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('System_Issues_Logs');
    if (!sheet) {
      return { ok: false, error: 'ไม่พบตารางรายงานปัญหาระบบ' };
    }

    var lastRow = sheet.getLastRow();
    if (rowIndex < 2 || rowIndex > lastRow) {
      return { ok: false, error: 'ตำแหน่งแถวระบบไม่ถูกต้อง' };
    }

    sheet.getRange(rowIndex, 6).setValue(newStatus);
    logActivity(session.username, session.role, 'SYSTEM_ISSUE_UPDATE', 'อัปเดตสถานะแจ้งปัญหาระบบ แถว ' + rowIndex + ' เป็น ' + newStatus);
    return { ok: true };
  } catch(e) {
    console.error('updateSystemIssueStatus error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * ดึงการตั้งค่าระบบทั้งหมด เฉพาะ Director เท่านั้น
 */
function getSystemSettings(token) {
  var session = _requireSession(token || '', 'GET_SETTINGS');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director'], 'GET_SETTINGS');
  if (!roleCheck.ok) return roleCheck;

  try {
    var props = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('GEMINI_API_KEY') || '';
    var openaiApiKey = props.getProperty('OPENAI_API_KEY') || '';
    var aiProvider = props.getProperty('AI_PROVIDER') || 'gemini';
    var adminEmail = props.getProperty('ADMIN_EMAIL') || '';
    var defaultModel = props.getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash';
    var openaiDefaultModel = props.getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';
    var promptFollowup = props.getProperty('SYSTEM_PROMPT_FOLLOWUP') || '';
    var promptTrouble = props.getProperty('SYSTEM_PROMPT_TROUBLE') || '';

    // Mask sensitive keys
    var maskKey = function(key) {
      if (!key) return '';
      if (key.length <= 8) return '********';
      return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    };

    return {
      ok: true,
      settings: {
        aiProvider: aiProvider,
        geminiApiKey: apiKey ? maskKey(apiKey) : '',
        openaiApiKey: openaiApiKey ? maskKey(openaiApiKey) : '',
        adminEmail: adminEmail,
        geminiDefaultModel: defaultModel,
        openaiDefaultModel: openaiDefaultModel,
        systemPromptFollowup: promptFollowup,
        systemPromptTrouble: promptTrouble
      }
    };
  } catch(e) {
    console.error('getSystemSettings error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * บันทึกการตั้งค่าระบบเฉพาะ Director เท่านั้น
 */
function saveSystemSettings(token, settingsData) {
  var session = _requireSession(token || '', 'SAVE_SETTINGS');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director'], 'SAVE_SETTINGS');
  if (!roleCheck.ok) return roleCheck;

  try {
    var props = PropertiesService.getScriptProperties();

    // Set AI Provider
    props.setProperty('AI_PROVIDER', settingsData.aiProvider || 'gemini');

    // Check and set Gemini API Key (if modified)
    var newApiKey = settingsData.geminiApiKey || '';
    if (newApiKey && newApiKey.indexOf('...') < 0 && newApiKey.indexOf('***') < 0) {
      props.setProperty('GEMINI_API_KEY', newApiKey);
    } else if (newApiKey === '') {
      props.deleteProperty('GEMINI_API_KEY');
    }

    // Check and set OpenAI API Key (if modified)
    var newOpenaiApiKey = settingsData.openaiApiKey || '';
    if (newOpenaiApiKey && newOpenaiApiKey.indexOf('...') < 0 && newOpenaiApiKey.indexOf('***') < 0) {
      props.setProperty('OPENAI_API_KEY', newOpenaiApiKey);
    } else if (newOpenaiApiKey === '') {
      props.deleteProperty('OPENAI_API_KEY');
    }

    // Check and set Admin Email
    var newAdminEmail = settingsData.adminEmail || '';
    if (newAdminEmail) {
      props.setProperty('ADMIN_EMAIL', newAdminEmail);
    } else {
      props.deleteProperty('ADMIN_EMAIL');
    }

    // Set model
    props.setProperty('GEMINI_DEFAULT_MODEL', settingsData.geminiDefaultModel || 'gemini-2.0-flash');
    props.setProperty('OPENAI_DEFAULT_MODEL', settingsData.openaiDefaultModel || 'gpt-4o-mini');

    // Set prompts
    if (settingsData.systemPromptFollowup) {
      props.setProperty('SYSTEM_PROMPT_FOLLOWUP', settingsData.systemPromptFollowup);
    } else {
      props.deleteProperty('SYSTEM_PROMPT_FOLLOWUP');
    }

    if (settingsData.systemPromptTrouble) {
      props.setProperty('SYSTEM_PROMPT_TROUBLE', settingsData.systemPromptTrouble);
    } else {
      props.deleteProperty('SYSTEM_PROMPT_TROUBLE');
    }

    logActivity(session.username, session.role, 'SYSTEM_SETTINGS_SAVE', 'บันทึกการตั้งค่าระบบและ AI สำเร็จ');
    return { ok: true };
  } catch(e) {
    console.error('saveSystemSettings error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * วิเคราะห์ข้อมูลหน้าจอสรุปรายแท็บ
 */
function analyzePageData(token, pageData, userMessage, chatHistory) {
  var session = _requireSession(token || '', 'ANALYZE_PAGE');
  if (!session.ok) return session;
  var roleCheck = _requireRole(session, ['Director', 'AM', 'BD'], 'ANALYZE_PAGE');
  if (!roleCheck.ok) return roleCheck;

  try {
    var prompt = '';
    var pageContext = getPromptForPage(pageData);

    if (userMessage) {
      prompt = "คุณคือ AI Insights Assistant ผู้ช่วยตอบคำถามอัจฉริยะแบบโต้ตอบได้ในระบบ Dashboard วิเคราะห์ลูกค้า\n" +
               "ข้อมูลบริบทปัจจุบันของหน้าจอ [" + (pageData.tab || 'หน้าแรก') + "] ประจำเดือน " + (pageData.monthTH || '') + " มีรายละเอียดดังนี้:\n" +
               "=== เริ่มข้อมูลบริบท ===\n" +
               pageContext + "\n" +
               "=== จบบริบท ===\n\n" +
               "นี่คือประวัติการสนทนาก่อนหน้า:\n";

      if (chatHistory && chatHistory.length > 0) {
        chatHistory.forEach(function(msg) {
          var sender = msg.role === 'user' ? 'ผู้ใช้' : 'AI';
          prompt += sender + ": " + msg.text + "\n";
        });
      } else {
        prompt += "(ไม่มีประวัติการสนทนาก่อนหน้า)\n";
      }

      prompt += "\nผู้ใช้ถามล่าสุด: " + userMessage + "\n" +
                "AI: โปรดวิเคราะห์ข้อมูลตามบริบทและประวัติการสนทนาข้างต้น แล้วตอบผู้ใช้อย่างตรงประเด็น สุภาพ กระชับ (ในรูปแบบภาษาไทยที่กระชับและสุภาพ และจัดกลุ่มหัวข้อด้วยอิโมจิหากเหมาะสม)";
    } else {
      prompt = pageContext;
    }

    var provider = PropertiesService.getScriptProperties().getProperty('AI_PROVIDER') || 'gemini';
    var model = provider === 'openai'
      ? (PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini')
      : (PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash');

    var textResult = callAiPageAnalysisAPI(prompt);

    // Log activity
    var logMsg = userMessage
      ? 'แชทคุยกับ AI: "' + (userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage) + '"'
      : 'วิเคราะห์ข้อมูลด้วย AI บนหน้าจอ: ' + pageData.tab;
    logActivity(session.username, session.role, 'PAGE_AI_ANALYSIS', logMsg);

    return { ok: true, result: textResult, provider: provider, model: model };
  } catch(e) {
    console.error('analyzePageData error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * สร้างคำสั่งวิเคราะห์โดยเฉพาะในแต่ละหน้าจอ
 */
function getPromptForPage(pageData) {
  var tab = pageData.tab;
  var monthTH = pageData.monthTH || '';
  var monthEN = pageData.monthEN || '';
  var dataYear = pageData.dataYear || '2026';
  var kpis = pageData.kpis || {};

  var carriersText = '';
  if (kpis.carrierSummary && kpis.carrierSummary.length > 0) {
    kpis.carrierSummary.forEach(function(cs) {
      carriersText += "  • " + cs.carrier + ": Volume=" + (cs.vol || 0).toLocaleString() + " ชิ้น, Revenue=" + (cs.rev || 0).toLocaleString() + " บาท\n";
    });
  } else {
    carriersText += "  • (ไม่มีข้อมูลขนส่ง)\n";
  }

  var basePrompt = "คุณคือ 'AI Assistant' ผู้ช่วยอัจฉริยะประจำระบบแดชบอร์ด Customer Insight Dashboard นี้\n" +
                   "ข้อมูลความเข้าใจเกี่ยวกับระบบและแดชบอร์ดนี้:\n" +
                   "- วัตถุประสงค์: วิเคราะห์ข้อมูลลูกค้าเชิงลึก ค้นหาลูกค้ารายเสี่ยง (At-Risk) เพื่อป้องกันรายได้หาย, แนะนำการเติบโต (Growth), และสรุปปริมาณการใช้บริการส่งพัสดุ (Volume) กับเจ้าขนส่งต่างๆ (เช่น DHL, Flash, Kerry, Best)\n" +
                   "- บทบาทและสิทธิ์ผู้ใช้:\n" +
                   "  1. Director (ผู้บริหาร): ดูสถิติระดับประเทศ, กำหนดเป้าหมายรายได้ (Revenue Target) และเปรียบเทียบความก้าวหน้า MTD\n" +
                   "  2. AM (Area Manager): ดูสถิติและเป้าหมายแยกเป็นรายเขต/โซน และดูแลทีม BD ในกลุ่มโซนนั้นๆ\n" +
                   "  3. BD (Business Development): ดูแลและจัดการการติดตามลูกค้ารายตัว\n" +
                   "- โครงสร้างแท็บข้อมูลที่เชื่อมต่อ:\n" +
                   "  * [home] หน้าแรก: แผนที่สรุปประสิทธิภาพโซน/ภูมิภาค, ข้อมูล KPIs ประจำวันสะสมเทียบเดือนก่อนหน้า, แนะนำงานด่วนประจำวัน\n" +
                   "  * [ov] ภาพรวมธุรกิจ: วิเคราะห์การเติบโตรายได้สะสม (MTD Revenue) และปริมาณพัสดุสะสมรายเดือน (MoM)\n" +
                   "  * [cr] ขนส่ง/การกระจายสินค้า: ตรวจปริมาณพัสดุและรายได้ที่ใช้บริการแยกตามขนส่ง (Carriers) และ Top Agents ในแต่ละขนส่ง\n" +
                   "  * [risk] กลุ่มเสี่ยง: คัดกรองรายชื่อลูกค้าที่ยอดขายเฉลี่ยรายวันลดลง เกินเกณฑ์เมื่อเทียบกับเดือนก่อน เพื่อติดตามทบทวน\n" +
                   "  * [growth] กลุ่มเติบโต: รายชื่อลูกค้าดาวรุ่งที่มียอดสั่งซื้อเฉลี่ยรายวันเพิ่มขึ้นโดดเด่น สำหรับต่อยอดความสัมพันธ์\n" +
                   "  * [ls] รายชื่อลูกค้า: แสดงตารางข้อมูลลูกค้าทั้งหมดพร้อมตัวกรองตามสิทธิ์ (Director/AM/BD)\n" +
                   "  * [ai_analytics] AI วิเคราะห์เชิงลึก พยากรณ์ และแนะนำกลยุทธ์รายวัน/รายสัปดาห์\n" +
                   "  * [usermgmt] ตั้งค่าผู้ใช้งาน สิทธิ์การเข้าถึง และการตั้งค่าคีย์หรือค่าย AI ของระบบ\n" +
                   "- กฎการตอบคำถาม:\n" +
                   "  1. คุณทำหน้าที่เป็น AI ผู้ช่วยอธิบายและตอบคำถามได้กว้างขวางเกี่ยวกับระบบ ทั้งการทำงานแดชบอร์ด, การประเมินกลุ่มเสี่ยง/กลุ่มเติบโต, เกณฑ์ตัวเลขต่างๆ และแนะนำกลยุทธ์บริการลูกค้า\n" +
                   "  2. สามารถอธิบายวิธีวิเคราะห์ ตัวชี้วัด และการใช้งานของทุกส่วนงานบนแดชบอร์ดเมื่อผู้ใช้สอบถาม\n" +
                   "  3. หากผู้ใช้ถามเรื่องงานทั่วไปหรือประเด็นทางธุรกิจนอกเหนือจากข้อมูลตัวเลขหน้าปัจจุบัน ให้ใช้ความรู้ระบบด้านบนเพื่อให้คำปรึกษาอย่างมืออาชีพ ทรงภูมิ สุภาพ และชัดเจน\n" +
                   "  4. ในการสรุปตัวเลข ให้เน้นประเด็นเชิงลึกแบบ Actionable Insights ไม่เพียงทวนเลขเฉยๆ และห้ามใช้หัวข้อ Markdown ใหญ่ (#, ##, ###)\n\n" +
                   "--- ข้อมูลภาพรวมแดชบอร์ดทั้งระบบ (Global Dashboard Summary) ---\n" +
                   "- รายได้ MTD เดือนนี้: " + (kpis.revenueMTD ? kpis.revenueMTD.toLocaleString() : '-') + " บาท\n" +
                   "- ปริมาณสินค้า MTD เดือนนี้: " + (kpis.volumeMTD ? kpis.volumeMTD.toLocaleString() : '-') + " ชิ้น\n" +
                   "- ยอดขายเฉลี่ยรายวัน: " + (kpis.avgRevPerDay ? kpis.avgRevPerDay.toLocaleString() : '-') + " บาท/วัน\n" +
                   "- จำนวนลูกค้ารวม: " + (kpis.totalCustomers || 0) + " ราย\n" +
                   "- สรุปการใช้บริการขนส่ง (Carriers):\n" + carriersText +
                   "- จำนวนลูกค้ากลุ่มเสี่ยง (At-Risk): " + (kpis.totalRiskCustomers || 0) + " ราย\n" +
                   "- จำนวนลูกค้ากลุ่มเติบโต (Growth): " + (kpis.totalGrowthCustomers || 0) + " ราย\n" +
                   "----------------------------------------------------\n\n" +
                   "ข้อมูลที่ส่งมาเป็นข้อมูลในแท็บ [" + tab + "] ประจำเดือน " + monthTH + " (" + monthEN + ") ปี " + dataYear + "\n\n";

  if (tab === 'home') {
    return basePrompt +
      "ข้อมูลสรุป KPIs ของแท็บ หน้าแรก:\n" +
      "- จำนวนลูกค้าทั้งหมด: " + kpis.totalCustomers + " ราย\n" +
      "- รายได้สะสมช่วงนี้ (Revenue MTD): " + kpis.revenueMTD + " บาท\n" +
      "- ปริมาณสินค้า (Volume MTD): " + kpis.volumeMTD + " ชิ้น\n" +
      "- ยอดขายเฉลี่ยรายวัน (Avg Rev/Day): " + kpis.avgRevPerDay + " บาท/วัน (เทียบกับเดือนก่อน " + (kpis.prevMonthName || '') + " ที่ " + (kpis.prevAvgRevPerDay || '') + " บาท/วัน)\n" +
      "- ยอดขายเฉลี่ยรายชิ้นสะสม: " + kpis.avgVolPerDay + " ชิ้น/วัน\n" +
      "- ราคาเฉลี่ยต่อชิ้น: " + kpis.avgPricePerPiece + " บาท/ชิ้น\n\n" +
      "โปรดสรุปสถานะธุรกิจในเดือนนี้ ค้นหาความผิดปกติของตัวเลขเปรียบเทียบกับรายวันของเดือนก่อน และแนะนำจุดโฟกัสหลักของเดือนนี้";
  } else if (tab === 'ov') {
    return basePrompt +
      "ข้อมูลสรุปภาพรวมธุรกิจ (Overview Tab):\n" +
      "- จำนวนลูกค้า: " + kpis.totalCustomers + " ราย\n" +
      "- ยอดขายรวม (Revenue MTD): " + kpis.revenueMTD + " บาท (เดือนก่อน " + (kpis.prevMonthName || '') + " มียอดขายสะสม " + (kpis.prevRevenue || '') + " บาท)\n" +
      "- ยอดวอลุ่มสินค้าสะสม: " + kpis.volumeMTD + " ชิ้น (เดือนก่อนมียอด " + (kpis.prevVolume || '') + " ชิ้น)\n" +
      "- ราคาเฉลี่ยสินค้าต่อชิ้น: " + kpis.avgPricePerPiece + " บาท\n\n" +
      "จงวิเคราะห์การเติบโตหรือหดตัวของ Revenue และ Volume เปรียบเทียบ MoM และแนะนำแนวทางจัดการการตั้งราคาหรือกระตุ้นยอดขาย";
  } else if (tab === 'cr') {
    var carrierSummaryStr = (kpis.carrierSummary || []).map(function(c) {
      return '  • ' + c.carrier + ': Vol=' + c.vol + ' ชิ้น, Rev=' + c.rev + ' บาท';
    }).join('\n');

    var topAgentsStr = '';
    var tapObj = kpis.topAgentsPerCarrier || {};
    var carrierNames = Object.keys(tapObj);
    carrierNames.forEach(function(carrier) {
      var agents = tapObj[carrier] || [];
      topAgentsStr += '\n  [' + carrier + '] top ' + agents.length + ' agents:\n';
      agents.forEach(function(a, i) {
        topAgentsStr += '    ' + (i+1) + '. code=' + a.code + ' name=' + a.name + ' vol=' + a.vol + ' ชิ้น rev=' + a.rev + ' บาท\n';
      });
    });

    return basePrompt +
      'ข้อมูลสรุปขนส่งและการกระจายสินค้า (Shipping Tab) ประจำเดือน ' + (kpis.month || monthEN) + ':\n' +
      '- จำนวนพาร์ทเนอร์ขนส่งทั้งหมด: ' + (kpis.totalCarriers || 0) + ' เจ้า\n' +
      '- จำนวน Agent ที่มีการขนส่ง: ' + (kpis.totalAgentsWithShipments || 0) + ' ราย\n' +
      '- สรุปยอดรวมต่อเจ้าขนส่ง:\n' + (carrierSummaryStr || '  (ไม่มีข้อมูล)') + '\n' +
      '- Top agents แยกตามเจ้าขนส่ง (เรียงตาม Volume สูงสุด):' + (topAgentsStr || '\n  (ไม่มีข้อมูล)') + '\n' +
      'โปรดวิเคราะห์: (1) เจ้าขนส่งหลักที่มีสัดส่วนสูงสุด (2) ลูกค้า/agent code ที่ส่งมากสุดต่อเจ้า (3) แนะนำการกระจายความเสี่ยงหรือปรับสัดส่วนขนส่ง';

  } else if (tab === 'risk') {
    var topLossStr = (kpis.topLossCustomers || []).map(function(c) {
      return "- ลูกค้า " + c.name + " (" + c.code + "): ยอดขายเฉลี่ยลดลง " + c.loss + " บาท/วัน";
    }).join('\n');
    return basePrompt +
      "ข้อมูลวิเคราะห์กลุ่มเสี่ยง (At-Risk Group Tab):\n" +
      "- มีลูกค้าอยู่ในกลุ่มเสี่ยงสูญเสียรายได้: " + kpis.totalRiskCustomers + " ราย\n" +
      "- เกณฑ์ยอดขายเฉลี่ยที่ลดลงที่ใช้ตรวจจับ: > " + kpis.riskThreshold + " บาท/วัน\n" +
      "- เดือนที่ใช้เปรียบเทียบเป็น Baseline: " + kpis.compareMonth + "\n" +
      "- รายชื่อลูกค้าเสี่ยงสูงสุดและยอดขายที่หายไปรายวัน:\n" + topLossStr + "\n\n" +
      "โปรดวิเคราะห์เหตุผลการลดลงของกลุ่มลูกค้าที่เสี่ยงที่สุดเหล่านี้ ชี้ช่องทางหรือประเภทความเสี่ยงเชิงลึก และแนะนำมาตรการตอบโต้ด่วน (Immediate Retention Actions)";
  } else if (tab === 'growth') {
    var topGrowthStr = (kpis.topGrowthCustomers || []).map(function(c) {
      return "- ลูกค้า " + c.name + " (" + c.code + "): ยอดขายเฉลี่ยเพิ่มขึ้น " + c.gain + " บาท/วัน";
    }).join('\n');
    return basePrompt +
      "ข้อมูลวิเคราะห์กลุ่มเติบโต (Growth Group Tab):\n" +
      "- มีลูกค้าอยู่ในกลุ่มเติบโตโดดเด่น: " + kpis.totalGrowthCustomers + " ราย\n" +
      "- เกณฑ์ยอดขายเฉลี่ยที่เพิ่มขึ้นที่ใช้ตรวจจับ: > " + kpis.growthThreshold + " บาท/วัน\n" +
      "- เดือนก่อนหน้าที่ใช้เป็น Baseline: " + kpis.compareMonth + "\n" +
      "- รายชื่อลูกค้าเติบโตสูงสุดและยอดที่เพิ่มขึ้นรายวัน:\n" + topGrowthStr + "\n\n" +
      "โปรดวิเคราะห์แนวโน้มการเติบโต ชี้เป้าลูกค้าดาวรุ่งที่เป็นโอกาส และแนะนำวิธีเพิ่มยอดขายเพิ่มเติม (Upsell/Cross-sell) หรือขยายความสัมพันธ์กับกลุ่มนี้";
  } else if (tab === 'ls') {
    var zoneDistributionStr = JSON.stringify(kpis.zoneDistribution || {});
    return basePrompt +
      "ข้อมูลรายการลูกค้าและพื้นที่การสั่งซื้อ (Customer List Tab):\n" +
      "- จำนวนลูกค้าที่คัดกรองขณะนี้: " + kpis.totalFilteredCustomers + " ราย\n" +
      "- สัดส่วนการกระจายลูกค้าตามเขตการขาย (Zone Distribution): " + zoneDistributionStr + "\n\n" +
      "โปรดวิเคราะห์การกระจายตัวทางภูมิศาสตร์ของลูกค้า แนะนำกลยุทธ์เจาะตลาดรายเขตพื้นที่ และวิธีขยายฐานลูกค้าในเขตที่ยังมีตัวเลขน้อย";
  } else {
    return basePrompt + "ข้อมูลวิเคราะห์ทั่วไปหน้านี้:\n" + JSON.stringify(kpis) + "\n\nโปรดวิเคราะห์ข้อมูลภาพรวมนี้และให้แนวทางปฏิบัติที่ชัดเจน";
  }
}

/**
 * เรียกใช้ Gemini API โดยตรงสำหรับการวิเคราะห์หน้าจอ (คืนผลลัพธ์เป็นข้อความธรรมดา/Markdown)
 */
function callGeminiPageAnalysisAPI(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('ไม่พบข้อมูล GEMINI_API_KEY ใน Script Properties กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าคีย์');
  }

  var payload = {
    "contents": [{
      "parts": [{ "text": prompt }]
    }]
  };

  var defaultModel = PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash';
  var models = [defaultModel];
  var backups = ['gemini-2.0-flash', 'gemini-2.5-flash'];
  backups.forEach(function(m) {
    if (models.indexOf(m) < 0) models.push(m);
  });
  var lastError = '';
  var _quotaHit = false;

  for (var mIdx = 0; mIdx < models.length; mIdx++) {
    if (_quotaHit) break;
    var modelName = models[mIdx];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;

    for (var attempt = 1; attempt <= 3; attempt++) {
      try {
        var options = {
          "method": "post",
          "contentType": "application/json",
          "payload": JSON.stringify(payload),
          "muteHttpExceptions": true
        };

        var response = UrlFetchApp.fetch(url, options);
        var code = response.getResponseCode();
        var text = response.getContentText();

        if (code === 200) {
          var jsonParsed = JSON.parse(text);
          if (jsonParsed.candidates && jsonParsed.candidates[0] && jsonParsed.candidates[0].content) {
            var innerText = jsonParsed.candidates[0].content.parts[0].text;
            return innerText;
          }
          throw new Error('ไม่สามารถดึงข้อความจากการตอบกลับของ AI ได้');
        }

        var errMsg = 'HTTP ' + code;
        try {
          var errJson = JSON.parse(text);
          if (errJson.error && errJson.error.message) {
            errMsg = errJson.error.message;
          }
        } catch(e) {}

        lastError += '\n• [' + modelName + ' (รอบที่ ' + attempt + ')] ' + errMsg;

        // ตรวจจับ Quota Exceeded (Free Tier) — quota เป็น account-wide ไม่ต้องลองโมเดลอื่นเพิ่ม
        if (code === 429 && (errMsg.indexOf('free_tier') >= 0 || errMsg.toLowerCase().indexOf('quota exceeded') >= 0)) {
          _quotaHit = true;
          break;
        }
        if (code === 503 || code === 429 || code === 500) {
          Utilities.sleep(attempt * 1200);
          continue;
        } else {
          break;
        }
      } catch(e) {
        lastError += '\n• [' + modelName + ' (รอบที่ ' + attempt + ')] Exception: ' + e.message;
        Utilities.sleep(attempt * 1200);
      }
    }
  }

  if (_quotaHit) {
    throw new Error('⚠️ AI ใช้งานเกิน quota ของ Free Tier แล้ว (ขีดจำกัด 20 ครั้ง/นาที) กรุณารอ 1-2 นาทีแล้วลองใหม่ หรือติดต่อผู้ดูแลระบบเพื่ออัปเกรด Gemini API plan');
  }
  throw new Error('การส่งข้อมูลให้ AI วิเคราะห์ล้มเหลวทุกช่องทาง:' + lastError);
}

// ============================================================
//  Unified AI Service Dispatcher (Gemini & OpenAI)
// ============================================================

function callAiFollowupAPI(customerData) {
  var provider = PropertiesService.getScriptProperties().getProperty('AI_PROVIDER') || 'gemini';
  var model = '';
  var result = null;
  if (provider === 'openai') {
    model = PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';
    result = callOpenAiFollowupAPI(customerData);
  } else {
    model = PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash';
    result = callGeminiFollowupAPI(customerData);
  }
  if (result) {
    result.provider = provider;
    result.model = model;
  }
  return result;
}

function callAiTroubleAPI(category, customerCode, description) {
  var provider = PropertiesService.getScriptProperties().getProperty('AI_PROVIDER') || 'gemini';
  var model = '';
  var result = null;
  if (provider === 'openai') {
    model = PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';
    result = callOpenAiTroubleAPI(category, customerCode, description);
  } else {
    model = PropertiesService.getScriptProperties().getProperty('GEMINI_DEFAULT_MODEL') || 'gemini-2.0-flash';
    result = callGeminiTroubleAPI(category, customerCode, description);
  }
  if (result) {
    result.provider = provider;
    result.model = model;
  }
  return result;
}

function callAiPageAnalysisAPI(prompt) {
  var provider = PropertiesService.getScriptProperties().getProperty('AI_PROVIDER') || 'gemini';
  if (provider === 'openai') {
    return callOpenAiPageAnalysisAPI(prompt);
  } else {
    return callGeminiPageAnalysisAPI(prompt);
  }
}

// ============================================================
//  OpenAI API Service Functions
// ============================================================

function callOpenAiFollowupAPI(customerData) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('ไม่พบข้อมูล OPENAI_API_KEY ใน Script Properties กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าคีย์');
  }

  var pctChangeText = '—';
  if (customerData.prevAvg && customerData.prevAvg > 0) {
    var pct = (customerData.diffAvg / customerData.prevAvg) * 100;
    pctChangeText = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  }

  var jsonInstruction = '\n\n' +
           'กรุณาตอบกลับเป็นรูปแบบ JSON ดิบเท่านั้น ห้ามมีคำอธิบายประกอบหน้าหลัง ห้ามมี markdown code blocks (```json ... ```) ครอบเด็ดขาด โดยมีโครงสร้างดังนี้:\n' +
           '{\n' +
           '  "summary": "ข้อสรุปทิศทางปัญหาของลูกค้ารายนี้ (ภาษาไทย สรุปกระชับความยาว 2-3 บรรทัด สำหรับแสดงผลบนมือถือ/หน้าเว็บ)",\n' +
           '  "guideline": "แนวทางการปฏิบัติและการติดตามลูกค้าอย่างละเอียดเป็นข้อๆ สำหรับส่งเข้าอีเมล (ภาษาไทย ประกอบด้วยหัวข้อย่อยเช่น: 1. การวิเคราะห์ปัญหาเบื้องต้น 2. บทสนทนาการโทรเจรจา (Call Script) 3. ข้อเสนอหรือสิทธิประโยชน์ที่แนะนำเพื่อช่วยฟื้นฟูหรือกระตุ้นยอดขาย)"\n' +
           '}';

  var customPrompt = PropertiesService.getScriptProperties().getProperty('SYSTEM_PROMPT_FOLLOWUP');
  var prompt = '';
  if (customPrompt) {
    prompt = customPrompt + '\n\n' +
             'ชื่อลูกค้า: ' + (customerData.name || '-') + ' (รหัส: ' + (customerData.code || '-') + ')\n' +
             'กลุ่มประเภท: ' + (customerData.segment === 'risk' ? 'กลุ่มเสี่ยง (ยอดขายตก)' : customerData.segment === 'growth' ? 'กลุ่มเติบโต (ยอดขายเพิ่มขึ้น/มีโอกาสต่อยอด)' : 'ปกติ') + '\n' +
             'ผู้ดูแล (Agent Name): ' + (customerData.agentName || '-') + '\n' +
             'พิกัดที่ตั้ง: โซน ' + (customerData.zone || '-') + ' / จังหวัด ' + (customerData.province || '-') + '\n' +
             'แพ็กเกจปัจจุบัน: ' + (customerData.package || '-') + '\n\n' +
             'เปรียบเทียบยอดขายเฉลี่ยรายวัน (Revenue/day MTD):\n' +
             '- เดือนฐานเปรียบเทียบ: ' + Math.round(customerData.prevAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- เดือนปัจจุบัน: ' + Math.round(customerData.curAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- ผลต่างเฉลี่ยต่อวัน: ' + Math.round(customerData.diffAvg || 0).toLocaleString() + ' บาท/วัน (' + pctChangeText + ')\n\n' +
             'เปรียบเทียบจำนวนชิ้นเฉลี่ยหรือสะสมรายเดือน:\n' +
             '- จำนวนชิ้นเดือนฐาน: ' + Math.round(customerData.prevVol || 0).toLocaleString() + ' ชิ้น\n' +
             '- จำนวนชิ้นเดือนปัจจุบัน: ' + Math.round(customerData.curVol || 0).toLocaleString() + ' ชิ้น\n\n' +
             'สัญญาณเตือนหรือเหตุผลการจัดกลุ่ม: ' + (customerData.priority || 'ติดตามสถานะทั่วไป') +
             jsonInstruction;
  } else {
    prompt = 'คุณเป็นผู้เชี่ยวชาญด้านกลยุทธ์การบริหารความสัมพันธ์ลูกค้า (CRM) และการฟื้นฟูยอดขายในประเทศไทย\n' +
             'กรุณาวิเคราะห์ข้อมูลตัวชี้วัดของลูกค้ารายนี้ เพื่อร่างแผนงานติดตามและบทสนทนาการเจรจาเจาะลึกเฉพาะราย:\n\n' +
             'ชื่อลูกค้า: ' + (customerData.name || '-') + ' (รหัส: ' + (customerData.code || '-') + ')\n' +
             'กลุ่มประเภท: ' + (customerData.segment === 'risk' ? 'กลุ่มเสี่ยง (ยอดขายตก)' : customerData.segment === 'growth' ? 'กลุ่มเติบโต (ยอดขายเพิ่มขึ้น/มีโอกาสต่อยอด)' : 'ปกติ') + '\n' +
             'ผู้ดูแล (Agent Name): ' + (customerData.agentName || '-') + '\n' +
             'พิกัดที่ตั้ง: โซน ' + (customerData.zone || '-') + ' / จังหวัด ' + (customerData.province || '-') + '\n' +
             'แพ็กเกจปัจจุบัน: ' + (customerData.package || '-') + '\n\n' +
             'เปรียบเทียบยอดขายเฉลี่ยรายวัน (Revenue/day MTD):\n' +
             '- เดือนฐานเปรียบเทียบ: ' + Math.round(customerData.prevAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- เดือนปัจจุบัน: ' + Math.round(customerData.curAvg || 0).toLocaleString() + ' บาท/วัน\n' +
             '- ผลต่างเฉลี่ยต่อวัน: ' + Math.round(customerData.diffAvg || 0).toLocaleString() + ' บาท/วัน (' + pctChangeText + ')\n\n' +
             'เปรียบเทียบจำนวนชิ้นเฉลี่ยหรือสะสมรายเดือน:\n' +
             '- จำนวนชิ้นเดือนฐาน: ' + Math.round(customerData.prevVol || 0).toLocaleString() + ' ชิ้น\n' +
             '- จำนวนชิ้นเดือนปัจจุบัน: ' + Math.round(customerData.curVol || 0).toLocaleString() + ' ชิ้น\n\n' +
             'สัญญาณเตือนหรือเหตุผลการจัดกลุ่ม: ' + (customerData.priority || 'ติดตามสถานะทั่วไป') +
             jsonInstruction;
  }

  var defaultModel = PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';
  var payload = {
    "model": defaultModel,
    "messages": [{ "role": "user", "content": prompt }],
    "response_format": { "type": "json_object" }
  };

  var url = 'https://api.openai.com/v1/chat/completions';
  var lastError = '';

  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var options = {
        "method": "post",
        "headers": {
          "Authorization": "Bearer " + apiKey
        },
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };

      var response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      var text = response.getContentText();

      if (code === 200) {
        var jsonParsed = JSON.parse(text);
        if (jsonParsed.choices && jsonParsed.choices[0] && jsonParsed.choices[0].message) {
          var innerText = jsonParsed.choices[0].message.content;
          if (innerText.indexOf('```') >= 0) {
            innerText = innerText.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          return JSON.parse(innerText);
        }
        throw new Error('โครงสร้างข้อความไม่ตรงกับเป้าหมาย');
      }

      var errMsg = 'HTTP ' + code;
      try {
        var errJson = JSON.parse(text);
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch(e) {}

      lastError += '\n• [OpenAI (รอบที่ ' + attempt + ')] ' + errMsg;
      if (code === 429 || code === 500 || code === 503) {
        Utilities.sleep(attempt * 1200);
        continue;
      } else {
        break;
      }
    } catch(e) {
      lastError += '\n• [OpenAI (รอบที่ ' + attempt + ')] Exception: ' + e.message;
      Utilities.sleep(attempt * 1200);
    }
  }

  throw new Error('การส่งข้อมูลให้ OpenAI วิเคราะห์ล้มเหลว:' + lastError);
}

function callOpenAiTroubleAPI(category, customerCode, description) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('ไม่พบข้อมูล OPENAI_API_KEY ใน Script Properties กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าคีย์');
  }

  var jsonInstruction = '\n\n' +
           'กรุณาวิเคราะห์เพื่อช่วยสรุปและแก้ไขปัญหานี้ โดยส่งผลลัพธ์กลับเป็นรูปแบบ JSON ดิบเท่านั้น ห้ามมีคำอธิบายประกอบหน้าหลัง ห้ามมี markdown code blocks (```json ... ```) ครอบเด็ดขาด โดยมีโครงสร้างดังนี้:\n' +
           '{\n' +
           '  "summary": "สรุปประเด็นปัญหาเชิงเทคนิคแบบกระชับความยาว 1-2 บรรทัด (ภาษาไทย)",\n' +
           '  "troubleshooting": "แนวทางการตรวจสอบเบื้องต้นและวิธีแก้ไขปัญหาแบบทีละขั้นตอนเป็นข้อๆ สำหรับส่งอีเมลตอบกลับผู้ใช้งาน (ภาษาไทย ประกอบด้วยหัวข้อย่อยและขั้นตอนที่ชัดเจน เช่น 1. การตั้งค่าเบื้องต้น 2. ขั้นตอนแก้ไข 3. คำแนะนำเพิ่มเติม)"\n' +
           '}';

  var customPrompt = PropertiesService.getScriptProperties().getProperty('SYSTEM_PROMPT_TROUBLE');
  var prompt = '';
  if (customPrompt) {
    prompt = customPrompt + '\n\n' +
             '- หมวดหมู่ปัญหา: ' + (category || '-') + '\n' +
             '- รหัสลูกค้าที่พบปัญหา (ถ้ามี): ' + (customerCode || '-') + '\n' +
             '- รายละเอียดของปัญหา: ' + (description || '-') +
             jsonInstruction;
  } else {
    prompt = 'คุณเป็นผู้เชี่ยวชาญการช่วยเหลือเชิงเทคนิคและซอฟต์แวร์ขององค์กร (Technical Support Expert)\n' +
             'ผู้ใช้งานระบบได้ส่งรายงานปัญหาเข้ามา ดังนี้:\n\n' +
             '- หมวดหมู่ปัญหา: ' + (category || '-') + '\n' +
             '- รหัสลูกค้าที่พบปัญหา (ถ้ามี): ' + (customerCode || '-') + '\n' +
             '- รายละเอียดของปัญหา: ' + (description || '-') +
             jsonInstruction;
  }

  var defaultModel = PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';
  var payload = {
    "model": defaultModel,
    "messages": [{ "role": "user", "content": prompt }],
    "response_format": { "type": "json_object" }
  };

  var url = 'https://api.openai.com/v1/chat/completions';
  var lastError = '';

  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var options = {
        "method": "post",
        "headers": {
          "Authorization": "Bearer " + apiKey
        },
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };

      var response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      var text = response.getContentText();

      if (code === 200) {
        var jsonParsed = JSON.parse(text);
        if (jsonParsed.choices && jsonParsed.choices[0] && jsonParsed.choices[0].message) {
          var innerText = jsonParsed.choices[0].message.content;
          if (innerText.indexOf('```') >= 0) {
            innerText = innerText.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          return JSON.parse(innerText);
        }
        throw new Error('โครงสร้างข้อความไม่ตรงกับเป้าหมาย');
      }

      var errMsg = 'HTTP ' + code;
      try {
        var errJson = JSON.parse(text);
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch(e) {}

      lastError += '\n• [OpenAI (รอบที่ ' + attempt + ')] ' + errMsg;
      if (code === 429 || code === 500 || code === 503) {
        Utilities.sleep(attempt * 1200);
        continue;
      } else {
        break;
      }
    } catch(e) {
      lastError += '\n• [OpenAI (รอบที่ ' + attempt + ')] Exception: ' + e.message;
      Utilities.sleep(attempt * 1200);
    }
  }

  throw new Error('การส่งข้อมูลให้ OpenAI วิเคราะห์ล้มเหลว:' + lastError);
}

function callOpenAiPageAnalysisAPI(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('ไม่พบข้อมูล OPENAI_API_KEY ใน Script Properties กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าคีย์');
  }

  var defaultModel = PropertiesService.getScriptProperties().getProperty('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';
  var payload = {
    "model": defaultModel,
    "messages": [{ "role": "user", "content": prompt }]
  };

  var url = 'https://api.openai.com/v1/chat/completions';
  var lastError = '';

  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var options = {
        "method": "post",
        "headers": {
          "Authorization": "Bearer " + apiKey
        },
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };

      var response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      var text = response.getContentText();

      if (code === 200) {
        var jsonParsed = JSON.parse(text);
        if (jsonParsed.choices && jsonParsed.choices[0] && jsonParsed.choices[0].message) {
          var innerText = jsonParsed.choices[0].message.content;
          return innerText;
        }
        throw new Error('ไม่สามารถดึงข้อความจากการตอบกลับของ AI ได้');
      }

      var errMsg = 'HTTP ' + code;
      try {
        var errJson = JSON.parse(text);
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch(e) {}

      lastError += '\n• [OpenAI (รอบที่ ' + attempt + ')] ' + errMsg;
      if (code === 429 || code === 500 || code === 503) {
        Utilities.sleep(attempt * 1200);
        continue;
      } else {
        break;
      }
    } catch(e) {
      lastError += '\n• [OpenAI (รอบที่ ' + attempt + ')] Exception: ' + e.message;
      Utilities.sleep(attempt * 1200);
    }
  }

  throw new Error('การส่งข้อมูลให้ OpenAI วิเคราะห์ล้มเหลว:' + lastError);
}
