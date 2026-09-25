
let balance=5000, startBalance=5000, profit=0, loss=0, bets=0, running=false, cycle=1;
let peakBalance=5000;
const fmt=n=>"₹ "+Math.round(n).toLocaleString("en-IN");
function betLimit(){return Math.max(100,Math.ceil((balance*0.01)/100)*100)}
function render(){
 document.getElementById('balance').textContent=fmt(balance);

 // Peak/high-water-mark कभी नीचे नहीं जाता। हर नई ऊँची राशि रिकॉर्ड होती है।
 if(balance>peakBalance) peakBalance=balance;

 // नया लक्ष्य: पुराने Peak को recover करना + Peak पर 5% का नया growth target.
 const peakNextTarget=peakBalance*1.05;
 const cycleTarget = Math.max(startBalance, peakNextTarget);
 const cycleTargetProfit = Math.max(0, cycleTarget-startBalance);

 document.getElementById('targetMoney').textContent="("+fmt(cycleTargetProfit)+")";
 document.getElementById('target2').textContent=fmt(cycleTargetProfit);
 document.getElementById('remain').textContent=fmt(Math.max(0,cycleTarget-balance));
 document.getElementById('cycleTarget').textContent=fmt(cycleTarget);
 document.getElementById('stopMoney').textContent="("+fmt(startBalance*.05)+")";

 document.getElementById('peakBalance').textContent=fmt(peakBalance);
 document.getElementById('peakNextTarget').textContent=fmt(peakNextTarget);

 document.getElementById('betLimit').textContent=fmt(betLimit());
 document.getElementById('betMax').textContent=fmt(betLimit());
 document.getElementById('profit').textContent=fmt(profit);
 document.getElementById('loss').textContent=fmt(loss);
 document.getElementById('profitPct').textContent="("+(profit/startBalance*100).toFixed(2)+"%)";
 document.getElementById('lossPct').textContent="("+(loss/startBalance*100).toFixed(2)+"%)";
 document.getElementById('cycleProfit').textContent=fmt(profit);
 document.getElementById('cycleLoss').textContent=fmt(loss);
 document.getElementById('bets').textContent=bets;

 let pct=cycleTargetProfit>0 ? Math.max(0,Math.min(100,(balance-startBalance)/cycleTargetProfit*100)) : 0;
 document.getElementById('progress').textContent=Math.round(pct)+"%";
 document.getElementById('ring').style.background=`conic-gradient(#3cff56 ${pct*3.6}deg,#1a3b56 ${pct*3.6}deg)`;
 document.getElementById('status').textContent=running?"चल रहा है":"नहीं चला रहा";
}
function modal(title,text){document.getElementById('modalTitle').textContent=title;document.getElementById('modalText').textContent=text;document.getElementById('overlay').style.display="flex"}
function closeModal(){document.getElementById('overlay').style.display="none"}
function startCycle(){
 if(running)return;
 startBalance=balance; profit=0; loss=0; bets=0; running=true; render();
 modal("साइकिल शुरू","Peak/High-Water-Mark: "+fmt(peakBalance)+"\nइस साइकिल का नया लक्ष्य: "+fmt(peakBalance*1.05));
}
function stopCycle(){running=false;render();modal("साइकिल बंद","यह साइकिल बंद कर दी गई है। अगली साइकिल आप अपनी सुविधा के अनुसार शुरू कर सकते हैं।")}
function result(amount){
 if(!running){modal("साइकिल शुरू करें","पहले “साइकिल शुरू करें” दबाएँ।");return}
 if(Math.abs(amount)>betLimit()){modal("STOP","यह राशि आपकी निर्धारित बेट लिमिट से अधिक है।");return}
 balance+=amount;bets++;
 if(amount>0)profit+=amount;else loss+=Math.abs(amount);
 render();
 const sl=startBalance*.05;
 const target=peakBalance*1.05;
 if(balance>=target){
   running=false; render();
   modal("🎯 नया Peak लक्ष्य पूरा","आप "+fmt(target)+" तक पहुँच गए हैं। अब साइकिल बंद है। नया Peak रिकॉर्ड सेव हो गया है।");
 } else if(loss>=sl){
   running=false; render();
   modal("🛑 STOP-LOSS","आपकी निर्धारित 5% स्टॉप-लॉस सीमा पूरी हो गई है। साइकिल बंद कर दी गई है।\nPeak रिकॉर्ड: "+fmt(peakBalance));
 }
}
function calculate(){
 let s=+document.getElementById('start').value||5000,r=+document.getElementById('rate').value||5,n=Math.max(1,+document.getElementById('cycles').value||10);
 let x=s,rows="";
 for(let i=1;i<=n;i++){let p=x*r/100,y=x+p; if(i<=5||i===n)rows+=`<tr><td>${i}</td><td>${Math.round(x).toLocaleString('en-IN')}</td><td>${Math.round(p).toLocaleString('en-IN')}</td><td>${Math.round(y).toLocaleString('en-IN')}</td></tr>`; x=y}
 document.getElementById('table').innerHTML=rows;document.getElementById('final').textContent=fmt(x);document.getElementById('totalProfit').textContent=fmt(x-s);
}
render();calculate();
