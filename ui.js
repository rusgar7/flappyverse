// ui.js - Modern Overlay Controller

let _uiMounted = false;
let _uiWrapper = null;

const createOverlay = () => {
    if (_uiMounted) return;
    const wrapper = document.getElementById('html-ui');
    if (!wrapper) return;
    _uiWrapper = wrapper;
    
    // Mount Screens
    wrapper.innerHTML = `
      <!-- Main Menu -->
      <div id="ui-MENU" class="ui-screen py-6 px-4">
          <div class="absolute inset-0 z-[-1] opacity-20 pointer-events-none flex items-center justify-center">
             <svg width="200" height="200" viewBox="0 0 100 100" class="animate-spin" style="animation-duration: 25s;"><path d="M50 0 A50 50 0 0 1 100 50 A50 50 0 0 1 50 100 A50 50 0 0 1 0 50 A50 50 0 0 1 50 0 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="20 10"/> <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-dasharray="10 20"/></svg>
          </div>

          <div class="w-full flex justify-between items-start z-10">
              <div class="flex flex-col gap-2 items-start pointer-events-auto">
                 <div class="glass-panel !rounded-full !py-1 !px-3 flex gap-2 items-center text-sm font-bold shadow-2xl ui-coins-box bg-slate-900/60 backdrop-blur-2xl border border-white/20" style="width:auto">
                    <span class="text-yellow-400 text-lg">🌟</span> <span class="ui-coins">0</span>
                 </div>
                 <div class="glass-panel !rounded-full !py-1 !px-3 flex gap-2 items-center text-sm font-bold shadow-2xl ui-diamonds-box text-cyan-300 bg-slate-900/60 backdrop-blur-2xl border border-white/20" style="width:auto; display:none">
                    <span class="text-cyan-400">💎</span> <span class="ui-diamonds">0</span>
                 </div>
              </div>
              <button class="ui-btn-mute k-btn k-btn-circle !w-10 !h-10 !p-0 shadow-2xl pointer-events-auto text-lg hover:scale-110 bg-slate-900/60 backdrop-blur-2xl border border-white/20" onclick="window.uiClickMute()">🔊</button>
          </div>
          
          <div class="mt-8 flex flex-col items-center">
             <h1 class="title">FLAPPY<br/>VERSE</h1>
             <p class="subtitle" id="t-subtitle">En zor Flappy oyununa hoşgeldin..</p>
          </div>
          
          <div class="w-full max-w-sm relative mt-auto mb-8">
              <div class="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[28px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !w-full !max-w-none !rounded-[24px] !p-5 flex flex-col gap-3 relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                  <button class="k-btn k-btn-primary" onclick="window.uiC('play')"><span class="text-xl">▶</span> <span id="t-play">OYNA</span></button>
                  <button class="k-btn k-btn-secondary" onclick="window.uiC('shop')"><span class="text-xl">🛒</span> <span id="t-shop">MAĞAZA</span></button>
                  <button class="k-btn k-btn-dark k-btn-mini" onclick="window.uiC('sets')"><span class="text-lg">👤</span> <span id="t-sets">PROFİL</span></button>
              </div>
          </div>
      </div>

      <!-- Play HUD -->
      <div id="ui-PLAY" class="ui-screen !pointer-events-none !bg-transparent !p-0 justify-start" style="backdrop-filter: none; -webkit-backdrop-filter: none;">
          <div class="w-full flex justify-between items-start p-4">
              <div class="flex flex-col gap-1 w-[120px]">
                  <div class="text-white/80 font-bold text-[13px] drop-shadow-md bg-black/30 w-fit px-2 py-0.5 rounded" id="ui-play-lvname">Bölüm 1</div>
                  <div class="w-full bg-black/40 h-2.5 mt-1 rounded-full overflow-hidden border border-white/20">
                      <div id="ui-play-progress" class="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all" style="width:0%"></div>
                  </div>
                  <div class="text-white/70 text-[11px] font-bold mt-0.5" id="ui-play-target">0/10</div>
              </div>
              <div class="text-[52px] leading-none font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex-1 text-center" id="ui-play-score">0</div>
              <div class="flex flex-col items-end gap-1 w-[120px] pointer-events-auto">
                  <button class="w-[36px] h-[36px] rounded-xl bg-black/40 border border-white/20 text-white flex items-center justify-center text-[16px] hover:bg-black/60 active:scale-95 transition-all" onclick="window.uiC('pause')">⏸</button>
                  <div class="mt-2 text-right pointer-events-none">
                      <div class="text-yellow-400 font-bold text-sm drop-shadow-md" id="ui-play-coins">🌟 0</div>
                      <div class="text-cyan-400 font-bold text-xs drop-shadow-md mt-0.5" id="ui-play-diamonds">💎 0</div>
                      <div class="text-white/60 font-bold text-[11px] drop-shadow-md mt-1" id="ui-play-time">⏱ 0sn</div>
                  </div>
              </div>
          </div>
          <div id="ui-play-hint" class="font-bold text-[13px] text-center drop-shadow-md text-white mt-auto mb-[95px] w-full px-4" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8);"></div>
      </div>

      <!-- Level Select -->
      <div id="ui-SEL" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm h-full max-h-[90%] relative mt-4 flex flex-col">
              <div class="absolute -inset-2 bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-slate-900/0 rounded-[36px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !max-w-none w-full h-full !rounded-[28px] !p-5 flex flex-col relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                  <div class="w-full flex justify-between items-start z-10">
                      <button class="k-btn k-btn-dark !w-auto !py-1.5 !px-4 !text-sm border-white/20 bg-black/40" onclick="window.uiC('back')">← Geri</button>
                      <div class="glass-panel !rounded-full !py-1.5 !px-3 !w-auto flex gap-2 items-center text-sm font-bold shadow-md bg-black/40 border-white/20">
                        <span class="text-yellow-400">🌟</span> <span class="ui-coins">0</span>
                      </div>
                  </div>
                  <h2 class="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-4 tracking-wider" id="t-levelsel">BÖLÜM SEÇ</h2>
                  <div class="level-grid w-full flex-1 mt-4 overflow-y-auto pr-2" id="ui-levelgrid"></div>
              </div>
          </div>
      </div>

      <!-- Shop -->
      <div id="ui-SHOP" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm h-full max-h-[90%] relative mt-4 flex flex-col">
              <div class="absolute -inset-2 bg-gradient-to-b from-rose-500/40 via-purple-500/30 to-slate-900/0 rounded-[36px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !max-w-none w-full h-full !rounded-[28px] !p-5 flex flex-col relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                  <div class="w-full flex justify-between items-start z-10">
                      <button class="k-btn k-btn-dark !w-auto !py-1.5 !px-4 !text-sm border-white/20 bg-black/40" onclick="window.uiC('back')">← Geri</button>
                      <div class="flex flex-col gap-1 items-end">
                        <div class="glass-panel !rounded-full !py-1.5 !px-3 !w-auto flex gap-2 items-center text-sm font-bold bg-black/40 border border-white/20 shadow-md">
                           <span class="text-yellow-400">🌟</span> <span class="ui-coins">0</span>
                        </div>
                        <div class="glass-panel !rounded-full !py-1.5 !px-3 !w-auto flex gap-2 items-center text-sm font-bold bg-black/40 border border-white/20 shadow-md text-cyan-300 ui-diamonds-box">
                           <span class="text-cyan-400">💎</span> <span class="ui-diamonds">0</span>
                        </div>
                      </div>
                  </div>
                  <h2 class="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-2 tracking-wider" id="t-shoptitle">MAĞAZA</h2>
                  <div class="flex gap-2 w-full my-4">
                      <button class="k-btn flex-1 !m-0 !py-2 !text-xs border-white/20" id="ui-tab-chars" onclick="window.uiC('shoptab', 'chars')">🦅 Kuşlar</button>
                      <button class="k-btn k-btn-dark flex-1 !m-0 !py-2 !text-xs border-white/20" id="ui-tab-boxes" onclick="window.uiC('shoptab', 'boxes')">📦 Kutular</button>
                      <button class="k-btn k-btn-dark flex-1 !m-0 !py-2 !text-xs border-white/20" id="ui-tab-diamonds" onclick="window.uiC('shoptab', 'diamonds')">💎 Elmas</button>
                  </div>
                  <div class="w-full flex-1 overflow-auto bg-black/20 rounded-[16px] p-2 border border-white/5" id="ui-shopgrid"></div>
              </div>
          </div>
      </div>

      <!-- Profile -->
      <div id="ui-SETS" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm h-full max-h-[90%] relative mt-4 flex flex-col">
              <div class="absolute -inset-2 bg-gradient-to-b from-indigo-500/40 via-blue-500/30 to-slate-900/0 rounded-[36px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !max-w-none w-full h-full !rounded-[28px] !p-5 flex flex-col relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                  <div class="w-full flex justify-between items-start z-10">
                      <button class="k-btn k-btn-dark !w-auto !py-1.5 !px-4 !text-sm border-white/20 bg-black/40" onclick="window.uiC('back')">← Geri</button>
                      <div class="flex gap-2 items-center">
                          <button id="ui-lang-btn" class="k-btn k-btn-dark !w-auto !py-1 !px-3 !text-xs border-white/20 bg-black/40 font-bold" onclick="window.uiC('lang')" title="Dil / Language">🌐 TR</button>
                          <button class="ui-btn-mute k-btn k-btn-circle !w-10 !h-10 !p-0 shadow-lg text-lg border-white/20 bg-black/40" onclick="window.uiClickMute()">🔊</button>
                      </div>
                  </div>
                  <h2 class="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-4 tracking-wider">PROFİL</h2>
                  <div class="w-full flex-1 mt-4 overflow-y-auto pr-2" id="ui-SETS-panel">
                     <!-- Dynamically populated -->
                  </div>
              </div>
          </div>
      </div>

      <!-- Overlay Menus -->
      <div id="ui-PAUSE" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm relative mt-4">
              <div class="absolute -inset-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-[36px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !max-w-none !rounded-[28px] !p-8 flex flex-col items-center relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                  <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-lg mb-8 tracking-wider text-center">DURDURULDU</h2>
                  <div class="w-full flex flex-col gap-4">
                     <button class="k-btn k-btn-primary w-full !m-0 shadow-[0_0_15px_rgba(48,209,88,0.3)]" onclick="window.uiC('resume')">▶ Devam Et</button>
                     <button class="k-btn k-btn-danger w-full !m-0 opacity-90 shadow-[0_0_15px_rgba(255,69,58,0.2)]" onclick="window.uiC('menu')">🏠 Menüye Dön</button>
                  </div>
              </div>
          </div>
      </div>

      <div id="ui-REVIVE-PROMPT" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm relative mt-4">
              <div class="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[36px] blur-xl opacity-60"></div>
              <div class="glass-panel !max-w-none !rounded-[28px] !p-6 flex flex-col items-center relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                 <button class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/20 transition-all font-bold text-sm z-20" onclick="window.uiC('skipRevive')">✕</button>

                 <div class="relative w-24 h-24 flex items-center justify-center mb-4 mt-2">
                     <div class="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl"></div>
                     <div class="absolute inset-2 bg-gradient-to-tr from-cyan-300 to-blue-600 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse"></div>
                     <span class="text-6xl drop-shadow-lg relative z-10" id="ui-revive-avatar">🐣</span>
                 </div>
                 
                 <h2 class="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-lg mb-2 leading-tight">DİRİLİP DEVAM ETMEK İSTER MİSİN?</h2>
                 <p class="text-xs font-semibold text-gray-300/80 mb-6 text-center">Öldüğün yerden kaldığın gibi devam et!</p>
                 
                 <div id="ui-prompt-revive" class="w-full flex flex-col gap-3 relative z-10"></div>
              </div>
          </div>
      </div>

      <div id="ui-OVER" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm relative mt-4">
              <div class="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[36px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !max-w-none !rounded-[28px] !p-8 flex flex-col items-center relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                 <div class="bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(255,69,58,0.2)] flex items-center gap-2">
                    <span class="text-base">💥</span> PARÇALANDI
                 </div>
                 
                 <div class="relative flex flex-col items-center justify-center mb-6 w-full">
                    <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Skorun</p>
                    <div class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-lg leading-tight" id="ui-go-score">0</div>
                 </div>
                 
                 <div id="ui-d-revive" class="w-full flex flex-col gap-3 mt-2"></div>
                 
                 <div class="w-full flex items-center gap-3 my-5">
                    <div class="flex-1 h-px bg-white/10"></div>
                 </div>
                 <button class="k-btn k-btn-dark w-full !text-sm !font-bold opacity-80" onclick="window.uiC('menu')">Ana Menüye Dön</button>
              </div>
          </div>
      </div>

      <div id="ui-DONE" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm relative mt-4">
              <div class="absolute -inset-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-[36px] blur-xl opacity-60 pointer-events-none"></div>
              <div class="glass-panel !max-w-none !rounded-[28px] !p-8 flex flex-col items-center text-center relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl">
                 <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-500 mb-2 uppercase drop-shadow-md">Bölüm Tamam! 🎉</h2>
                 <span id="ui-done-rec" class="text-yellow-400 font-bold mb-2 hidden text-[10px] tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">YENİ REKOR!</span>
                 <div class="text-5xl font-black text-white mb-4 drop-shadow-md">⏱ <span id="ui-done-time"></span></div>
                 <div class="text-amber-400 font-black text-2xl mb-8 drop-shadow-lg bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20" id="ui-done-coins"></div>
                 <button class="k-btn k-btn-primary w-full shadow-[0_0_20px_rgba(48,209,88,0.5)] !py-4" id="ui-btn-next" onclick="window.uiC('next')">Sıradaki Bölüm →</button>
              </div>
          </div>
      </div>
      
      <div id="ui-WIN" class="ui-screen flex-center justify-center p-4">
          <div class="w-full max-w-sm relative mt-4">
              <div class="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-[36px] blur-xl opacity-70 pointer-events-none animate-pulse"></div>
              <div class="glass-panel !max-w-none !rounded-[28px] !p-8 flex flex-col items-center relative z-10 border border-white/20 shadow-2xl bg-slate-900/70 backdrop-blur-3xl text-center">
                  <h1 class="text-8xl mb-4 drop-shadow-2xl font-black">🏆</h1>
                  <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 mb-4 drop-shadow-lg tracking-wide">TEBRİKLER!</h2>
                  <p class="text-white/80 text-sm font-bold mb-8 uppercase tracking-widest">Tüm Dünyaları Fethettin!</p>
                  <button class="k-btn k-btn-gold w-full shadow-[0_0_25px_rgba(255,159,10,0.6)] font-black text-lg" onclick="window.uiC('menu')">Başa Dön</button>
              </div>
          </div>
      </div>
    `;
    _uiMounted = true;
};

let _lastGameState = -1, _lastCoins = -1, _lastDiamonds = -1, _lastMuted = null;
let _revivePrompted = false;

window.updateHTMLUI = function(G) {
    if (!G) return;
    G_ref = G;
    createOverlay();

    // ── HUD REFRESH (Every Frame) ──
    if (G.state === ST.PLAY) {
        const lv = LEVELS[G.lvi];
        const isScore = lv.mode === 'space' || lv.mode === 'flappy' || lv.mode === 'cyber';
        const prog = Math.min(100, Math.floor(G.score / lv.tgt * 100));
        
        const scoreEl = document.getElementById('ui-play-score');
        if (scoreEl) scoreEl.innerText = isScore ? G.score : prog + '%';
        
        const progBar = document.getElementById('ui-play-progress');
        if (progBar) progBar.style.width = Math.min((G.score / lv.tgt) * 100, 100) + '%';
        
        const tgtEl = document.getElementById('ui-play-target');
        if (tgtEl) tgtEl.innerText = `${G.score} / ${lv.mode==='flappy'?'∞':lv.tgt} ${lv.mode==='space'?'👾':''}`;

        const nameEl = document.getElementById('ui-play-lvname');
        if (nameEl) nameEl.innerText = LANG[curLang].lv[G.lvi];
        
        const coinsEl = document.getElementById('ui-play-coins');
        if (coinsEl) coinsEl.innerText = '🌟 ' + (window.devMode ? '∞' : coins);
        
        const diamEl = document.getElementById('ui-play-diamonds');
        if (diamEl) diamEl.innerText = '💎 ' + (window.devMode ? '∞' : diamonds);
        
        const timeEl = document.getElementById('ui-play-time');
        if (timeEl) timeEl.innerText = '⏱ ' + Math.floor(G.elapsed / 60) + 'sn';

        let hint = '';
        if (lv.mode === 'wind') hint = '💨 Dikkat: Rüzgar Sert Esiyor!';
        else if (lv.mode === 'cyber') hint = '⚡ Lazerlere Dikkat Et!';
        else if (lv.mode === 'space') hint = '🚀 Serbest Uçuş Modu';
        else if (lv.autoFlip) hint = '🔄 DİKKAT: DÜNYA DÖNÜYOR!';
        if (lv.mode === 'tutorial' && G.score < 2) hint = '👆 Zıplamak için dokun';
        
        const hintEl = document.getElementById('ui-play-hint');
        if (hintEl) hintEl.innerText = hint;
        
        if (_lastGameState === G.state && !window.UI_NEEDS_REBUILD) {
            return;
        }
    }

    // ── STRUCTURAL UPDATE (On State Change or Forced) ──
    if (_lastGameState === G.state && !window.UI_NEEDS_REBUILD) {
        if (G.state === ST.OVER && G.deadT > 45) {
            const hasReviveOpt = (diamonds >= 10);
            if (!_revivePrompted && hasReviveOpt) {
                document.getElementById('ui-REVIVE-PROMPT').classList.add('active');
            } else {
                document.getElementById('ui-OVER').classList.add('active');
            }
        }
        return; 
    }
    window.UI_NEEDS_REBUILD = false;
    _lastGameState = G.state;

    // ── Update Global Coin/Diamond Counters ──
    const allCoins = document.querySelectorAll('.ui-coins');
    const allDiams = document.querySelectorAll('.ui-diamonds');
    allCoins.forEach(el => el.innerText = window.devMode ? '∞' : window.coins);
    allDiams.forEach(el => el.innerText = window.devMode ? '∞' : window.diamonds);

    // Reset screens & Blur
    document.querySelectorAll('.ui-screen').forEach(s => s.classList.remove('active'));
    const canv = document.getElementById('gameCanvas');
    if (G.state === ST.PLAY) { canv.style.filter = 'none'; document.getElementById('ui-PLAY').classList.add('active'); _revivePrompted = false; }
    else if (G.state === ST.PAUSE) { canv.style.filter = 'blur(8px) brightness(0.5)'; document.getElementById('ui-PAUSE').classList.add('active'); }
    else if (G.state === ST.OVER) { 
        canv.style.filter = 'blur(12px) grayscale(0.5)'; 
        if (G.deadT > 45) {
            const hasReviveOpt = (diamonds >= 10);
            if (!_revivePrompted && hasReviveOpt) {
                document.getElementById('ui-REVIVE-PROMPT').classList.add('active');
            } else {
                document.getElementById('ui-OVER').classList.add('active');
            }
        }
    }
    else { canv.style.filter = 'blur(15px) brightness(0.4)'; }

    // Sync global values
    document.querySelectorAll('.ui-coins').forEach(el => el.innerText = coins);
    document.querySelectorAll('.ui-diamonds').forEach(el => el.innerText = diamonds);
    document.querySelectorAll('.ui-diamonds-box').forEach(el => el.style.display = diamonds > 0 ? 'flex' : 'none');
    document.querySelectorAll('.ui-btn-mute').forEach(el => { el.innerText = sfxMuted ? '🔇' : '🔊'; el.style.opacity = sfxMuted ? 0.5 : 1; });
    const langBtn = document.getElementById('ui-lang-btn'); if (langBtn) langBtn.innerText = '🌐 ' + (typeof curLang !== 'undefined' ? curLang.toUpperCase() : 'TR');

    // Build specific screen contents
    if (G.state === ST.MENU) { document.getElementById('ui-MENU').classList.add('active'); }
    else if (G.state === ST.SEL) {
        document.getElementById('ui-SEL').classList.add('active');
        let html = '';
        LEVELS.forEach((lv, i) => {
            const lock = !unlockedLvs[i]; const bt = bestTimes[i] ? bestTimes[i] + 's' : '-';
            html += `<div class="level-card ${lock?'locked':''}" onclick="if(!${lock}) window.uiC('lv',${i})">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg" style="background:${lv.sky[1]}">${i+1}</div>
                <div class="flex-1 text-left px-3"><div class="font-bold text-white text-sm">${LANG[curLang].lv[i]}</div><div class="text-[10px] text-white/40">${lock?'Kilitli':LANG[curLang].lvsub[i]}</div></div>
                ${!lock ? `<div class="text-[10px] text-yellow-400 font-black bg-black/40 px-2 py-1 rounded">⏱ ${bt}</div>` : '🔒'}
            </div>`;
        });
        document.getElementById('ui-levelgrid').innerHTML = html;
    }
    else if (G.state === ST.SHOP) {
        // Always default to 'chars' tab when first entering shop (state change)
        if (!window.shopTabState) window.shopTabState = 'chars';
        document.getElementById('ui-SHOP').classList.add('active');
        // Tab aktif vurgula
        ['chars','boxes','diamonds'].forEach(t => {
            const el = document.getElementById('ui-tab-' + t);
            if (!el) return;
            if (t === (window.shopTabState || 'chars')) {
                el.classList.remove('k-btn-dark'); el.classList.add('k-btn-primary');
            } else {
                el.classList.remove('k-btn-primary'); el.classList.add('k-btn-dark');
            }
        });
        const tab = window.shopTabState || 'chars';
        const grid = document.getElementById('ui-shopgrid'); let html = '';
        const RARITY_COL = {common:'text-gray-300',rare:'text-blue-400',legendary:'text-yellow-400'};
        const RARITY_LBL = {common:'Sıradan',rare:'Nadir',legendary:'Efsanevi'};
        const charList = window.CHARS || (typeof CHARS !== 'undefined' ? CHARS : null);
        const CR = window.CHAR_RARITY || (typeof CHAR_RARITY !== 'undefined' ? CHAR_RARITY : ['common','common','common','common','rare','rare','legendary','legendary']);
        if (tab === 'chars') {
            if (!charList) {
                html = '<div class="text-center text-white/50 py-8">Yükleniyor...</div>';
            } else {
            charList.forEach((ch, i) => {
                const owned = (window.ownedChars || [])[i], sel = (window.selChar||0) === i, canBuy = (window.coins||0) >= ch.price;
                const rCol = RARITY_COL[CR[i]] || ''; const rLbl = RARITY_LBL[CR[i]] || '';
                const langData = window.LANG && window.curLang ? window.LANG[window.curLang] : null;
                const charName = langData && langData.charName ? langData.charName[i] : ch.type;
                let btn = sel ? `<span class="text-green-400 text-[10px] font-bold">KUŞANILDI</span>` :
                          owned ? `<button class="k-btn k-btn-dark k-btn-mini !m-0 !py-1 !px-3 text-[10px]" onclick="window.uiC('char',${i})">SEÇ</button>` :
                          `<button class="k-btn ${canBuy?'k-btn-gold':'k-btn-dark'} k-btn-mini !m-0 !py-1 !px-3 text-[10px]" onclick="window.uiC('char',${i})">&#127775; ${ch.price}</button>`;
                html += `<div class="level-card !py-2 !px-3 mb-2 ${sel?'border-green-400/50':''}">
                    <div class="text-3xl w-10 text-center">${ch.emoji}</div>
                    <div class="flex-1 text-left pl-3">
                        <div class="font-bold text-white text-xs">${charName}</div>
                        <div class="text-[9px] ${rCol} font-bold">${rLbl}</div>
                    </div>
                    <div>${btn}</div>
                </div>`;
            });
            }
        } else if (tab === 'boxes') {
            const canGold = window.coins >= 150, canDiam = window.diamonds >= 20;
            const last = window._lastBoxResult;
            if (last) {
                const rC = RARITY_COL[last.rarity]||''; const rL = RARITY_LBL[last.rarity]||last.rarity;
                const charName = window.LANG[window.curLang].charName[last.charIdx];
                const charEmoji = window.CHARS[last.charIdx]?.emoji || '';
                
                const boxFrame = last.rarity === 'legendary' ? 'border-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]' :
                                 last.rarity === 'rare' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' :
                                 'border-gray-500 shadow-md';
                                 
                html += `<div class="level-card !p-5 mb-4 text-center flex-col gap-2 bg-slate-900/90 border-2 ${boxFrame} transform scale-105 transition-all animate-popIn">
                    <div class="${rC} text-[10px] font-black uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded">${rL}</div>
                    <div class="text-6xl my-2 drop-shadow-2xl animate-bounce" style="animation-iteration-count: 2;">${charEmoji}</div>
                    <div class="font-black text-white text-lg mb-1">${charName}</div>
                    ${last.isDuplicate 
                        ? `<div class="text-[11px] font-bold text-amber-400 bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30 w-full">Mevcut karakter geldi!<br/>💰 +${last.refund} Altın iade edildi.</div>` 
                        : `<div class="flex gap-2 w-full mt-2">
                             <button class="k-btn k-btn-primary flex-1 !m-0 !py-2 text-xs" onclick="window.uiC('char',${last.charIdx}); window._lastBoxResult=null; window.UI_NEEDS_REBUILD=true; window.updateHTMLUI(window.G);">KUŞAN</button>
                             <button class="k-btn k-btn-dark flex-1 !m-0 !py-2 text-xs" onclick="window._lastBoxResult=null; window.UI_NEEDS_REBUILD=true; window.updateHTMLUI(window.G);">ENVANTER</button>
                           </div>`
                    }
                </div>`;
            }
            html += `<div class="level-card !py-4 !px-4 mb-3 flex-col items-start border-amber-500/30 bg-amber-900/10">
                <div class="flex items-center gap-3 w-full mb-3">
                    <span class="text-3xl">&#128230;</span>
                    <div class="flex-1">
                        <div class="font-black text-amber-300 text-sm">Altin Kutusu</div>
                        <div class="text-[10px] text-white/50">70% Siradan &middot; 25% Nadir &middot; 5% Efsanevi</div>
                    </div>
                    <div class="text-amber-300 font-black text-sm">&#127775; 150</div>
                </div>
                <button class="k-btn ${canGold?'k-btn-gold':'k-btn-dark opacity-50'} w-full !m-0 !py-2 text-sm font-black" onclick="window.uiC('openBox','gold')">Kutuyu Ac</button>
            </div>
            <div class="level-card !py-4 !px-4 mb-3 flex-col items-start border-cyan-500/30 bg-cyan-900/10">
                <div class="flex items-center gap-3 w-full mb-3">
                    <span class="text-3xl">&#128142;</span>
                    <div class="flex-1">
                        <div class="font-black text-cyan-300 text-sm">Elmas Kutusu</div>
                        <div class="text-[10px] text-white/50">40% Siradan &middot; 40% Nadir &middot; 20% Efsanevi</div>
                    </div>
                    <div class="text-cyan-300 font-black text-sm">&#128142; 20</div>
                </div>
                <button class="k-btn ${canDiam?'btn-glowing-cyan':'k-btn-dark opacity-50'} w-full !m-0 !py-2 text-sm font-black" onclick="window.uiC('openBox','diamond')">Kutuyu Ac</button>
            </div>`;
        } else {
            // Elmas satin alma
            const dRow = (amt, lbl, note) => `<div class="level-card !py-3 !px-3 mb-2 border-cyan-500/20">
                <span class="text-2xl w-10 text-center">&#128142;</span>
                <div class="flex-1 text-left pl-3"><div class="font-bold text-cyan-300 text-sm">${amt} Elmas</div><div class="text-[9px] text-white/40">${note}</div></div>
                <button class="k-btn k-btn-primary k-btn-mini !m-0 !py-1" onclick="window.uiC('buyD',${amt})">${lbl}</button>
            </div>`;
            html += dRow(50,'9.99 TL','Baslangic paketi') + dRow(150,'24.99 TL','Populer') + dRow(350,'49.99 TL','En iyi deger');
        }
        grid.innerHTML = html;
    }
    else if (G.state === ST.SETS) {
        document.getElementById('ui-SETS').classList.add('active');
        document.getElementById('ui-SETS-panel').innerHTML = `
            <div class="flex flex-col gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-2xl">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-white/10 flex items-center justify-center text-4xl shadow-inner">${CHARS[selChar].emoji}</div>
                    <div>
                        <h3 class="text-xl font-black text-white">Lv ${playerLv} Oyuncu</h3>
                        <div class="w-32 bg-black/50 h-1.5 rounded-full mt-1 overflow-hidden border border-white/10">
                           <div class="bg-indigo-500 h-full" style="width:${(playerXP%XP_PER_LV)/XP_PER_LV*100}%"></div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                   <div class="bg-black/40 p-3 rounded-xl border border-white/5"><p class="text-[9px] text-gray-500 font-bold uppercase">Mevcut Altın</p><p class="text-lg font-black text-amber-400">🌟 ${window.devMode ? '∞' : coins}</p></div>
                   <div class="bg-black/40 p-3 rounded-xl border border-white/5"><p class="text-[9px] text-gray-500 font-bold uppercase">Mevcut Elmas</p><p class="text-lg font-black text-cyan-400">💎 ${window.devMode ? '∞' : diamonds}</p></div>
                </div>
                <div class="space-y-2 py-2 border-t border-white/5 text-xs text-gray-400 font-medium">
                   <div class="flex justify-between"><span>Kazanılan Toplam Altın:</span><span class="text-white">🌟 ${totalCoinsEarned || 0}</span></div>
                   <div class="flex justify-between"><span>Harcanan Toplam Altın:</span><span class="text-white">🛒 ${spentCoins || 0}</span></div>
                   <div class="flex justify-between"><span>Kazanılan Toplam Elmas:</span><span class="text-cyan-400">💎 ${totalDiamondsEarned || 0}</span></div>
                </div>
                <div class="flex flex-col gap-2 pt-2 border-t border-white/5">
                   <label class="text-[10px] text-gray-500 font-black uppercase tracking-widest">İçerik Kodu</label>
                   <div class="flex gap-2">
                      <input type="text" id="ui-code-input" class="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500/50 outline-none" placeholder="Kodu giriniz...">
                      <button class="k-btn k-btn-primary !m-0 !py-0 !px-4 text-xs font-bold" onclick="window.uiC('submitCode')">UYGULA</button>
                   </div>
                   <p id="ui-set-msg" class="text-[10px] font-bold text-center h-4"></p>
                </div>
                <button class="k-btn k-btn-danger !m-0 !py-3 text-[10px] font-black shadow-lg opacity-70 hover:opacity-100 mt-2" onclick="window.uiC('reset')">⚠️ TÜM İLERLEMEYİ SIFIRLA</button>
            </div>
        `;
    }
    else if (G.state === ST.OVER) {
        document.getElementById('ui-go-score').innerText = G.score;
        
        let nextLvBtn = '';
        if (G.lvi + 1 < window.LEVELS.length && window.unlockedLvs[G.lvi + 1]) {
            let isNew = !(window.bestTimes && window.bestTimes[G.lvi + 1] > 0);
            let btnTitle = isNew ? "YENİ DÜNYAYA GEÇİŞ YAP" : "BİR SONRAKİ BÖLÜME GEÇİŞ YAP";
            let topTitle = isNew ? "YENİ DÜNYA AÇILDI" : "BÖLÜM AÇIK";
            
            nextLvBtn = `
                <button class="k-btn k-btn-gold flex-1 !m-0 !py-3 flex flex-col items-center justify-center w-full shadow-lg" onclick="window.uiC('next')">
                   <div class="text-[9px] text-yellow-900/60 mb-0.5 font-bold tracking-widest uppercase">${topTitle}</div>
                   <div class="text-white font-black text-xl flex items-center gap-1 drop-shadow-sm">⏭ ${btnTitle}</div>
                </button>
            `;
        }
        
        document.getElementById('ui-d-revive').innerHTML = `
            ${nextLvBtn}
            <button class="k-btn k-btn-primary flex-1 !m-0 !py-3 flex flex-col items-center justify-center w-full shadow-lg" onclick="window.uiC('retry')">
               <div class="text-[9px] text-green-900/60 mb-0.5 font-bold tracking-widest uppercase">PES ETME</div>
               <div class="text-white font-black text-xl flex items-center gap-1 drop-shadow-sm">↺ YENİDEN DENE</div>
            </button>
        `;
        
        const promptEl = document.getElementById('ui-prompt-revive');
        if (promptEl) {
            const hasD = diamonds >= 10;
            promptEl.innerHTML = `
                <div class="flex w-full">
                    <button class="k-btn w-full !m-0 !py-4 flex flex-col items-center justify-center relative overflow-hidden transition-all ${hasD?'btn-glowing-cyan':'k-btn-dark opacity-50 grayscale'}" onclick="window.uiC('retryDiamond')">
                       ${hasD?'<div class="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%]" style="animation: shimmerBtn 2s infinite linear;"></div>':''}
                       <div class="text-[10px] text-white/70 mb-1 font-bold tracking-widest relative z-10">ELMASLA DIRIL (Sabit Fiyat)</div>
                       <div class="${hasD?'text-cyan-300':'text-red-400'} font-black text-2xl flex items-center gap-1 relative z-10">&#128142; 10</div>
                    </button>
                </div>
                ${!hasD?'<div class="text-center text-xs text-amber-400/80 mt-2">Yeterli Elmasin yok (' + diamonds + '/10). Magazadan elmas alabilirsin!</div>':''}
            `;
            const avatarEl = document.getElementById('ui-revive-avatar');
            if (avatarEl && window.CHARS && typeof window.selChar !== 'undefined') {
                avatarEl.innerText = window.CHARS[window.selChar].emoji;
            }
        }
    }
    else if (G.state === ST.DONE) {
        document.getElementById('ui-done-time').innerText = lastTimes[G.lvi] + 's';
        document.getElementById('ui-done-coins').innerText = '🌟 +' + G.sesC + ' Altın!';
    }
};

window.uiClickMute = function() {
    sfxMuted = !sfxMuted; S.s('sfx_mute', sfxMuted);
    if (typeof sfxSwsh !== 'undefined') sfxSwsh();
    window.UI_NEEDS_REBUILD = true; window.updateHTMLUI(G_ref);
};

let G_ref = null;
window.uiC = function(action, val) {
    if (!G_ref) return;
    const G = G_ref;
    if (typeof sfxSwsh !== 'undefined' && action !== 'submitCode') sfxSwsh();

    if (action === 'play') G.state = ST.SEL;
    else if (action === 'shop') { G.state = ST.SHOP; window.shopTabState = 'chars'; }
    else if (action === 'sets') G.state = ST.SETS;
    else if (action === 'back' || action === 'menu') {
        G.state = ST.MENU;
    }
    else if (action === 'resume') G.togglePause();
    else if (action === 'lv') G.startLv(val);
    else if (action === 'char') {
        const ch = CHARS[val];
        if (ownedChars[val]) { selChar = val; saveAll(); }
        else if (devMode) { ownedChars[val] = true; selChar = val; saveAll(); }
        else if (coins >= ch.price) { coins -= ch.price; spentCoins += ch.price; ownedChars[val] = true; selChar = val; saveAll(); if(typeof sfxCoin !== 'undefined') sfxCoin(); }
        window.UI_NEEDS_REBUILD = true; window.updateHTMLUI(G);
    }
    else if (action === 'submitCode') {
        const input = document.getElementById('ui-code-input'), code = (input?input.value:'').toLowerCase().trim(), msgEl = document.getElementById('ui-set-msg');
        if (!code) return;
        let res = "Geçersiz kod!", col = "text-red-500";
        if (code === 'dev123' || code === 'geliştirici') { 
            devMode = true; 
            coins += 999999; 
            diamonds += 9999; 
            if (typeof unlockedLvs !== 'undefined' && Array.isArray(unlockedLvs)) {
                for(let i=0; i<unlockedLvs.length; i++) unlockedLvs[i] = true;
            }
            if (typeof LEVELS !== 'undefined' && Array.isArray(LEVELS)) {
                LEVELS.forEach(l => l.unlocked = true);
            }
            saveAll(); 
            res = "Geliştirici Modu Aktif!"; 
            col = "text-green-400"; 
        }
        else if (code === 'dev0') { devMode = false; saveAll(); res = "Geliştirici Modu Kapandı."; col = "text-gray-400"; }
        else if (code === 'altin10k') { coins += 10000; totalCoinsEarned += 10000; saveAll(); res = "10.000 Altın Eklendi!"; col = "text-yellow-400"; }
        else if (code === 'elmas50') { diamonds += 50; totalDiamondsEarned += 50; saveAll(); res = "50 Elmas Eklendi!"; col = "text-cyan-400"; }
        if (msgEl) { msgEl.innerText = res; msgEl.className = "text-[10px] font-black text-center h-4 " + col; }
        if (input) input.value = '';
        window.UI_NEEDS_REBUILD = true; setTimeout(() => window.updateHTMLUI(G), 10);
    }
    else if (action === 'reset') { if (confirm('Her şeyi sıfırlamak istiyor musun?')) { localStorage.clear(); window.location.reload(); } }
    else if (action === 'skipRevive') { _revivePrompted = true; window.UI_NEEDS_REBUILD = true; window.updateHTMLUI(G); }
    else if (action === 'retryDiamond') {
        if (diamonds >= 10) {
            diamonds -= 10; saveAll(); G.revive();
        } else {
            if (confirm('10 elmasin yok. Magazadan elmas alabilirsin!')) {
                G.state = ST.SHOP; window.shopTabState = 'diamonds';
                window.UI_NEEDS_REBUILD = true; window.updateHTMLUI(G);
            }
        }
    }
    else if (action === 'openBox') {
        if (typeof openBox === 'function') {
            if (window._boxAnimating) return;
            const result = openBox(val);
            if (result) {
                window._boxAnimating = true;
                if (typeof sfxSwsh !== 'undefined') sfxSwsh();
                
                // Animasyon eklentisi
                const animEl = document.createElement('div');
                animEl.id = 'ui-kutu-anim';
                animEl.className = 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300';
                animEl.innerHTML = `
                   <div class="text-9xl transform transition-transform duration-100 animate-pulse drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]" style="animation: spin 0.4s linear infinite;">${val==='gold'?'📦':'💎'}</div>
                   <div class="absolute bottom-24 text-white font-black text-2xl tracking-[0.3em] animate-pulse drop-shadow-lg">AÇILIYOR...</div>
                `;
                document.body.appendChild(animEl);
                
                setTimeout(() => {
                    const el = document.getElementById('ui-kutu-anim');
                    if (el) el.remove();
                    window._boxAnimating = false;
                    
                    window._lastBoxResult = result;
                    window.shopTabState = 'boxes';
                    if (typeof sfxXP !== 'undefined') sfxXP();
                    if (typeof spawnParts !== 'undefined') {
                        const colMap = {common:'#d1d5db',rare:'#60a5fa',legendary:'#fbbf24'};
                        spawnParts(225, 400, colMap[result.rarity]||'#fff', 30, 8);
                    }
                    window.UI_NEEDS_REBUILD = true;
                    window.updateHTMLUI(window.G);
                }, 1400); // 1.4s bekle
            } else {
                if (typeof sfxDie !== 'undefined') sfxDie();
                // Show insufficient funds message
                const grid = document.getElementById('ui-shopgrid');
                if (grid) {
                    const msg = document.createElement('div');
                    msg.className = 'text-center text-xs text-red-400 font-bold py-2';
                    msg.innerText = val === 'gold' ? '⚠ Yeterli altın yok (150 gerekli)' : '⚠ Yeterli elmas yok (20 gerekli)';
                    grid.insertBefore(msg, grid.firstChild);
                    setTimeout(() => msg.remove(), 2000);
                }
            }
        }
    }
    else if (action === 'shoptab') {
        window.shopTabState = val;
        window.UI_NEEDS_REBUILD = true;
        window.updateHTMLUI(G);
        return; // already updated, skip redundant call at end
    }
    else if (action === 'buyD') {
        const opts = { title: 'Elmas Satın Al', text: `💎 Elmas satın alma sistemi çok yakında aktif olacak!\n\nŞu an elimizde ${typeof diamonds !== 'undefined' ? diamonds : 0} elmasın var.`, confirmButtonText: 'Tamam', background: '#1e1b2e', color: '#fff' };
        if (typeof Swal !== 'undefined') { Swal.fire(opts); }
        else { alert('Elmas satın alma sistemi çok yakında aktif olacak!'); }
        return;
    }
    else if (action === 'lang') {
        if (typeof curLang !== 'undefined') {
            curLang = curLang === 'tr' ? 'en' : 'tr';
            if (typeof S !== 'undefined') S.s('lang', curLang);
        }
    }
    else if (action === 'retry') G.startLv(G.lvi);
    else if (action === 'next') G.startLv(G.lvi + 1);
    else if (action === 'pause') G.togglePause();
    
    window.UI_NEEDS_REBUILD = true;
    window.updateHTMLUI(G);
};
