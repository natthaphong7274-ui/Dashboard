// ===== PHASE 2 WORKSPACE: real data binding =====
// Scope: A1 Remove Mock Data, E1 Target Progress, B5 Daily Task Progress
// Additive integration layer. It safely overrides the mock BD home DOM after legacy render.

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
function phase2Esc(value){
  if(typeof _uiText === 'function') return _uiText(value);
  return String(value == null ? '' : value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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
  if(monthKey && username && typeof _bdMonthlyTargets !== 'undefined' && _bdMonthlyTargets[monthKey] && _bdMonthlyTargets[monthKey][username]) return _bdMonthlyTargets[monthKey][username];
  if(monthKey && typeof _monthlyTargets !== 'undefined' && _monthlyTargets[monthKey]) return _monthlyTargets[monthKey];
  return null;
}
function phase2N(v){ return (typeof N === 'function') ? N(v) : Number(v || 0); }
function phase2BuildWorkspaceData(){
  var rows = phase2Rows();
  var m = phase2GetMonth();
  var mp = phase2GetPrevMonth();
  if(!m || !m.colRev) return { ok:false, message:'ไม่พบข้อมูลเดือนสำหรับคำนวณ Workspace' };
  var actual = 0, prev = 0, vol = 0, activeAgents = 0, riskAgents = 0;
  rows.forEach(function(r){
    var rev = phase2N(r[m.colRev]);
    var pRev = (mp && mp.colRev) ? phase2N(r[mp.colRev]) : 0;
    var v = m.colVol ? phase2N(r[m.colVol]) : 0;
    actual += rev; prev += pRev; vol += v;
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
  return { ok:true, rows:rows, month:m, prevMonth:mp, actual:actual, prev:prev, volume:vol, activeAgents:activeAgents, riskAgents:riskAgents, target:target, hasTarget:target > 0, percent:percent, remaining:remaining, requiredPerDay:requiredPerDay, diffPct:diffPct, daysElapsed:daysElapsed, daysTotal:daysTotal };
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
function phase2WorkspaceHtml(){
  var d = phase2BuildWorkspaceData();
  if(!d.ok) return '<div class="ui-state ui-state-card empty"><div class="ui-state-title">No data</div><div class="ui-state-msg">'+phase2Esc(d.message)+'</div></div>';
  if(!d.rows.length) return '<div class="ui-state ui-state-card empty"><div class="ui-state-title">No data</div><div class="ui-state-msg">ไม่มีข้อมูลตาม filter ปัจจุบัน</div></div>';
  var t = phase2BuildDailyProgress();
  var user = (typeof _currentUser !== 'undefined' && _currentUser) ? _currentUser : {};
  var name = user.displayName || user.username || 'Business Development';
  var monthLabel = d.month.th || d.month.en || d.month.key || '-';
  var progWidth = Math.max(0, Math.min(100, d.percent));
  return ''+
    '<div class="phase2-wrap">'+
      '<div class="phase2-head"><div><div class="phase2-title">BD Workspace</div><div class="phase2-sub">ข้อมูลจริงจาก Raw KPI / Tracking / Target · '+phase2Esc(monthLabel)+'</div></div><div class="phase2-chip">'+phase2Esc(name)+'</div></div>'+
      '<div class="phase2-grid">'+
        '<div class="phase2-card phase2-card-wide"><div class="phase2-card-label">Target Progress</div><div class="phase2-progress-row"><strong>'+phase2Pct(d.percent)+'</strong><span>'+(d.hasTarget ? phase2Money(d.actual)+' / '+phase2Money(d.target) : 'ยังไม่ตั้งเป้า')+'</span></div><div class="phase2-progress"><div style="width:'+progWidth+'%"></div></div><div class="phase2-muted">'+(d.hasTarget ? 'เหลืออีก '+phase2Money(d.remaining)+' · ต้องทำเฉลี่ย '+phase2Money(d.requiredPerDay)+'/วัน' : 'ตั้ง target แล้วระบบจะคำนวณ progress อัตโนมัติ')+'</div></div>'+
        '<div class="phase2-card"><div class="phase2-card-label">รายได้ MTD</div><div class="phase2-value">'+phase2Money(d.actual)+'</div><div class="phase2-muted">'+phase2Pct(d.diffPct)+' vs เดือนก่อน</div></div>'+
        '<div class="phase2-card"><div class="phase2-card-label">Active Agents</div><div class="phase2-value">'+phase2Num(d.activeAgents)+'</div><div class="phase2-muted">จาก '+phase2Num(d.rows.length)+' agents</div></div>'+
        '<div class="phase2-card"><div class="phase2-card-label">Risk Agents</div><div class="phase2-value">'+phase2Num(d.riskAgents)+'</div><div class="phase2-muted">ยอดลดเกิน 30% vs เดือนก่อน</div></div>'+
        '<div class="phase2-card phase2-card-wide"><div class="phase2-card-label">Daily Task Progress</div><div class="phase2-progress-row"><strong>'+phase2Pct(t.pct)+'</strong><span>Done '+phase2Num(t.done)+' / '+phase2Num(t.total)+'</span></div><div class="phase2-progress"><div style="width:'+Math.max(0,Math.min(100,t.pct))+'%"></div></div><div class="phase2-task-row"><span>Pending '+phase2Num(t.pending)+'</span><span>Success '+phase2Num(t.success)+'</span><span>Fail '+phase2Num(t.fail)+'</span><span>No status '+phase2Num(t.noStatus)+'</span></div></div>'+
      '</div>'+
    '</div>';
}
function phase2RenderBdWorkspace(targetId){
  var el = document.getElementById(targetId || 'phase2_bd_workspace');
  if(!el) return;
  el.innerHTML = phase2WorkspaceHtml();
}
function phase2InjectStyles(){
  if(document.getElementById('phase2_workspace_styles')) return;
  var css = '.phase2-wrap{background:#fff;border:1px solid var(--bd);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 1px 8px rgba(0,0,0,.07)}.phase2-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.phase2-title{font-size:15px;font-weight:900;color:var(--pr)}.phase2-sub{font-size:11px;color:var(--t2);margin-top:2px}.phase2-chip{font-size:11px;font-weight:800;color:var(--ac);background:#e0f7ff;border:1px solid #bae6fd;border-radius:999px;padding:5px 10px}.phase2-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.phase2-card{border:1px solid var(--bd);border-radius:13px;background:#f8fafc;padding:13px}.phase2-card-wide{grid-column:span 3}.phase2-card-label{font-size:10px;font-weight:900;color:var(--t2);letter-spacing:.45px;text-transform:uppercase;margin-bottom:7px}.phase2-value{font-size:22px;font-weight:900;color:var(--pr);line-height:1}.phase2-muted{font-size:11px;color:var(--t2);margin-top:7px;line-height:1.45}.phase2-progress-row{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:8px}.phase2-progress-row strong{font-size:22px;color:var(--pr)}.phase2-progress-row span{font-size:12px;color:var(--t2);font-weight:700}.phase2-progress{height:9px;background:#e2e8f0;border-radius:999px;overflow:hidden}.phase2-progress>div{height:100%;background:linear-gradient(90deg,var(--ac),var(--pr));border-radius:999px}.phase2-task-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.phase2-task-row span{font-size:10px;font-weight:800;background:white;border:1px solid var(--bd);border-radius:999px;padding:4px 8px;color:var(--t2)}@media(max-width:900px){.phase2-grid{grid-template-columns:1fr}.phase2-card-wide{grid-column:span 1}.phase2-head{align-items:flex-start;flex-direction:column}}';
  var st = document.createElement('style'); st.id = 'phase2_workspace_styles'; st.textContent = css; document.head.appendChild(st);
}
function phase2MountWorkspace(){
  phase2InjectStyles();
  var screen = document.getElementById('rm-screen-bd');
  if(!screen) return;
  var host = document.getElementById('phase2_bd_workspace');
  if(!host){
    host = document.createElement('div');
    host.id = 'phase2_bd_workspace';
    screen.insertBefore(host, screen.firstChild);
  }
  phase2RenderBdWorkspace('phase2_bd_workspace');
  // Hide legacy mock bento content after the real Phase 2 workspace is mounted.
  Array.prototype.forEach.call(screen.children, function(child){
    if(child.id !== 'phase2_bd_workspace') child.style.display = 'none';
  });
}
function phase2RefreshWorkspace(){ phase2MountWorkspace(); }
(function(){
  var timer = setInterval(function(){
    var ready = typeof document !== 'undefined' && document.getElementById('rm-screen-bd');
    if(ready){ clearInterval(timer); phase2MountWorkspace(); }
  }, 800);
})();
