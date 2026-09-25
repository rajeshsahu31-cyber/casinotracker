const KEY='cycle_tracker_local_v3';
const DEF={balance:5000,peak:5000,cycle:1,running:false,startBalance:5000,profit:0,loss:0,entries:0,history:[],targetRate:5,stopRate:5,cooldownUntil:null,reminder:null};
let s=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(DEF);
const $=id=>document.getElementById(id);
const money=n=>'₹'+Math.round(n).toLocaleString('en-IN');
function save(){localStorage.setItem(KEY,JSON.stringify(s));render()}
function target(){return s.peak}
function cap(){return Math.max(100,Math.ceil((s.balance*.01)/100)*100)}
function stop(){return s.startBalance*s.stopRate/100}
function render(){
 $('balance').textContent=money(s.balance);$('peak').textContent=money(target());$('highest').textContent=money(s.peak);
 $('cycle').textContent=s.cycle;$('status').textContent=s.running?'Running':'Stopped';
 $('stop').textContent=money(stop());$('cap').textContent=money(cap());
 $('profit').textContent=money(s.profit);$('loss').textContent=money(s.loss);
 const denom=Math.max(1,s.peak-s.startBalance), pct=Math.max(0,Math.min(100,(s.balance-s.startBalance)/denom*100));
 $('progressText').textContent=Math.round(pct)+'%';$('bar').style.width=pct+'%';
}
function modal(title,body){$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modal').classList.remove('hidden')}
function close(){ $('modal').classList.add('hidden') }
function startCycle(){
 if(s.running)return alert('Cycle पहले से चालू है।');
 s.running=true;s.startBalance=s.balance;s.profit=0;s.loss=0;s.entries=0;save();
}
function finish(reason){
 s.running=false;
 s.history.unshift({cycle:s.cycle,start:s.startBalance,end:s.balance,profit:s.profit,loss:s.loss,reason,date:new Date().toLocaleString('hi-IN')});
 s.cycle++;save();modal('Cycle समाप्त',`<div class="empty">${reason}<br><br><b>Balance: ${money(s.balance)}</b><br>Peak: ${money(s.peak)}</div>`);
}
function result(a){
 if(!s.running)return alert('पहले Start Cycle दबाइए।');
 if(Math.abs(a)>cap())return alert('यह amount Safety Cap से अधिक है: '+money(cap()));
 s.balance=Math.max(0,s.balance+a);s.entries++;
 if(a>0)s.profit+=a;if(a<0)s.loss+=Math.abs(a);
 if(s.balance>s.peak){s.peak=s.balance;finish('🎯 नया Peak प्राप्त हुआ। यही अब अगला Target है।');return}
 if(s.loss>=stop()){finish('🛑 Stop Loss सीमा पूरी हुई।');return}
 save();
}
function showHistory(){
 if(!s.history.length)return modal('Session History','<div class="empty">अभी कोई completed cycle नहीं है।</div>');
 modal('Session History',s.history.map(h=>`<div class="historyrow"><b>Cycle ${h.cycle}</b> • ${h.date}<br>Start ${money(h.start)} → End ${money(h.end)}<br>Profit ${money(h.profit)} • Loss ${money(h.loss)}<br>${h.reason}</div>`).join(''));
}
function showReport(){modal('Report',`<div class="historyrow">Total Cycles: <b>${s.history.length}</b></div><div class="historyrow">Highest Peak: <b>${money(s.peak)}</b></div><div class="historyrow">Current Balance: <b>${money(s.balance)}</b></div><div class="historyrow">Current Cycle Profit: <b>${money(s.profit)}</b></div><div class="historyrow">Current Cycle Loss: <b>${money(s.loss)}</b></div>`)}
function settings(){
 modal('Settings',`<label style="font-size:10px">Stop Loss %</label><input id="setStop" type="number" value="${s.stopRate}" style="width:100%;margin:6px 0;padding:8px;background:#0f172a;color:white;border:1px solid #334155;border-radius:6px"><button id="saveSet" style="width:100%;padding:8px;background:#2563eb;color:white;border:0;border-radius:6px">Save</button>`);
 $('saveSet').onclick=()=>{s.stopRate=+$('setStop').value||5;save();close()}
}
function cooldown(){s.cooldownUntil=Date.now()+86400000;save();modal('Cooldown','24 घंटे का cooldown सेट किया गया है।')}
function reminder(){let v=prompt('Reminder का समय लिखें (जैसे 8:00 PM):',s.reminder||'');if(v!==null){s.reminder=v;save();alert('Reminder समय सेव हो गया।')}}
function calc(){let a=+$('calcStart').value||0,r=(+$('calcRate').value||0)/100,n=+$('calcCycles').value||0;let x=a*Math.pow(1+r,n);$('calcResult').textContent=`${n} cycles के बाद hypothetical amount: ${money(x)}`}
$('startBtn').onclick=startCycle;$('stopBtn').onclick=()=>{if(s.running)finish('Cycle manually stopped.');else alert('Cycle चल नहीं रहा है।')};
document.querySelectorAll('[data-amt]').forEach(b=>b.onclick=()=>result(+b.dataset.amt));
$('historyBtn').onclick=showHistory;$('reportBtn').onclick=showReport;$('cooldownBtn').onclick=cooldown;$('reminderBtn').onclick=reminder;$('settingsBtn').onclick=settings;
$('menuBtn').onclick=()=>modal('About','<div class="empty">यह app केवल manual tracking के लिए है। कोई login, backend या gaming-platform connection नहीं है। Data इसी browser/device में localStorage में सेव होता है।</div>');
$('closeModal').onclick=close;$('modal').onclick=e=>{if(e.target.id==='modal')close()};
$('calcBtn').onclick=calc;
$('clearHistoryBtn').onclick=()=>{if(confirm('सिर्फ History clear करें? Balance और Peak सुरक्षित रहेंगे।')){s.history=[];save()}};
$('resetBtn').onclick=()=>{if(confirm('पूरा App Reset करें? Balance और Peak सहित सभी local data हट जाएगा।')){localStorage.removeItem(KEY);location.reload()}};
render();
