const KEY='cycle_tracker_local_v4';
const DEF={balance:5000,peak:5000,cycle:1,running:false,startBalance:5000,profit:0,loss:0,entries:0,history:[],stopRate:5,cooldownUntil:null,reminder:null};
let s=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(DEF);
const $=id=>document.getElementById(id);
const money=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const cap=()=>Math.max(100,Math.ceil((s.balance*.01)/100)*100);
const stop=()=>s.startBalance*s.stopRate/100;
function save(){localStorage.setItem(KEY,JSON.stringify(s));render()}
function render(){
 $('balance').textContent=money(s.balance);$('peak').textContent=money(s.peak);$('highest').textContent=money(s.peak);
 $('cycle').textContent=s.cycle;$('status').textContent=s.running?'Running':'Stopped';
 $('stop').textContent=money(stop());$('cap').textContent=money(cap());
 $('profit').textContent=money(s.profit);$('loss').textContent=money(s.loss);
 const d=Math.max(1,s.peak-s.startBalance),p=Math.max(0,Math.min(100,(s.balance-s.startBalance)/d*100));
 $('progressText').textContent=Math.round(p)+'%';$('bar').style.width=p+'%';
}
function modal(title,html){$('modalTitle').textContent=title;$('modalBody').innerHTML='<div class="modalContent">'+html+'</div>';$('modal').classList.remove('hidden')}
function close(){ $('modal').classList.add('hidden') }
function start(){
 if(s.running)return alert('Cycle पहले से चालू है।');
 s.running=true;s.startBalance=s.balance;s.profit=0;s.loss=0;s.entries=0;save();
}
function finish(reason){
 s.running=false;s.history.unshift({cycle:s.cycle,start:s.startBalance,end:s.balance,profit:s.profit,loss:s.loss,reason,date:new Date().toLocaleString('hi-IN')});
 s.cycle++;save();modal('Cycle समाप्त',`<div class="row">${reason}</div><div class="row">Balance: <b>${money(s.balance)}</b></div><div class="row">Peak / Target: <b>${money(s.peak)}</b></div>`);
}
function add(a){
 if(!s.running)return alert('पहले Start Cycle दबाइए।');
 if(Math.abs(a)>cap())return alert('यह amount Safety Cap से अधिक है: '+money(cap()));
 s.balance=Math.max(0,s.balance+a);s.entries++;
 if(a>0)s.profit+=a;else s.loss+=Math.abs(a);
 if(s.balance>s.peak){s.peak=s.balance;finish('🎯 नया Peak प्राप्त हुआ। यही अगला Target है।');return}
 if(s.loss>=stop()){finish('🛑 Stop Loss सीमा पूरी हुई।');return}
 save();
}
function history(){
 if(!s.history.length)return modal('History','<div class="row">अभी कोई completed cycle नहीं है।</div>');
 modal('History',s.history.map(h=>`<div class="row"><b>Cycle ${h.cycle}</b> · ${h.date}<br>Start ${money(h.start)} → End ${money(h.end)}<br>Profit ${money(h.profit)} · Loss ${money(h.loss)}<br>${h.reason}</div>`).join(''));
}
function report(){modal('Report',`<div class="row">Completed Cycles: <b>${s.history.length}</b></div><div class="row">Highest Peak: <b>${money(s.peak)}</b></div><div class="row">Current Balance: <b>${money(s.balance)}</b></div><div class="row">Current Profit: <b>${money(s.profit)}</b></div><div class="row">Current Loss: <b>${money(s.loss)}</b></div>`)}
function more(){
 modal('More',`<div class="modalBtns">
 <button id="coolBtn">⏳ Cooldown</button><button id="remBtn">🔔 Reminder</button>
 <button id="calcOpen">🧮 Calculator</button><button id="setOpen">⚙ Settings</button>
 <button id="clearBtn" class="danger">🗑️ Clear History</button><button id="resetBtn" class="danger">♻️ Reset App</button>
 </div>`);
 $('coolBtn').onclick=()=>{s.cooldownUntil=Date.now()+86400000;save();close();alert('24 घंटे का cooldown सेट किया गया।')};
 $('remBtn').onclick=()=>{let v=prompt('Reminder समय लिखें:',s.reminder||'');if(v!==null){s.reminder=v;save();alert('Reminder सेव हो गया।')}};
 $('calcOpen').onclick=calculator;$('setOpen').onclick=settings;
 $('clearBtn').onclick=()=>{if(confirm('सिर्फ History clear करें? Balance और Peak सुरक्षित रहेंगे।')){s.history=[];save();close()}};
 $('resetBtn').onclick=()=>{if(confirm('पूरा App Reset करें?')){localStorage.removeItem(KEY);location.reload()}};
}
function calculator(){modal('Compounding Calculator',`<div class="calc"><input id="ca" type="number" value="5000" placeholder="Start"><input id="cr" type="number" value="5" placeholder="%"><input id="cn" type="number" value="10" placeholder="Cycles"><button id="doCalc">Calculate</button></div><div class="calcResult" id="calcOut">—</div>`);$('doCalc').onclick=()=>{let a=+$('ca').value||0,r=(+$('cr').value||0)/100,n=+$('cn').value||0;$('calcOut').textContent=money(a*Math.pow(1+r,n))}}
function settings(){modal('Settings',`<div class="row">Stop Loss %<br><input id="sr" type="number" value="${s.stopRate}" style="width:100%;margin-top:5px;padding:7px;background:#071a31;color:#fff;border:1px solid #45637e;border-radius:7px"></div><div class="modalBtns"><button id="saveS">Save</button></div>`);$('saveS').onclick=()=>{s.stopRate=+$('sr').value||5;save();close()}}
$('startBtn').onclick=start;$('stopBtn').onclick=()=>{if(s.running)finish('Cycle manually stopped.');else alert('Cycle चल नहीं रहा है।')};
document.querySelectorAll('[data-amt]').forEach(b=>b.onclick=()=>add(+b.dataset.amt));
$('historyBtn').onclick=history;$('reportBtn').onclick=report;$('moreBtn').onclick=more;$('settingsBtn').onclick=settings;
$('menuBtn').onclick=()=>modal('About','<div class="row">यह app केवल manual tracking के लिए है। कोई login, backend या gaming-platform connection नहीं है। Data इसी browser/device में localStorage में रहता है।</div>');
$('closeModal').onclick=close;$('modal').onclick=e=>{if(e.target.id==='modal')close()};
render();
