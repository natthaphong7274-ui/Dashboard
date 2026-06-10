# -*- coding: utf-8 -*-
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'c:\Users\User\OneDrive\Desktop\Dashboard\src\Scripts.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. New keys to add
new_keys = {
    'home.am.agentsCompareVsMonth': { 'th': 'Agents เทียบรายตัว vs {0}', 'en': 'Individual agents vs {0}' },
    'home.am.revIncreased': { 'th': '▲ Rev เพิ่มขึ้น', 'en': '▲ Rev Increased' },
    'home.am.revDecreased': { 'th': '▼ Rev ลดลง', 'en': '▼ Rev Decreased' },
    'home.am.revStable': { 'th': '— ทรงตัว', 'en': '— Stable' },
    'home.am.growthDetail': { 'th': 'กลุ่มเติบโต — รายละเอียด', 'en': 'Growth Group — Details' },
    'home.am.growthDesc': { 'th': 'Agents ที่ Avg/วัน เพิ่มขึ้น vs เดือนก่อน', 'en': 'Agents with Avg/day increase vs prev month' },
    'label.piecesPerMonth': { 'th': 'ชิ้น/เดือน', 'en': 'pcs/month' },
    'home.am.growthAgents': { 'th': 'Agents เติบโต', 'en': 'Growth Agents' },
    'home.am.viewAllList': { 'th': 'ดูรายชื่อทั้งหมด →', 'en': 'View all list →' }
}

dict_lines = []
for k, v in new_keys.items():
    th_val = v["th"].replace("'", "\\'")
    en_val = v["en"].replace("'", "\\'")
    dict_lines.append(f"    '{k}': {{ th: '{th_val}', en: '{en_val}' }},")

dict_block = "\n".join(dict_lines)
target_dict_end = "'home.noRevenueThisMonth': { th: 'ไม่มีรายได้เดือนนี้', en: 'No revenue this month' }"

if target_dict_end in content:
    replacement = target_dict_end + ",\n" + dict_block
    content = content.replace(target_dict_end, replacement)
    print("SUCCESS: Extended APP_I18N dictionary.")
else:
    print("ERROR: Could not find target_dict_end in Scripts.html.")
    sys.exit(1)

# Canonicalize
def clean_str(s):
    return s.replace('\r\n', '\n')

content_clean = clean_str(content)

# 2. Replacements in active AM dashboard
am_replacements = [
    ("am-stat-lbl\" style=\"margin-bottom:8px\">Agents เทียบรายตัว vs ' + mp.th", "am-stat-lbl\" style=\"margin-bottom:8px\">' + t('home.am.agentsCompareVsMonth', [mp.th])"),
    ("_amStatBox('▲ Rev เพิ่มขึ้น', momGainCount", "_amStatBox(t('home.am.revIncreased'), momGainCount"),
    ("_amStatBox('▼ Rev ลดลง', momLossCount", "_amStatBox(t('home.am.revDecreased'), momLossCount"),
    ("_amStatBox('— ทรงตัว', momSameCount", "_amStatBox(t('home.am.revStable'), momSameCount"),
    ("_amSecHdr('🌱', 'กลุ่มเติบโต — รายละเอียด', 'Agents ที่ Avg/วัน เพิ่มขึ้น vs เดือนก่อน'",
     "_amSecHdr('🌱', t('home.am.growthDetail'), t('home.am.growthDesc')"),
    ("growthSorted.length + ' ราย'", "growthSorted.length + ' ' + t('label.agentsUnit')"),
    ("_amStatBox('Revenue Gain', '+' + fmtS(Math.round(growthRevGain)), 'vs เดือนก่อน'",
     "_amStatBox('Revenue Gain', '+' + fmtS(Math.round(growthRevGain)), t('home.vsPrevMonth')"),
    ("_amStatBox('Volume Gain', '+' + fmtInt(Math.round(growthVolGain)), 'ชิ้น/เดือน'",
     "_amStatBox('Volume Gain', '+' + fmtInt(Math.round(growthVolGain)), t('label.piecesPerMonth')"),
    ("_amStatBox('% ของ Zone', (totLeads > 0 ? (growthSorted.length / totLeads * 100).toFixed(0) : 0) + '%', 'Agents เติบโต'",
     "_amStatBox(t('home.metric.pctOfZone'), (totLeads > 0 ? (growthSorted.length / totLeads * 100).toFixed(0) : 0) + '%', t('home.am.growthAgents')"),
    ("if (growthSorted.length > 8) html += '<div style=\"text-align:center;font-size:10px;color:var(--t2);padding:5px\">+' + (growthSorted.length - 8) + ' รายอื่น</div>';",
     "if (growthSorted.length > 8) html += '<div style=\"text-align:center;font-size:10px;color:var(--t2);padding:5px\">+' + (growthSorted.length - 8) + ' ' + t('label.otherAgents') + '</div>';"),
    ("_amViewBtn('ดูรายชื่อทั้งหมด →', \"swMain('growth')\"", "_amViewBtn(t('home.am.viewAllList'), \"swMain('growth')\""),
    ("html += _amViewBtn(t('home.am.viewAllList'), \"swMain('growth')\", '#86efac', 'var(--gn)', '#f0fdf4')\n          + '</div>';",
     "html += _amViewBtn(t('home.am.viewAllList'), \"swMain('growth')\", '#86efac', 'var(--gn)', '#f0fdf4')\n          + '</div>';")
]

replaced_count = 0
for target, replacement in am_replacements:
    target_clean = clean_str(target)
    replacement_clean = clean_str(replacement)
    if target_clean in content_clean:
        content_clean = content_clean.replace(target_clean, replacement_clean)
        replaced_count += 1
    else:
        print(f"WARNING: Could not find target: {target_clean}")

# 3. Wrapping the legacy loss IIFE in if (false) to prevent layout breakages
legacy_loss_target = """        // ── Loss Group Detail Panel (right of Growth) ──
        (function () {
          var lossRows35 = []; // T03
          var lossSorted35 = lossRows35.slice().sort(function (a, b) {
            var dropA = mp ? N(a[mp.colRev]) - N(a[m.colRev]) : 0;
            var dropB = mp ? N(b[mp.colRev]) - N(b[m.colRev]) : 0;
            return dropB - dropA;
          });
          var lossRevTotal35 = lossSorted35.reduce(function (s, r) { return s + N(r[m.colRev]); }, 0);
          var lossVolTotal35 = lossSorted35.reduce(function (s, r) { return s + N(r[m.colVol]); }, 0);
          var lossRevDrop35 = mp ? lossSorted35.reduce(function (s, r) { return s + Math.max(0, N(r[mp.colRev]) - N(r[m.colRev])); }, 0) : 0;
          var lossVolDrop35 = mp ? lossSorted35.reduce(function (s, r) { return s + Math.max(0, N(r[mp.colVol]) - N(r[m.colVol])); }, 0) : 0;
          var lossPctOfZone35 = myRows.length > 0 ? (lossSorted35.length / myRows.length * 100).toFixed(0) : 0;
          var lossByZone35 = {};
          lossSorted35.forEach(function (r) {
            var z = String(r[COL.zoneName] || '?');
            if (!lossByZone35[z]) lossByZone35[z] = { count: 0, revDrop: 0 };
            lossByZone35[z].count++;
            if (mp) lossByZone35[z].revDrop += Math.max(0, N(r[mp.colRev]) - N(r[m.colRev]));
          });


          // By-zone bars — unified
          (function () {
            var lossZoneMap = {};
            Object.keys(lossByZone35).forEach(function (z) {
              var zd = lossByZone35[z];
              lossZoneMap[z] = { count: zd.count, extra: mp && zd.revDrop > 0 ? ' · -' + fmtS(Math.round(zd.revDrop)) : '' };
            });
            html += _amZoneBars(lossZoneMap, lossSorted35.length, '#fca5a5');
          })();

          // Agent table — unified am-tbl
          html += _amTblHdr('Agent', mp ? _monthLabel(mp) : t('label.previous'), '<span style="color:#c2410c">AVG Rev</span>', mp ? _monthLabel(mp) : t('label.previous'), '<span style="color:#991b1b">AVG Vol</span>', '%Chg', '#fca5a5');
          lossSorted35.slice(0, 8).forEach(function (r, i) {
            var rv = N(r[m.colRev]), vol = N(r[m.colVol]);
            var prv = mp ? N(r[mp.colRev]) : null, prvVol = mp ? N(r[mp.colVol]) : null;
            var pct = (prv && prv > 0) ? Math.round((rv - prv) / prv * 100) : null;
            var pctTxt = pct !== null ? '<span style="color:' + (pct < 0 ? '#c2410c' : '#64748b') + '">' + pct + '%</span>' : '—';
            html += _amTblRow(
              String(r[COL.agentCode] || '-'),
              prv !== null ? fmtS(Math.round(prv)) : '—',
              fmtS(Math.round(rv)),
              prvVol !== null ? fmtInt(Math.round(prvVol)) : '—',
              fmtInt(Math.round(vol)),
              pctTxt,
              i % 2 === 0 ? '#fff5f5' : 'transparent',
              '#c2410c', '#991b1b'
            );
          });
          if (lossSorted35.length > 8) html += '<div style="text-align:center;font-size:10px;color:var(--t2);padding:5px">+' + (lossSorted35.length - 8) + ' ' + t('label.otherAgents') + '</div>';
          html += _amViewBtn('ดูรายชื่อทั้งหมด →', "swMain('risk')", '#fca5a5', 'var(--rd)', '#fff5f5')
            + '</div>';
        })();"""

legacy_loss_replacement = """        if (false) {
        // ── Loss Group Detail Panel (right of Growth) ──
        (function () {
          var lossRows35 = []; // T03
          var lossSorted35 = lossRows35.slice().sort(function (a, b) {
            var dropA = mp ? N(a[mp.colRev]) - N(a[m.colRev]) : 0;
            var dropB = mp ? N(b[mp.colRev]) - N(b[m.colRev]) : 0;
            return dropB - dropA;
          });
          var lossRevTotal35 = lossSorted35.reduce(function (s, r) { return s + N(r[m.colRev]); }, 0);
          var lossVolTotal35 = lossSorted35.reduce(function (s, r) { return s + N(r[m.colVol]); }, 0);
          var lossRevDrop35 = mp ? lossSorted35.reduce(function (s, r) { return s + Math.max(0, N(r[mp.colRev]) - N(r[m.colRev])); }, 0) : 0;
          var lossVolDrop35 = mp ? lossSorted35.reduce(function (s, r) { return s + Math.max(0, N(r[mp.colVol]) - N(r[m.colVol])); }, 0) : 0;
          var lossPctOfZone35 = myRows.length > 0 ? (lossSorted35.length / myRows.length * 100).toFixed(0) : 0;
          var lossByZone35 = {};
          lossSorted35.forEach(function (r) {
            var z = String(r[COL.zoneName] || '?');
            if (!lossByZone35[z]) lossByZone35[z] = { count: 0, revDrop: 0 };
            lossByZone35[z].count++;
            if (mp) lossByZone35[z].revDrop += Math.max(0, N(r[mp.colRev]) - N(r[m.colRev]));
          });


          // By-zone bars — unified
          (function () {
            var lossZoneMap = {};
            Object.keys(lossByZone35).forEach(function (z) {
              var zd = lossByZone35[z];
              lossZoneMap[z] = { count: zd.count, extra: mp && zd.revDrop > 0 ? ' · -' + fmtS(Math.round(zd.revDrop)) : '' };
            });
            html += _amZoneBars(lossZoneMap, lossSorted35.length, '#fca5a5');
          })();

          // Agent table — unified am-tbl
          html += _amTblHdr('Agent', mp ? _monthLabel(mp) : t('label.previous'), '<span style="color:#c2410c">AVG Rev</span>', mp ? _monthLabel(mp) : t('label.previous'), '<span style="color:#991b1b">AVG Vol</span>', '%Chg', '#fca5a5');
          lossSorted35.slice(0, 8).forEach(function (r, i) {
            var rv = N(r[m.colRev]), vol = N(r[m.colVol]);
            var prv = mp ? N(r[mp.colRev]) : null, prvVol = mp ? N(r[mp.colVol]) : null;
            var pct = (prv && prv > 0) ? Math.round((rv - prv) / prv * 100) : null;
            var pctTxt = pct !== null ? '<span style="color:' + (pct < 0 ? '#c2410c' : '#64748b') + '">' + pct + '%</span>' : '—';
            html += _amTblRow(
              String(r[COL.agentCode] || '-'),
              prv !== null ? fmtS(Math.round(prv)) : '—',
              fmtS(Math.round(rv)),
              prvVol !== null ? fmtInt(Math.round(prvVol)) : '—',
              fmtInt(Math.round(vol)),
              pctTxt,
              i % 2 === 0 ? '#fff5f5' : 'transparent',
              '#c2410c', '#991b1b'
            );
          });
          if (lossSorted35.length > 8) html += '<div style="text-align:center;font-size:10px;color:var(--t2);padding:5px">+' + (lossSorted35.length - 8) + ' ' + t('label.otherAgents') + '</div>';
          html += _amViewBtn(t('home.am.viewAllList'), "swMain('risk')", '#fca5a5', 'var(--rd)', '#fff5f5')
            + '</div>';
        })();
        }"""

legacy_loss_target_clean = clean_str(legacy_loss_target)
legacy_loss_replacement_clean = clean_str(legacy_loss_replacement)

# Try literal replacement of legacy loss block
if legacy_loss_target_clean in content_clean:
    content_clean = content_clean.replace(legacy_loss_target_clean, legacy_loss_replacement_clean)
    print("SUCCESS: Wrapped legacy loss IIFE in if (false).")
else:
    # Try with single quotes
    legacy_loss_target_no_esc = legacy_loss_target_clean.replace("\\'", "'").replace('\\"', '"')
    if legacy_loss_target_no_esc in content_clean:
        content_clean = content_clean.replace(legacy_loss_target_no_esc, legacy_loss_replacement_clean)
        print("SUCCESS: Wrapped legacy loss IIFE in if (false).")
    else:
        print("WARNING: Could not find legacy loss IIFE in Scripts.html.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content_clean)

print(f"SUCCESS: Replaced {replaced_count} out of {len(am_replacements)} AM strings.")
