/* =========================================================================
   THE NONSLOP GROCERY NAVIGATOR — shared behaviour
   ========================================================================= */
(function(){
  "use strict";

  /* ---- mobile nav ---- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      nav.classList.toggle('open');
    });
  }

  /* ---- current year in footers ---- */
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  /* =======================================================================
     STORE DIRECTORY
     ======================================================================= */
  var grid = document.getElementById('storeGrid');
  if(grid && typeof STORES !== 'undefined'){
    var state = { q:'', region:'all', price:'all' };
    var countEl = document.getElementById('storeCount');

    function priceClass(p){ return p; }

    function render(){
      var q = state.q.trim().toLowerCase();
      var list = STORES.filter(function(s){
        if(state.region !== 'all' && s.region !== state.region) return false;
        if(state.price !== 'all' && s.price !== state.price) return false;
        if(q){
          var hay = (s.name + ' ' + s.country + ' ' + s.region + ' ' + s.type + ' ' + s.buy).toLowerCase();
          if(hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      grid.innerHTML = '';
      list.forEach(function(s){
        var el = document.createElement('article');
        el.className = 'store';
        el.innerHTML =
          '<div class="s-main">'+
            '<div class="s-name">'+esc(s.name)+' <span class="stamp ghost">'+esc(s.price)+'</span></div>'+
            '<div class="s-meta"><span>'+esc(s.country)+'</span><span>'+esc(s.region)+'</span><span>'+esc(s.type)+'</span></div>'+
            '<div class="s-buy">'+esc(s.buy)+'</div>'+
          '</div>'+
          '<div class="s-right">'+esc(s.region.toUpperCase())+'</div>'+
          '<div class="s-detail">'+
            '<div><h4>What to prioritise</h4><p>'+esc(s.buy)+'</p></div>'+
            '<div><h4>Field note</h4><p>'+esc(s.tip)+'</p></div>'+
          '</div>';
        el.addEventListener('click', function(){ el.classList.toggle('open'); });
        grid.appendChild(el);
      });

      if(countEl){
        countEl.textContent = list.length + ' of ' + STORES.length + ' stores' +
          (state.region !== 'all' ? ' · ' + state.region : '') +
          (state.price !== 'all' ? ' · ' + state.price : '');
      }
      if(list.length === 0){
        grid.innerHTML = '<div style="padding:40px 0;color:var(--muted);font-family:var(--mono);font-size:0.9rem;">No stores match. Clear a filter or try another name.</div>';
      }
    }

    /* search */
    var search = document.getElementById('storeSearch');
    if(search){ search.addEventListener('input', function(){ state.q = this.value; render(); }); }

    /* region chips */
    var regionRow = document.getElementById('regionChips');
    if(regionRow){
      var regs = ['all'].concat(REGIONS);
      regs.forEach(function(r){
        var b = document.createElement('button');
        b.className = 'chip' + (r === 'all' ? ' on' : '');
        b.textContent = r === 'all' ? 'All regions' : r;
        b.addEventListener('click', function(){
          state.region = r;
          regionRow.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('on'); });
          b.classList.add('on');
          render();
        });
        regionRow.appendChild(b);
      });
    }

    /* price chips */
    var priceRow = document.getElementById('priceChips');
    if(priceRow){
      [['all','All prices'],['$','$ Budget'],['$$','$$ Mid'],['$$$','$$$ Premium']].forEach(function(pair){
        var b = document.createElement('button');
        b.className = 'chip' + (pair[0] === 'all' ? ' on' : '');
        b.textContent = pair[1];
        b.addEventListener('click', function(){
          state.price = pair[0];
          priceRow.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('on'); });
          b.classList.add('on');
          render();
        });
        priceRow.appendChild(b);
      });
    }

    render();
  }

  /* =======================================================================
     BUDGET CALCULATOR
     Weekly per-person baseline costs (USD) for a real-food, whole-food diet.
     Tiers scale the same basket up/down by sourcing quality.
     ======================================================================= */
  var calcHousehold = document.getElementById('household');
  if(calcHousehold){
    // per person / week, mid tier (USD)
    var BASE = { meat:34, organ:5, eggs:7, dairy:11, produce:16, fats:6, pantry:9 };
    var TIER = { budget:0.68, mid:1.0, premium:1.6 };
    var LABELS = {
      meat:'Muscle meat (beef, lamb, poultry)',
      organ:'Organ meats (liver, heart)',
      eggs:'Pasture-raised eggs',
      dairy:'Dairy (butter, cheese, yogurt)',
      produce:'Produce & fruit',
      fats:'Cooking fats & oils',
      pantry:'Pantry (honey, nuts, staples)'
    };
    var tier = 'mid';

    function money(n){ return '$' + n.toFixed(0); }

    function calc(){
      var people = Math.max(1, Math.min(12, parseInt(calcHousehold.value, 10) || 1));
      var mult = TIER[tier];
      var ledger = document.getElementById('ledger');
      ledger.innerHTML = '';
      var weeklyPP = 0;
      Object.keys(BASE).forEach(function(k){
        var perPerson = BASE[k] * mult;
        weeklyPP += perPerson;
        var row = document.createElement('div');
        row.className = 'ledger-row';
        row.innerHTML = '<span>'+LABELS[k]+'</span><span>'+money(perPerson * people)+' /wk</span>';
        ledger.appendChild(row);
      });
      var monthly = weeklyPP * people * 4.33;
      var ppWeek = document.createElement('div');
      ppWeek.className = 'ledger-row';
      ppWeek.innerHTML = '<span>Per person / week</span><span>'+money(weeklyPP)+'</span>';
      ledger.appendChild(ppWeek);
      var total = document.createElement('div');
      total.className = 'ledger-row total';
      total.innerHTML = '<span>Monthly household total</span><span>'+money(monthly)+'</span>';
      ledger.appendChild(total);
    }

    calcHousehold.addEventListener('input', calc);
    var tierToggle = document.getElementById('tierToggle');
    if(tierToggle){
      tierToggle.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          tier = b.getAttribute('data-tier');
          tierToggle.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
          b.classList.add('on');
          calc();
        });
      });
    }
    calc();
  }

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();
