// ===== PHASE 2 WORKSPACE: real data binding =====
// Scope: A1 Remove Mock Data, E1 Target Progress, B5 Daily Task Progress
// This file is intentionally additive so the large legacy Scripts.html can be patched safely later.

function phase2Money(value){
  var n = Number(value || 0);
  if(!isFinite(n)) n = 0;
  return '฿' + n.toLocaleString('th-TH', {maximumFractionDigits: 0});
}

function phase2Num(value){
  var n = Number(value || 0);
  if(!isFinite(n)) n = 0;
  return n.toLocaleString('th-TH', {maximumFractionDigits: 0});
}

function phase2Pct(value){
  var n = Number(value || 0);
  if(!isFinite(n)) n = 0;
  return n.toLocaleString('th-TH', {maximumFractionDigits: 1}) + '%';
}

function phase2Rows(){
  return (typeof FR !== 'undefined' && FR && FR.length) ? FR : ((typeof R !== 'undefined' && R) ? R : []);
}

function phase2GetMonth(){
  if(typeof getMC === 'function') return getMC();
  return (typeof CUR_MONTH !== 'undefined' && CUR_MONTH) ? CUR_MONTH : ((typeof MONTHS !== 'undefined' && MONTHS[0]) ? MONTHS[0] : null);
}

function phase2GetPrevMonth(){
  if(typeof getMP === 'function') return getMP();
  return (typeof PREV_MONTH !== 'undefined') ? PREV_MONTH : null;
}

function phase2GetTarget(monthKey){
  var user = (typeof _currentUser !== 'undefined') ? _currentUser : null;
  var username = user && (user.username || user.displayName);
  if(monthKey && username && typeof _bdMonthlyTargets !== 'undefined' && _bdMonthlyTargets[monthKey] && _bdMonthlyTargets[monthKey][username]){
    return _bdMonthlyTargets[monthKey][username];
  }
  if(monthKey && typeof _monthlyTargets !== 'undefined' && _monthlyTargets[monthKey]) return _monthlyTargets[monthKey];
  return null;
}

function phase2BuildWorkspaceData(){
  var rows = phase2Rows();
  var m = phase2GetMonth();
  var mp = phase2GetPrevMonth();
  if(!m || !m.colRev){
    return { ok:false, message:'ไม่พบข้อมูลเดือนสำหรับคำนวณ Workspace' };
  }
  var actual = 0;
  var prev = 0;
  var vol = 0;
  var activeAgents = 0;
  var riskAgents = 0;
  rows.forEach(function(r){
    var rev = (typeof N === 'function') ? N(r[m.colRev]) : Number(r[m.colRev] || 0);
    var pRev = (mp && mp.colRev) ? ((typeof N === 'function') ? N(r[mp.colRev]) : Number(r[mp.colRev] || 0)) : 0;
    var v = m.colVol ? ((typeof N === 'function') ? N(r[m.colVol]) : Number(r[m.colVol] || 0)) : 0;
    actual += rev;
    prev += pRev;
    vol += v;
    if(rev > 0 || v > 0) activeAgents++;
    if(pRev > 0 && rev < pRev * 0.7) riskAgents++;
  });
  var targetObj = phase2GetTarget(m.key);
  var target = targetObj ? Number(targetObj.value || targetObj.target || 0) : 0;
  var percent = target > 0 ? Math.min(999, actual / target * 100) : 0;
  var remaining = Math.max(0, target - actual);
  var daysElapsed = (typeof getDAY1ForMonth === 'function') ? getDAY1ForMonth(m.key) : Math.max(1, new Date().getDate() - 1);
  var daysTotal = daysElapsed;
  try{
    var idx = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(String(m.key||'').toLowerCase());
    if(idx >= 0) daysTotal = new Date(Number(typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : new Date().getFullYear()), idx + 1, 0).getDate();
  }catch(e){}
  var daysLeft = Math.max(1, daysTotal - daysElapsed);
  var requiredPerDay = target > 0 ? remaining / daysLeft : 0;
  var diffPct = prev > 0 ? ((actual - prev) / prev * 100) : 0;
  return {
    ok:true,
    rows:rows,
    month:m,
    prevMonth:mp,
    actual:actual,
    prev:prev,
    volume:vol,
    activeAgents:activeAgents,
    riskAgents:riskAgents,
    target:target,
    hasTarget:target > 0,
    percent:percent,
    remaining:remaining,
    requiredPerDay:requiredPerDay,
    diffPct:diffPct,
    daysElapsed:daysElapsed,
    daysTotal:daysTotal
  };
}

function phase2BuildDailyProgress(){
  var rows = phase2Rows();
  var total = rows.length;
  var done = 0, success = 0, fail = 0, pending = 0, noStatus = 0;
  rows.forEach(function(r){
    var status = String(r.Status || r.status || r['Tracking Status'] || r['สถานะ'] || '').toLowerCase();
    if(!status){ noStatus++; return; }
    if(status.indexOf('success') >= 0 || status.indexOf('สำเร็จ') >= 0){ done++; success++; return; }
    if(status.indexOf('fail') >= 0 || status.indexOf('ไม่สำเร็จ') >= 0){ done++; fail++; return; }
    if(status.indexOf('contact') >= 0 || status.indexOf('โทร') >= 0 || status.indexOf('ติดตาม') >= 0){ done++; return; }
    pending++;
  });
  return { total: total, done: done, pending: pending, success: success, fail: fail, noStatus: noStatus, pct: total > 0 ? done / total * 100 : 0 };
}

function phase2RenderBdWorkspace(targetId){
  var el = document.getElementById(targetId || 'phase2_bd_workspace');
  if(!el) return;
  var d = phase2BuildWorkspaceData();
  if(!d.ok){
    if(typeof renderEmpty === 'function') renderEmpty(el, d.message);
    else el.innerHTML = '<div class="ui-state">'+d.message+'</div>';
    return;
  }
  if(!d.rows.length){
    if(typeof renderEmpty === 'function') renderEmpty(el, 'ไม่มีข้อมูลตาม filter ปัจจุบัน');
    else el.innerHTML = '<div class="ui-state">ไม่มีข้อมูลตาม filter ปัจจุบัน</div>';
    return;
  }
  var t = phase2BuildDailyProgress();
  var user = (typeof _currentUser !== 'undefined' && _currentUser) ? _currentUser : {};
  var name = user.displayName || user.username || 'Business Development';
  var monthLabel = d.month.th || d.month.en || d.month.key || '-';
  var progWidth = Math.max(0, Math.min(100, d.percent));
  el.innerHTML = ''+
    '<div class="phase2-wrap">'+
      '<div class="phase2-head">'+
        '<div><div class="phase2-title">BD Workspace</div><div class="phase2-sub">ข้อมูลจริงจาก Raw KPI / Tracking / Target · '+_uiText(monthLabel)+'</div></div>'+
        '<div class="phase2-chip">'+_uiText(name)+'</div>'+
      '</div>'+
      '<div class="phase2-grid">'+
        '<div class="phase2-card phase2-card-wide">'+
          '<div class="phase2-card-label">Target Progress</div>'+
          '<div class="phase2-progress-row"><strong>'+phase2Pct(d.percent)+'</strong><span>'+(d.hasTarget ? phase2Money(d.actual)+' / '+phase2Money(d.target) : 'ยังไม่ตั้งเป้า')+'</span></div>'+
          '<div class="phase2-progress"><div style="width:'+progWidth+'%"></div></div>'+
          '<div class="phase2-muted">'+(d.hasTarget ? 'เหลืออีก '+phase2Money(d.remaining)+' · ต้องทำเฉลี่ย '+phase2Money(d.requiredPerDay)+'/วัน' : 'ตั้ง target แล้วระบบจะคำนวณ progress อัตโนมัติ')+'</div>'+
        '</div>'+
        '<div class="phase2-card"><div class="phase2-card-label">รายได้ MTD</div><div class="phase2-value">'+phase2Money(d.actual)+'</div><div class="phase2-muted">'+phase2Pct(d.diffPct)+' vs เดือนก่อน</div></div>'+
        '<div class="phase2-card"><div class="phase2-card-label">Active Agents</div><div class="phase2-value">'+phase2Num(d.activeAgents)+'</div><div class="phase2-muted">จาก '+phase2Num(d.rows.length)+' agents</div></div>'+
        '<div class="phase2-card"><div class="phase2-card-label">Risk Agents</div><div class="phase2-value">'+phase2Num(d.riskAgents)+'</div><div class="phase2-muted">ยอดลดเกิน 30% vs เดือนก่อน</div></div>'+
        '<div class="phase2-card phase2-card-wide">'+
          '<div class="phase2-card-label">Daily Task Progress</div>'+
          '<div class="phase2-progress-row"><strong>'+phase2Pct(t.pct)+'</strong><span>Done '+phase2Num(t.done)+' / '+phase2Num(t.total)+'</span></div>'+
          '<div class="phase2-progress"><div style="width:'+Math.max(0,Math.min(100,t.pct))+'%"></div></div>'+
          '<div class="phase2-task-row"><span>Pending '+phase2Num(t.pending)+'</span><span>Success '+phase2Num(t.success)+'</span><span>Fail '+phase2Num(t.fail)+'</span><span>No status '+phase2Num(t.noStatus)+'</span></div>'+
        '</div>'+
      '</div>'+
    '</div>';
}

function phase2RefreshWorkspace(){
  phase2RenderBdWorkspace('phase2_bd_workspace');
}
