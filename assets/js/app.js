const KEY="cycle_tracker_local_v2";
const DEFAULT={balance:5000,peak:5000,cycle:1,running:false,startBalance:5000,profit:0,loss:0,entries:0,history:[],targetRate:5,stopRate:5,cooldownUntil:null,reminder:null};
let s=load();const $=id=>document.getElementById(id);const money=n=>"₹ "+Math.round(n).toLocaleString("en-IN");
function load(){try{return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return {...DEFAULT}}}
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
function openModal(t,b){$("modalTitle").textContent=t;$("modalBody").innerHTML=b;$("modalOverlay").style.display="flex"}
function closeModal(){$("modalOverlay").style.display="none"}
function nextTarget(){return s.peak}
function stopAmount(){return s.startBalance*s.stopRate/100}
function safetyCap(){return Math.max(100,Math.ceil((s.balance*.01)/100)*100)}
function render(){
 if(s.balance>s.peak)s.peak=s.balance;
 $("balance").textContent=money(s.balance);$("peak").textContent=money(s.peak);$("nextTarget").textContent=money(nextTarget());
 $("stopLossText").textContent=money(stopAmount());$("status").textContent=s.running?"सेशन चालू":"सेशन बंद";$("cycleNo").textContent=s.cycle;
 $("profit").textContent=money(s.profit);$("loss").textContent=money(s.loss);$("cycleProfit").textContent=money(s.profit);$("cycleLoss").textContent=money(s.loss);$("entries").textContent=s.entries;
 $("profitPct").textContent=(s.startBalance?((s.profit/s.startBalance)*100).toFixed(2):"0.00")+"%";$("lossPct").textContent=(s.startBalance?((s.loss/s.startBalance)*100).toFixed(2):"0.00")+"%";
 const total=Math.max(1,s.peak-s.startBalance),gap=Math.max(0,s.peak-s.balance),pct=total===1?100:Math.max(0,Math.min(100,((s.balance-s.startBalance)/total)*100));
 $("targetDisplay").textContent=money(s.peak);$("remaining").textContent=money(gap);$("progress").textContent=Math.round(pct)+"%";
 $("ring").style.background=`conic-gradient(#3cff56 ${pct*3.6}deg,#1a3b56 ${pct*3.6}deg)`;save();
}
function startCycle(){if(s.cooldownUntil&&Date.now()<s.cooldownUntil){openModal("⏳ कूलडाउन सक्रिय",`<div class="danger">अभी कूलडाउन चल रहा है। ${new Date(s.cooldownUntil).toLocaleString("hi-IN")} तक नया सेशन शुरू नहीं होगा।</div>`);return}if(s.running)return;s.startBalance=s.balance;s.profit=0;s.loss=0;s.entries=0;s.running=true;render()}
function finish(reason){s.running=false;s.history.unshift({cycle:s.cycle,start:s.startBalance,end:s.balance,profit:s.profit,loss:s.loss,at:new Date().toISOString(),reason});s.cycle++;render();openModal("साइकिल बंद",reason)}
function stopCycle(){if(!s.running){openModal("कोई सक्रिय साइकिल नहीं","पहले साइकिल शुरू करें।");return}finish("आपने साइकिल बंद की।")}
function addResult(a){if(!s.running){openModal("पहले साइकिल शुरू करें","पहले “साइकिल शुरू करें” दबाएँ।");return}if(Math.abs(a)>safetyCap()){openModal("🛑 सुरक्षा सीमा","यह entry आपकी तय safety limit से बड़ी है।");return}s.balance+=a;s.entries++;if(a>0)s.profit+=a;else s.loss+=Math.abs(a);if(s.balance>s.peak)s.peak=s.balance;render();
 if(s.balance>=s.peak&&s.balance>s.startBalance)finish("🎯 नया Peak प्राप्त हुआ। Peak अब यही राशि है। अगली साइकिल का लक्ष्य भी यही Peak रहेगा।");
 else if(s.loss>=stopAmount())finish("🛑 Stop-Loss सीमा पूरी हुई।")}
function calc(){const a=Number($("startInput").value)||5000,r=Number($("rateInput").value)||5,n=Math.max(1,Math.floor(Number($("cyclesInput").value)||10)),f=a*Math.pow(1+r/100,n);$("finalAmount").textContent=money(f);$("compoundProfit").textContent=money(f-a)}
function showHistory(){if(!s.history.length){openModal("सेशन हिस्ट्री","अभी कोई history नहीं है।");return}openModal("सेशन हिस्ट्री",s.history.slice(0,50).map(x=>`<div class="history-row"><b>साइकिल ${x.cycle}</b><br>${money(x.start)} → ${money(x.end)}<br>प्रॉफिट: ${money(x.profit)} | लॉस: ${money(x.loss)}<br><small>${new Date(x.at).toLocaleString("hi-IN")}</small></div>`).join(""))}
function showReport(){const p=s.history.reduce((a,x)=>a+x.profit,0),l=s.history.reduce((a,x)=>a+x.loss,0);openModal("📊 रिपोर्ट",`कुल साइकिल: <b>${s.history.length}</b><br><br>कुल दर्ज प्रॉफिट: <b class="green">${money(p)}</b><br>कुल दर्ज लॉस: <b class="red">${money(l)}</b><br>Highest Peak: <b>${money(s.peak)}</b>`)}
function cooldown(){s.cooldownUntil=Date.now()+86400000;s.running=false;save();render();openModal("⏳ कूलडाउन","24 घंटे का कूलडाउन शुरू हो गया है।")}
function reminder(){const v=prompt("रिमाइंडर समय लिखें, जैसे 20:00");s.reminder=v||null;save();openModal("🔔 रिमाइंडर",v?`समय: <b>${v}</b>`:"रिमाइंडर हटाया गया।")}
function clearHistory(){if(!s.history.length){openModal("History","History पहले से खाली है।");return}if(confirm("क्या केवल पूरी History साफ करनी है? वर्तमान Balance और Peak नहीं बदलेंगे.")){s.history=[];save();openModal("✓ History Clear","History साफ कर दी गई है। Balance और Peak सुरक्षित रखे गए हैं.");}}
function resetApp(){if(confirm("पूरा app reset होगा: Balance ₹5,000, Peak ₹5,000 और History खाली। जारी रखें?")){localStorage.removeItem(KEY);s=load();render();openModal("✓ App Reset","App पूरी तरह शुरुआती स्थिति में आ गया है।")}}
function settings(){openModal("⚙ सेटिंग्स",`लक्ष्य प्रतिशत (सिर्फ calculator): <input id="rateModal" type="number" value="${s.targetRate}"><br><br>Stop-Loss प्रतिशत: <input id="slModal" type="number" value="${s.stopRate}"><br><br><button id="saveSettings">सेव करें</button>`);$("saveSettings").onclick=()=>{s.targetRate=Number($("rateModal").value)||5;s.stopRate=Number($("slModal").value)||5;save();closeModal();render()}}
$("startBtn").onclick=startCycle;$("stopBtn").onclick=stopCycle;$("calcBtn").onclick=calc;$("historyBtn").onclick=showHistory;$("reportBtn").onclick=showReport;$("reportTile").onclick=showReport;$("cooldownBtn").onclick=cooldown;$("reminderBtn").onclick=reminder;$("settingsBtn").onclick=settings;$("clearHistoryBtn").onclick=clearHistory;$("resetBtn").onclick=resetApp;
$("menuBtn").onclick=()=>openModal("Cycle Tracker","कोई Login नहीं है। History इसी device के browser में localStorage में सेव होती है।");$("closeModal").onclick=closeModal;$("modalOverlay").onclick=e=>{if(e.target.id==="modalOverlay")closeModal()};
document.querySelectorAll("[data-amount]").forEach(b=>b.onclick=()=>addResult(Number(b.dataset.amount)));calc();render();