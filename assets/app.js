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

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enterHero(){ document.body.classList.add('entered'); }

  /* =======================================================================
     PROCEDURAL SOUND (Web Audio — no files). Unlocks on first gesture.
     ======================================================================= */
  function createSound(){
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    var ctx, master, muted = false;
    try { muted = localStorage.getItem('nonslop_muted') === '1'; } catch(e){}
    function ensure(){
      if(!ctx){
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.8;
        master.connect(ctx.destination);
      }
      return ctx;
    }
    function T(){ return ctx.currentTime; }
    function tone(freq, start, dur, type, peak, endFreq){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, start);
      if(endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak || 0.3, start + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g); g.connect(master); o.start(start); o.stop(start + dur + 0.03);
    }
    function noise(start, dur, peak, cutoff, hp){
      var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for(var i=0;i<len;i++) d[i] = Math.random()*2 - 1;
      var n = ctx.createBufferSource(); n.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = cutoff || 1400;
      var g = ctx.createGain();
      g.gain.setValueAtTime(peak || 0.2, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      n.connect(f); f.connect(g); g.connect(master); n.start(start); n.stop(start + dur);
    }
    return {
      resume:function(){ ensure(); return (ctx.state === 'suspended') ? ctx.resume() : Promise.resolve(); },
      ready:function(){ return !!ctx && ctx.state === 'running'; },
      setMuted:function(v){ muted = v; if(master) master.gain.value = v ? 0 : 0.8; try{ localStorage.setItem('nonslop_muted', v?'1':'0'); }catch(e){} },
      isMuted:function(){ return muted; },
      tick:function(){ if(!ctx) return; noise(T(), 0.045, 0.10, 3200, true); },
      strike:function(){ if(!ctx) return; var s=T(); noise(s, 0.16, 0.26, 3800, true); tone(150, s, 0.16, 'sawtooth', 0.13, 70); },
      riser:function(dur){ if(!ctx) return; var s=T(); tone(110, s, dur, 'sawtooth', 0.10, 520); noise(s, dur, 0.045, 900); },
      boom:function(){ if(!ctx) return; var s=T(); tone(150, s, 1.2, 'sine', 0.6, 42); tone(80, s, 1.0, 'triangle', 0.28, 40); noise(s, 0.45, 0.26, 500); }
    };
  }

  /* =======================================================================
     CINEMATIC COLD OPEN v2 — timeline-driven, skippable, with sound
     ======================================================================= */
  var intro = document.getElementById('intro');
  if(intro){
    var seen = false;
    try { seen = sessionStorage.getItem('nonslop_intro_seen') === '1'; } catch(e){}

    if(seen || reduceMotion){
      if(intro.parentNode) intro.parentNode.removeChild(intro);
      enterHero();
    } else {
      var slot = document.getElementById('introSlot');
      var snd = createSound();
      var timers = [];
      var ended = false;
      function at(ms, fn){ timers.push(setTimeout(fn, ms)); }

      function wordsHTML(str){
        var parts = str.split(' ');
        return '<span class="intro-words">' + parts.map(function(w,i){
          return '<span class="w" style="transition-delay:'+(i*0.06).toFixed(2)+'s"><span class="i">'+w+'</span></span>';
        }).join('') + '</span>';
      }
      function showLine(str){
        slot.innerHTML = wordsHTML(str);
        var el = slot.firstChild;
        requestAnimationFrame(function(){ el.classList.add('show'); });
        return el;
      }
      function outLine(el){ if(el) el.classList.add('out'); }
      function showBuzz(text){
        slot.innerHTML = '<span class="intro-buzz">' + text + '<span class="bar"></span></span>';
        var el = slot.firstChild;
        requestAnimationFrame(function(){ el.classList.add('show'); });
        setTimeout(function(){ el.classList.add('strike'); if(snd) snd.strike(); }, 230);
      }
      function showLogo(){
        slot.innerHTML = '<div class="intro-logo"><div class="lg">Non<span class="amp">·</span>Slop</div><div class="tag">The Grocery Navigator</div></div>';
        var el = slot.firstChild;
        requestAnimationFrame(function(){ el.classList.add('show'); });
        if(snd) snd.boom();
      }

      function endIntro(){
        if(ended) return; ended = true;
        timers.forEach(clearTimeout);
        intro.classList.add('wipe');
        document.body.classList.remove('intro-lock');
        enterHero();
        try { sessionStorage.setItem('nonslop_intro_seen','1'); } catch(e){}
        var node = intro;
        setTimeout(function(){ if(node && node.parentNode) node.parentNode.removeChild(node); }, 840);
      }

      /* sound toggle (available once the sequence is running) */
      var soundBtn = document.getElementById('introSound');
      function updateSoundBtn(){
        if(!soundBtn) return;
        var muted = snd ? snd.isMuted() : true;
        soundBtn.classList.toggle('muted', muted);
        soundBtn.lastChild.textContent = muted ? ' Muted' : ' Sound';
      }
      if(soundBtn){
        if(!snd){ soundBtn.style.display = 'none'; }
        else {
          soundBtn.addEventListener('click', function(e){
            e.stopPropagation();
            var willMute = !snd.isMuted();
            snd.setMuted(willMute);
            if(!willMute) snd.resume().then(updateSoundBtn);
            updateSoundBtn();
          });
          updateSoundBtn();
        }
      }

      var skip = document.getElementById('introSkip');
      if(skip) skip.addEventListener('click', function(e){ e.stopPropagation(); endIntro(); });

      /* the timeline — only runs after the visitor presses Begin (audio unlock) */
      function runTimeline(){
        var line1;
        at(140,  function(){ line1 = showLine("You've been <em>lied</em> to."); if(snd){ snd.tick(); at(70,function(){snd.tick();}); at(150,function(){snd.tick();}); } });
        at(1450, function(){ outLine(line1); });
        at(1650, function(){ showBuzz('All&nbsp;natural.'); });
        at(2250, function(){ showBuzz('Low&nbsp;fat.'); });
        at(2850, function(){ showBuzz('Multigrain.'); });
        at(3500, function(){ if(snd) snd.riser(1.15); });
        at(3650, function(){ var l = showLine('In every aisle.'); at(900, function(){ outLine(l); }); });
        at(4800, function(){ showLogo(); });
        at(6050, function(){ endIntro(); });
      }

      var started = false;
      var enterLayer = document.getElementById('introEnter');
      function begin(){
        if(started || ended) return; started = true;
        if(snd) snd.resume().then(updateSoundBtn);   // the click IS the audio-unlock gesture
        if(enterLayer) enterLayer.classList.add('hide');
        intro.classList.add('go');                    // starts the progress bar
        updateSoundBtn();
        runTimeline();
      }

      /* click anywhere on the entry screen begins with sound */
      if(enterLayer) enterLayer.addEventListener('click', begin);
      var enterSkip = document.getElementById('enterSkip');
      if(enterSkip) enterSkip.addEventListener('click', function(e){ e.stopPropagation(); endIntro(); });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape'){ endIntro(); }
        else if(!started && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); begin(); }
      });

      /* arm the overlay (show the entry screen); the sequence waits for Begin */
      document.body.classList.add('intro-lock');
      intro.classList.add('play');
    }
  }

  /* =======================================================================
     SCROLL REVEAL
     ======================================================================= */
  var revealEls = document.querySelectorAll('[data-reveal],[data-reveal-child]');
  if(revealEls.length){
    if(reduceMotion || !('IntersectionObserver' in window)){
      revealEls.forEach(function(el){ el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            en.target.classList.add('in');
            if(en.target.hasAttribute('data-count-group')) runCounts(en.target);
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function(el){ io.observe(el); });
    }
  }

  /* =======================================================================
     COUNT-UP NUMBERS
     ======================================================================= */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduceMotion){ el.textContent = prefix + target + suffix; return; }
    var dur = 1300, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }
  function runCounts(scope){
    (scope || document).querySelectorAll('.count-up').forEach(function(el){
      if(!el.dataset.counted){ el.dataset.counted = '1'; animateCount(el); }
    });
  }
  // run counts when the proof strip reveals
  var proof = document.querySelector('.proof');
  if(proof){
    if(reduceMotion || !('IntersectionObserver' in window)){
      runCounts(proof);
    } else {
      var pio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ runCounts(proof); pio.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      pio.observe(proof);
    }
  }

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
