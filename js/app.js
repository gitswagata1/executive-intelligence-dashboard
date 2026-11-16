/* =====================================================================
   Acme Manufacturing – Central Intelligence Platform  ·  app.js
   Premium executive dashboard + Swagata.ai engine (data-driven, no API)
   ===================================================================== */
const R = window.RM_DATA;
const $ = (s, r=document) => r.querySelector(s);
const el = (h) => { const t=document.createElement('template'); t.innerHTML=h.trim(); return t.content.firstChild; };

/* ---------- formatting ---------- */
function cr(n){ // compact Indian: Cr / L
  const a=Math.abs(n);
  if(a>=1e7) return '₹'+(n/1e7).toFixed(2)+' Cr';
  if(a>=1e5) return '₹'+(n/1e5).toFixed(2)+' L';
  if(a>=1e3) return '₹'+(n/1e3).toFixed(1)+'K';
  return '₹'+Math.round(n);
}
const tT = (n) => Math.round(n).toLocaleString('en-IN') + ' T';   // tonnes
const C = {cyan:'#22d3ee',teal:'#2dd4bf',violet:'#a78bfa',indigo:'#6366f1',amber:'#fbbf24',rose:'#fb7185',green:'#34d399',muted:'#8a96ad'};
const PALETTE=[C.cyan,C.indigo,C.violet,C.teal,C.amber,C.rose,C.green,'#38bdf8','#818cf8','#f472b6','#facc15','#4ade80'];

/* ---------- icons ---------- */
const ICON = {
  exec:'<path d="M3 3v18h18"/><path d="m7 14 3-4 4 3 5-7"/>',
  proc:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  inv:'<path d="M21 8V21H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
  maint:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.4-.6-.6-2.4z"/>',
  vendor:'<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  logi:'<path d="M1 3h13v13H1z"/><path d="M14 8h5l3 3v5h-8z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>',
  hr:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  fin:'<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  ai:'<path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1 0 8 4 4 0 0 1-8 0 4 4 0 0 1 0-8 4 4 0 0 1 4-4z"/><path d="M12 8v4l2 1"/>',
  alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h0"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};
const svg=(p)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

/* ---------- nav model ---------- */
const MAIN=[
  {id:'exec',label:'Command Center',icon:'exec',view:'exec'},
  {id:'swagata',label:'Swagata.ai',icon:'chat',view:'swagata'},
];
const MODULES=[
  {id:'rm',label:'Raw Material Intelligence',icon:'inv',view:'rm',live:true,group:'Procurement'},
  {id:'hier',label:'Material Drill-Down',icon:'proc',view:'hier',live:true,group:'Procurement'},
  {id:'vendor',label:'Vendor Analytics',icon:'vendor',view:'vendor',live:true,group:'Procurement'},
  {id:'maint',label:'Predictive Maintenance',icon:'maint',feed:'Machine IoT + breakdown logs',group:'Operations'},
  {id:'logi',label:'Logistics & Supply Chain',icon:'logi',feed:'Fleet / dispatch feed',group:'Operations'},
  {id:'hr',label:'HR & Workforce',icon:'hr',feed:'Attendance / shift feed',group:'Operations'},
  {id:'fin',label:'Financial Intelligence',icon:'fin',feed:'GL / costing feed',group:'Operations'},
];

/* ===================================================================
   NAV + ROUTING
   =================================================================== */
function buildNav(){
  const nm=$('#nav-main'), mm=$('#nav-modules');
  MAIN.forEach(n=>nm.appendChild(navItem(n)));
  let curGroup=null;
  MODULES.forEach(n=>{
    if(n.group&&n.group!==curGroup){curGroup=n.group; mm.appendChild(el(`<div class="navlabel">${curGroup}</div>`));}
    mm.appendChild(navItem(n));
  });
}
function navItem(n){
  const locked=!n.view;
  const node=el(`<div class="nav ${locked?'locked':''}" data-id="${n.id}">${svg(ICON[n.icon])}<span>${n.label}</span>${n.live?'<span class="lk" style="color:var(--green)">●LIVE</span>':locked?'<span class="lk">🔒</span>':''}</div>`);
  node.onclick=()=>route(n);
  return node;
}
const TITLES={exec:['Executive Command Center','Acme Manufacturing Group · All Plants'],
  rm:['Raw Material Intelligence','Steel Procurement · Orders · Receipts · GRN'],
  hier:['Material Drill-Down','Category → Grade · Tonnage & Fill'],
  vendor:['Vendor Analytics','Steel Supplier Scorecards · Trust Index'],
  swagata:['Swagata.ai','Enterprise Manufacturing Copilot']};
const RENDERED={};
function ensureView(view){
  if(RENDERED[view])return false;          // already built
  if(view==='exec')renderExec();
  else if(view==='rm')renderRM();
  else if(view==='hier')renderHier();
  else if(view==='vendor')renderVendor();
  else if(view==='swagata')renderSwagata();
  RENDERED[view]=true; return true;        // freshly built (already animating)
}
function replayView(view){
  const cont=$('#view-'+view); if(!cont)return;
  if(view==='exec'){animateCounts(cont);drawSparks(cont);}
  cont.querySelectorAll('canvas').forEach(cv=>{const ch=Chart.getChart(cv);if(ch){ch.reset();ch.update();}});
}
function route(n){
  document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.id===n.id));
  document.querySelectorAll('.content').forEach(c=>c.classList.remove('active'));
  if(n.view){
    $('#view-'+n.view).classList.add('active');   // show first so canvases size correctly
    const fresh=ensureView(n.view);               // build on first visit (auto-animates)
    if(!fresh) replayView(n.view);                // re-animate on every revisit
    const t=TITLES[n.view]; $('#viewTitle').textContent=t[0]; $('#viewCrumb').textContent=t[1];
  } else {
    renderLocked(n); $('#view-locked').classList.add('active');
    $('#viewTitle').textContent=n.label; $('#viewCrumb').textContent='Awaiting data feed integration';
  }
}

/* ===================================================================
   EXECUTIVE COMMAND CENTER
   =================================================================== */
let _sparkId=0;
function kpiCard(ico,label,val,unit,delta,dir,accent,series){
  const arrow=dir==='up'?'▲':dir==='down'?'▼':'■';
  accent=accent||C.cyan;
  const sid='spark'+(_sparkId++);
  return `<div class="kpi glass" style="--accent:${accent}">
    <div class="kpi-glow"></div>
    <div class="ico" style="color:${accent}">${svg(ICON[ico])}</div>
    <div class="lbl">${label}</div>
    <div class="val" data-count="${val.raw??''}">${val.txt}${unit?`<span class="u">${unit}</span>`:''}</div>
    <div class="delta ${dir}">${arrow} ${delta}</div>
    <canvas class="spark" id="${sid}" data-series="${(series||[]).join(',')}" data-accent="${accent}"></canvas>
  </div>`;
}
// lightweight sparkline (raw canvas, no Chart.js overhead)
function drawSparks(scope){
  scope.querySelectorAll('canvas.spark').forEach(cv=>{
    const raw=cv.dataset.series; if(!raw)return;
    const data=raw.split(',').map(Number).filter(n=>!isNaN(n)); if(data.length<2)return;
    const dpr=window.devicePixelRatio||1, W=cv.clientWidth||110, H=cv.clientHeight||48;
    cv.width=W*dpr; cv.height=H*dpr; const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
    const min=Math.min(...data), max=Math.max(...data), pad=4;
    const x=i=>pad+i*(W-2*pad)/(data.length-1);
    const y=v=>H-pad-(max===min?0.5:(v-min)/(max-min))*(H-2*pad);
    const col=cv.dataset.accent||'#22d3ee';
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,col+'55'); g.addColorStop(1,col+'00');
    ctx.beginPath(); ctx.moveTo(x(0),y(data[0]));
    for(let i=1;i<data.length;i++){const xc=(x(i-1)+x(i))/2; ctx.quadraticCurveTo(x(i-1),y(data[i-1]),xc,(y(data[i-1])+y(data[i]))/2);}
    ctx.lineTo(x(data.length-1),y(data[data.length-1]));
    ctx.lineTo(x(data.length-1),H); ctx.lineTo(x(0),H); ctx.closePath(); ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x(0),y(data[0]));
    for(let i=1;i<data.length;i++){const xc=(x(i-1)+x(i))/2; ctx.quadraticCurveTo(x(i-1),y(data[i-1]),xc,(y(data[i-1])+y(data[i]))/2);}
    ctx.lineTo(x(data.length-1),y(data[data.length-1]));
    ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.lineJoin='round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x(data.length-1),y(data[data.length-1]),2.2,0,7); ctx.fillStyle=col; ctx.fill();
  });
}
function renderExec(){
  const k=R.kpis, v=$('#view-exec');
  const receivedOrders=k.orderValue-k.pendingValue;          // orders basis
  const fill=Math.round(receivedOrders/k.orderValue*100);
  const top=R.byPlant[0], topv=R.vendors[0], topPend=[...R.byPlant].sort((a,b)=>b.pending-a.pending)[0];
  v.innerHTML=`
    <div class="insight" style="margin-bottom:20px">
      <div class="ai">S</div>
      <div class="body"><b>Swagata.ai morning brief —</b> Across <b>${k.plants} plants</b> and <b>${k.vendors} steel vendors</b>, <b>${cr(k.orderValue)}</b> of raw material was ordered (${R.meta.orderWindow}); <b>${k.tonnage.toLocaleString('en-IN')} T</b> received via ${k.grns} GRNs worth ${cr(k.receivedValue)}. Median lead time <b>${k.medLead} days</b>. <span style="color:var(--rose)"><b>${k.overdueLines} open-order lines are overdue</b> (${cr(k.overdueValue)})</span> — top supplier <b>${topv.vendor}</b>; <b>${topPend.plant}</b> carries the largest pending exposure. <span style="color:var(--amber)">Recommend expediting overdue steel + top-3 pending plants.</span></div>
    </div>
    <div class="grid kpis" style="margin-bottom:16px">
      ${kpiCard('fin','Total RM Spend',{txt:cr(k.orderValue),raw:k.orderValue},'',R.meta.orderWindow,'up',C.cyan,R.ordersTrend.map(t=>t.order))}
      ${kpiCard('proc','Received (Orders)',{txt:cr(receivedOrders),raw:receivedOrders},'','of '+cr(k.orderValue)+' ordered','up',C.green,[])}
      ${kpiCard('logi','Steel Intake (GRN)',{txt:k.tonnage.toLocaleString('en-IN'),raw:k.tonnage},'T','17-month receipts','up',C.violet,R.receiptTrend.map(t=>t.tonnes))}
      ${kpiCard('exec','Fill Rate',{txt:fill,raw:fill},'%','received / ordered','flat',C.amber,R.leadDist.map(l=>l.count))}
    </div>
    <div class="grid kpis" style="margin-bottom:20px">
      ${kpiCard('alert','Pending (Orders)',{txt:cr(k.pendingValue),raw:k.pendingValue},'','to receive','down',C.rose,[])}
      ${kpiCard('alert','Overdue Lines',{txt:k.overdueLines,raw:k.overdueLines},'',cr(k.overdueValue)+' late','down',C.amber,[])}
      ${kpiCard('vendor','Steel Vendors',{txt:k.vendors,raw:k.vendors},'','active suppliers','up',C.indigo,[])}
      ${kpiCard('proc','Avg Lead Time',{txt:k.avgLead,raw:k.avgLead},'days','median '+k.medLead+'d','flat',C.teal,R.leadDist.map(l=>l.count))}
    </div>
    <div class="grid cards-3" style="margin-bottom:16px">
      <div class="panel glass" style="grid-column:span 2">
        <div class="ptitle"><h3>RM Order Value Trend</h3><span class="chip">Monthly · Order Amount</span></div>
        <div class="psub">Raw-material purchase value across all plants</div>
        <div class="chart-wrap h-260"><canvas id="cTrend"></canvas></div>
      </div>
      <div class="panel glass">
        <div class="ptitle"><h3>Fulfilment</h3></div>
        <div class="psub">Received vs pending value</div>
        <div class="chart-wrap h-220"><canvas id="cFulfil"></canvas></div>
      </div>
    </div>
    <div class="grid cards-3">
      <div class="panel glass" style="grid-column:span 2">
        <div class="ptitle"><h3>Spend by Plant</h3><span class="chip">${R.byPlant.length} plants</span></div>
        <div class="psub">Received vs pending order value per plant</div>
        <div class="chart-wrap h-300"><canvas id="cPlant"></canvas></div>
      </div>
      <div class="panel glass">
        <div class="ptitle"><h3>Spend by Category</h3></div>
        <div class="psub">Steel form</div>
        <div class="chart-wrap h-220"><canvas id="cCat"></canvas></div>
      </div>
    </div>`;
  animateCounts(v); drawSparks(v);
  new Chart($('#cTrend'),{type:'line',data:{labels:R.ordersTrend.map(t=>t.month.slice(2)),
    datasets:[{data:R.ordersTrend.map(t=>t.order),fill:true,borderColor:C.cyan,tension:.4,pointRadius:0,
      borderWidth:2,backgroundColor:grad('#22d3ee')}]},options:lineOpts(x=>cr(x))});
  new Chart($('#cFulfil'),{type:'doughnut',data:{labels:['Received','Pending'],
    datasets:[{data:[receivedOrders,k.pendingValue],backgroundColor:[C.green,'rgba(251,113,133,.65)'],borderWidth:0}]},
    options:donutOpts(fill+'%','fulfilled')});
  new Chart($('#cPlant'),{type:'bar',data:{labels:R.byPlant.map(p=>p.plant),
    datasets:[{label:'Received',data:R.byPlant.map(p=>p.received),backgroundColor:C.green,stack:'s'},
              {label:'Pending',data:R.byPlant.map(p=>p.pending),backgroundColor:'rgba(99,102,241,.55)',stack:'s'}]},
    options:barOpts(x=>cr(x),true)});
  new Chart($('#cCat'),{type:'doughnut',data:{labels:R.byCategory.map(c=>c.name),
    datasets:[{data:R.byCategory.map(c=>c.order),backgroundColor:PALETTE,borderWidth:0}]},options:donutOpts('','')});
}

/* ===================================================================
   RAW MATERIAL INTELLIGENCE
   =================================================================== */
function renderRM(){
  const k=R.kpis, v=$('#view-rm');
  const top=R.byCategory[0], topv=R.vendors[0];
  v.innerHTML=`
    <div class="insight" style="margin-bottom:20px">
      <div class="ai">S</div>
      <div class="body"><b>Swagata.ai · Raw-Material brief —</b> ${cr(k.orderValue)} of steel ordered (Jan–May 2026) across <b>${k.plants} plants</b> from <b>${k.vendors} vendors</b>; <b>${k.tonnage.toLocaleString('en-IN')} T</b> received over ${k.grns} GRNs worth ${cr(k.receivedValue)}. Median lead time <b>${k.medLead} days</b>. <span style="color:var(--rose)"><b>${k.overdueLines} open-order lines are overdue</b> (${cr(k.overdueValue)})</span> — top category <b>${top.name}</b>, top supplier <b>${topv.vendor}</b>.</div>
    </div>
    <div class="grid kpis" style="margin-bottom:16px">
      ${kpiCard('inv','RM Order Value',{txt:cr(k.orderValue),raw:k.orderValue},'','Jan–May 2026','up',C.cyan,R.ordersTrend.map(t=>t.order))}
      ${kpiCard('proc','GRN Receipts',{txt:cr(k.receivedValue),raw:k.receivedValue},'',k.grns+' GRNs · 17-mo','up',C.green,R.receiptTrend.map(t=>t.value))}
      ${kpiCard('logi','Steel Intake (GRN)',{txt:k.tonnage.toLocaleString('en-IN'),raw:k.tonnage},'T','17-month','up',C.violet,R.receiptTrend.map(t=>t.tonnes))}
      ${kpiCard('proc','Avg Lead Time',{txt:k.avgLead,raw:k.avgLead},'days','median '+k.medLead+'d','flat',C.teal,R.leadDist.map(l=>l.count))}
    </div>
    <div class="grid kpis" style="margin-bottom:20px">
      ${kpiCard('alert','Pending (Orders)',{txt:cr(k.pendingValue),raw:k.pendingValue},'','to receive','down',C.amber,[])}
      ${kpiCard('alert','Overdue Lines',{txt:k.overdueLines,raw:k.overdueLines},'',cr(k.overdueValue)+' late','down',C.rose,[])}
      ${kpiCard('vendor','Steel Vendors',{txt:k.vendors,raw:k.vendors},'','active suppliers','up',C.indigo,[])}
      ${kpiCard('inv','Grades Sourced',{txt:k.grades,raw:k.grades},'','distinct grades','flat',C.cyan,[])}
    </div>
    <div class="grid cards-3" style="margin-bottom:16px">
      <div class="panel glass"><div class="ptitle"><h3>Spend by Category</h3></div>
        <div class="psub">Order value by steel form</div><div class="chart-wrap h-260"><canvas id="cRmCat"></canvas></div></div>
      <div class="panel glass"><div class="ptitle"><h3>Lead-Time Distribution</h3><span class="chip">GRN − PO release</span></div>
        <div class="psub">Real receipt lead time (days)</div><div class="chart-wrap h-260"><canvas id="cRmLead"></canvas></div></div>
      <div class="panel glass"><div class="ptitle"><h3>Sourcing by Region</h3></div>
        <div class="psub">Tonnage received by vendor state</div><div class="chart-wrap h-260"><canvas id="cRmRegion"></canvas></div></div>
    </div>
    <div class="grid cards-2" style="margin-bottom:16px">
      <div class="panel glass" style="grid-column:span 1"><div class="ptitle"><h3>Monthly Steel Intake</h3><span class="chip">Tonnes received</span></div>
        <div class="psub">GRN tonnage trend</div><div class="chart-wrap h-260"><canvas id="cRmTrend"></canvas></div></div>
      <div class="panel glass"><div class="ptitle"><h3>Top Grades by Tonnage</h3></div>
        <div class="psub">Highest-volume steel grades</div><div class="chart-wrap h-260"><canvas id="cRmGrade"></canvas></div></div>
    </div>
    <div class="panel glass" style="margin-bottom:16px">
      <div class="ptitle"><h3>Overdue Open Orders</h3><span class="chip" style="color:var(--rose)">${k.overdueLines} late · ${cr(k.overdueValue)}</span></div>
      <div class="psub">Delivery date passed, not yet received — expedite list</div>
      <div class="tbl-scroll" style="max-height:300px"><table>
        <thead><tr><th>Plant</th><th>PO No.</th><th>Vendor</th><th>Material</th><th class="num">Pending ₹</th><th>Due</th><th class="num">Days Late</th></tr></thead>
        <tbody>${R.overdue.slice(0,40).map(r=>`<tr><td><b>${r.plant}</b></td><td>${r.po}</td><td>${r.vendor}</td><td>${r.desc}</td>
          <td class="num" style="color:var(--rose)">${cr(r.pend)}</td><td>${r.due}</td>
          <td class="num"><span class="tag ${r.daysLate>60?'bad':'warn'}">${r.daysLate}d</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="panel glass">
      <div class="ptitle"><h3>RM Order Explorer</h3><span class="chip" id="rmRowCount"></span></div>
      <div class="psub">Drill into ${R.rawOrders.length.toLocaleString('en-IN')} raw-material order lines</div>
      <div class="filters">
        <select class="sel" id="rmPlant"><option value="">All Plants</option></select>
        <select class="sel" id="rmCat"><option value="">All Categories</option>${R.byCategory.map(c=>`<option>${c.name}</option>`).join('')}</select>
        <input class="txtin" id="rmSearch" placeholder="Search vendor / material…" style="flex:1;min-width:160px"/>
        <button class="btn ghost" id="rmCsv">⤓ Export CSV</button>
      </div>
      <div class="tbl-scroll"><table>
        <thead><tr><th>Plant</th><th>PO No.</th><th>Vendor</th><th>Material</th><th>Grade</th><th class="num">Qty (T)</th><th class="num">Order ₹</th><th class="num">Pending ₹</th><th>Status</th></tr></thead>
        <tbody id="rmBody"></tbody>
      </table></div>
    </div>`;
  animateCounts(v); drawSparks(v);
  new Chart($('#cRmCat'),{type:'bar',data:{labels:R.byCategory.map(c=>c.name),
    datasets:[{data:R.byCategory.map(c=>c.order),backgroundColor:PALETTE,borderRadius:5}]},options:barOpts(x=>cr(x),false,true)});
  new Chart($('#cRmLead'),{type:'bar',data:{labels:R.leadDist.map(l=>l.label),
    datasets:[{data:R.leadDist.map(l=>l.count),backgroundColor:grad('#2dd4bf'),borderRadius:5}]},options:barOpts(x=>x+' GRNs',false)});
  new Chart($('#cRmRegion'),{type:'doughnut',data:{labels:R.byRegion.map(r=>r.region),
    datasets:[{data:R.byRegion.map(r=>r.tonnes),backgroundColor:PALETTE,borderWidth:0}]},options:donutOpts(R.kpis.tonnage.toLocaleString('en-IN'),'tonnes',x=>tT(x))});
  new Chart($('#cRmTrend'),{type:'line',data:{labels:R.receiptTrend.map(t=>t.month.slice(2)),
    datasets:[{data:R.receiptTrend.map(t=>t.tonnes),fill:true,borderColor:C.violet,backgroundColor:grad('#a78bfa'),tension:.4,pointRadius:0,borderWidth:2}]},
    options:{...lineOpts(x=>tT(x)),scales:{x:{grid:{display:false},ticks:{color:'#8a96ad',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a96ad',font:{size:10},callback:x=>tT(x)}}}}});
  new Chart($('#cRmGrade'),{type:'bar',data:{labels:R.byGrade.slice(0,8).map(g=>g.grade),
    datasets:[{data:R.byGrade.slice(0,8).map(g=>g.tonnes),backgroundColor:grad('#22d3ee'),borderRadius:5}]},options:barOpts(x=>tT(x),false,true)});

  const pf=$('#rmPlant'); R.byPlant.map(p=>p.plant).sort().forEach(p=>pf.appendChild(el(`<option>${p}</option>`)));
  ['rmPlant','rmCat','rmSearch'].forEach(id=>$('#'+id).addEventListener('input',renderRMrows));
  $('#rmCsv').onclick=rmExportCsv;
  renderRMrows();
}
let curRm=[];
function renderRMrows(){
  const fp=$('#rmPlant').value, fc=$('#rmCat').value, q=$('#rmSearch').value.toLowerCase();
  curRm=R.rawOrders.filter(r=>(!fp||r.plant===fp)&&(!fc||r.cat===fc)
    &&(!q||(r.vendor.toLowerCase().includes(q)||r.desc.toLowerCase().includes(q)||String(r.po).includes(q))));
  $('#rmRowCount').textContent=curRm.length.toLocaleString('en-IN')+' lines';
  $('#rmBody').innerHTML=curRm.slice(0,300).map(r=>{const st=r.status==='Released'?'ok':r.status==='Not Approved'?'warn':'';
    return `<tr><td><b>${r.plant}</b></td><td>${r.po}</td><td>${r.vendor}</td><td>${r.desc}</td><td><small style="color:var(--muted)">${r.grade}</small></td>
    <td class="num">${r.qtyT}</td><td class="num">${cr(r.order)}</td><td class="num" style="color:${r.pend>0?'var(--rose)':'var(--muted)'}">${cr(r.pend)}</td>
    <td>${st?`<span class="tag ${st}">${r.status}</span>`:'—'}</td></tr>`;}).join('')
    +(curRm.length>300?`<tr><td colspan="9" style="text-align:center;color:var(--muted)">…first 300 of ${curRm.length.toLocaleString('en-IN')}. Refine or export.</td></tr>`:'');
}
function rmExportCsv(){
  const cols=['plant','po','date','vendor','grade','desc','qtyT','order','pend','status','delivered'];
  const lines=[cols.join(',')].concat(curRm.map(r=>cols.map(c=>`"${(r[c]??'')}"`).join(',')));
  const b=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='MT_RM_orders.csv';a.click();
  toast('Export ready','Filtered RM order lines downloaded.');
}

/* ===================================================================
   VENDOR ANALYTICS
   =================================================================== */
function renderVendor(){
  const k=R.kpis, v=$('#view-vendor');
  const tot=R.vendors.reduce((a,x)=>{a.r+=x.received;a.s+=x.spend;return a;},{r:0,s:0});
  const avgFill=Math.round(tot.r/tot.s*100);   // orders-based (consistent with scorecard)
  const top10=R.vendors.slice(0,10);
  v.innerHTML=`
    <div class="grid kpis" style="margin-bottom:20px">
      ${kpiCard('vendor','Active Vendors',{txt:k.vendors,raw:k.vendors},'','steel suppliers','up',C.cyan,[])}
      ${kpiCard('fin','Total RM Spend',{txt:cr(k.orderValue),raw:k.orderValue},'','Jan–May 2026','up',C.indigo,R.ordersTrend.map(t=>t.order))}
      ${kpiCard('exec','Avg Fill Rate',{txt:avgFill,raw:avgFill},'%','received / ordered','flat',C.green,[])}
      ${kpiCard('proc','Top Supplier',{txt:cr(k.topVendorSpend),raw:k.topVendorSpend},'',k.topVendor.split(' ')[0],'up',C.violet,[])}
    </div>
    <div class="grid cards-3" style="margin-bottom:16px">
      <div class="panel glass" style="grid-column:span 2"><div class="ptitle"><h3>Top 10 Vendors by Spend</h3></div>
        <div class="psub">Order value per supplier (₹)</div><div class="chart-wrap h-300"><canvas id="cVenSpend"></canvas></div></div>
      <div class="panel glass"><div class="ptitle"><h3>Sourcing by Region</h3></div>
        <div class="psub">Tonnage by vendor state</div><div class="chart-wrap h-300"><canvas id="cVenRegion"></canvas></div></div>
    </div>
    <div class="panel glass">
      <div class="ptitle"><h3>Vendor Scorecard</h3><span class="chip">${k.vendors} suppliers · Trust Index</span></div>
      <div class="psub">Trust = 0.6 × fill-rate + 0.4 × delivered-rate. Sorted by spend.</div>
      <div class="tbl-scroll" style="max-height:460px"><table>
        <thead><tr><th>#</th><th>Vendor</th><th>Region</th><th class="num">Spend ₹</th><th class="num">Recd (T)</th><th class="num">Fill %</th><th class="num">Deliv %</th><th class="num">Pending ₹</th><th>Trust</th></tr></thead>
        <tbody>${R.vendors.map((vn,i)=>{const t=vn.trust>=60?'ok':vn.trust>=35?'warn':'bad';
          return `<tr><td style="color:var(--muted)">${i+1}</td><td><b>${vn.vendor}</b></td><td><small>${vn.region}</small></td>
          <td class="num">${cr(vn.spend)}</td><td class="num">${vn.recT.toLocaleString('en-IN')}</td><td class="num">${vn.fill}%</td>
          <td class="num">${vn.delivpct}%</td><td class="num" style="color:${vn.pending>0?'var(--rose)':'var(--muted)'}">${cr(vn.pending)}</td>
          <td><span class="tag ${t}">${vn.trust}</span></td></tr>`;}).join('')}</tbody>
      </table></div>
    </div>`;
  animateCounts(v); drawSparks(v);
  new Chart($('#cVenSpend'),{type:'bar',data:{labels:top10.map(x=>x.vendor.length>22?x.vendor.slice(0,20)+'…':x.vendor),
    datasets:[{label:'Received',data:top10.map(x=>x.received),backgroundColor:C.green,stack:'s'},
              {label:'Pending',data:top10.map(x=>x.pending),backgroundColor:'rgba(99,102,241,.55)',stack:'s'}]},
    options:barOpts(x=>cr(x),true,true)});
  new Chart($('#cVenRegion'),{type:'doughnut',data:{labels:R.byRegion.map(r=>r.region),
    datasets:[{data:R.byRegion.map(r=>r.tonnes),backgroundColor:PALETTE,borderWidth:0}]},options:donutOpts(k.vendors,'vendors',x=>tT(x))});
}

/* ===================================================================
   MATERIAL DRILL-DOWN  (Category → Grade hierarchy)
   =================================================================== */
let hierCat=null;
function renderHier(){
  const v=$('#view-hier'); const H=R.hier;
  const totO=H.reduce((a,c)=>a+c.ordT,0), totR=H.reduce((a,c)=>a+c.recT,0);
  const totG=H.reduce((a,c)=>a+c.grades.length,0), totL=H.reduce((a,c)=>a+c.lines,0);
  hierCat=H[0].category;
  v.innerHTML=`
    <div class="insight" style="margin-bottom:20px">
      <div class="ai">S</div>
      <div class="body"><b>Swagata.ai · Material drill-down —</b> ${tT(totO)} of steel ordered across <b>${H.length} categories</b> and <b>${totG} grades</b> (${totL} order lines); ${tT(totR)} received. Largest category: <b>${H[0].category}</b> (${tT(H[0].ordT)}). Quantities are tonnes from the per-grade order files — drill any category below.</div>
    </div>
    <div class="grid kpis" id="hierKpis" style="margin-bottom:20px"></div>
    <div class="panel glass" style="margin-bottom:16px">
      <div class="ptitle"><h3>Grades in <span id="hCatName" style="color:var(--cyan)"></span></h3>
        <div class="chips" id="hChips" style="margin:0">${H.map(c=>`<div class="qchip" data-cat="${c.category}">${c.category}</div>`).join('')}</div></div>
      <div class="psub">Ordered vs received tonnage by grade</div>
      <div class="chart-wrap h-300"><canvas id="cHier"></canvas></div>
    </div>
    <div class="panel glass">
      <div class="ptitle"><h3>Category → Grade Breakdown</h3><span class="chip">${H.length} categories · ${totG} grades</span></div>
      <div class="psub">Every raw-material category and its grades (tonnage, from the folder hierarchy)</div>
      <div class="tbl-scroll" style="max-height:460px"><table>
        <thead><tr><th>Category / Grade</th><th class="num">Ordered (T)</th><th class="num">Received (T)</th><th class="num">Pending (T)</th><th class="num">Fill %</th><th class="num">Lines</th></tr></thead>
        <tbody>${H.map(c=>`
          <tr style="background:var(--glass2)"><td><b>▸ ${c.category}</b></td><td class="num"><b>${tT(c.ordT)}</b></td><td class="num">${tT(c.recT)}</td><td class="num">${tT(c.pendT)}</td><td class="num">${c.fill}%</td><td class="num">${c.lines}</td></tr>
          ${c.grades.map(g=>{const h=g.fill>=50?'ok':g.fill>=25?'warn':'bad';return `<tr><td style="padding-left:28px;color:var(--muted)">${g.grade}</td><td class="num">${tT(g.ordT)}</td><td class="num">${tT(g.recT)}</td><td class="num" style="color:${g.pendT>0?'var(--rose)':'var(--muted)'}">${tT(g.pendT)}</td><td class="num"><span class="tag ${h}">${g.fill}%</span></td><td class="num">${g.lines}</td></tr>`;}).join('')}
        `).join('')}</tbody>
      </table></div>
    </div>`;
  $('#hChips').querySelectorAll('.qchip').forEach(ch=>ch.onclick=()=>{hierCat=ch.dataset.cat;drawHier();});
  drawHier();
}
function drawHier(){
  const c=R.hier.find(x=>x.category===hierCat)||R.hier[0];
  $('#hCatName').textContent=c.category;
  $('#hChips').querySelectorAll('.qchip').forEach(ch=>ch.style.cssText=ch.dataset.cat===c.category?'color:#fff;border-color:var(--cyan);background:var(--glass2)':'');
  $('#hierKpis').innerHTML=
    kpiCard('inv',c.category+' Ordered',{txt:tT(c.ordT),raw:c.ordT},'','tonnes','up',C.cyan,c.grades.map(g=>g.ordT))+
    kpiCard('proc',c.category+' Received',{txt:tT(c.recT),raw:c.recT},'','tonnes','up',C.green,c.grades.map(g=>g.recT))+
    kpiCard('exec','Fill Rate',{txt:c.fill,raw:c.fill},'%','qty basis','flat',C.amber,[])+
    kpiCard('vendor','Grades',{txt:c.grades.length,raw:c.grades.length},'','in '+c.category,'up',C.violet,[]);
  animateCounts($('#hierKpis')); drawSparks($('#hierKpis'));
  const cv=document.getElementById('cHier'); const old=Chart.getChart(cv); if(old)old.destroy();
  const opt=barOpts(x=>tT(x),false,true); opt.plugins.legend.display=true; opt.plugins.legend.position='top';
  new Chart(cv,{type:'bar',data:{labels:c.grades.map(g=>g.grade),
    datasets:[{label:'Ordered',data:c.grades.map(g=>g.ordT),backgroundColor:grad('#22d3ee'),borderRadius:5},
              {label:'Received',data:c.grades.map(g=>g.recT),backgroundColor:C.green,borderRadius:5}]},options:opt});
}

/* ===================================================================
   LOCKED MODULES
   =================================================================== */
function renderLocked(n){
  const feeds={vendor:['Vendor master','GRN / receipts','Quality rejections'],
    inventory:['Stock on hand','MRP / reorder','Inventory ageing'],
    maint:['Machine IoT','Breakdown logs','MTTR / MTBF'],
    logi:['Fleet GPS','Dispatch / EWB','Freight cost'],
    hr:['Attendance','Shift roster','Productivity'],
    fin:['GL postings','Cost centers','Budget vs actual']};
  const f=feeds[n.id]||['Source A','Source B','Source C'];
  $('#view-locked').innerHTML=`<div class="locked-view"><div>
    <div class="li" style="color:var(--violet)">${svg(ICON[n.icon])}</div>
    <h2 class="head" style="font-size:22px;margin:0 0 6px">${n.label}</h2>
    <p style="color:var(--muted);max-width:460px;margin:0 auto;font-size:13.5px">This module is wired into the platform architecture and ready to activate once its data feed is connected. The Procurement module is already <b style="color:var(--green)">live</b> on the SAP export.</p>
    <div class="grid feed-grid" style="margin-left:auto;margin-right:auto">
      ${f.map(x=>`<div class="feed glass"><div class="f1">${x}</div><div class="f2">Awaiting connector</div></div>`).join('')}
    </div>
  </div></div>`;
}

/* ===================================================================
   SWAGATA.AI  – data-driven intent engine
   =================================================================== */
const SUGGEST=['Generate today\'s executive summary','Best vendor for 16MNCR5 coil','Top steel vendors by spend','Show overdue steel orders','Compare top 2 vendors','16MNCR5 across forms','Sourcing by region','Top steel grades by tonnage'];
// open-ended prompts shown only when a real model is connected (need reasoning)
const DEEP_SUGGEST=['Root-cause my lowest fill-rate grade','Where is my biggest overdue risk and the 3-step fix?','Which vendor should I shift volume to, and why?','Compare bar vs coil sourcing strategy for 16MNCR5','What would lift overall fill rate the fastest?','Draft a board-level steel sourcing brief'];
/* ---- Claude model config (stored in browser localStorage) ---- */
const LLM_MODELS=[['claude-opus-4-8','Claude Opus 4.8 · deepest reasoning (recommended)'],
                  ['claude-sonnet-4-6','Claude Sonnet 4.6 · fast + strong'],
                  ['claude-haiku-4-5','Claude Haiku 4.5 · fastest / cheapest']];
const llmKey  =()=>localStorage.getItem('eid_llm_key')||'';
const llmModel=()=>localStorage.getItem('eid_llm_model')||'claude-opus-4-8';
const llmOn   =()=>!!llmKey();
function aiBadge(){
  return llmOn()
    ? `<span class="ai-badge on" title="${llmModel()}"><span class="dot"></span> Claude connected · ${llmModel().replace('claude-','').replace(/-/g,' ')}</span>`
    : `<span class="ai-badge"><span class="dot" style="background:var(--muted);animation:none"></span> Offline engine</span>`;
}
function renderSwagata(){
  const v=$('#view-swagata');
  v.innerHTML=`<div class="chat">
    <div class="ai-bar">
      <div id="aiStatus">${aiBadge()}</div>
      <button class="btn ghost" id="aiCfgBtn" style="padding:6px 12px;font-size:12px">⚙ Connect AI</button>
    </div>
    <div class="ai-settings glass" id="aiCfg" style="display:none">
      <div class="psub" style="margin:0 0 10px">Paste an Anthropic API key to power Swagata.ai with a real Claude model. The key is stored only in this browser (localStorage) and sent directly to api.anthropic.com.</div>
      <div class="filters" style="margin:0">
        <input class="txtin" id="aiKey" type="password" placeholder="sk-ant-…" style="flex:1;min-width:220px" value="${llmKey()?'••••••••••••':''}"/>
        <select class="sel" id="aiModel">${LLM_MODELS.map(m=>`<option value="${m[0]}" ${m[0]===llmModel()?'selected':''}>${m[1]}</option>`).join('')}</select>
        <button class="btn" id="aiSave">Save</button>
        <button class="btn ghost" id="aiClear">Disconnect</button>
      </div>
      <div class="psub" style="margin:10px 0 0">Get a key at console.anthropic.com → API Keys. Without a key, Swagata.ai uses the built-in offline engine.</div>
    </div>
    <div class="msgs" id="msgs"></div>
    <div>
      <div class="chips" id="chips"></div>
      <div class="composer glass">
        <input id="chatIn" placeholder="Ask Swagata.ai about your operations…" autocomplete="off"/>
        <button class="btn" id="sendBtn">Ask →</button>
      </div>
    </div></div>`;
  const intro = llmOn()
    ? `<b>Swagata.ai online — powered by ${llmModel().replace('claude-','Claude ').replace(/-/g,' ')}.</b> I'm reading the live raw-material feed (<b>${cr(R.kpis.orderValue)}</b> ordered, <b>${R.kpis.tonnage.toLocaleString('en-IN')} T</b> received, ${R.kpis.vendors} vendors). Ask me anything about the steel procurement data — free-form questions welcome.`
    : `<b>Swagata.ai online</b> (offline engine). I'm reading the live raw-material feed — <b>${cr(R.kpis.orderValue)}</b> of steel ordered, <b>${R.kpis.tonnage.toLocaleString('en-IN')} T</b> received across <b>${R.kpis.vendors} vendors</b>. Ask about vendors, lead times, overdue orders, grades, sourcing or plant spend.`;
  addMsg('ai',intro);
  renderChips();
  $('#sendBtn').onclick=()=>{const i=$('#chatIn');if(i.value.trim()){ask(i.value.trim());i.value='';}};
  $('#chatIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.value.trim()){ask(e.target.value.trim());e.target.value='';}});
  $('#aiCfgBtn').onclick=()=>{const c=$('#aiCfg');c.style.display=c.style.display==='none'?'block':'none';};
  $('#aiSave').onclick=()=>{
    const k=$('#aiKey').value.trim();
    if(k && !k.startsWith('•')) localStorage.setItem('eid_llm_key',k);
    localStorage.setItem('eid_llm_model',$('#aiModel').value);
    chatHistory=[];
    $('#aiStatus').innerHTML=aiBadge(); $('#aiCfg').style.display='none'; renderChips();
    toast('Swagata.ai connected', llmOn()?('Reasoning with '+llmModel()):'Enter a valid key to connect.');
    if(llmOn()) addMsg('ai',`✅ Connected to <b>${llmModel().replace('claude-','Claude ').replace(/-/g,' ')}</b> with adaptive reasoning over the full live dataset. Ask me anything — including open-ended analysis, root-cause, what-ifs and recommendations.`);
  };
  $('#aiClear').onclick=()=>{localStorage.removeItem('eid_llm_key');chatHistory=[];$('#aiKey').value='';$('#aiStatus').innerHTML=aiBadge();renderChips();toast('Disconnected','Back to the offline engine.');};
}
function addMsg(who,html){
  const m=el(`<div class="msg ${who}"><div class="av">${who==='ai'?'S':'You'}</div><div class="bubble">${html}</div></div>`);
  $('#msgs').appendChild(m); $('#msgs').scrollTop=$('#msgs').scrollHeight; return m;
}
/* chips: data-lookup set when offline; open-ended "deep analysis" set when a model is connected */
function renderChips(){
  const box=$('#chips'); if(!box)return;
  const on=llmOn(), list=on?DEEP_SUGGEST:SUGGEST;
  box.innerHTML=(on?`<span class="chips-label">✨ Deep analysis · ${llmModel().replace('claude-','Claude ').replace(/-/g,' ')}</span>`:'')
    +list.map(s=>`<div class="qchip${on?' deep':''}">${s}</div>`).join('');
  box.querySelectorAll('.qchip').forEach(c=>c.onclick=()=>ask(c.textContent));
}
let chatHistory=[];   // multi-turn memory for the connected model
async function ask(q){
  addMsg('me',q.replace(/</g,'&lt;'));
  const bubble=addMsg('ai','<div class="typing"><span></span><span></span><span></span></div>').querySelector('.bubble');
  if(llmOn()){
    try{
      let started=false;
      await askLLM(q,(text,thinking)=>{
        if(thinking&&!started){bubble.innerHTML='<span class="mini">🧠 '+llmModel().replace('claude-','Claude ').replace(/-/g,' ')+' reasoning…</span>';return;}
        if(text!=null){started=true;bubble.innerHTML=text;$('#msgs').scrollTop=$('#msgs').scrollHeight;}
      });
      if(!started) bubble.innerHTML='(no answer returned)';
    }catch(e){ bubble.innerHTML=`<b>⚠️ Claude request failed.</b> ${(''+e.message).replace(/</g,'&lt;')}<br/><span class="mini">Offline fallback:</span><br/>${answer(q)}`; }
  } else {
    await new Promise(r=>setTimeout(r,400)); bubble.innerHTML=answer(q);
  }
  $('#msgs').scrollTop=$('#msgs').scrollHeight;
}
/* full live data context sent to Claude (cached after the first call) */
function buildLLMContext(){
  return {
    window:R.meta, kpis:R.kpis,
    spendByCategory:R.byCategory, byPlant:R.byPlant, topGrades:R.byGrade,
    sourcingByRegion:R.byRegion, ordersTrendMonthly:R.ordersTrend, receiptsTrendMonthly:R.receiptTrend,
    leadTimeDistribution:R.leadDist, vendors:R.vendors, overdueOrders:R.overdue.slice(0,40),
    categoryGradeHierarchy:R.hier, vendorSelectionByGrade:R.gradeVendor,
  };
}
const SWAGATA_SYS=`You are **Swagata.ai**, chief manufacturing-intelligence analyst for Acme Manufacturing Group (Indian auto-component manufacturer). Answer questions about their RAW-MATERIAL (steel) procurement using ONLY the JSON DATA provided — never invent a figure. Reason like a sharp supply-chain & procurement strategist: quantify, compare, rank, find root causes and risks, and give a clear recommendation.

DATA MAP — kpis: orderValue, pendingValue, receivedValue(GRN), tonnage(T), valueFill/unitsFill/lineFill(%), overdueLines/overdueValue, avgLead/medLead(days), vendors, grns, plants, unitsShortT. spendByCategory; byPlant; topGrades; sourcingByRegion; orders/receipts monthly trends; leadTimeDistribution; vendors[] (spend/received/pending ₹, recT/ordT tonnes, fill%, delivpct%, trust 0-100, region); overdueOrders[]; categoryGradeHierarchy (per category → grades, tonnage & fill); vendorSelectionByGrade ("Category / Grade" → ranked vendors with fill%, lead days, price ₹/kg, score).

FORMULAS (use exactly): Value fill = ₹received÷₹ordered×100; Units fill = qty received÷ordered; Line fill = lines fully received÷total. Vendor trust = 0.6·fill% + 0.4·delivered%. Vendor-selection score = 0.5·(fill normalised) + 0.5·(lead normalised, lower better), prefer lower ₹/kg. Overdue = delivery date passed with qty still pending.

UNITS: every money value is in rupees — present as ₹ Cr (÷10,000,000) or ₹ L (÷100,000); weights as tonnes (T).

HONESTY: this is procurement-side data with NO selling price, demand forecast, or demand variability — so you CANNOT compute commercial margin, projected revenue, lost sales, or safety stock; say so plainly if asked. Prices exist only for Coil grades (others show price n/a).

STYLE: concise, executive, quantitative — cite the actual numbers. Output clean HTML only (<b>, <br>, <ul><li>, simple tables) — no markdown, no code fences. Lead with the answer; end with a bolded "▶ Recommendation" when useful.`;
async function askLLM(q,onText){
  const model=llmModel();
  const reason=model.indexOf('opus')>=0||model.indexOf('sonnet')>=0;   // adaptive thinking + effort
  const body={model,max_tokens:2048,stream:true,
    system:[{type:'text',text:SWAGATA_SYS},{type:'text',text:'LIVE DATA (JSON):\n'+JSON.stringify(buildLLMContext()),cache_control:{type:'ephemeral'}}],
    messages:[...chatHistory,{role:'user',content:q}]};
  if(reason){body.thinking={type:'adaptive'};body.output_config={effort:'high'};}
  const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'content-type':'application/json','x-api-key':llmKey(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify(body)});
  if(!res.ok||!res.body){
    let msg='HTTP '+res.status; try{const e=await res.json();msg=(e.error&&e.error.message)||msg;}catch(_){}
    if(res.status===401)msg='Invalid API key (401). Re-enter your key via ⚙ Connect AI.';
    throw new Error(msg);
  }
  const reader=res.body.getReader(), dec=new TextDecoder(); let buf='', full='';
  for(;;){
    const {done,value}=await reader.read(); if(done)break;
    buf+=dec.decode(value,{stream:true}); let nl;
    while((nl=buf.indexOf('\n'))>=0){
      const line=buf.slice(0,nl).trim(); buf=buf.slice(nl+1);
      if(!line.startsWith('data:'))continue;
      let ev; try{ev=JSON.parse(line.slice(5).trim());}catch(_){continue;}
      if(ev.type==='content_block_start'&&ev.content_block&&ev.content_block.type==='thinking'&&onText)onText(null,true);
      else if(ev.type==='content_block_delta'&&ev.delta.type==='text_delta'){full+=ev.delta.text; if(onText)onText(full,false);}
      else if(ev.type==='error')throw new Error((ev.error&&ev.error.message)||'stream error');
    }
  }
  full=full.trim();
  chatHistory.push({role:'user',content:q},{role:'assistant',content:full||'(no content)'});
  if(chatHistory.length>12)chatHistory=chatHistory.slice(-12);
  return full;
}
function stat(label,val){return `<span class="stat"><b>${val}</b><span style="color:var(--muted)">${label}</span></span>`;}

/* ---- Swagata.ai · Raw-Material / Vendor knowledge ---- */
function vendorCard(vn){
  const t=vn.trust>=60?'On Track':vn.trust>=35?'Watch':'At Risk';
  const short=Math.max(0,vn.spend-vn.received);
  return `<b>🏷️ ${vn.vendor}</b>
    ${stat('Fill rate',vn.fill+'%')}${stat('Spend',cr(vn.spend))}${stat('Received',cr(vn.received))}${stat('Trust',vn.trust+' · '+t)}
    <div class="mini">Value fill rate = ₹ received ÷ ₹ ordered = ${cr(vn.received)} ÷ ${cr(vn.spend)} = <b>${vn.fill}%</b> (${cr(short)} short). Delivered ${vn.delivpct}% of lines · ${vn.recT.toLocaleString('en-IN')} T received · ${cr(vn.pending)} pending · region ${vn.region} · ${vn.lines} lines.</div>`;
}
/* generic vendor matcher — real-name tokens OR anonymized "Vendor NN" */
const VSTOP=new Set('steel india ltd pvt the and top for of by vendor vendors order orders spend group works udyog ispat nigam industries industry company limited private enterprises corporation corp metals metal iron auto parts components'.split(' '));
function vendorTokens(v){return v.vendor.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=3 && !VSTOP.has(w));}
function matchedVendors(s){
  const out=[]; const re=/\bvendor\s*0*(\d{1,2})\b/g; let m;
  while((m=re.exec(s))){const v=R.vendors.find(x=>x.vendor.toLowerCase()==='vendor '+m[1].padStart(2,'0'))||R.vendors[+m[1]-1]; if(v&&!out.includes(v))out.push(v);}
  if(out.length) return out;
  for(const v of R.vendors){ if(vendorTokens(v).some(w=>s.includes(w)) && !out.includes(v)) out.push(v); }
  return out;
}
/* same grade across product forms (Bar / Coil / Strip …) */
function gradeAcrossForms(s){
  const q=s.replace(/[^a-z0-9]/g,''), by={};
  for(const c of (R.hier||[])) for(const g of c.grades){
    const n=g.grade.toLowerCase().replace(/[^a-z0-9]/g,'');
    if(n.length>=3 && q.includes(n)){(by[g.grade]=by[g.grade]||[]).push(Object.assign({cat:c.category},g));}
  }
  let best=null; for(const k in by){ if(!best||by[k].length>by[best].length) best=k; }
  return best?{grade:best,rows:by[best]}:null;
}
function formCard(r){
  const rows=[...r.rows].sort((a,b)=>b.ordT-a.ordT), tot=rows.reduce((a,x)=>a+x.ordT,0);
  const worst=[...rows].sort((a,b)=>a.fill-b.fill)[0];
  return `<b>🔀 ${r.grade} across product forms</b>
    <ul>${rows.map(x=>`<li><b>${x.cat}</b> — ${tT(x.ordT)} ordered · ${tT(x.recT)} received · fill <b>${x.fill}%</b> · ${x.lines} lines</li>`).join('')}</ul>
    <div class="mini">Same grade (${r.grade}) across <b>${rows.length} form${rows.length>1?'s':''}</b>, ${tT(tot)} ordered total — same chemistry but a separate SKU, vendor set & MOQ per form.${rows.length>1&&worst.fill<30?` <span style="color:var(--rose)">${worst.cat} form is lagging at ${worst.fill}% — expedite.</span>`:''}</div>`;
}
/* weighted vendor selection for a grade+form: 50% completion + 50% lead, price for preference */
function recVendor(s){
  const forms=[['coil','Coils'],['strip','Strips'],['pipe','Pipes'],['tier','Tier-2 Bars'],['bar','Bars']];
  let cat=null; for(const [f,c] of forms){ if(s.includes(f)){cat=c;break;} }
  const q=s.replace(/[^a-z0-9]/g,'');
  for(const key in (R.gradeVendor||{})){
    const sp=key.split(' / '), gn=sp[1].toLowerCase().replace(/[^a-z0-9]/g,'');
    if(gn.length>=3 && q.includes(gn) && (!cat||sp[0]===cat)) return {key,vs:R.gradeVendor[key]};
  }
  return null;
}
function recCard(rv){
  const vs=rv.vs, top=vs[0], priced=vs.filter(v=>v.price!=null);
  const cheap=priced.length?priced.slice().sort((a,b)=>a.price-b.price)[0]:null;
  return `<b>🎯 Vendor selection · ${rv.key}</b>
    <div class="mini" style="margin:4px 0 2px">Score = 50% completion + 50% lead time (lower = better); price shown for preference.</div>
    <ul>${vs.map((v,i)=>`<li><b>${i+1}. ${v.vendor}</b> — score <b>${v.score}</b> · fill ${v.fill}% · lead ${v.lead!=null?v.lead+'d':'—'} · ${v.price!=null?'₹'+v.price+'/kg':'price n/a'}</li>`).join('')}</ul>
    <div class="mini">▶ Recommended: <b>${top.vendor}</b> (best 50/50 score).${cheap&&cheap.vendor!==top.vendor?` Cheapest: <b>${cheap.vendor}</b> at ₹${cheap.price}/kg — choose if price-led.`:''}</div>`;
}
/* material/item-code lookup — matches the query against actual codes in the data */
let _matCodes=null;
function matCodes(){
  if(!_matCodes){_matCodes=new Set();for(const r of R.rawOrders){const m=(r.mat||'').toUpperCase();if(m)_matCodes.add(m);}}
  return _matCodes;
}
function matCard(code){
  const rows=R.rawOrders.filter(r=>(r.mat||'').toUpperCase()===code);
  if(!rows.length)return null;
  const ord=rows.reduce((a,r)=>a+r.order,0),pend=rows.reduce((a,r)=>a+r.pend,0),qty=rows.reduce((a,r)=>a+r.qtyT,0);
  const fill=ord?Math.round((ord-pend)/ord*100):0;
  const vn=[...new Set(rows.map(r=>r.vendor))],pl=[...new Set(rows.map(r=>r.plant))];
  return `<b>🔎 ${code}</b> — ${rows[0].desc||''}
    ${stat('Order',cr(ord))}${stat('Pending',cr(pend))}${stat('Qty',tT(qty))}${stat('Fill',fill+'%')}
    <ul>${rows.slice(0,6).map(r=>`<li>${r.plant} · ${r.vendor} · ${tT(r.qtyT)} · ${cr(r.order)} ${r.pend>0?'· '+cr(r.pend)+' pending':'· received'}</li>`).join('')}</ul>
    <div class="mini">${rows.length} order line(s) · grade ${rows[0].grade||'—'} · ${vn.length} vendor(s) · plant(s) ${pl.join(', ')}.</div>`;
}
function rmAnswer(s,k){
  // MATERIAL CODE FIRST — any code the user types returns its info
  {
    const qU=s.toUpperCase(), codes=matCodes();
    for(const c of codes){ if(qU.includes(c)) return matCard(c); }          // full code present
    const frag=(qU.match(/MAT-\d{2,}|[A-Z]{0,2}-?RM-?[\dA-Z-]{2,}|\b[\dA-Z]{2,}-[\dA-Z]{2,}-[\dA-Z]+\b/)||[])[0];
    if(frag){
      const cand=[...codes].filter(c=>c.includes(frag));
      if(cand.length) return matCard(cand[0]) + (cand.length>1?`<div class="mini">${cand.length} codes match “${frag}” — showing the first. Give the full code for an exact line.</div>`:'');
      if(/RM|MAT/.test(frag)) return `<b>🔎 ${frag}</b><div class="mini">No order line found for that material code in the current data (${codes.size} codes loaded). Codes look like <b>MAT-0001</b>. Try a grade, form, vendor or plant.</div>`;
    }
  }
  // weighted vendor selection for a grade/form (e.g. "best vendor for 16MNCR5 coil")
  if(/(vendor|suppl|buy|source|select|recommend|cheap|score|prefer|who)/.test(s)){
    const rv=recVendor(s); if(rv) return recCard(rv);
  }
  // same grade across forms (Bar/Coil/Strip) — must beat the generic grade intent
  if(/(across form|by form|\bforms?\b|bar.*coil|coil.*bar|coil.*strip|each form|per form|form-?wise|grade.*form)/.test(s)){
    const gf=gradeAcrossForms(s); if(gf) return formCard(gf);
  }
  // a specific vendor named (real-name token or "Vendor NN") → its scorecard, fill rate included
  const mv=matchedVendors(s);
  if(mv.length===1 && !/(compare|versus|\bvs\b|rank|\btop\b|all vendor|list)/.test(s)) return vendorCard(mv[0]);
  // executive summary / brief
  if(/(summary|brief|overview|today|executive|health|status)/.test(s)) return rmBrief(k);
  // fulfilment / fill rate — value, units and line basis
  if(/(fulfil|fulfill|fill rate|received vs|why.*low|completion|service level)/.test(s)){
    const recv=k.orderValue-k.pendingValue;
    return `<b>📊 RM fill rate</b>
      ${stat('Value fill',k.valueFill+'%')}${stat('Units fill',k.unitsFill+'%')}${stat('Line fill',k.lineFill+'%')}${stat('Overdue',k.overdueLines+' lines')}
      <ul>
        <li><b>Value fill</b> = ₹ received ÷ ₹ ordered = ${cr(recv)} ÷ ${cr(k.orderValue)} = <b>${k.valueFill}%</b></li>
        <li><b>Units fill</b> = qty received ÷ qty ordered = <b>${k.unitsFill}%</b> (≈ ${k.unitsShortT.toLocaleString('en-IN')} T short)</li>
        <li><b>Line fill</b> = lines fully received ÷ total lines = <b>${k.lineFill}%</b></li>
      </ul>
      <div class="mini">${k.overdueLines} lines past due (${cr(k.overdueValue)}) — clearing overdue receipts is the fastest lever to lift fill rate.</div>`;
  }
  // plants ranking (generic, not a specific code)
  if(/(plant)/.test(s) && !s.match(/\b(zzznomatchzzz)\b/)){
    const t=[...R.byPlant].sort((a,b)=>b.pending-a.pending).slice(0,6);
    return `<b>🏭 Plants by pending RM value</b>
      <ul>${t.map((p,i)=>`<li><b>${i+1}. ${p.plant}</b> — ${cr(p.pending)} pending · ${cr(p.order)} ordered · fill ${p.fill}%</li>`).join('')}</ul>
      <div class="mini">${t[0].plant} carries the largest steel pending exposure.</div>`;
  }
  // compare two vendors (named, else default to the top 2 by spend)
  if(/(compare|versus|\bvs\b)/.test(s)){
    const f=mv.length>=2?mv:R.vendors.slice(0,2); const x=f[0],y=f[1];
    return `<b>⚖️ ${x.vendor} vs ${y.vendor}</b>
      ${stat('Spend',cr(x.spend)+' / '+cr(y.spend))}${stat('Tonnes',x.recT.toLocaleString('en-IN')+' / '+y.recT.toLocaleString('en-IN'))}${stat('Fill %',x.fill+'% / '+y.fill+'%')}${stat('Trust',x.trust+' / '+y.trust)}
      <div class="mini">${x.trust>=y.trust?x.vendor:y.vendor} has the stronger trust score; ${x.pending>y.pending?x.vendor:y.vendor} carries more pending value.</div>`;
  }
  // vendor ranking / trust
  if(/(vendor|supplier|trust|scorecard|who.*suppl)/.test(s)){
    const t=R.vendors.slice(0,5);
    return `<b>🏭 Top steel vendors by spend</b>
      <ul>${t.map((v,i)=>`<li><b>${i+1}. ${v.vendor}</b> — ${cr(v.spend)} · ${v.recT.toLocaleString('en-IN')} T · fill ${v.fill}% · trust ${v.trust}</li>`).join('')}</ul>
      <div class="mini">${R.kpis.vendors} active suppliers. ${t[0].vendor} leads at ${(t[0].spend/R.kpis.orderValue*100).toFixed(0)}% of RM spend.</div>`;
  }
  // overdue
  if(/(overdue|late|delay|expedite|behind)/.test(s)){
    const t=R.overdue.slice(0,5);
    return `<b>⚠️ Overdue steel orders</b> — <b>${k.overdueLines} lines</b> late, ${cr(k.overdueValue)} pending.
      <ul>${t.map(r=>`<li><b>${r.vendor}</b> @ ${r.plant} — ${cr(r.pend)} · ${r.daysLate} days late (due ${r.due})</li>`).join('')}</ul>
      <div class="mini">Oldest overdue: ${t[0].daysLate} days. Prioritise these for expediting.</div>`;
  }
  // lead time (real, from GRN)
  if(/(lead time|deliver|how long|turnaround|cycle)/.test(s)){
    return `<b>⏱️ Steel lead time</b> — avg <b>${k.avgLead} days</b>, median <b>${k.medLead} days</b> (PO release → GRN receipt).
      <ul>${R.leadDist.map(l=>`<li>${l.label}: <b>${l.count}</b> receipts</li>`).join('')}</ul>
      <div class="mini">Based on ${k.grns} GRNs over 17 months — a genuine receipt lead time.</div>`;
  }
  // grades
  if(/(grade|15b25|scm|16mncr|4135|steel type)/.test(s)){
    const t=R.byGrade.slice(0,6);
    return `<b>🧬 Top steel grades by tonnage</b>
      <ul>${t.map(g=>`<li><b>${g.grade}</b> — ${g.tonnes.toLocaleString('en-IN')} T · ${cr(g.value)} · ${g.grns} GRNs</li>`).join('')}</ul>`;
  }
  // region / sourcing
  if(/(region|source|sourcing|state|geograph|where.*from)/.test(s)){
    const t=R.byRegion.slice(0,6);
    return `<b>🗺️ Steel sourcing by region</b>
      <ul>${t.map(r=>`<li><b>${r.region}</b> — ${r.tonnes.toLocaleString('en-IN')} T · ${cr(r.value)}</li>`).join('')}</ul>
      <div class="mini">${t[0].region} is the largest sourcing hub by tonnage.</div>`;
  }
  // category
  if(/(coil|black bar|\bbar\b|\bpipe\b|strip|category|form)/.test(s)){
    const t=R.byCategory.slice(0,6);
    return `<b>📦 RM spend by category</b>
      <ul>${t.map(c=>`<li><b>${c.name}</b> — ${cr(c.order)} · ${c.tonnes.toLocaleString('en-IN')} T</li>`).join('')}</ul>`;
  }
  // tonnage / intake
  if(/(tonne|tonnag|intake|received|\bgrn\b|receipt|volume)/.test(s)){
    return `<b>📥 Steel intake</b>
      ${stat('Received',cr(k.receivedValue))}${stat('Tonnage',k.tonnage.toLocaleString('en-IN')+' T')}${stat('GRNs',k.grns)}${stat('Vendors',k.vendors)}
      <div class="mini">Peak month: ${R.receiptTrend.reduce((a,b)=>b.tonnes>a.tonnes?b:a).month} (${R.receiptTrend.reduce((a,b)=>b.tonnes>a.tonnes?b:a).tonnes.toLocaleString('en-IN')} T).</div>`;
  }
  // plant (RM)
  const pm=s.match(/\b(zzznomatchzzz)\b/);
  if(pm){const p=R.byPlant.find(x=>x.plant.toLowerCase()===pm[1]);
    if(p)return `<b>🏭 ${p.plant} · raw material</b>
      ${stat('Order',cr(p.order))}${stat('Received',cr(p.received))}${stat('Tonnes',p.tonnes.toLocaleString('en-IN'))}${stat('Fill',p.fill+'%')}
      <div class="mini">${p.lines} RM order lines · ${cr(p.pending)} pending.</div>`;}
  // default → brief
  return rmBrief(k);
}
function rmBrief(k){
  return `<b>🏗️ Raw-Material executive brief · ${R.meta.orderWindow}</b>
    ${stat('Ordered',cr(k.orderValue))}${stat('Received',cr(k.receivedValue))}${stat('Intake',k.tonnage.toLocaleString('en-IN')+' T')}${stat('Overdue',k.overdueLines+' lines')}
    <ul>
      <li><b>${k.vendors} vendors</b> supplied across <b>${k.plants} plants</b>; top is <b>${k.topVendor}</b> (${cr(k.topVendorSpend)}).</li>
      <li><b>${k.tonnage.toLocaleString('en-IN')} T</b> received via ${k.grns} GRNs; median lead <b>${k.medLead} days</b>.</li>
      <li><span style="color:var(--rose)"><b>${k.overdueLines} open lines overdue</b></span> worth ${cr(k.overdueValue)} — expedite focus.</li>
    </ul>
    <div class="chips" style="margin-top:10px">${SUGGEST.slice(1,5).map(x=>`<div class="qchip" onclick="ask('${x.replace(/'/g,"\\'")}')">${x}</div>`).join('')}</div>`;
}

function answer(q){
  return rmAnswer(q.toLowerCase(), R.kpis);
}

/* ===================================================================
   CHART HELPERS
   =================================================================== */
function grad(hex){const c=document.createElement('canvas').getContext('2d');
  const g=c.createLinearGradient(0,0,0,260);g.addColorStop(0,hex+'cc');g.addColorStop(1,hex+'10');return g;}
const GRID='rgba(255,255,255,.05)', TICK='#8a96ad';
// staggered, premium animation presets (replay-friendly)
const ANIM_LINE={duration:1200,easing:'easeOutQuart',
  delay:(c)=>c.type==='data'&&c.mode==='default'?c.dataIndex*14:0};
const ANIM_BAR={duration:850,easing:'easeOutCubic',
  delay:(c)=>c.type==='data'&&c.mode==='default'?c.dataIndex*55:0};
const ANIM_DONUT={animateRotate:true,animateScale:true,duration:1100,easing:'easeOutQuart'};
function lineOpts(fmt){return{responsive:true,maintainAspectRatio:false,animation:ANIM_LINE,
  plugins:{legend:{display:false},tooltip:tt(fmt)},
  scales:{x:{grid:{display:false},ticks:{color:TICK,maxTicksLimit:10,font:{size:10}}},
          y:{grid:{color:GRID},ticks:{color:TICK,font:{size:10},callback:v=>cr(v)}}}};}
function barOpts(fmt,stacked,horizontal){
  // category axis = y when horizontal, x when vertical → leave its tick formatter default (shows labels)
  // value axis    = x when horizontal, y when vertical → format with cr()
  const valTicks={color:TICK,font:{size:10},callback:v=>fmt?fmt(v):v};
  const catTicks={color:TICK,font:{size:10},autoSkip:false,maxRotation:horizontal?0:55,minRotation:0};
  return{indexAxis:horizontal?'y':'x',responsive:true,maintainAspectRatio:false,animation:ANIM_BAR,
    plugins:{legend:{display:!!stacked,labels:{color:TICK,boxWidth:10,font:{size:10}}},tooltip:tt(fmt)},
    scales:{x:{stacked:!!stacked,grid:{display:false},ticks:horizontal?valTicks:catTicks},
            y:{stacked:!!stacked,grid:{color:GRID},ticks:horizontal?catTicks:valTicks}}};}
function donutOpts(center,sub,fmt){return{responsive:true,maintainAspectRatio:false,cutout:'70%',animation:ANIM_DONUT,
  plugins:{legend:{position:'bottom',labels:{color:TICK,boxWidth:9,padding:10,font:{size:10.5}}},
    tooltip:tt(fmt||(v=>typeof v==='number'&&v>1000?cr(v):v)),
    center:{text:center,sub:sub}},};}
function tt(fmt){return{backgroundColor:'rgba(10,14,26,.95)',borderColor:'rgba(255,255,255,.12)',borderWidth:1,
  padding:10,titleColor:'#fff',bodyColor:'#cbd5e1',callbacks:{label:c=>{
    const p=c.parsed;
    // doughnut/pie → number; horizontal bar → value is x; vertical bar/line → value is y
    let v = (typeof p==='number') ? p
          : (c.chart.options.indexAxis==='y' ? p.x : p.y);
    if(v==null) v = (typeof p==='number'?p:(p.y??p.x));
    return '  '+(fmt?fmt(v):v);
  }}}}
// center text plugin for doughnuts
Chart.register({id:'center',afterDraw(chart){const o=chart.config.options.plugins.center;if(!o||!o.text)return;
  const {ctx,chartArea:{left,right,top,bottom}}=chart;const x=(left+right)/2,y=(top+bottom)/2;
  ctx.save();ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 20px Sora';ctx.fillText(o.text,x,y-2);
  if(o.sub){ctx.fillStyle='#8a96ad';ctx.font='600 10px Inter';ctx.fillText(o.sub.toUpperCase(),x,y+15);}ctx.restore();}});

/* ---------- animated counters ---------- */
function animateCounts(scope){
  scope.querySelectorAll('.val[data-count]').forEach(node=>{
    if(node._anim){clearInterval(node._anim);}        // cancel any in-flight count (avoids frozen partial value on rapid re-nav)
    if(node.dataset.final===undefined) node.dataset.final=node.innerHTML;  // capture the true final once
    const target=parseFloat(node.dataset.count); const final=node.dataset.final;
    if(isNaN(target)){node.innerHTML=final;return;}
    const isPct=final.includes('%')||target<100&&final.includes('.');
    let cur=0;const steps=34,inc=target/steps;let i=0;
    node._anim=setInterval(()=>{i++;cur+=inc;if(i>=steps){node.innerHTML=final;clearInterval(node._anim);node._anim=null;return;}
      node.textContent=target>1e5?cr(cur):Math.round(cur*(isPct?10:1))/(isPct?10:1);},18);
  });
}

/* ---------- toast / alerts ---------- */
function toast(t1,t2){$('#toastT1').textContent=t1;$('#toastT2').textContent=t2;
  const el=$('#toast');el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),4200);}
$('#bell').onclick=()=>toast('3 Smart Alerts',`${R.kpis.overdueLines} overdue steel lines (${cr(R.kpis.overdueValue)}) · top supplier ${R.kpis.topVendor.split(' ')[0]} · median lead ${R.kpis.medLead}d.`);

/* ===================================================================
   LOGIN + BOOT
   =================================================================== */
$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const role=$('#lrole').value;
  $('#login').style.display='none';
  $('#app').style.display='grid';
  const ini=role.split('·')[0].trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  $('#userInitials').textContent=ini||'MT';
  $('#userMeta').innerHTML=`${role.split('·')[0].trim()}<br/><small>${role.includes('VP')||role.includes('Admin')?'All-Plant Access':'Scoped Access'}</small>`;
  $('#footWindow').textContent=R.meta.orderWindow;
  boot();
  setTimeout(()=>toast('Swagata.ai brief ready',`${R.kpis.overdueLines} overdue steel lines · ${cr(R.kpis.overdueValue)} flagged for expediting.`),1400);
});
function boot(){
  buildNav();
  ensureView('exec');           // render the default view (charts + KPIs animate in)
  document.querySelector('.nav[data-id="exec"]').classList.add('active');
  setupChrome();
}
// live clock + working global search
function setupChrome(){
  const clk=$('#clock');
  const tick=()=>{const d=new Date();clk.textContent='⏱ '+d.toLocaleTimeString('en-GB');};
  tick(); setInterval(tick,1000);
  const gs=$('#globalSearch');
  if(gs) gs.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const q=e.target.value.trim();
    route(MODULES[0]);                 // jump to Procurement
    const f=$('#rmSearch'); if(f){f.value=q; renderRMrows();}
    if(q) toast('Search applied',`Filtered Purchase Orders for “${q}”.`);
  });
}
// redraw sparklines on resize so they stay crisp
let _rsz; window.addEventListener('resize',()=>{clearTimeout(_rsz);_rsz=setTimeout(()=>{const v=$('#view-exec'); if(v&&v.classList.contains('active'))drawSparks(v);},250);});
