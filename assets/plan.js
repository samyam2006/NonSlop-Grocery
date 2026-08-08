/* =========================================================================
   THE NONSLOP MEAL-PLAN + SHOPPING-LIST GENERATOR
   Builds a personalised weekly plan from MEALS, aggregates a categorised
   shopping list, and estimates the cost. Pure client-side.
   ========================================================================= */
(function(){
  "use strict";
  if(typeof MEALS === "undefined") return;
  var root = document.getElementById("planApp");
  if(!root) return;

  var TIER = { budget:0.68, standard:1.0, premium:1.6 };
  var CATS = [
    ["meat","Meat & poultry"],["seafood","Seafood"],["eggs","Eggs"],
    ["dairy","Dairy"],["produce","Produce"],["fats","Fats & oils"],["pantry","Pantry"]
  ];

  var state = { household:2, days:7, diet:"omnivore", tier:"standard",
                slots:{breakfast:true, lunch:true, dinner:true} };

  /* ---- helpers ---- */
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function tierOK(m){
    if(state.tier==="premium") return true;
    if(state.tier==="standard") return m.tier==="budget"||m.tier==="standard";
    return m.tier==="budget";
  }
  function pool(slot){
    return MEALS.filter(function(m){ return m.slot===slot && m.diet.indexOf(state.diet)!==-1 && tierOK(m); });
  }
  function rotation(p, count){
    if(!p.length) return [];
    var out=[], bag=[];
    for(var i=0;i<count;i++){
      if(!bag.length) bag=shuffle(p);
      var m=bag.pop();
      if(out.length && out[out.length-1].id===m.id && bag.length){ var alt=bag.pop(); bag.push(m); m=alt; }
      out.push(m);
    }
    return out;
  }
  function money(n){ return "$"+ (Math.round(n*100)/100).toFixed(2); }
  function money0(n){ return "$"+ Math.round(n); }
  function fmtQty(q,u){
    q = Math.round(q*10)/10;
    if(u==="g" && q>=1000) return (Math.round(q/100)/10)+" kg";
    if(u==="ml" && q>=1000) return (Math.round(q/100)/10)+" L";
    var qStr = (q % 1 === 0) ? q : q.toFixed(1);
    return u ? (qStr+" "+u) : ("×"+qStr);
  }

  /* ---- generate ---- */
  var current = null; // { plan: [{day, meals:{slot:meal}}], meals:[all instances] }
  function generate(){
    var enabledSlots = ["breakfast","lunch","dinner"].filter(function(s){ return state.slots[s]; });
    var rotations = {};
    enabledSlots.forEach(function(s){ rotations[s] = rotation(pool(s), state.days); });

    var plan = [], allMeals = [];
    for(var d=0; d<state.days; d++){
      var day = { i:d, meals:{} };
      enabledSlots.forEach(function(s){
        var m = rotations[s][d];
        if(m){ day.meals[s]=m; allMeals.push(m); }
      });
      plan.push(day);
    }
    current = { plan:plan, meals:allMeals, slots:enabledSlots };
    render();
  }

  /* ---- render plan ---- */
  var DAYNAMES = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7","Day 8","Day 9","Day 10","Day 11","Day 12","Day 13","Day 14"];
  function render(){
    if(!current) return;
    var planEl = document.getElementById("planGrid");
    var slotLabel = { breakfast:"Breakfast", lunch:"Lunch", dinner:"Dinner" };
    planEl.innerHTML = current.plan.map(function(day){
      var rows = current.slots.map(function(s){
        var m = day.meals[s];
        if(!m) return "";
        return '<div class="plan-meal"><span class="plan-slot">'+slotLabel[s]+'</span>'+
               '<div><div class="plan-name">'+esc(m.name)+'</div>'+
               (m.note?'<div class="plan-note">'+esc(m.note)+'</div>':'')+'</div></div>';
      }).join("");
      return '<div class="plan-day"><div class="plan-daynum">'+(DAYNAMES[day.i]||("Day "+(day.i+1)))+'</div>'+rows+'</div>';
    }).join("");

    renderList();
    renderCost();
  }

  /* ---- shopping list ---- */
  function renderList(){
    var agg = {}; // cat -> { key -> {n,q,u,cat} }
    current.meals.forEach(function(m){
      m.ing.forEach(function(ig){
        var key = ig.n.toLowerCase()+"|"+ig.u;
        var bucket = agg[ig.cat] || (agg[ig.cat]={});
        if(!bucket[key]) bucket[key] = { n:ig.n, q:0, u:ig.u, cat:ig.cat };
        bucket[key].q += ig.q * state.household;
      });
    });
    var listEl = document.getElementById("shopList");
    var html = "";
    var total = 0;
    CATS.forEach(function(pair){
      var cat=pair[0], label=pair[1];
      var bucket = agg[cat]; if(!bucket) return;
      var items = Object.keys(bucket).map(function(k){return bucket[k];});
      total += items.length;
      html += '<div class="shop-cat"><h4>'+label+'</h4><ul>'+
        items.map(function(it){
          return '<li><label><input type="checkbox"><span class="shop-item">'+esc(it.n)+'</span>'+
                 '<span class="shop-qty">'+esc(fmtQty(it.q,it.u))+'</span></label></li>';
        }).join("")+'</ul></div>';
    });
    listEl.innerHTML = html;
    var cnt = document.getElementById("listCount");
    if(cnt) cnt.textContent = total + " items · " + state.household + (state.household>1?" people":" person") + " · " + state.days + " days";
  }

  /* ---- cost ---- */
  function renderCost(){
    var mult = TIER[state.tier];
    var weekly = 0;
    current.meals.forEach(function(m){ weekly += m.cost * mult * state.household; });
    var perPersonWeek = weekly / state.household;
    var perPersonDay = perPersonWeek / state.days;
    var monthly = weekly * (30/state.days);
    document.getElementById("costWeekly").textContent = money0(weekly);
    document.getElementById("costPerPerson").textContent = money(perPersonDay);
    document.getElementById("costMonthly").textContent = money0(monthly);
    // takeout comparison — a modest $14 per takeout/restaurant meal
    var takeoutMeals = current.meals.length; // total meals cooked
    var takeoutCost = takeoutMeals * state.household * 14;
    var saved = takeoutCost - weekly;
    var cmp = document.getElementById("costCompare");
    if(cmp){
      cmp.textContent = saved>0
        ? ("The same "+ takeoutMeals*state.household +" meals as takeout would cost about "+money0(takeoutCost)+" — you save ~"+money0(saved)+" a week cooking real food.")
        : "Real food, cooked at home, for less than eating out.";
    }
  }

  /* ---- controls ---- */
  function seg(id, key, cast){
    var el = document.getElementById(id); if(!el) return;
    el.querySelectorAll("button").forEach(function(b){
      b.addEventListener("click", function(){
        el.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});
        b.classList.add("on");
        state[key] = cast ? cast(b.getAttribute("data-v")) : b.getAttribute("data-v");
        generate();
      });
    });
  }
  seg("segDiet","diet");
  seg("segTier","tier");
  seg("segDays","days", function(v){return parseInt(v,10);});

  var hh = document.getElementById("planHousehold");
  if(hh) hh.addEventListener("input", function(){
    state.household = Math.max(1, Math.min(12, parseInt(this.value,10)||1));
    generate();
  });

  ["breakfast","lunch","dinner"].forEach(function(s){
    var c = document.getElementById("slot-"+s);
    if(c) c.addEventListener("change", function(){
      state.slots[s] = this.checked;
      if(!state.slots.breakfast && !state.slots.lunch && !state.slots.dinner){ this.checked=true; state.slots[s]=true; }
      generate();
    });
  });

  var regen = document.getElementById("planRegen");
  if(regen) regen.addEventListener("click", function(e){ e.preventDefault(); generate(); });
  var printBtn = document.getElementById("planPrint");
  if(printBtn) printBtn.addEventListener("click", function(e){ e.preventDefault(); window.print(); });

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  generate();
})();
