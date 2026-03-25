/* ================================================
   FLAPPYVERSE
   v2.0 — Vanilla JS + HTML5 Canvas
================================================ */
const canvas = document.getElementById('gameCanvas'), ctx = canvas.getContext('2d');
const W = 450, H = 800; canvas.width = W; canvas.height = H;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    // Mobil işlemcileri %80 rahatlatacak trick: Ağır gölgelendirmeyi iptal et.
    Object.defineProperty(ctx, 'shadowBlur', {
        set: function(val) { /* mobilde iptal */ },
        get: function() { return 0; }
    });
}

/* ── i18n ── */
const LANG = {
  tr: {
    title: 'Flappyverse', play: '▶  OYNA', shop: '🛒  MAĞAZA', settings: '👤  PROFİL', levelsel: 'Bölüm Seç', back: '← Geri',
    coins: 'Altın', diamonds: 'Elmas', xp: 'XP', level: 'Seviye', bestTime: 'En İyi Süre', lastTime: 'Son Süre', record: '🏆 REK!', sec: 'sn',
    locked: '🔒 Kilitli', unlock: 'Önceki bölümü bitir', buy: 'Satın Al', equip: 'Kuşan', equipped: '✔ Seçili',
    gameover: 'Oyun Bitti!', victory: 'Bölüm Tamam!', next: 'Sonraki →', retry: 'Tekrar', toMenu: 'Menü',
    pipes: 'boru', engel: 'engel', lazer: 'lazer', dalga: 'dalga', 'time': 'Süre', xpEarned: 'XP Kazanıldı', newRecord: 'YENİ REKOR!', congratz: 'Tebrikler! 🏆', allDone: 'Tüm bölümleri bitirdin!', paused: '⏸ DURAKLATILDI',
    lv: ['🌿 Klasik Nostalji', '💨 Rüzgarlı Vadi', '🌊 Derin Deniz', '🎃 Karanlık Sır', '⚡ Glitch Vakası', '🌆 Siber Şehir', '🚀 Yörüngeden Kaçış', '🚗 Ölümcül Otoyol', '🏆 Dereceli'],
    lvsub: ['Öğretici — temel kontroller', 'Rüzgar + sallanan platformlar', 'Yüzme fiziği — mercan tünelleri', 'Karanlık flaşör — görme zorluğu!', 'Ters yerçekimi — geri sayım!', 'Hız 2x — Lazer Bariyerler', 'Sıfır Yerçekimi — 360° itiş', 'Kurbağa Modu! Şerit atla!', '🏆 Sonsuz Skor & Küresel Sıralama'],
    charName: ['Klasik Piksel', 'Kırmızı Piksel', 'Mavi Piksel', 'Yeşil Piksel', 'Neon Sayborg', 'Batiskaf Dalgıç', 'Kuantum Baykuş', 'Uzay Şahini'],
    charDesc: ['Standart fizik.', 'Standart fizik.', 'Standart fizik.', 'Standart fizik.', 'Yerçekimi %15 azdır.', 'Hitbox %15 ufaktır.', 'Altın çeker ve 1.5x verir.', 'Zırhı vardır, 1 kez ölmez!'],
    hint1: 'Dokun / Boşluk = Zıpla / Uç', hint2: 'Yerçekimini tersine çevirmek için dokun!', hint3: 'Koşucu modda atla!',
    lang: '🌐 Dil: TR'
  },
  en: {
    title: 'Flappyverse', play: '▶  PLAY', shop: '🛒  SHOP', settings: '👤  PROFILE', levelsel: 'Select Level', back: '← Back',
    coins: 'Coins', diamonds: 'Diamonds', xp: 'XP', level: 'Level', bestTime: 'Best Time', lastTime: 'Last Time', record: '🏆 REC!', sec: 's',
    locked: '🔒 Locked', unlock: 'Complete previous level', buy: 'Buy', equip: 'Equip', equipped: '✔ Equipped',
    gameover: 'Game Over!', victory: 'Level Clear!', next: 'Next →', retry: 'Retry', toMenu: 'Menu',
    pipes: 'pipes', engel: 'obstacle', lazer: 'laser', dalga: 'wave', 'time': 'Time', xpEarned: 'XP Earned', newRecord: 'NEW RECORD!', congratz: 'Congratulations! 🏆', allDone: 'You completed all levels!', paused: '⏸ PAUSED',
    lv: ['🌿 Classic Nostalgia', '💨 Windy Valley', '🌊 Deep Sea', '🎃 Dark Secret', '⚡ The Glitch', '🌆 Cyber City', '🚀 Orbital Escape', '🚗 Deadly Highway', '🏆 Ranked'],
    lvsub: ['Tutorial — basic controls', 'Wind gusts + swinging platforms', 'Buoyancy physics — coral tunnels', 'Flashlight darkness!', 'Gravity flip countdown!', 'Speed 2x — laser barriers', 'Zero-G — 360° thrust', 'Frogger mode! Lane hop!', '🏆 Infinite score & global leaderboard'],
    charName: ['Classic Pixel', 'Red Pixel', 'Blue Pixel', 'Green Pixel', 'Neon Cyborg', 'Bathyscaphe Diver', 'Quantum Owl', 'Space Falcon'],
    charDesc: ['Standard bird.', 'Standard bird.', 'Standard bird.', 'Standard bird.', '15% lower gravity.', '15% smaller hitbox.', 'Magnets coins, 1.5x.', 'Armor, survives 1 hit!'],
    hint1: 'Tap / Space = Jump / Fly', hint2: 'Tap to flip gravity!', hint3: 'Jump in runner mode!',
    lang: '🌐 Lang: EN'
  }
};
let curLang = 'tr'; const T = k => LANG[curLang][k] || k;

/* ── AUDIO ── */
let _ac; const ga = () => { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); return _ac; };
let sfxMuted = false;
function tonePlus(f, t, d, v = .15, slide = false) {
    if (sfxMuted) return;
    try {
        const ac = ga(), o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        let type = t;
        if (t === 'sawtooth' || t === 'square') type = 'triangle'; // Softer replacing buzzy waves
        o.type = type;
        o.frequency.setValueAtTime(f, ac.currentTime);
        if (slide) o.frequency.exponentialRampToValueAtTime(f * 1.5, ac.currentTime + d);
        g.gain.setValueAtTime(0, ac.currentTime);
        g.gain.linearRampToValueAtTime(v * 0.7, ac.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d);
        o.start(); o.stop(ac.currentTime + d);
    } catch (_) {}
}
const sfxFlap = () => tonePlus(300, 'sine', 0.15, 0.1); 
const sfxCoin = () => { tonePlus(1200, 'sine', 0.1, 0.12, true); setTimeout(() => tonePlus(1600, 'sine', 0.15, 0.12, true), 40); };
const sfxScore = () => { tonePlus(600, 'triangle', 0.15, 0.1, true); };
const sfxDie = () => { tonePlus(200, 'triangle', 0.3, 0.15); setTimeout(() => tonePlus(150, 'triangle', 0.4, 0.15), 100); };
const sfxSwsh = () => tonePlus(350, 'sine', 0.1, 0.05);
const sfxWin = () => [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => tonePlus(f, 'sine', 0.2, 0.12, true), i * 80));
const sfxXP = () => { tonePlus(600, 'sine', 0.1, 0.12); setTimeout(() => tonePlus(800, 'sine', 0.2, 0.12, true), 80); };
const sfxAlarm = () => { [400, 500, 400, 500].forEach((f, i) => setTimeout(() => tonePlus(f, 'triangle', .2, .1), i * 120)); };

/* ── SAVE ── */
const S = { g: (k, d) => { const v = localStorage.getItem('coy_' + k); return v !== null ? JSON.parse(v) : d; }, s: (k, v) => localStorage.setItem('coy_' + k, JSON.stringify(v)) };
sfxMuted = S.g('sfx_mute', false);
var coins = S.g('coins', 0), ownedChars = S.g('owned', [true, false, false, false, false, false, false, false]), selChar = S.g('selchar', 0);
var diamonds = S.g('diamonds', 0);
var totalCoinsEarned = S.g('tc_earn', 0);
var spentCoins = S.g('tc_spent', 0);
var totalDiamondsEarned = S.g('td_earn', 0);
var compCounts = S.g('compc', [0,0,0,0,0,0,0,0,0]);
var unlockedLvs = S.g('unlocked', [true, false, false, false, false, false, false, false, false]);
var bestTimes = S.g('btimes', [0,0,0,0,0,0,0,0,0]), lastTimes = S.g('ltimes', [0,0,0,0,0,0,0,0,0]);
var playerXP = S.g('xp', 0), playerLv = S.g('plv', 1);
var devMode = S.g('devmode', false);

let devCode = '';
const DEV_SECRET = 'geliştirici';
const DEV_ALT = 'dev123';
function saveAll() { 
  S.s('coins', coins); S.s('diamonds', diamonds); S.s('compc', compCounts); 
  S.s('owned', ownedChars); S.s('selchar', selChar); S.s('unlocked', unlockedLvs); 
  S.s('btimes', bestTimes); S.s('ltimes', lastTimes); S.s('xp', playerXP); 
  S.s('plv', playerLv); S.s('devmode', devMode); S.s('tc_earn', totalCoinsEarned); 
  S.s('tc_spent', spentCoins); S.s('td_earn', totalDiamondsEarned); 
}
/* ── KOSTÜM SİSTEMİ (Gacha Kutu) ── */
// Kostümler ve nadirlik sistemine ek: index-based rarity
const CHAR_RARITY = ['common','common','common','common','rare','rare','legendary','legendary'];
const RARITY_REFUND = { common: 25, rare: 50, legendary: 150 };
const RARITY_LABELS = { common: 'Sıradan', rare: 'Nadir', legendary: 'Efsanevi' };
// Kutu açma: type = 'gold' (150 altın) | 'diamond' (20 elmas)
function openBox(type) {
  const GOLD_COST = 150, DIAMOND_COST = 20;
  if (type === 'gold') { if (coins < GOLD_COST) return null; coins -= GOLD_COST; spentCoins += GOLD_COST; }
  else if (type === 'diamond') { if (diamonds < DIAMOND_COST) return null; diamonds -= DIAMOND_COST; }
  // Düşme oranları
  const roll = Math.random();
  let rarity;
  if (type === 'diamond') {
    rarity = roll < 0.40 ? 'common' : roll < 0.80 ? 'rare' : 'legendary';
  } else {
    rarity = roll < 0.70 ? 'common' : roll < 0.95 ? 'rare' : 'legendary';
  }
  // Nadirlik grubundan rastgele karakter seç
  const pool = CHARS.map((c,i)=>i).filter(i => CHAR_RARITY[i] === rarity);
  const charIdx = pool[Math.floor(Math.random() * pool.length)];
  let isDuplicate = false, refund = 0;
  if (ownedChars[charIdx]) {
    // Çiftleme (Duplicate) → altın iade
    isDuplicate = true;
    refund = RARITY_REFUND[rarity];
    coins += refund; totalCoinsEarned += refund;
  } else {
    ownedChars[charIdx] = true;
  }
  saveAll();
  return { charIdx, rarity, isDuplicate, refund };
}
function applyDevMode() {
  if (devMode) { unlockedLvs = [true,true,true,true,true,true,true,true,true]; LEVELS.forEach(l => l.unlocked = true); }
}
const XP_PER_LV = 500;

/* ── LEADERBOARD (B7 Dereceli — Firebase Küresel Skor) ── */
let leaderboard = S.g('lb', []); // [{name, score, date}] — yerel önbellek
function lbSubmit(name, score) {
  const badWords = ['amk','piç','yarrak','sik','siktir','orospu','göt','bok','fuck','shit','bitch'];
  let n = name.slice(0, 12).trim() || 'Anonim';
  if (badWords.some(w => n.toLowerCase().includes(w))) n = 'Anonim';
  const entry = { name: n, score, date: new Date().toLocaleDateString('tr-TR') };
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  S.s('lb', leaderboard);
  // Firebase Firestore: sadece kişisel rekor ise güncelle
  if (window.fbDb) {
    try {
      const ref = window.fbDb.collection('leaderboard').doc(n);
      ref.get().then(doc => {
        if (!doc.exists || doc.data().highScore < score) {
          ref.set({ username: n, highScore: score, date: entry.date });
        }
      }).catch(() => {});
    } catch(e) {}
  }
}
/* ── Firebase'den küresel liderlik tablosunu çek ── */
function lbFetchGlobal() {
  if (!window.fbDb) return;
  try {
    window.fbDb.collection('leaderboard').orderBy('highScore', 'desc').limit(10).get().then(snap => {
      const remote = [];
      snap.forEach(doc => { const d = doc.data(); remote.push({ name: d.username || doc.id, score: d.highScore, date: d.date || '' }); });
      if (remote.length > 0) { leaderboard = remote; S.s('lb', leaderboard); }
    }).catch(() => {});
  } catch(e) {}
}

function drawLeaderboard(px, py, pw) {
  const rh = 28, maxRows = Math.min(leaderboard.length, 10);
  panel(px, py, pw, 44 + maxRows * rh + 14, 14);
  ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
  ctx.fillText('\ud83c\udfc6 Liderlik Tablosu', px + pw / 2, py + 20); ctx.shadowBlur = 0;
  if (leaderboard.length === 0) {
    ctx.font = '12px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.fillText('Hen\u00fcz kay\u0131tl\u0131 skor yok', px + pw / 2, py + 50); return;
  }
  leaderboard.slice(0, 10).forEach((e, i) => {
    const ry = py + 36 + i * rh;
    const medal = ['\ud83e\udd47','\ud83e\udd48','\ud83e\udd49'][i] || (i + 1) + '.';
    const isTop = i < 3;
    ctx.font = isTop ? 'bold 13px Outfit' : '11px Outfit';
    ctx.fillStyle = isTop ? ['#fbbf24','#d1d5db','#f97316'][i] : 'rgba(255,255,255,.5)';
    ctx.textAlign = 'left';
    ctx.fillText(medal + ' ' + e.name, px + 10, ry + 17);
    ctx.textAlign = 'right'; ctx.fillStyle = '#4ade80';
    ctx.font = isTop ? 'bold 13px Outfit' : '11px Outfit';
    ctx.fillText(String(e.score), px + pw - 10, ry + 17);
    if (e.date) {
      ctx.font = '9px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.textAlign = 'right';
      ctx.fillText(e.date, px + pw - 10, ry + 27);
    }
    if (i < maxRows - 1) {
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px + 8, ry + rh - 1); ctx.lineTo(px + pw - 8, ry + rh - 1); ctx.stroke();
    }
  });
}

/* ── CHARACTERS ── */
const CHARS = [
  { i: 0, emoji: '🐤', price: 0, c1: '#fcd34d', c2: '#f59e0b', c3: '#d97706', type: 'classic' },
  { i: 1, emoji: '🍎', price: 300, c1: '#fca5a5', c2: '#ef4444', c3: '#b91c1c', type: 'classic' },
  { i: 2, emoji: '💧', price: 300, c1: '#93c5fd', c2: '#3b82f6', c3: '#1d4ed8', type: 'classic' },
  { i: 3, emoji: '🌿', price: 300, c1: '#86efac', c2: '#22c55e', c3: '#15803d', type: 'classic' },
  { i: 4, emoji: '🤖', price: 800, c1: '#1e293b', c2: '#0f172a', c3: '#38bdf8', type: 'cyborg' },
  { i: 5, emoji: '🤿', price: 800, c1: '#06b6d4', c2: '#0891b2', c3: '#fbbf24', type: 'diver' },
  { i: 6, emoji: '🦉', price: 2000, c1: '#4c1d95', c2: '#312e81', c3: '#a78bfa', type: 'owl' },
  { i: 7, emoji: '🚀', price: 5000, c1: '#cbd5e1', c2: '#475569', c3: '#ef4444', type: 'falcon' },
];

/* ── LEVELS ──
   mode: classic | buoy | glitch | wind | cyber | space | flappy
   wind: constant downward Y push
   movObs: obstacles sine-wave Y oscillation
   darkness: flashlight effect
   autoFlip: periodic gravity flip interval (frames)
   glitchScore: score threshold to trigger glitch countdown
   spdMul: base speed multiplier
── */
const LEVELS = [
  // B1 — Tutorial: öğretici, çok geniş gap, çok yavaş (Hedef bitince scroll durur)
  {
    mode:'tutorial', gap:310, iv:170, tgt:10, cv:1, xpR:60, grav:.26, jf:-7.2, spdMul:0.62,
    wind:0, movObs:false, darkness:false, autoFlip:0, obsStyle:'platform',
    sky:['#7dd3fc','#38bdf8','#bae6fd'], gc:['#22c55e','#16a34a','#15803d'],
    pc:['#22c55e','#166534','#14532d','#4ade80','#bbf7d0'], stars:0
  },
  // B2 — Rüzgarlı Vadi: sine salınan platformlar + rüzgar gustleri
  {
    mode:'wind', gap:290, iv:130, tgt:20, cv:2, xpR:140, grav:.30, jf:-7.8, spdMul:0.85,
    wind:0, movObs:true, darkness:false, autoFlip:0, windForce:0.04, windInterval:180, obsStyle:'wind_platform',
    sky:['#e0f2fe','#bae6fd','#7dd3fc'], gc:['#6b7280','#4b5563','#374151'],
    pc:['#6b7280','#9ca3af','#4b5563','#d1d5db','#f3f4f6'], stars:8
  },
  // B3 — Derin Deniz: buoyancy, mercan tünelleri + denizanaları
  {
    mode:'buoy', gap:275, iv:135, tgt:25, cv:3, xpR:280, grav:0, jf:0, spdMul:0.82,
    wind:0, movObs:false, darkness:false, autoFlip:0, obsStyle:'coral',
    sky:['#042f54','#0c4a6e','#0369a1'], gc:['#042f54','#0c3256','#021428'],
    pc:['#0f766e','#0d9488','#134e4a','#14b8a6','#99f6e4'], stars:0
  },
  // B4 — Karanlık Sır (Cadılar Bayramı): Görme zorluğu + karanlık flaşör efekti
  {
    mode:'halloween', gap:285, iv:128, tgt:25, cv:3, xpR:350, grav:.32, jf:-8.0, spdMul:0.90,
    wind:0, movObs:true, darkness:true, autoFlip:0, obsStyle:'spooky',
    sky:['#04020a','#000000','#0f0514'], gc:['#110022','#090011','#040008'],
    pc:['#9333ea','#b91c1c','#c026d3','#fbbf24','#000000'], stars:0
  },
  // B5 — The Glitch: Ters yerçekimi geri sayım vs
  {
    mode:'glitch', gap:265, iv:120, tgt:30, cv:4, xpR:400, grav:.35, jf:-8.4, spdMul:1.0,
    wind:0, movObs:false, darkness:false, autoFlip:0, glitchScore: 8, obsStyle:'digital',
    sky:['#1e1b4b','#312e81','#1e1b4b'], gc:['#020617','#0f172a','#020617'],
    pc:['#f43f5e','#e11d48','#be123c','#fb7185','#fda4af'], stars:0
  },
  // B6 — Siber Şehir: Lazer bariyerler + altın toplama
  {
    mode:'cyber', gap:270, iv:105, tgt:20, cv:5, xpR:220, grav:.38, jf:-8.5, spdMul:1.55,
    wind:0, movObs:false, darkness:false, autoFlip:0, obsStyle:'laser', cyberCoins:true,
    sky:['#0f0f1a','#1a0533','#0d0d2b'], gc:['#1e1b4b','#312e81','#0d0b1e'],
    pc:['#7c3aed','#6d28d9','#4c1d95','#a78bfa','#ddd6fe'], stars:30
  },
  // B7 — Yörüngeden Kaçış: Zero-G, füzeler + meteorlar
  {
    mode:'space', gap:310, iv:125, tgt:15, cv:4, xpR:500, grav:0, jf:0, spdMul:0,
    wind:0, movObs:false, darkness:false, autoFlip:0, obsStyle:'space',
    sky:['#020617','#0c0a1e','#030014'], gc:['#0c0a1e','#020617','#000010'],
    pc:['#6366f1','#4338ca','#312e81','#818cf8','#c7d2fe'], stars:60
  },
  // B8 — Ölümcül Otoyol: Kuşbakışı di̇key şerrit + yatay scroll
  {
    mode:'frogger', lanes: 12, tgt:15, cv:3, xpR:500, grav:0, jf:0, spdMul:0,
    wind:0, movObs:false, darkness:false, autoFlip:0, obsStyle:'car', topDown:true,
    sky:['#0a0e1a','#060a14','#020407'], gc:['#0a0e1a','#060a14','#020407'],
    pc:['#f59e0b','#ef4444','#3b82f6','#ffffff','#10b981'], stars:0,
    carColors: ['#ef4444','#f97316','#3b82f6','#06b6d4','#10b981','#a855f7','#ec4899','#fbbf24','#64748b','#f8fafc'],
    // Di̇key şerit hız çarpanları (sola→sağa artan tehlike)
    laneSpeedMul: [0.8,1.0,1.2,1.4,1.7,2.0,2.3,2.6,3.0,3.4,3.9,4.5]
  },
  // B9 — Saf Flappy (Dereceli): SONSUZ skor saldırısı
  {
    mode:'flappy', gap:290, iv:130, tgt:999, cv:6, xpR:300, grav:.30, jf:-7.8, spdMul:0.85,
    wind:0, movObs:false, darkness:false, autoFlip:0, obsStyle:'pipe', leaderboard:true,
    flappyInfinite:true,
    sky:['#56cfcd','#56cfcd','#4db8b6'], gc:['#ded895','#c8b65a','#a89240'],
    pc:['#73b04a','#5a8f38','#3d6326','#8fd456','#b8e986'], stars:0
  }
];
LEVELS.forEach((l, i) => { if (unlockedLvs[i]) l.unlocked = true; });

/* ── SPEED ── */
function spd(sc, lv) {
  const mul = (lv && lv.spdMul != null) ? lv.spdMul : 1.0;
  if (lv && lv.mode === 'space') return 0; // space: no auto-scroll
  return Math.min((1.8 + sc * 0.11) * mul, 8.5);
}

/* ── HELPERS ── */
const C = { gold: '#fbbf24', goldD: '#d97706', white: '#fff', dark: '#0f172a', panel: 'rgba(15,23,42,.92)', pb: 'rgba(125,211,252,.25)', accent: '#f59e0b' };
function rr(x, y, w, h, r = 10) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
function panel(x, y, w, h, r = 18) { ctx.save(); ctx.shadowColor = 'rgba(125,211,252,.15)'; ctx.shadowBlur = 20; rr(x, y, w, h, r); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.pb; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore(); }
function btn(lbl, cy, w = 210, h = 52, c1 = '#f59e0b', c2 = '#d97706') { const x = (W - w) / 2, y = cy - h / 2; ctx.save(); ctx.shadowColor = c1; ctx.shadowBlur = 12; rr(x, y, w, h, 14); const bg = ctx.createLinearGradient(x, y, x, y + h); bg.addColorStop(0, c1); bg.addColorStop(1, c2); ctx.fillStyle = bg; ctx.fill(); ctx.restore(); ctx.font = 'bold 19px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = C.dark; ctx.fillText(lbl, W / 2, cy + 7); return { x, y, w, h }; }
function smBtn(lbl, x, cy, w = 120, h = 36, c1 = '#334155', c2 = '#1e293b') { const y = cy - h / 2; rr(x, y, w, h, 10); ctx.fillStyle = c2; ctx.fill(); ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(lbl, x + w / 2, cy + 5); return { x, y, w, h }; }
function backBtn() { rr(12, 12, 88, 34, 10); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke(); ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText(T('back'), 56, 34); return { x: 12, y: 12, w: 88, h: 34 }; }
function goldBadge(x, y) { ctx.font = 'bold 16px Outfit'; ctx.textAlign = 'right'; ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 8; ctx.fillText(`🌟 ${coins}`, x, y); ctx.shadowBlur = 0; }
function xpBar(x, y, w, h) { const pct = (playerXP % (XP_PER_LV)) / XP_PER_LV; rr(x, y, w, h, 4); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill(); if (pct > 0) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#a78bfa'); g.addColorStop(1, '#7c3aed'); ctx.fillStyle = g; rr(x, y, w * pct, h, 4); ctx.fill(); } ctx.font = '10px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.textAlign = 'left'; ctx.fillText(`Lv ${playerLv} · ${playerXP % XP_PER_LV}/${XP_PER_LV} XP`, x, y + h + 11); }
function hitTest(b, cx, cy) { return b && cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h; }
function adjustBrightness(hex, factor) {
  try {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b2 = parseInt(hex.slice(5,7),16);
    r = Math.min(255,Math.round(r*factor)); g = Math.min(255,Math.round(g*factor)); b2 = Math.min(255,Math.round(b2*factor));
    return `rgb(${r},${g},${b2})`;
  } catch(e) { return hex; }
}

/* ── DRAW CHARACTER ── */
function drawChar(ch, x, y, r, rot = 0, crk = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot * Math.PI / 180);
  const t = ch.type;
  // Shadow
  ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, r + 3, r * .9, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  
  if (t === 'classic') {
    // 8-bit retro sarı kuş (Flappy Bird benzeri pixel-art hissiyatı ama canvas primitives ile)
    ctx.fillStyle = ch.c1;
    rr(-r, -r*.8, r*2, r*1.6, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(r*.2, -r*.5, r*.6, r*.6);
    ctx.fillStyle = '#000'; ctx.fillRect(r*.5, -r*.3, r*.2, r*.2);
    ctx.fillStyle = ch.c3; ctx.fillRect(r*.6, -r*.1, r*.7, r*.4);
    ctx.fillStyle = ch.c2; ctx.fillRect(-r*.7, 0, r*.8, r*.5);
  } else if (t === 'diver') {
    // Batiskaf Dalgıç
    ctx.fillStyle = ch.c1; ctx.beginPath(); ctx.arc(0, 0, r*.9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#cffafe'; ctx.beginPath(); ctx.arc(r*.3, -r*.1, r*.4, 0, Math.PI*2); ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle = ch.c3; ctx.stroke();
    ctx.fillStyle = ch.c2; rr(-r*1.1, -r*.4, r*.4, r*.8, 3); ctx.fill();
    if(G && G.tick % 8 === 0) spawnParts(x-r, y, '#cffafe', 1, 1);
  } else if (t === 'cyborg') {
    // Neon Sayborg
    ctx.fillStyle = ch.c2; ctx.beginPath(); ctx.ellipse(0, 0, r*1.1, r*.8, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ef4444'; rr(r*.1, -r*.4, r*.7, r*.3, 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = ch.c1; ctx.beginPath(); ctx.moveTo(-r*.2, r*.1); ctx.lineTo(-r*1.2, -r*.3); ctx.lineTo(-r*.6, r*.5); ctx.fill();
    ctx.shadowColor = ch.c3; ctx.shadowBlur = 8;
    ctx.fillStyle = ch.c3; ctx.beginPath(); ctx.moveTo(-r*.8, r*.3); ctx.lineTo(-r*1.5, r*.6+Math.random()*2); ctx.lineTo(-r*.6, r*.7); ctx.fill(); ctx.shadowBlur = 0;
  } else if (t === 'owl') {
    // Kuantum Baykuş
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = ch.c2; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = ch.c3; ctx.shadowBlur = 12;
    ctx.fillStyle = ch.c3; ctx.beginPath(); ctx.arc(r*.3, -r*.2, r*.25, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r*.35, -r*.25, r*.08, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    if(G && G.tick % 5 === 0) spawnParts(x, y, ch.c3, 1, 1);
    ctx.globalAlpha = 1;
  } else if (t === 'falcon') {
    // Uzay Şahini
    ctx.fillStyle = ch.c2; ctx.beginPath(); ctx.moveTo(-r, -r*.5); ctx.lineTo(r, 0); ctx.lineTo(-r, r*.5); ctx.lineTo(-r*.5, 0); ctx.fill();
    ctx.strokeStyle = ch.c1; ctx.lineWidth = 3; ctx.stroke();
    // Flicker blue light
    ctx.fillStyle = Math.random() > 0.5 ? '#60a5fa' : '#3b82f6';
    ctx.beginPath(); ctx.arc(0, 0, r*.2, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = ch.c3; ctx.shadowBlur = 10;
    ctx.fillStyle = ch.c3; ctx.beginPath(); ctx.moveTo(-r*.8, -r*.2); ctx.lineTo(-r*1.8, (Math.random()-.5)*4); ctx.lineTo(-r*.8, r*.2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(r*.1, 0, r*.4, r*.15, 0, 0, Math.PI*2); ctx.fill();
  }
  
  if (crk > 0) { ctx.strokeStyle = '#000'; ctx.lineWidth = 1 + crk; ctx.beginPath(); ctx.moveTo(-r*.4,0); ctx.lineTo(r*.3,-.1); ctx.stroke(); }
  ctx.restore();
}

/* ── STARFIELD ── */
class StarField {
  constructor(n) { this.s = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * (H * .75), r: .5 + Math.random() * 2, tw: Math.random() * Math.PI * 2, sp: .02 + Math.random() * .03 })); }
  update() { this.s.forEach(s => s.tw += s.sp); }
  draw() { this.s.forEach(s => { ctx.save(); ctx.globalAlpha = .45 + Math.sin(s.tw) * .4; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }); }
}

/* ── CLOUD ── */
class Cloud {
  constructor(i = false) { this.reset(i); } reset(i = false) { this.x = i ? Math.random() * W : W + 80; this.y = 40 + Math.random() * 200; this.sp = .3 + Math.random() * .5; this.sc = .5 + Math.random() * .9; this.al = .4 + Math.random() * .35; }
  update(sp = 2.2) { this.x -= this.sp * (sp / 2.2); if (this.x < -150) this.reset(); }
  draw() { ctx.save(); ctx.globalAlpha = this.al; ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.translate(this.x, this.y); ctx.scale(this.sc, this.sc); ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.arc(38, -8, 22, 0, Math.PI * 2); ctx.arc(-32, -5, 20, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
}

/* ── PARTICLES ── */
const PARTS = [];
function spawnParts(x, y, col, n = 10, speed = 4) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * speed; PARTS.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, col, r: 2 + Math.random() * 5, life: 1, dec: .03 + Math.random() * .04 }); }
}
function updateParts() { for (let i = PARTS.length - 1; i >= 0; i--) { const p = PARTS[i]; p.x += p.vx; p.y += p.vy; p.vy += .1; p.life -= p.dec; if (p.life <= 0) PARTS.splice(i, 1); } }
function drawParts() { PARTS.forEach(p => { ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }); }

/* ── COIN ── */
const GROUND_H = 85;
class Coin {
  constructor(x, y, val) { 
    this.x = x; this.y = y; this.val = val; this.r = 15; this.coll = false; this.an = 0; 
    this.isDiamond = Math.random() < 0.04; // %4 şansla elmas
  }
  update() { this.an += .07; }
  collect() { 
    this.coll = true; 
    if (this.isDiamond) { sfxXP(); spawnParts(this.x, this.y, '#22d3ee', 12, 5); } 
    else { sfxCoin(); spawnParts(this.x, this.y, C.gold, 8, 3); }
  }
  draw() { 
    if (this.coll) return; const sc = 1 + Math.sin(this.an * 2) * .08, scX = Math.abs(Math.cos(this.an)); 
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(scX * sc, sc); 
    if (this.isDiamond) {
      ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 12; ctx.fillStyle = '#06b6d4';
      ctx.beginPath(); ctx.moveTo(0, -this.r); ctx.lineTo(this.r*0.85, 0); ctx.lineTo(0, this.r); ctx.lineTo(-this.r*0.85, 0); ctx.fill();
      ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.moveTo(0, -this.r+4); ctx.lineTo(this.r*0.5, 0); ctx.lineTo(0, this.r-4); ctx.lineTo(-this.r*0.5, 0); ctx.fill();
    } else {
      ctx.shadowColor = C.gold; ctx.shadowBlur = 10; const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, this.r); 
      g.addColorStop(0, '#fef3c7'); g.addColorStop(.6, C.gold); g.addColorStop(1, C.goldD); 
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); 
      ctx.shadowBlur = 0; ctx.font = 'bold 11px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = C.dark; ctx.fillText(this.val > 1 ? `+${this.val}` : '★', 0, 4); 
    }
    ctx.restore(); 
  }
}

/* ── SPACE OBSTACLES (B6) ── */
class SpaceObs {
  constructor(tick) {
    this.type = Math.random() < 0.55 ? 'missile' : 'meteor';
    if (this.type === 'missile') {
      // homing missile: starts from right side
      this.x = W + 20; this.y = PING + Math.random() * (H - GROUND_H - PING * 2);
      this.vx = -(1.8 + Math.random() * 1.2) * 0.33; this.vy = 0;
      this.life = Math.floor((180 + Math.floor(Math.random() * 60)) * 1.4); // 40% increased life
      this.r = 12; this.angle = Math.PI;
      this.tick = 0;
    } else {
      // meteor: random angle from right/top
      const side = Math.random() < 0.5;
      this.x = side ? W + 20 : PING + Math.random() * (W - PING * 2);
      this.y = side ? PING + Math.random() * (H / 2) : -20;
      const ang = Math.PI + Math.random() * Math.PI / 3;
      const spd2 = (2 + Math.random() * 1.5) * 0.33;
      this.vx = Math.cos(ang) * spd2; this.vy = Math.sin(ang) * spd2 + (side ? 0.3 : 0.8) * 0.33;
      this.r = 10 + Math.random() * 14; this.angle = 0; this.life = 220; this.tick = 0;
    }
    this.passed = false; this.x0 = this.x;
  }
  update(playerX, playerY) {
    this.tick++;
    if (this.type === 'missile') {
      // home toward player for 3s then straight
      if (this.tick < 252) {
        const dx = playerX - this.x, dy = playerY - this.y;
        const len = Math.sqrt(dx*dx+dy*dy) || 1;
        this.vx += (dx/len * 2.2 - this.vx) * 0.04;
        this.vy += (dy/len * 2.2 - this.vy) * 0.04;
      }
      this.angle = Math.atan2(this.vy, this.vx);
    } else {
      this.angle += 0.06;
    }
    this.x += this.vx; this.y += this.vy; this.life--;
    if (!this.passed && this.x + this.r < 0) this.passed = true;
  }
  off() { return this.life <= 0 || this.x + this.r * 2 < 0 || this.y > H; }
  hits(bird) {
    const hb = bird.hb();
    const cx = hb.x + hb.w/2, cy = hb.y + hb.h/2;
    const dx = cx - this.x, dy = cy - this.y;
    return Math.sqrt(dx*dx+dy*dy) < this.r + bird.hR - 3;
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
    if (this.type === 'missile') {
      ctx.shadowColor = '#f97316'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-8,6); ctx.lineTo(-8,-6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(-16,4); ctx.lineTo(-16,-4); ctx.closePath(); ctx.fill();
      // exhaust
      ctx.globalAlpha = 0.6 + Math.sin(G.tick*0.3)*0.4;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.ellipse(-10, 0, 6, 3, 0, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.shadowColor = '#94a3b8'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(-this.r*0.3, -this.r*0.25, this.r*0.35, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}

/* ── ALIEN COLLECTIBLE (B6) ── */
class AlienObs {
  constructor() {
    const side = Math.floor(Math.random() * 3);
    if (side === 0) { this.x = W + 24; this.y = 80 + Math.random() * (H - GROUND_H - 160); this.vx = -(1.2 + Math.random() * 0.8) * 0.33; this.vy = (Math.random() - 0.5) * 1.0 * 0.33; }
    else if (side === 1) { this.x = 60 + Math.random() * (W - 120); this.y = -24; this.vx = (Math.random() - 0.5) * 1.2 * 0.33; this.vy = (1.0 + Math.random() * 0.6) * 0.33; }
    else { this.x = 60 + Math.random() * (W - 120); this.y = H - GROUND_H + 24; this.vx = (Math.random() - 0.5) * 1.2 * 0.33; this.vy = -(1.0 + Math.random() * 0.6) * 0.33; }
    this.r = 16; this.tk = 0; this.collected = false;
    this.wobble = Math.random() * Math.PI * 2;
    const typeRoll = Math.random();
    if (typeRoll < 0.05) { this.col = '#3b82f6'; this.val = 4; } // Blue 5%
    else if (typeRoll < 0.25) { this.col = '#fbbf24'; this.val = 2; } // Yellow 20%
    else { this.col = ['#4ade80','#34d399','#6ee7b7'][Math.floor(Math.random()*3)]; this.val = 1; }
    this.life = 420;
  }
  update() {
    this.tk++; this.life--;
    this.wobble += 0.06;
    this.vy += Math.sin(this.wobble * 0.3) * 0.04;
    this.vx *= 0.996; this.vy *= 0.996;
    this.x += this.vx; this.y += this.vy;
  }
  off() { return this.collected || this.life <= 0 || this.x < -60 || this.x > W + 60 || this.y < -60 || this.y > H + 60; }
  collect(bird) {
    if (this.collected) return false;
    const dx = bird.x - this.x, dy = bird.y - this.y;
    return Math.sqrt(dx*dx+dy*dy) < this.r + bird.hR + 4;
  }
  draw() {
    if (this.collected) return;
    const sc = 1 + Math.sin(this.wobble) * 0.08;
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(sc, sc);
    ctx.shadowColor = this.col; ctx.shadowBlur = 18;
    ctx.fillStyle = this.col;
    ctx.beginPath(); ctx.ellipse(0, 3, this.r, this.r * 0.72, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -5, this.r * 0.75, this.r * 0.8, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#0008';
    ctx.beginPath(); ctx.ellipse(-6, -2, 5, 4, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -2, 5, 4, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(-5, -3, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -3, 2, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.col; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-5, -this.r*0.65); ctx.lineTo(-9, -this.r*1.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -this.r*0.65); ctx.lineTo(9, -this.r*1.1); ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(-9, -this.r*1.1, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -this.r*1.1, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#0008'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 4, 5, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  }
}

/* ── OBSTACLE ── */
const OW = 64, OCAP = 20, PING = 60;
class Obstacle {
  constructor(x, lv, sc) {
    this.x = x; this.sp = spd(sc, lv); this.pc = lv.pc; this.gap = lv.gap; this.passed = false;
    this.lv = lv; this.style = lv.obsStyle || 'pipe';
    this.isOcean = this.style === 'coral';
    this.isCyber = this.style === 'laser';
    this.isDigital = this.style === 'digital';
    this.isWind = this.style === 'wind_platform';
    this.isSpooky = this.style === 'spooky';
    this.yTk = Math.random() * Math.PI * 2;
    this.yAmp = lv.movObs ? (18 + Math.random() * 24) : 0;
    const mn = PING + 10, mx = H - GROUND_H - this.gap - PING - 10;
    this._bTop = mn + Math.random() * Math.max(1, mx - mn);
    this.topH = this._bTop; this.botY = this.topH + this.gap; this._bBot = this.botY;
    
    // Altın farmını engelle (tamamlanan bölümlerde spawn şansı düşer)
    this.dropScl = 1;
    if (G.lvi < 7 && compCounts[G.lvi] > 0) {
      this.dropScl = Math.max(0.05, Math.pow(0.3, compCounts[G.lvi]));
    }
    this.coin = Math.random() < (.72 * this.dropScl) ? new Coin(x + OW / 2, this.topH + this.gap / 2, lv.cv) : null;
    // Platform style (B1 tutorial): floating cloud platforms
    if (this.isTutorial || this.isWind) {
      this.platW = 55 + Math.random() * 30;
      this.platH = 18;
    }
    // Ocean (B3): coral + jellyfish
    if (this.isOcean) {
      this.jags = Array.from({ length: 7 }, () => 10 + Math.random() * 24);
      this.hasMoray = Math.random() < .32;
      this.moraySide = Math.random() < .5 ? 'top' : 'bot';
      this.morayExt = 0;
      this.jellyR = 12 + Math.random() * 9;
      this.jellyClr = ['rgba(192,132,252,.8)','rgba(45,212,191,.8)','rgba(249,168,212,.8)'][Math.floor(Math.random()*3)];
      
      this._ocv = document.createElement('canvas');
      this._ocv.width = OW + 10; this._ocv.height = Math.max(H, 800);
      const octx = this._ocv.getContext('2d'); const tw = OW + 10;
      const g1 = octx.createLinearGradient(0, 0, tw, 0); g1.addColorStop(0, '#0f766e'); g1.addColorStop(.5, '#0d9488'); g1.addColorStop(1, '#0f766e');
      octx.fillStyle = g1; octx.beginPath(); octx.moveTo(0, 0); octx.lineTo(tw, 0); octx.lineTo(tw, this.topH - 8);
      for (let i = 0; i <= 6; i++) { octx.lineTo(tw - i * (tw / 6), this.topH - this.jags[i % 7]); }
      octx.lineTo(0, this.topH - 10); octx.closePath(); octx.fill();
      octx.fillStyle = 'rgba(20,184,166,.35)'; octx.beginPath(); octx.moveTo(5, 0); octx.lineTo(16, 0); octx.lineTo(16, this.topH - 14); octx.lineTo(5, this.topH - 12); octx.closePath(); octx.fill();
      const g2 = octx.createLinearGradient(0, 0, tw, 0); g2.addColorStop(0, '#134e4a'); g2.addColorStop(.5, '#0f766e'); g2.addColorStop(1, '#134e4a');
      octx.fillStyle = g2; octx.beginPath(); octx.moveTo(0, H - GROUND_H); octx.lineTo(tw, H - GROUND_H); octx.lineTo(tw, this.botY + 10);
      for (let i = 0; i <= 6; i++) { octx.lineTo(tw - i * (tw / 6), this.botY + this.jags[(i + 4) % 7]); }
      octx.lineTo(0, this.botY + 8); octx.closePath(); octx.fill();
    }
    // Digital blocks (B4)
    this.isGlitch = lv.mode === 'glitch';
    this.glitchThr = lv.glitchScore || 10;
    if (this.isDigital) {
      const blockH = 22 + Math.random() * 18;
      this.blocks = [];
      // Top block cluster
      let y = 0;
      while (y + blockH < this.topH - 4) {
        const bh = 18 + Math.random() * 14;
        const bw = 40 + Math.random() * 28;
        const bx2 = Math.random() * (OW - bw);
        this.blocks.push({ y, h: bh, x: bx2, w: bw, top: true, _origY: y });
        y += bh + 4 + Math.random() * 8;
      }
      // Bottom block cluster
      let y2 = this.botY;
      while (y2 < H - GROUND_H - 4) {
        const bh = 18 + Math.random() * 14;
        const bw = 40 + Math.random() * 28;
        const bx2 = Math.random() * (OW - bw);
        this.blocks.push({ y: y2, h: bh, x: bx2, w: bw, top: false, _origY: y2 });
        y2 += bh + 4 + Math.random() * 8;
      }
      if (this.isGlitch && sc >= this.glitchThr) { this.yAmp = 14 + Math.random() * 22; }
    }
    // Laser only (B3 Siber Şehir): persistent, Y-moving — DASH YOK
    if (this.isCyber) {
      this.laserOpen = false; // closed = safe, open = DANGER
      this.laserTick = 0;
      this.laserPeriod = 95;       // safe window (~1.6s) — dengeli
      this.laserDangerPeriod = 62; // danger window (~1.0s)
      this.laserInDanger = false;
      this.laserWarnTick = 0;
      this._introSafe = 180;       // ilk 3 saniye lazer gelmez — smooth başlangıç
      this._gapYTk = Math.random() * Math.PI * 2;
      this._gapYSpeed = 0.012;    // sakin başlangıç hızı
      this._gapYAmp = 88;         // orta hareket alanı
      // Altınlar: Artık ekranın sağından gelip sola (arkaya) doğru akacaklar
      const py = this.topH + this.gap / 2;
      this.coins = [
        Math.random() < this.dropScl ? new Coin(W + 50, py, this.lv.cv) : null,
        Math.random() < this.dropScl ? new Coin(W + 150, py, this.lv.cv) : null,
      ];
      this.coin = null;
      this._coinRespawnTimers = [0, 0];
    }
  }
  update() {
    this.x -= this.sp;
    if (this.isGlitch && G.glitchFlipped && this.yAmp === 0 && this.isDigital) { this.yAmp = 14 + Math.random() * 20; }
    if (this.yAmp > 0) {
      this.yTk += .018; const dy = Math.sin(this.yTk) * this.yAmp;
      this.topH = this._bTop + dy; this.botY = this._bBot + dy;
      if (this.coin) this.coin.y = this.topH + this.gap / 2;
      if (this.isDigital && this.blocks) {
        this.blocks.forEach(b => {
          if (b.top) b.y = b._origY + dy;
          else b.y = b._origY + (this.botY - this._bBot);
        });
      }
    }
    if (this.isOcean && this.hasMoray) { const t = Math.sin(G.tick * 0.045 + this.x * 0.01) > 0.55 ? 24 : 0; this.morayExt += (t - this.morayExt) * 0.07; }
    if (this.isCyber) {
      // Intro safe period: oyun başlatılınca lazer hemen gelmesin
      if (this._introSafe > 0) {
        this._introSafe--;
        // Gap y movement de başta yavaş başlsın
        this._gapYTk += this._gapYSpeed * 0.4;
        const gapDY = Math.sin(this._gapYTk) * this._gapYAmp;
        const mn = PING + 20, mx = H - GROUND_H - this.gap - PING - 20;
        const newTop = Math.max(mn, Math.min(mx, this._bTop + gapDY));
        this.topH = newTop; this.botY = newTop + this.gap;
        this._updateCyberCoins();
        return;
      }
      // Y-slide: safe gap moves continuously
      this._gapYTk += this._gapYSpeed;
      const gapDY = Math.sin(this._gapYTk) * this._gapYAmp;
      const mn = PING + 20, mx = H - GROUND_H - this.gap - PING - 20;
      const newTop = Math.max(mn, Math.min(mx, this._bTop + gapDY));
      this.topH = newTop;
      this.botY = newTop + this.gap;
      // Multi-coin update
      this._updateCyberCoins();
      this.laserTick++;
      // Two-phase cycle: SAFE → WARN → DANGER → SAFE
      const danger = this.laserInDanger;
      const period = danger ? this.laserDangerPeriod : this.laserPeriod;
      // Warn in last 20 frames of safe phase
      if (!danger && this.laserTick >= period - 20 && this.laserTick < period) {
        if ((period - this.laserTick) % 5 === 0) tonePlus(860, 'square', .04, .07);
        this.laserWarnTick = period - this.laserTick;
      } else { this.laserWarnTick = 0; }
      if (this.laserTick >= period) {
        this.laserTick = 0;
        this.laserInDanger = !this.laserInDanger;
        this.laserOpen = this.laserInDanger;
        tonePlus(this.laserOpen ? 210 : 520, 'square', .08, .11);
        // Difficulty scaling — dengeli artış
        this._gapYSpeed = Math.min(0.030, 0.012 + G.score * 0.0008);
        this._gapYAmp = Math.min(120, 88 + G.score * 1.5);
        this.laserPeriod = Math.max(55, 95 - G.score * 2);
        this.laserDangerPeriod = Math.min(90, 62 + G.score);
      }
      return; // skip default coin update below
    }
    if (this.coin) { this.coin.x -= this.sp; this.coin.update(); }
  }
  // Cyber altın güncelleme: arkaya doğru akar
  _updateCyberCoins() {
    if (!this.coins) return;
    this.coins.forEach((c, idx) => {
      if (!c || c.coll || c.x < -30) {
        if (!this._coinRespawnTimers[idx]) this._coinRespawnTimers[idx] = G.tick + 180;
        if (G.tick >= this._coinRespawnTimers[idx]) {
          this.coins[idx] = Math.random() < this.dropScl ? new Coin(W + 40, this.topH + this.gap / 2 + (Math.random() * 30 - 15), this.lv.cv) : null;
          this._coinRespawnTimers[idx] = 0;
        }
      } else {
        // Arkaya doğru akmasını sağla
        c.x -= this.sp * 0.88;
        c.y = this.topH + this.gap / 2 + Math.sin(G.tick * 0.07 + idx * 1.1) * 10;
        c.update();
      }
    });
  }
  _p(x, y, w, h) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, this.pc[0]); g.addColorStop(.45, this.pc[1]); g.addColorStop(1, this.pc[0]); ctx.fillStyle = g; rr(x, y, w, h, 0); ctx.fill(); }
  _c(x, y, w, h) { const g = ctx.createLinearGradient(x - 5, 0, x + w + 5, 0); g.addColorStop(0, this.pc[3]); g.addColorStop(.5, this.pc[4]); g.addColorStop(1, this.pc[3]); ctx.fillStyle = g; rr(x - 5, y, w + 10, h, 6); ctx.fill(); }
  _drawPlatform(isWind) {
    const tk = G.tick;
    // B2 color fix: use pc[] (grey/blue tones matching map)
    const c0 = this.pc[0]; // '#6b7280'
    const c1 = this.pc[2]; // '#4b5563'
    const cEdge = this.pc[3]; // '#d1d5db'
    const cShine = this.pc[4]; // '#f3f4f6'
    // Top wall
    const g1 = ctx.createLinearGradient(this.x, 0, this.x + OW, 0);
    g1.addColorStop(0, cEdge); g1.addColorStop(.5, c0); g1.addColorStop(1, cEdge);
    ctx.fillStyle = g1; ctx.save();
    ctx.shadowColor = c1; ctx.shadowBlur = 8;
    rr(this.x, 0, OW, this.topH, 0); ctx.fill();
    ctx.fillStyle = cEdge; rr(this.x, this.topH - 8, OW, 8, 4); ctx.fill();
    if (isWind) { ctx.globalAlpha = 0.2; ctx.fillStyle = cShine; rr(this.x + 4, 0, 8, this.topH - 6, 0); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.restore();
    // Bottom wall
    ctx.save(); ctx.shadowColor = c1; ctx.shadowBlur = 8;
    ctx.fillStyle = c0;
    rr(this.x, this.botY, OW, H - GROUND_H - this.botY, 0); ctx.fill();
    ctx.fillStyle = cEdge; rr(this.x, this.botY, OW, 8, 4); ctx.fill();
    ctx.restore();
    // Arrow guide in gap
    ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(tk * 0.1) * 0.35;
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 20px Outfit'; ctx.textAlign = 'center';
    ctx.fillText('→', this.x + OW / 2, this.topH + this.gap / 2 + 7);
    ctx.restore();
  }
  _drawDigital() {
    const tk = G.tick;
    const postG = G.glitchFlipped;
    // Use level pc[] palette for full cyberpunk theming
    const baseCol = postG ? this.pc[1] : this.pc[0]; // cyan or hot pink
    const glowCol = postG ? this.pc[4] : this.pc[2]; // bright cyan or blue
    const darkCol = postG ? this.pc[2] : '#0a001a';
    ctx.save();
    ctx.shadowColor = glowCol; ctx.shadowBlur = postG ? 20 : 10;
    this.blocks.forEach(b => {
      const bx = this.x + b.x, by2 = b.y;
      const g = ctx.createLinearGradient(bx, by2, bx + b.w, by2 + b.h);
      g.addColorStop(0, darkCol);
      g.addColorStop(0.5, baseCol);
      g.addColorStop(1, darkCol);
      ctx.fillStyle = g;
      rr(bx, by2, b.w, b.h, 3); ctx.fill();
      // scan line shimmer always active in cyberpunk
      if (Math.random() < 0.06) {
        ctx.globalAlpha = 0.55; ctx.fillStyle = glowCol;
        ctx.fillRect(bx, by2 + Math.random() * b.h, b.w, 2);
        ctx.globalAlpha = 1;
      }
      // pixel grid
      ctx.strokeStyle = `rgba(0,255,255,0.15)`; ctx.lineWidth = 1;
      for (let gx = bx; gx < bx + b.w; gx += 8) { ctx.beginPath(); ctx.moveTo(gx, by2); ctx.lineTo(gx, by2 + b.h); ctx.stroke(); }
    });
    ctx.restore();
  }
  _drawCyberLaser() {
    const tk = G.tick;
    const pulse = 0.5 + Math.sin(tk * 0.15) * 0.5;
    const topH2 = this.topH;
    const botY2 = this.botY;
    const midY = (topH2 + botY2) / 2;
    const isIntro = (this._introSafe || 0) > 0;
    ctx.save();
    // Side emitter bars
    ctx.shadowColor = isIntro ? '#4ade80' : '#a78bfa';
    ctx.shadowBlur = 16;
    ctx.fillStyle = isIntro ? '#14532d' : '#4c1d95';
    rr(0, 0, 22, topH2, 0); ctx.fill();
    rr(W - 22, 0, 22, topH2, 0); ctx.fill();
    rr(0, botY2, 22, H - GROUND_H - botY2, 0); ctx.fill();
    rr(W - 22, botY2, 22, H - GROUND_H - botY2, 0); ctx.fill();
    // Neon edge boundary lines
    const edgeCol = isIntro ? 'rgba(74,222,128,0.85)' : 'rgba(167,139,250,0.85)';
    ctx.strokeStyle = edgeCol; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, topH2); ctx.lineTo(W, topH2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, botY2); ctx.lineTo(W, botY2); ctx.stroke();
    ctx.shadowBlur = 0;
    // Intro: Hazırlan mesajı
    if (isIntro) {
      const introAlpha = 0.65 + Math.sin(tk * 0.14) * 0.35;
      const countdown = Math.ceil((this._introSafe || 0) / 60);
      ctx.save(); ctx.globalAlpha = introAlpha;
      ctx.font = 'bold 22px Outfit'; ctx.textAlign = 'center';
      ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 18;
      ctx.fillText(`⚡ Hazırlan! (${countdown})`, W / 2, midY + 8);
      ctx.shadowBlur = 0; ctx.restore();
      // Güvenli bölge gösterimi
      ctx.save(); ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, topH2, W, botY2 - topH2);
      ctx.restore();
    } else {
      // Gap hareket yönü oku
      const arrowDir = Math.sin(this._gapYTk + Math.PI / 2) > 0 ? 1 : -1;
      ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(tk * 0.12) * 0.35;
      ctx.font = 'bold 24px Outfit'; ctx.textAlign = 'center';
      ctx.fillStyle = '#a78bfa'; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 12;
      ctx.fillText(arrowDir > 0 ? '▼' : '▲', W / 2, midY + 10);
      ctx.shadowBlur = 0; ctx.restore();
    }
    // Laser beam state (intro sırasında gösterme)
    if (!isIntro) {
      const beamAlpha = this.laserOpen ? pulse * 0.15 : 0.90;
      const beamColor = this.laserOpen ? `rgba(0,255,200,${beamAlpha})` : `rgba(255,0,80,${beamAlpha})`;
      ctx.strokeStyle = beamColor; ctx.lineWidth = this.laserOpen ? 2 : 8;
      ctx.shadowColor = beamColor; ctx.shadowBlur = this.laserOpen ? 6 : 38;
      if (!this.laserOpen) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#ff0050'; ctx.fillRect(0, 0, W, topH2);
        ctx.fillRect(0, botY2, W, H - GROUND_H - botY2);
        ctx.globalAlpha = 1;
        ctx.globalAlpha = 0.45;
        for (let yw = 4; yw < topH2 - 8; yw += 16) { ctx.fillStyle = 'rgba(255,0,80,0.4)'; ctx.fillRect(22, yw, W - 44, 8); }
        for (let yw = botY2 + 4; yw < H - GROUND_H - 8; yw += 16) { ctx.fillStyle = 'rgba(255,0,80,0.4)'; ctx.fillRect(22, yw, W - 44, 8); }
        ctx.globalAlpha = 1;
        // DANGER yazısı
        const dangerPulse = 0.65 + Math.sin(tk * 0.2) * 0.35;
        ctx.save(); ctx.globalAlpha = dangerPulse;
        ctx.font = 'bold 18px Outfit'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ff0050'; ctx.shadowColor = '#ff0050'; ctx.shadowBlur = 16;
        ctx.fillText('⚠ LAZER AKTİF ⚠', W / 2, topH2 / 2 + 10);
        ctx.fillText('⚠ LAZER AKTİF ⚠', W / 2, botY2 + (H - GROUND_H - botY2) / 2 + 10);
        ctx.shadowBlur = 0; ctx.restore();
      }
      ctx.beginPath(); ctx.moveTo(22, topH2); ctx.lineTo(W - 22, topH2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(22, botY2); ctx.lineTo(W - 22, botY2); ctx.stroke();
      // Pulsing nodes
      const nr = 6 + Math.sin(tk * 0.2) * 2.5;
      ctx.fillStyle = this.laserOpen ? 'rgba(0,255,200,0.9)' : '#ff0050';
      ctx.beginPath(); ctx.arc(22, topH2, nr, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W - 22, topH2, nr, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(22, botY2, nr, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W - 22, botY2, nr, 0, Math.PI * 2); ctx.fill();
      // Countdown bar
      if (this.laserWarnTick > 0) {
        const wPct = this.laserWarnTick / 20;
        ctx.save(); ctx.globalAlpha = 0.85;
        ctx.fillStyle = `rgba(255,${Math.floor(120 * wPct)},0,0.95)`;
        ctx.fillRect(22, topH2 - 6, (W - 44) * wPct, 4);
        ctx.fillRect(22, botY2 + 3, (W - 44) * wPct, 4);
        ctx.restore();
      }
    } else {
      // Intro: güvenli bant çiz
      ctx.strokeStyle = 'rgba(74,222,128,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(22, topH2); ctx.lineTo(W - 22, topH2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(22, botY2); ctx.lineTo(W - 22, botY2); ctx.stroke();
      // Yeşil node'lar
      ctx.fillStyle = 'rgba(74,222,128,0.8)';
      [22, W - 22].forEach(nx => {
        ctx.beginPath(); ctx.arc(nx, topH2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(nx, botY2, 5, 0, Math.PI * 2); ctx.fill();
      });
    }
    // Multi-coin draw
    if (this.coins) { this.coins.forEach(c => { if (c) c.draw(); }); }
    ctx.restore();
  }
  _drawSpooky() {
    const tk = G.tick;
    const c0 = '#1e1b4b'; // dark purple
    const c1 = '#4c1d95'; // purple rim
    // Top obstacle (stalactite / vine) body
    ctx.save();
    ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
    ctx.fillStyle = c0; ctx.strokeStyle = c1; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, 0); ctx.lineTo(this.x + OW, 0);
    ctx.lineTo(this.x + OW - 5, this.topH - 10);
    ctx.lineTo(this.x + OW/2, this.topH);
    ctx.lineTo(this.x + 5, this.topH - 10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Bottom obstacle (stalagmite / vine) body
    ctx.save();
    ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
    ctx.fillStyle = c0; ctx.strokeStyle = c1; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, H); ctx.lineTo(this.x + OW, H);
    ctx.lineTo(this.x + OW - 5, this.botY + 10);
    ctx.lineTo(this.x + OW/2, this.botY);
    ctx.lineTo(this.x + 5, this.botY + 10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  _drawSpookyGlow() {
    const tk = G.tick;
    // Top obstacle glowing path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x, 0); ctx.lineTo(this.x + OW, 0);
    ctx.lineTo(this.x + OW - 5, this.topH - 10);
    ctx.lineTo(this.x + OW/2, this.topH);
    ctx.lineTo(this.x + 5, this.topH - 10);
    ctx.closePath();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.setLineDash([40, 50]);
    ctx.lineDashOffset = -tk * 0.8; 

    // Outer glow (ultra bright purple bloom)
    ctx.shadowColor = '#d946ef'; ctx.shadowBlur = 35;
    ctx.strokeStyle = '#d946ef'; ctx.lineWidth = 5;
    ctx.stroke();

    // Inner bright core (white-hot center)
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#fdf4ff'; ctx.lineWidth = 2;
    ctx.stroke();
    
    // A glowing eye on the obstacle
    const eyey = this.topH - 30;
    if (eyey > 20) {
       const blink = Math.sin(tk*0.1 + this.x) > 0.8;
       ctx.fillStyle = blink ? '#c026d3' : '#fbbf24'; 
       ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = blink ? 2 : 12;
       ctx.beginPath(); ctx.ellipse(this.x + OW/2, eyey, 6, 10, 0, 0, Math.PI*2); ctx.fill();
       ctx.fillStyle = '#000'; ctx.shadowBlur = 0;
       ctx.beginPath(); ctx.ellipse(this.x + OW/2, eyey, 2, 7, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // Bottom obstacle glowing path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x, H); ctx.lineTo(this.x + OW, H);
    ctx.lineTo(this.x + OW - 5, this.botY + 10);
    ctx.lineTo(this.x + OW/2, this.botY);
    ctx.lineTo(this.x + 5, this.botY + 10);
    ctx.closePath();
    
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.setLineDash([40, 50]);
    ctx.lineDashOffset = -tk * 0.8;

    // Outer glow (ultra bright purple bloom)
    ctx.shadowColor = '#d946ef'; ctx.shadowBlur = 35;
    ctx.strokeStyle = '#d946ef'; ctx.lineWidth = 5;
    ctx.stroke();

    // Inner bright core (white-hot center)
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#fdf4ff'; ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // Floating cobweb/spider in gap
    if (Math.sin(tk*0.03 + this.x) > 0.6) {
       ctx.save();
       ctx.fillStyle = 'rgba(255,255,255,0.4)';
       ctx.shadowColor = '#fff'; ctx.shadowBlur = 10;
       ctx.font = '24px serif';
       ctx.fillText('🕸️', this.x + OW/2 - 12, this.topH + this.gap/2 + Math.sin(tk*0.05)*10);
       ctx.restore();
    }
  }
  _drawCoral() {
    const bx = this.x - 5, tw = OW + 10, tk = G.tick;
    if (this._ocv) ctx.drawImage(this._ocv, bx, 0);
    
    if (this.hasMoray && this.morayExt > 3) {
      const ey = this.moraySide === 'top' ? this.topH - 6 : this.botY + 6;
      const dir = this.moraySide === 'top' ? -1 : 1;
      ctx.save(); ctx.translate(this.x + OW / 2, ey);
      ctx.fillStyle = '#166534';
      ctx.beginPath(); ctx.ellipse(Math.sin(tk * 0.06) * 4, dir * (this.morayExt / 2 - 12), 8, this.morayExt / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath(); ctx.ellipse(Math.sin(tk * 0.06) * 5, dir * (this.morayExt - 16), 11, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.arc(Math.sin(tk * 0.06) * 5, dir * (this.morayExt - 9), 6, 0, Math.PI, this.moraySide === 'top'); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(Math.sin(tk * 0.06) * 5 + 4, dir * (this.morayExt - 22), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#030712'; ctx.beginPath(); ctx.arc(Math.sin(tk * 0.06) * 5 + 4, dir * (this.morayExt - 22), 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // E4 FIX: jellyfish moves left independently
    if (this._jx === undefined) { this._jx = this.x + OW / 2; this._jVx = -(0.8 + Math.random() * 0.7); }
    this._jx += this._jVx;
    // reset if left screen
    if (this._jx < -30) { this._jx = W + 30; }
    const jy = this.topH + this.gap / 2 + Math.sin(tk * 0.03 + this._jx * 0.02) * 18;
    const jx = this._jx; const jr = this.jellyR;
    this._jy = jy; // save for hitbox
    ctx.save(); ctx.shadowColor = this.jellyClr; ctx.shadowBlur = 12;
    ctx.fillStyle = this.jellyClr; ctx.beginPath();
    ctx.arc(jx, jy, jr, Math.PI, 0);
    ctx.quadraticCurveTo(jx + jr * 1.25, jy + jr * .5, jx + jr, jy + jr * .5);
    ctx.quadraticCurveTo(jx, jy + jr * .95, jx - jr, jy + jr * .5);
    ctx.quadraticCurveTo(jx - jr * 1.25, jy + jr * .5, jx - jr, jy); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = this.jellyClr; ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const tx = jx - jr * .6 + i * jr * .3;
      ctx.beginPath(); ctx.moveTo(tx, jy + jr * .4);
      ctx.quadraticCurveTo(tx + Math.sin(tk * .05 + i) * 7, jy + jr, tx + Math.sin(tk * .04 + i + 1) * 5, jy + jr * 1.65);
      ctx.stroke();
    }
    ctx.restore();
  }
  // H6 FIX: jellyfish hitbox check
  hitsJelly(bird) {
    if (!this.isOcean || this._jx === undefined) return false;
    const dx = bird.x - this._jx, dy = bird.y - (this._jy || 0);
    return Math.sqrt(dx*dx+dy*dy) < this.jellyR + bird.hR - 2;
  }
  draw() {
    if (this.isOcean) { this._drawCoral(); }
    else if (this.isCyber) { this._drawCyberLaser(); } // coins drawn inside _drawCyberLaser
    else if (this.isSpooky) { this._drawSpooky(); }
    else if (this.isDigital) { this._drawDigital(); }
    else if (this.isTutorial || this.isWind) { this._drawPlatform(this.isWind); }
    else { // pipe (classic / B7 / flappy)
      this._p(this.x, 0, OW, this.topH - OCAP); this._c(this.x, this.topH - OCAP, OW, OCAP);
      this._p(this.x, this.botY + OCAP, OW, H - this.botY - OCAP - GROUND_H); this._c(this.x, this.botY, OW, OCAP);
    }
    // Non-cyber coins
    if (!this.isCyber && this.coin) { this.coin.draw(); }
  }
  off() { if (this.isCyber) return false; return this.x + OW + 15 < 0; }
  hits(bird) {
    const b = bird.hb(), bx2 = b.x + b.w, by2 = b.y + b.h;
    if (this.isCyber) {
      // laserOpen = dangerous zone
      if (this.laserOpen) {
        const inTop = by2 > 0 && b.y < this.topH;
        const inBot = by2 > this.botY && b.y < H;
        return inTop || inBot;
      }
      return false;
    }
    if (this.isDigital) {
      return this.blocks.some(bl => {
        const bkx = this.x + bl.x, bky = bl.y;
        return bx2 > bkx - 3 && b.x < bkx + bl.w + 3 && by2 > bky && b.y < bky + bl.h;
      });
    }
    const p1 = this.x - 3, p2 = this.x + OW + 3;
    return (bx2 > p1 && b.x < p2 && by2 > 0 && b.y < this.topH) ||
           (bx2 > p1 && b.x < p2 && by2 > this.botY && b.y < H);
  }
  chkCoin(bird) {
    let mult = bird.ch.type === 'owl' ? 1.5 : 1.0;
    // Cyber: check multi-coin array — geniş collect radius
    if (this.isCyber && this.coins) {
      let total = 0, dTotal = 0;
      this.coins.forEach(c => {
        if (!c || c.coll) return;
        const dx = bird.x - c.x, dy = bird.y - c.y;
        if (Math.sqrt(dx*dx+dy*dy) < bird.r + c.r + 6) { 
          c.collect(); 
          if (c.isDiamond) dTotal++; else total += Math.ceil(c.val * mult); 
        }
      });
      return {c: total, d: dTotal};
    }
    if (!this.coin || this.coin.coll) return {c: 0, d: 0};
    const dx = bird.x - this.coin.x, dy = bird.y - this.coin.y;
    if (Math.sqrt(dx * dx + dy * dy) < bird.r + this.coin.r - 5) { 
      this.coin.collect(); 
      return this.coin.isDiamond ? {c: 0, d: 1} : {c: Math.ceil(this.coin.val * mult), d: 0}; 
    }
    return {c: 0, d: 0};
  }
}

/* ── PLAYER ── */
class Player {
  constructor(lv, ch) {
    this.ch = ch; this.mode = lv.mode; this.grav = lv.grav; this.jf = lv.jf;
    this.isBuoy  = lv.mode === 'buoy';
    this.isWind  = lv.mode === 'wind';
    this.isCyber = lv.mode === 'cyber';
    this.isSpace = lv.mode === 'space';
    this.isFlappy = lv.mode === 'flappy';
    this.r = 22; this.hR = 12; this.gravDir = 1; this.grounded = false;
    this.invulnerable = 0;
    if (ch.type === 'falcon') this.armor = true;
    if (ch.type === 'cyborg') this.grav *= 0.85;
    // Space / Zero-G
    this.vx = 0;         // horizontal velocity (space mode)
    this.angle = 0;      // thrust direction (space mode)
    // Wind
    this.windKick = 0;   // current wind X velocity
    this.reset(lv); this.alive = true; this.crk = 0; this.wA = 0; this.wD = 1;
  }
  reset(lv) {
    this.x = W * .27; this.y = H * .45; this.vy = 0; this.vx = 0;
    this.rot = 0; this.gravDir = 1; this.grounded = false;
    this.windKick = 0;
  }
  flap() {
    if (this.isCyber) {
      // Normal flap in cyber mode — DASH YOK
      this.vy = this.jf; sfxFlap();
      spawnParts(this.x, this.y, this.ch.c1, 4, 2.5);
      return;
    }
    if (this.isSpace) {
      // H4 FIX: thrust toward touch point if provided, else use auto angle
      const thrust = 4.2;
      if (this._tapX !== undefined && this._tapY !== undefined) {
        const dx = this._tapX - this.x, dy = this._tapY - this.y;
        const len = Math.sqrt(dx*dx+dy*dy) || 1;
        this.vx += (dx/len) * thrust;
        this.vy += (dy/len) * thrust;
        this.angle = Math.atan2(dy, dx);
      } else {
        this.vx += Math.cos(this.angle - Math.PI / 2) * thrust;
        this.vy += Math.sin(this.angle - Math.PI / 2) * thrust;
      }
      spawnParts(this.x, this.y, this.ch.c1, 4, 2); sfxFlap(); return;
    }
    if (this.mode === 'glitch') {
      this.vy = this.jf * this.gravDir; sfxFlap();
    } else {
      this.vy = this.jf; sfxFlap();
    }
    spawnParts(this.x, this.y, this.ch.c1, 5, 2.5);
  }
  update() {
    if (this.invulnerable > 0) { this.invulnerable--; }
    // Yanıp sönme engeli için opacity kontrolü draw() içinde yapılacak ama hitbox'u kapattık (invulnerable check).
    if (!this.alive) { this.crk = Math.min(this.crk + .08, 1.5); return; }
    if (this.isSpace) {
      // H4 FIX: no auto-rotate; angle is set by touch input
      // this.angle += 0.025;  // REMOVED
      this.vx *= 0.985; this.vy *= 0.985;
      this.x += this.vx; this.y += this.vy;
      // wrap screen X, clamp Y
      if (this.x < this.r) this.x = this.r;
      if (this.x > W - this.r) this.x = W - this.r;
      if (this.y < this.r) { this.y = this.r; this.vy = Math.abs(this.vy) * 0.5; }
      if (this.y > H - GROUND_H - this.r) { this.y = H - GROUND_H - this.r; this.vy = -Math.abs(this.vy) * 0.5; }
      this.rot = this.angle * 180 / Math.PI;
      this.wA += this.wD * 7; if (Math.abs(this.wA) > 28) this.wD *= -1;
      return;
    }
    if (this.isBuoy) {
      // Buoyancy: float UP naturally, hold = push DOWN
      this.vy += G.holding ? 0.40 : -0.20;
      this.vy *= 0.93;
    } else if (this.isWind) {
      // Wind mode: normal gravity + X-axis wind gusts
      this.vy += this.grav;
      this.x += this.windKick;
      this.windKick *= 0.92; // dampen wind
      // clamp X
      if (this.x < 60) { this.x = 60; this.windKick = 0; }
      if (this.x > W - 60) { this.x = W - 60; this.windKick = 0; }
    } else {
      this.vy += this.grav * this.gravDir;
    }
    this.y += this.vy;
    this.wA += this.wD * 7; if (Math.abs(this.wA) > 28) this.wD *= -1;
    const t = this.isBuoy ? Math.max(-25, Math.min(25, this.vy * 6)) :
      this.mode === 'glitch' ? this.gravDir * Math.max(-25, Math.min(75, this.vy * 4.5)) :
      Math.max(-25, Math.min(75, this.vy * 4.5));
    this.rot += (t - this.rot) * .14;
    // Boundary
    if (this.y + this.r >= H - GROUND_H) { this.y = H - GROUND_H - this.r; this.vy = 0; }
    if (this.y - this.r <= 0) { this.y = this.r; this.vy = 0; }
  }
  draw() {
    const flip = this.mode === 'glitch' && this.gravDir === -1;
    ctx.save();
    if (this.invulnerable > 0 && Math.floor(G.tick / 3) % 2 === 0) { ctx.globalAlpha = 0.4; }
    ctx.translate(this.x, this.y);
    if (this.isSpace) ctx.rotate(this.angle);
    else ctx.rotate(this.rot * Math.PI / 180);
    if (flip) ctx.scale(1, -1);
    drawChar(this.ch, 0, 0, this.r, 0, this.crk);
    if (this.invulnerable > 0) {
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, this.r + 6, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
  hb() {
    let r = this.hR - 2; // Coyote-time: reduce hitbox globally
    if (this.ch.type === 'diver') r *= 0.85;
    return { x: this.x - r, y: this.y - r, w: r * 2, h: r * 2 };
  }
}

/* ── DRAWGROUND / SKY ── */
function drawGround(off, gc) {
  const g = ctx.createLinearGradient(0, H - GROUND_H, 0, H); g.addColorStop(0, gc[0]); g.addColorStop(.3, gc[1]); g.addColorStop(1, gc[2]);
  ctx.fillStyle = g; ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
  ctx.fillStyle = gc[0]; ctx.globalAlpha = .5; ctx.fillRect(0, H - GROUND_H, W, 5); ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 2; const sp = 38, st = ((-off) % sp + sp) % sp;
  for (let x = st - sp; x < W + sp; x += sp) { ctx.beginPath(); ctx.moveTo(x, H - GROUND_H + 5); ctx.lineTo(x - 18, H); ctx.stroke(); }
}
function drawSky(lv) {
  const g = ctx.createLinearGradient(0, 0, 0, H - GROUND_H);
  // Flappy modu: faza göre dinamik sky rengi
  if (lv.mode === 'flappy' && G.state === ST.PLAY) {
    const phase = G.flappyPhase;
    const t = G.flappyPhaseT || 0;
    const PHASE_SKIES = [
      ['#56cfcd','#4db8b6','#38aaaa'],  // 0: classic
      ['#e0f2fe','#93c5fd','#3b82f6'],  // 1: wind/blue
      ['#0f0f1a','#1a0533','#0d0d2b'],  // 2: dark neon
      ['#1a001a','#2d0033','#0d000d'],  // 3: glitch purple
      ['#020617','#0c0a1e','#030014'],  // 4: space
      ['#042f54','#0c4a6e','#0369a1'],  // 5: ocean
      ['#0f0b1e','#1e0533','#2d0b4e'],  // 6: glitch dark
    ];
    const sky = PHASE_SKIES[phase];
    g.addColorStop(0, sky[0]); g.addColorStop(.5, sky[1]); g.addColorStop(1, sky[2]);
  } else {
    g.addColorStop(0, lv.sky[0]); g.addColorStop(.5, lv.sky[1]); g.addColorStop(1, lv.sky[2]);
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H - GROUND_H);
  // E5 FIX: Wind level visual leaf/line particles
  if (lv.mode === 'wind') {
    const tk = G.tick;
    ctx.save(); ctx.globalAlpha = 0.45;
    for (let i = 0; i < 12; i++) {
      const lx = ((i * 83 + tk * (1.2 + i * 0.08)) % (W + 40) + W + 40) % (W + 40) - 20;
      const ly = 80 + (i * 57 + Math.sin(tk * 0.04 + i) * 40) % (H - GROUND_H - 100);
      ctx.strokeStyle = i % 3 === 0 ? '#86efac' : '#bfdbfe';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 14, ly + 6 + Math.sin(tk*0.05+i)*4); ctx.stroke();
      // leaf dot
      ctx.fillStyle = '#4ade80'; ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.ellipse(lx - 7, ly + 3, 4, 2, 0.4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.45;
    }
    ctx.restore();
  }
  // Halloween spooky background elements
  if (lv.mode === 'halloween') {
    const tk = G.tick;
    ctx.save();
    // Creepy pulsing eyes in the dark
    for (let i = 0; i < 5; i++) {
       const eyex = ((i * 123 + Math.sin(tk*0.01 + i)*80) % W + W) % W;
       const eyey = 50 + (i * 77 + Math.cos(tk*0.015 + i)*50) % (H - GROUND_H - 120);
       const blink = Math.sin(tk*(0.03 + i*0.01) + i*1.5);
       if (blink > 0.6) {
          ctx.globalAlpha = (blink - 0.6) * 2.5; 
          ctx.fillStyle = i%2===0 ? '#ff0050' : '#fbbf24';
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 15;
          ctx.beginPath(); ctx.ellipse(eyex, eyey, 4, 3, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(eyex + 18, eyey, 4, 3, 0, 0, Math.PI*2); ctx.fill();
       }
    }
    // Floating "souls"
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 8; i++) {
        const sx = ((i * 89 - tk * (0.8 + i*0.1)) % W + W) % W;
        const sy = 100 + (i * 61 + Math.sin(tk*0.03 + i)*60) % (H - GROUND_H - 150);
        ctx.fillStyle = '#a78bfa'; ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(sx, sy, 8 + Math.sin(tk*0.1+i)*3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  // Ocean caustic light effect for buoy level
  if (lv.mode === 'buoy') {
    const t = G.tick * 0.018;
    ctx.save(); ctx.globalAlpha = 0.07;
    for (let i = 0; i < 7; i++) {
      const cx2 = ((i * 67 + Math.sin(t + i) * 40) % W + W) % W;
      const cy2 = 60 + Math.sin(t * 1.3 + i * 1.7) * 80 + i * 60;
      const cr = 45 + Math.cos(t + i) * 20;
      const cg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr);
      cg.addColorStop(0, '#7dd3fc'); cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H - GROUND_H);
    }
    ctx.restore();
    // Rising bubbles
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = 'rgba(125,211,252,.6)';
    for (let i = 0; i < 6; i++) {
      const bx = ((i * 73 + 30) % W);
      const by = ((H - GROUND_H) - (G.tick * (0.4 + i * 0.15) + i * 90) % (H - GROUND_H - 20));
      const br = 2 + (i % 3);
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // Glitch level: sky transformation (classic blue → dark cyberpunk)
  if (lv.mode === 'glitch' && G.glitchFlipped) {
    const intensity = Math.min((G.score - lv.glitchScore) / 5, 1);
    // Dark overlay creeps in
    ctx.fillStyle = `rgba(2,4,18,${intensity * 0.78})`;
    ctx.fillRect(0, 0, W, H - GROUND_H);
    // Occasional red flash on alarm
    if (intensity < 0.15 && G.glitchFlipped) {
      ctx.fillStyle = 'rgba(255,0,64,0.09)';
      ctx.fillRect(0, 0, W, H - GROUND_H);
    }
  }
}

/* ── HUD ── */
function drawHUD(sc, sesC, lv, elapsed) {
  // Unlock notification
  if (G._unlockNotifT > 0) {
    G._unlockNotifT--;
    const a = Math.min(G._unlockNotifT / 30, 1);
    const n = G.lvi + 1;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = 'bold 16px Outfit'; ctx.textAlign = 'center';
    ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 16;
    ctx.fillText(n < LEVELS.length ? `🔓 ${T('lv')[n]} Açıldı!` : '🏆 Hepsini Açtın!', W/2, 120);
    ctx.shadowBlur = 0; ctx.restore();
  }
}

/* ── GAME OBJECT (STATE MACHINE) ── */
const ST = { MENU: 'menu', SEL: 'sel', SHOP: 'shop', SETS: 'sets', PLAY: 'play', OVER: 'over', DONE: 'done', WIN: 'win', PAUSE: 'pause' };
const G = {
  state: ST.MENU, lvi: 0, tick: 0, score: 0, sesC: 0, goff: 0, deadT: 0, menuW: 0, compA: 0,
  paused: false, preState: null, 
  player: null, obs: [], clouds: Array.from({ length: 6 }, () => new Cloud(true)), sf: null,
  pt: 0, _shk: 0, startTick: 0, elapsed: 0, isRec: false, autoFlipTimer: 0, holding: false,
  glitchFlipped: false, glitchT: 0, glitchCountdown: -1, glitchCdTick: 0, glitchTriggered: false,
  laserOpen: false, laserTick: 0, laserWarnTick: 0,
  reviveCount: 0,
  _introSafe: 0, _gapYTk: 0,
  _bb: {},
  get cfg() { return LEVELS[this.lvi]; }, get ch() { return CHARS[selChar]; },
  init() {
    const lv = this.cfg, ch = this.ch;
    this.player = new Player(lv, ch); this.obs = []; this.spaceObs = []; this.alienObs = []; this.score = 0; this.sesC = 0; this.pt = 0; this.goff = 0; this.deadT = 0; this.compA = 0;
    this.startTick = this.tick; this.elapsed = 0; this.autoFlipTimer = 0;
    this.glitchFlipped = false; this.glitchT = 0; this.glitchCountdown = -1; this.glitchCdTick = 0; this.glitchTriggered = false;
    this.windTimer = 0; this.spaceTimer = 0; this._spaceScoreTick = 0; this._lastGlitchScore = -1; this._flashT = 0; this.reviveCount = 0;
    this.unlockedNext = false; this._laserCreated = false; this._unlockNotifT = 0;
    // Flappy infinite mode state
    this.flappyPhase = 0;       // 0=classic, 1=wind, 2=dark, 3=glitch, 4=speed, 5=cyber, 6=space, cycle
    this.flappyPhaseScore = 0;  // score at start of current phase
    this.flappyPhaseT = 0;      // smooth transition 0→1
    this.flappyWindKick = 0;
    this.flappyWindTimer = 0;
    this.flappyGlitchFlash = 0;
    this.flappyGlitchDir = 1;
    this.flappyGlitchTimer = 0;
    // Frogger / Ölümcül Otoyol state sıfırla
    this.cars = [];
    this._frogLane = -1; // -1 denotes left sidewalk
    this._frogTutorial = 220; // Show tutorial overlay at start
    this._frogMaxLane = 0;
    this._frogDiffMul = 0.5; // Sabit "Çok Kolay" (hız seviyesi 0.5 yapıldı)
    this._frogMoving = 0;
    this._frogSpawnTimer = 0;
    this._frogCoins = [];
    this._frogCoinTimer = 0;
    PARTS.length = 0; this.sf = lv.stars > 0 ? new StarField(lv.stars) : null;
  },
  _unlockNextLevel() {
    this.unlockedNext = true;
    this._unlockNotifT = 180; // show for 3 seconds
    const n = this.lvi + 1; 
    if (n < LEVELS.length && !unlockedLvs[n]) { 
      unlockedLvs[n] = true; LEVELS[n].unlocked = true; saveAll();
    }
    spawnParts(W/2, H/2, '#4ade80', 35, 8);
    sfxWin();
    
    // Tutorial Stop Check
    if (this.cfg.mode === 'tutorial') {
        this._done();
        setTimeout(() => { window.UI_NEEDS_REBUILD = true; window.updateHTMLUI(this); }, 50);
    }
  },
  startLv(i) {
    this.lvi = i; this.state = ST.PLAY; this.init(); sfxSwsh();
    this.isReviveWait = true; // wait for first tap
  },
  _checkDamage(pl) {
    if (pl.invulnerable > 0) return;
    if (pl.ch.type === 'falcon' && pl.armor) {
      pl.armor = false; pl.ch = CHARS[0]; pl.invulnerable = 60;
      sfxSwsh(); spawnParts(pl.x, pl.y, '#cbd5e1', 35, 7);
      return;
    }
    this._die();
  },
  revive() {
    this.dead = false; this.state = ST.PLAY; this.deadT = 0; this.deadTimer = 0;
    this.player.alive = true;
    
    if (this.cfg && this.cfg.mode === 'frogger') {
      this._frogSafeLane = this._frogLane; // Mark current lane as safe
      this.player.y = H * 0.5; // Frogger uses fixed canvas Y
      if (this.cars) {
        this.cars = this.cars.filter(c => c.lane !== this._frogLane);
      }
      this.isReviveWait = false; // flow immediately!
    } else {
      this.player.y = (H - GROUND_H) / 2;
      this.isReviveWait = true; // wait for tap to continue
    }
    
    this.player.vy = 0; this.player.crk = 0; this.player.rot = 0;
    this.blocks = []; 
    if (this.cfg && this.cfg.mode === 'cyber') {
      this.obs.forEach(o => {
        if (o.isCyber) {
           o.laserOpen = false;
           o.laserInDanger = false;
           o.laserTick = 0;
           o._introSafe = 60;
        }
      });
    } else {
      this.obs = [];
    }
    this.pipes = (this.pipes||[]).filter(p => p.x > this.player.x + 200 || p.x + p.w < this.player.x);
    this.laserTick = 0;
    window.UI_NEEDS_REBUILD = true;
    window.updateHTMLUI(this);
  },
  // E7: toggle pause
  togglePause() {
    if (this.state === ST.PLAY) { this.state = ST.PAUSE; sfxSwsh(); }
    else if (this.state === ST.PAUSE) { this.state = ST.PLAY; this.startTick += this.tick - (this._pauseTick||this.tick); sfxSwsh(); }
    this._pauseTick = this.tick;
  },
  tap(cx, cy) {
    if (this.state === ST.PLAY) {
      if (this.player && !this.player.alive) return; // Prevent inputs during death animation
      
      if (this.isReviveWait) {
          this.isReviveWait = false;
          this.player.vy = 0;
          if (this.cfg && this.cfg.mode === 'frogger') {
              if (this._frogTutorial > 45) this._frogTutorial = 45; // Sadece bașlangıçtaysa fade-out yap
              return; // İlk dokunuşta hareketi iptal et / sadece oyunu bașlat veya unfreeze
          }
      }
      
      if (this.cfg && this.cfg.mode === 'frogger') {
          // Tutorial animasyonu her tıkta hızlıca bitir
          if (this._frogTutorial > 0) this._frogTutorial = Math.min(this._frogTutorial, 45);
          
          // Başlatmadıysa başlat: kaldırımdan (lane=-1) başla
          if (this._frogLane === undefined) this._frogLane = -1;
          
          if (cx > W / 2) {
            // SAĞ = İLERİ
            const LANES = this.cfg.lanes || 12;
            if (this._frogLane < LANES) {
              this._frogLane++;
              this._frogSafeLane = -1; // Reset safe lane
              if (this._frogLane === LANES) {
                // SAĞ KALDIRIM = GEÇİŞ BAŞARILI!
                this.score++;
                sfxScore();
                spawnParts(W/2, H*0.5, '#fbbf24', 28, 8);
                [523, 659, 784, 1047].forEach((f,i) => setTimeout(() => tonePlus(f,'sine',0.2,0.14,true), i*70));
                this._frogLane = -1; // Sol kaldırıma dön
                if (this.score >= this.cfg.tgt && !this.unlockedNext) this._unlockNextLevel();
              } else {
                tonePlus(500 + this._frogLane * 25, 'sine', 0.07, 0.1, true);
                spawnParts(W/2, H*0.5, '#4ade80', 5, 2);
              }
            }
          } else {
            // SOL = GERİ
            if (this._frogLane > -1) {
              this._frogLane--;
              this._frogSafeLane = -1; // Reset safe lane
              tonePlus(380, 'sine', 0.06, 0.08);
              spawnParts(W/2, H*0.5, '#f87171', 4, 2);
            } else {
              // Zaten kaldırımda, geri gidilmez
              tonePlus(160, 'triangle', 0.1, 0.1);
              this._shk = 4;
            }
          }
          // Smooth kamera kayması
          this._frogMoving = 12;
          return;
      }
      
      // H4: pass tap coords to player for space mode
      if (this.player) { this.player._tapX = cx; this.player._tapY = cy; }
      this.player.flap();
      if (this.player) { setTimeout(() => { this.player._tapX = undefined; this.player._tapY = undefined; }, 50); }
    }
    // Geri kalan menü/done geçişleri click handler'a taşındı (ST.OVER)
    else if (this.state === ST.DONE && this.compA > 65) { const n = this.lvi + 1; if (n < LEVELS.length) { unlockedLvs[n] = true; LEVELS[n].unlocked = true; saveAll(); this.state = ST.SEL; sfxSwsh(); } else { this.state = ST.WIN; sfxWin(); } }
    else if (this.state === ST.WIN) { this.state = ST.MENU; sfxSwsh(); }
    else if (this.state === ST.MENU) { this.state = ST.SEL; sfxSwsh(); }
  },
  update() {
    this.tick++; this.menuW += .04; PARTS.length > 200 && PARTS.splice(0, 50);
    const cs = spd(this.score, this.cfg); this.clouds.forEach(c => c.update(cs)); if (this.sf) this.sf.update();
    updateParts();
    // E7: pause freezes everything
    if (this.state === ST.PAUSE) return;
    
    // Revive bekleme durumu: sadece ekranı dondur ama arkaplan efektleri dönsün
    if (this.state === ST.PLAY && this.isReviveWait) {
        if (!this.cfg || this.cfg.mode !== 'frogger') {
            this.player.y += Math.sin(this.tick * 0.1) * 0.5; // hover effect (except frogger)
        }
        this.player.rot = 0;
        return;
    }

    if (!this.player.alive) {
       if (this.deadTimer > 0) {
          this.deadTimer--;
          if (this.deadTimer <= 0) {
             this.state = ST.OVER;
             window.UI_NEEDS_REBUILD = true;
          }
       }
       // Let parts animate
       this.parts && this.parts.forEach(p => p.update());
       if (this.parts) this.parts = this.parts.filter(p => p.a > 0.05);
       this.player.update();
       this.obs.forEach(o => o.update());
       if (this.spaceObs) this.spaceObs.forEach(o => o.update(this.player.x, this.player.y));
       if (this.state === ST.OVER) this.deadT++;
       return;
    }
    if (this.state !== ST.PLAY) { if (this.state === ST.OVER) this.deadT++; if (this.state === ST.DONE) this.compA++; return; }
    
    const lv = this.cfg, curSpd = spd(this.score, lv); this.elapsed = this.tick - this.startTick;
    this.goff += curSpd; this.player.update(); this.pt++;
    // Wind (B2): random gusts that push player X
    if (lv.mode === 'wind' && this.player.alive) {
      if (!this.windTimer) this.windTimer = 0;
      this.windTimer++;
      if (this.windTimer >= (lv.windInterval || 150)) {
        this.windTimer = 0;
        const dir = Math.random() < 0.5 ? 1 : -1;
        this.player.windKick = dir * (lv.windForce || 0.06) * 30;
        spawnParts(this.player.x, this.player.y + dir * 10, dir > 0 ? '#93c5fd' : '#bfdbfe', 6, 3);
        tonePlus(dir > 0 ? 220 : 180, 'sawtooth', .25, .14);
      }
    }
    // ── Saf Flappy (B7): Dinamik Faz Sistemi — her 10 skorda yeni dünya ──
    if (lv.mode === 'flappy' && this.player.alive) {
      const PHASE_SIZE = 10; // her 10 skorda faz değişir
      const newPhase = Math.floor(this.score / PHASE_SIZE) % 7;
      if (newPhase !== this.flappyPhase) {
        this.flappyPhase = newPhase;
        this.flappyPhaseScore = this.score;
        this.flappyPhaseT = 0;
        this._shk = 10;
        sfxAlarm();
        spawnParts(W/2, H/2, ['#fbbf24','#93c5fd','#00ffcc','#ff0080','#a78bfa','#f97316','#4ade80'][newPhase], 22, 6);
      }
      // Smooth transition blending
      if (this.flappyPhaseT < 1) this.flappyPhaseT = Math.min(1, this.flappyPhaseT + 0.018);
      // Phase 1: Wind gusts
      if (newPhase === 1 || newPhase === 5) {
        this.flappyWindTimer = (this.flappyWindTimer || 0) + 1;
        if (this.flappyWindTimer >= 120) {
          this.flappyWindTimer = 0;
          const dir = Math.random() < 0.5 ? 1 : -1;
          this.player.windKick = dir * 2.2;
          spawnParts(this.player.x, this.player.y, dir > 0 ? '#93c5fd' : '#bfdbfe', 5, 2);
          tonePlus(dir > 0 ? 220 : 180, 'sawtooth', .2, .12);
        }
      } else { this.flappyWindTimer = 0; }
      // Phase 3: Glitch flash gravity invert (brief, controlled)
      if (newPhase === 3) {
        this.flappyGlitchTimer = (this.flappyGlitchTimer || 0) + 1;
        if (this.flappyGlitchTimer % 300 === 250 && this.flappyGlitchFlash === 0) {
          this.flappyGlitchFlash = 40;
          tonePlus(200, 'sawtooth', .3, .2);
          this._shk = 6;
        }
        if (this.flappyGlitchFlash > 0) this.flappyGlitchFlash--;
      } else { this.flappyGlitchTimer = 0; this.flappyGlitchFlash = 0; }
      // Player wind kick apply
      if (this.player.windKick) {
        this.player.x += this.player.windKick;
        this.player.windKick *= 0.88;
        if (Math.abs(this.player.windKick) < 0.1) this.player.windKick = 0;
        if (this.player.x < 60) this.player.x = 60;
        if (this.player.x > W - 60) this.player.x = W - 60;
      }
    }
    // Auto gravity flip timer
    if (lv.autoFlip && this.player.alive) {
      this.autoFlipTimer++;
      if (this.autoFlipTimer >= lv.autoFlip) {
        this.autoFlipTimer = 0; this.player.gravDir *= -1;
        this.player.vy = this.player.jf * .45 * (-this.player.gravDir);
        spawnParts(this.player.x, this.player.y, '#a78bfa', 12, 4);
      }
    }
    // ── Glitch level: 3-2-1 countdown → smooth gravity flip ──
    if (lv.mode === 'glitch' && this.player.alive) {
      // E3 FIX: trigger every 15 points after first
      const glitchThreshold = this.glitchFlipped
        ? lv.glitchScore + 15 * Math.ceil((this.score - lv.glitchScore) / 15)
        : lv.glitchScore;
      if (!this.glitchTriggered && this.score >= lv.glitchScore) {
        this.glitchTriggered = true;
        this.glitchCountdown = 3;
        this.glitchCdTick = 0;
        sfxAlarm();
        this._shk = 8;
      }
      // E3 FIX: repeat after flip, every 15 obstacles
      if (this.glitchFlipped && this.glitchCountdown < 0 && this.score > 0 && (this.score - lv.glitchScore) % 15 === 0 && this.score !== this._lastGlitchScore) {
        this._lastGlitchScore = this.score;
        this.glitchCountdown = 3;
        this.glitchCdTick = 0;
        sfxAlarm();
        this._shk = 8;
      }
      // Step 2: tick the countdown (1 step per second = 60 frames)
      if (this.glitchCountdown >= 0) {
        this.glitchCdTick++;
        if (this.glitchCdTick >= 60) {
          this.glitchCdTick = 0;
          this.glitchCountdown--;
          if (this.glitchCountdown >= 0) {
            // countdown beep
            tonePlus(this.glitchCountdown === 0 ? 1100 : 660, 'sine', .18, .28);
          }
          if (this.glitchCountdown < 0) {
            // Countdown ended — fully flip gravity
            this.glitchFlipped = true;
            this.player.gravDir = -1;
            this.player.vy = 1.8; // soft kick
            this._shk = 20;
            spawnParts(W / 2, H / 2, '#00ffcc', 28, 7);
            spawnParts(W / 2, H / 2, '#ff0080', 18, 5);
          }
        }
      }
      // Step 3: gradually increase glitchT for smooth visual transition
      if (this.glitchTriggered && this.glitchT < 1) {
        // Slow rise during countdown, then faster once flipped
        const rate = this.glitchFlipped ? 0.012 : 0.004;
        this.glitchT = Math.min(1, this.glitchT + rate);
      }
    }
    if (this.pt >= lv.iv) {
      if (lv.mode === 'space') {
        this.spaceObs.push(new SpaceObs(this.tick));
        // spawn alien every ~90 frames (1.5s)
        if (Math.random() < 0.45) this.alienObs.push(new AlienObs());
      } else if (lv.mode === 'cyber') {
        // B5: persistent laser — only create once, never remove
        if (!this._laserCreated) { this._laserCreated = true; this.obs.push(new Obstacle(W / 2, lv, this.score)); }
      } else {
        // Flappy infinite: dynamic gap based on phase
        const obsToSpawn = lv.mode === 'flappy' ? (() => {
          const phase = this.flappyPhase;
          const dynLv = Object.assign({}, lv);
          // Faza göre gap küçülüyor ve hız artıyor
          dynLv.gap = Math.max(150, 248 - phase * 12 - Math.floor(this.score / 20) * 4);
          dynLv.spdMul = 1.0 + phase * 0.12 + Math.floor(this.score / 15) * 0.04;
          dynLv.movObs = phase >= 2; // faz 2+'dan itibaren hareketli platformlar
          return dynLv;
        })() : lv;
        this.obs.push(new Obstacle(W + 10, obsToSpawn, this.score));
      }
      this.pt = 0;
    }
    // Regular obstacles
    this.obs.forEach(o => o.update()); this.obs = this.obs.filter(o => !o.off());
    for (const o of this.obs) {
      // H2 FIX: B5 cyber — score based on lazer cycle completions, not position
      if (lv.mode === 'cyber') {
        // score 1 point each time a laser closes (open→closed = 1 cycle survived)
        if (!o._scoredCycle && !o.laserOpen && o.laserTick === 1) {
          o._scoredCycle = true; this.score++; sfxScore();
          if (this.score >= lv.tgt && !this.unlockedNext) { this._unlockNextLevel(); }
        }
        if (o.laserOpen) o._scoredCycle = false; // reset for next cycle
      } else {
        if (!o.passed && o.x + OW < this.player.x) { 
          o.passed = true; this.score++; sfxScore(); 
          if (this.score >= lv.tgt && !this.unlockedNext) { this._unlockNextLevel(); } 
        }
      }
      const e = o.chkCoin(this.player); 
      if (e.c > 0 || e.d > 0) { 
        this.sesC += e.c; coins += e.c; totalCoinsEarned += e.c;
        diamonds += e.d; totalDiamondsEarned += e.d;
        saveAll(); 
      }
    }
    // H3 / ALIEN FIX: B6 score = aliens collected (not time-based)
    if (lv.mode === 'space') {
      this.alienObs.forEach(a => a.update());
      this.alienObs = this.alienObs.filter(a => !a.off());
      for (const a of this.alienObs) {
        if (a.collect(this.player)) {
          a.collected = true;
          spawnParts(a.x, a.y, a.col, 14, 4);
          tonePlus(1400, 'sine', .14, .22); setTimeout(() => tonePlus(1800, 'sine', .1, .18), 80);
          this.score += (a.val || 1); sfxScore();
          if (a.col === '#fbbf24') { this.sesC += 2; coins += 2; totalCoinsEarned += 2; saveAll(); }
          if (this.score >= lv.tgt && !this.unlockedNext) { this._unlockNextLevel(); }
        }
      }
    }
    
    // ── ÖLÜMCÜL OTOYOL: Di̇key şerit sistemi (araçlar YUKARI-AŞaĞİ, oyuncu SAL-SAĞA) ──
    if (lv.mode === 'frogger') {
      // ── SABITLER ──
      const FLANE_W = 50;  // Her şeridin genişliği (dünya koordinatı)
      const FSIDE_W = 55;  // Kaldırım genişliği
      const FLANES = lv.lanes || 12;
      const FPLAYER_Y = H * 0.5; // Oyuncu sabit Y
      // Oyuncunun dünya X pozisyonu
      // ── STATE BAŞLATMA (Geri kalanı init()'te başlar) ──
      const playerWorldX = (lane) => lane < 0
        ? FSIDE_W * 0.5
        : FSIDE_W + lane * FLANE_W + FLANE_W * 0.5;

      if (this._frogCameraX === undefined) {
         this._frogCameraX = playerWorldX(-1);
      }
      if (this._frogTutorial > 0) this._frogTutorial--;
      
      // ── KAMERA SMOOTH KAYMA ──
      const targetCameraX = playerWorldX(this._frogLane);
      this._frogCameraX = (this._frogCameraX || targetCameraX);
      this._frogCameraX += (targetCameraX - this._frogCameraX) * 0.12;
      
      // Player canvas X: her zaman W/2
      this.player.x = W * 0.5;
      this.player.y = FPLAYER_Y;
      this.player.vy = 0;
      
      // ── ARAÇ SPAWN ──
      this.cars = this.cars || [];
      this._frogSpawnTimer = (this._frogSpawnTimer || 0) + 1;
      const diffMul = this._frogDiffMul || 1;
      // Spawn interval: başlangıçta rahat, gittikçe sıklaşır (ama çok da sık değil)
      const spawnInterval = Math.max(22, Math.floor(52 / diffMul));
      
      if (this._frogSpawnTimer >= spawnInterval) {
        this._frogSpawnTimer = 0;
        // Her şeritte ayrı ayrı spawn — yakın şeritlere daha seyrek
        for (let L = 0; L < FLANES; L++) {
          if (this._frogSafeLane === L) continue; // Revival safe koruması varsa bu şeride araba doğurma
          
          // Oyuncunun bulunduğu şeritte hemen spawn etme (biraz koruma)
          const isPlayerLane = L === this._frogLane;
          const spawnChance = isPlayerLane ? 0.05 : (0.25 + L * 0.02);
          if (Math.random() > spawnChance) continue;
          
          // Di̇ley şerit yönü: tek şeritler aşağı, çift şeritler yukarı
          const goesDown = L % 2 === 0;
          // Bütün şeritlerdeki araçlar eşit hıza sahip olacak
          const baseSpd = 5.0 * diffMul; 
          // Max hız sınırı
          const vy = baseSpd * (goesDown ? 1 : -1);
          const startY = goesDown ? -70 : H + 70;
          // Dünya X: şeritin merkezi
          const carWorldX = FSIDE_W + L * FLANE_W + FLANE_W * 0.5;
          const carLen = 28 + Math.floor(Math.random() * 3) * 12; // 28/40/52 (sedan/SUV/kamyon)
          const carWid = 17;
          const colors = lv.carColors || ['#ef4444','#3b82f6','#fbbf24'];
          const carColor = colors[Math.floor(Math.random() * colors.length)];
          const isNeon = Math.random() < 0.18;
          this.cars.push({
            lane: L, worldX: carWorldX,
            y: startY, vy,
            len: carLen, wid: carWid,
            c: carColor, goesDown,
            neon: isNeon,
            lights: Math.random() < 0.55,
            type: carLen <= 28 ? 'sedan' : carLen <= 40 ? 'suv' : 'truck'
          });
        }
      }
      
      // ── ARAÇLARI GÜNCELLE ──
      this.cars.forEach(c => { c.y += c.vy; });
      this.cars = this.cars.filter(c => c.y > -150 && c.y < H + 150);
      
      // ── COIN SPAWN ──
      this._frogCoins = this._frogCoins || [];
      this._frogCoinTimer = (this._frogCoinTimer || 0) + 1;
      if (this._frogCoinTimer >= 80) { // Her ~1.3 saniyede bir dene
        this._frogCoinTimer = 0;
        for (let L = 0; L < FLANES; L++) {
          if (Math.random() < 0.35 && this._frogCoins.filter(c => c.lane === L).length < 2) {
            const isDiamond = Math.random() < 0.04;
            const goesDown = L % 2 === 0;
            // Coin şeridin yönünde akar (çok yavaş)
            const coinVy = (goesDown ? 1 : -1) * 0.8;
            this._frogCoins.push({
              lane: L,
              worldX: FSIDE_W + L * FLANE_W + FLANE_W * 0.5,
              y: Math.random() * (H - 80) + 40,
              vy: coinVy,
              isDiamond,
              r: isDiamond ? 12 : 9,
              anim: Math.random() * Math.PI * 2
            });
          }
        }
      }
      // Coinleri hareket ettir + sınır kontrolu
      this._frogCoins.forEach(c => {
        c.y += c.vy;
        c.anim += 0.07;
        if (c.y < -20) c.y = H + 20;
        if (c.y > H + 20) c.y = -20;
      });
      // Coin toplama: oyuncu giriş yaptı + Y yakınsa
      this._frogCoins = this._frogCoins.filter(fc => {
        if (fc.lane === this._frogLane && Math.abs(fc.y - FPLAYER_Y) < 38) {
          // Topla!
          const cv = lv.cv || 3;
          if (fc.isDiamond) {
            diamonds++; totalDiamondsEarned++;
            sfxXP(); spawnParts(W*0.5, FPLAYER_Y, '#06b6d4', 14, 5);
          } else {
            coins += cv; totalCoinsEarned += cv; this.sesC += cv;
            sfxCoin(); spawnParts(W*0.5, FPLAYER_Y, '#fbbf24', 8, 3);
          }
          saveAll();
          return false; // sil
        }
        return true;
      });
      
      // ── ÇARPIŞMA TESTI ──
      // Oyuncu sadece trafik şeridindeyse çarpışabilir (kaldırımda değil)
      if (this._frogLane >= 0 && this._frogLane < FLANES) {
        const plWorldX = playerWorldX(this._frogLane);
        const PLAYER_R = 13;
        for (const c of this.cars) {
          if (c.lane !== this._frogLane) continue; // Farklı şerit — es geç
          // Di̇key AABB: yatay merkez = c.worldX, dikey = c.y ± c.len/2
          const carTop = c.y - c.len * 0.5;
          const carBot = c.y + c.len * 0.5;
          const carL = c.worldX - c.wid * 0.5;
          const carR = c.worldX + c.wid * 0.5;
          // Screen çarpışma: oyuncu daima W*0.5, FPLAYER_Y
          const plScrX = W * 0.5;
          const plScrY = FPLAYER_Y;
          // Araç ekran X = c.worldX - this._frogCameraX + W*0.5
          const cScrX = c.worldX - this._frogCameraX + W * 0.5;
          if (Math.abs(cScrX - plScrX) < c.wid * 0.5 + PLAYER_R &&
              Math.abs(c.y - plScrY) < c.len * 0.5 + PLAYER_R) {
            this._checkDamage(this.player);
            if (!this.player.alive) return;
          }
        }
      }
    }
    
    const pl = this.player;
    // ── Kuantum Baykuş (Owl) Magnet Effect ──
    if (pl.ch.type === 'owl' && pl.alive && this.tick % 2 === 0) {
      const magnetDist = 180;
      this.obs.forEach(o => {
        if (o.coin && !o.coin.coll) {
          const dx = pl.x - o.coin.x, dy = pl.y - o.coin.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist > 0 && dist < magnetDist) { o.coin.x += (dx/dist)*9; o.coin.y += (dy/dist)*9; }
        }
        if (o.coins) {
          o.coins.forEach(c => {
            if (c && !c.coll) {
               const dx = pl.x - c.x, dy = pl.y - c.y;
               const dist = Math.sqrt(dx*dx+dy*dy);
               if (dist > 0 && dist < magnetDist) { c.x += (dx/dist)*9; c.y += (dy/dist)*9; }
            }
          });
        }
      });
      this.alienObs.forEach(a => {
        if (!a.collected) {
           const dx = pl.x - a.x, dy = pl.y - a.y;
           const dist = Math.sqrt(dx*dx+dy*dy);
           if (dist > 0 && dist < magnetDist) { a.x += (dx/dist)*12; a.y += (dy/dist)*12; }
        }
      });
    }

    // Space obstacles (missiles + meteors) — deadly
    if (lv.mode === 'space') {
      this.spaceObs.forEach(o => o.update(this.player.x, this.player.y));
      this.spaceObs = this.spaceObs.filter(o => !o.off());
      for (const o of this.spaceObs) {
        if (o.hits(pl)) { this._checkDamage(pl); if(!pl.alive) return; }
      }
    }
    
    // Space / Frogger mode has no bounding death on top/bottom
    if (lv.mode !== 'space' && lv.mode !== 'frogger') {
      if (pl.y + pl.r >= H - GROUND_H || pl.y - pl.r <= 0) { this._checkDamage(pl); if(!pl.alive) return; }
    }
    if (lv.mode !== 'frogger') {
      for (const o of this.obs) {
        if (o.hits(pl)) { this._checkDamage(pl); if(!pl.alive) return; }
        // H6 FIX: jellyfish collision check
        if (o.hitsJelly && o.hitsJelly(pl)) { this._checkDamage(pl); if(!pl.alive) return; }
      }
    }
  },
  _done() {
    // G4 FIX: white flash transition
    this._flashT = 1.0;
    const el = Math.floor(this.elapsed / 60); const i = this.lvi; lastTimes[i] = el;
    this.isRec = (!bestTimes[i] || el < bestTimes[i]); if (this.isRec) bestTimes[i] = el;
    
    // XP azaltıldı (farm önlendi) ve tamamlanma sayısı artırıldı
    compCounts[i]++;
    const xp = Math.floor(this.cfg.xpR * 0.4) + Math.floor(20 / Math.max(el, 1)); playerXP += xp;
    const newLv = Math.floor(playerXP / XP_PER_LV) + 1; if (newLv > playerLv) { playerLv = newLv; sfxXP(); }
    saveAll(); this.state = ST.DONE; sfxWin();
  },
  _die() { 
    if (!this.player.alive) return;
    this.player.alive = false; this.deadT = 0; this.deadTimer = 60; // 1 second delay
    this._shk = 14; sfxDie(); spawnParts(this.player.x, this.player.y, this.ch.c2, 20, 5);
    this._deathPoint = { x: this.player.x, y: this.player.y };
    // Score & XP güncelle
    const el = Math.floor(this.elapsed / 60); const i = this.lvi; lastTimes[i] = el;
    this.isRec = (!bestTimes[i] || el < bestTimes[i]); if (this.isRec) bestTimes[i] = el;
    const scoreFactor = Math.floor(this.score * 1.5);
    const xp = Math.floor(this.cfg.xpR * 0.2) + Math.floor(10 / Math.max(el, 1)) + scoreFactor; playerXP += xp;
    const newLv = Math.floor(playerXP / XP_PER_LV) + 1; if (newLv > playerLv) { playerLv = newLv; sfxXP(); }
    saveAll();
    
    if ((this.cfg.leaderboard || this.cfg.mode === 'flappy') && this.score > 0) {
      this._pendingLbScore = this.score;
      this._lbNameInput = '';
      if (this.cfg.mode === 'flappy') {
        const prevBest = S.g('flappy_best', 0);
        if (this.score > prevBest) { S.s('flappy_best', this.score); lbFetchGlobal(); }
      }
    }
  },

  draw() {
    ctx.clearRect(0, 0, W, H);
    // G4 FIX: fade flash on transition
    if (this._flashT > 0) {
      this._flashT -= 0.04;
      ctx.save(); ctx.globalAlpha = Math.max(0, this._flashT);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      if (this._flashT > 0.6) return; // hold white briefly
    }
    let shk = false; if (this._shk > 0) { shk = true; ctx.save(); ctx.translate((Math.random() - .5) * this._shk * 1.5, (Math.random() - .5) * this._shk * 1.5); this._shk -= 1.5; if (this._shk < 0) this._shk = 0; }
    
    // Death Zoom (Slow-motion feel)
    let zoomed = false;
    if (this.state === ST.OVER && this.deadT < 60 && this._deathPoint) {
        zoomed = true;
        ctx.save();
        const t = Math.max(0, this.deadT / 60);
        // Easing for zoom: easeOutCubic
        const ease = 1 - Math.pow(1 - t, 3);
        const zoom = 1 + ease * 0.35; // 35% zoom
        ctx.translate(W/2, H/2);
        ctx.scale(zoom, zoom);
        const dx = (this._deathPoint.x - W/2) * ease * 0.9;
        const dy = (this._deathPoint.y - H/2) * Math.min(ease * 1.2, 1);
        ctx.translate(-W/2 - dx, -H/2 - dy);
    }

    if (this.cfg.mode !== 'frogger') { drawSky(this.cfg); if (this.sf) this.sf.draw(); this.clouds.forEach(c => c.draw()); }
    // Cyber (B5) background neon rain
    if (this.cfg.mode === 'cyber') {
      ctx.save(); ctx.globalAlpha = 0.22;
      for (let i = 0; i < 18; i++) {
        const rx = ((i * 27 + this.tick * 0.4 * (1 + i * 0.05)) % W + W) % W;
        const ry1 = ((this.tick * (0.8 + i * 0.04) + i * 55) % (H - GROUND_H));
        ctx.strokeStyle = i % 3 === 0 ? '#a78bfa' : '#6366f1';
        ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(rx, ry1); ctx.lineTo(rx - 4, ry1 + 22); ctx.stroke();
      }
      ctx.restore();
    }
    // Space (B6) starfield extras + nebula tint
    if (this.cfg.mode === 'space') {
      ctx.save(); ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#6366f1'; ctx.fillRect(0, 0, W, H - GROUND_H);
      ctx.restore();
      this.alienObs.forEach((a) => a.draw());
    }
    if ([ST.PLAY, ST.OVER, ST.DONE].includes(this.state)) {
      this.obs.forEach(o => o.draw());
      if (this.spaceObs) this.spaceObs.forEach(o => o.draw());
    }
    if (this.cfg.mode !== 'frogger') drawGround(this.goff, this.cfg.gc); 
    
    // ── ÖLÜMCÜL OTOYOL: Tam kuşbakışı çizim sistemi (di̇key şeritler, yatay scroll) ──
    if (this.cfg.mode === 'frogger') {
      const FLANE_W = 50;
      const FSIDE_W = 55;
      const FLANES = this.cfg.lanes || 12;
      const FPLAYER_Y = H * 0.5;
      const camX = this._frogCameraX || FSIDE_W * 0.5;
      const tk = this.tick;
      const pl = this.player;
      // Ekran X hesabı: worldX → screenX
      const wx2sx = (worldX) => worldX - camX + W * 0.5;
      // Sol kaldırım dünya X merkezi
      const leftSideWorldX = FSIDE_W * 0.5;
      // Sağ kaldırım dünya X merkezi
      const rightSideWorldX = FSIDE_W + FLANES * FLANE_W + FSIDE_W * 0.5;
      // Tüm yol genişliği
      const roadEndWorldX = FSIDE_W + FLANES * FLANE_W + FSIDE_W;
      
      ctx.save();
      
      // ── 1. ASFALT ZEMİN (tüm kanvas) ──
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);
      
      // ── 2. YOLU DÜNYA KOORDINATINDA ÇİZ ──
      const roadStartSx = wx2sx(0);
      const roadEndSx = wx2sx(roadEndWorldX);
      
      // Yol zemini (trafik alanı sadece)
      const laneAreaStartSx = wx2sx(FSIDE_W);
      const laneAreaW = FLANES * FLANE_W;
      ctx.fillStyle = '#161b22';
      ctx.fillRect(laneAreaStartSx, 0, laneAreaW, H);
      
      // Altşerritlerin renk alternasyonu (sol-sağ trafik yönü göstergesi)
      for (let L = 0; L < FLANES; L++) {
        const lsx = wx2sx(FSIDE_W + L * FLANE_W);
        if (L % 2 === 0) {
          ctx.fillStyle = 'rgba(59,130,246,0.04)'; // Aşağı giden
        } else {
          ctx.fillStyle = 'rgba(239,68,68,0.04)'; // Yukarı giden
        }
        ctx.fillRect(lsx, 0, FLANE_W, H);
        
        // Di̇key kesik şerit çizgileri (animasyonlu)
        const laneEdgeSx = wx2sx(FSIDE_W + L * FLANE_W);
        if (L > 0 && L !== FLANES / 2) {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([18, 18]);
          // Aşağı giden şeritte çizgi aşağı, yukarı gidende yukarı kayar
          const dashDir = L % 2 === 0 ? 1 : -1;
          ctx.lineDashOffset = (tk * 2.5 * dashDir) % 36;
          ctx.beginPath(); ctx.moveTo(laneEdgeSx, 0); ctx.lineTo(laneEdgeSx, H); ctx.stroke();
        }
      }
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      
      // Orta çift sarı bant (sol ⇔ sağ yön ayırıcı)
      const midLaneSx = wx2sx(FSIDE_W + FLANES * 0.5 * FLANE_W);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(midLaneSx - 2, 0); ctx.lineTo(midLaneSx - 2, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(midLaneSx + 2, 0); ctx.lineTo(midLaneSx + 2, H); ctx.stroke();
      
      // Yol kenar beyaz çizgileri
      const lEdge = wx2sx(FSIDE_W);
      const rEdge = wx2sx(FSIDE_W + FLANES * FLANE_W);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lEdge, 0); ctx.lineTo(lEdge, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rEdge, 0); ctx.lineTo(rEdge, H); ctx.stroke();
      
      // ── 3. SOL KALDIRIM ──
      const leftSideSx = wx2sx(0);
      if (leftSideSx < W) {
        ctx.fillStyle = '#2d4a2d';
        ctx.fillRect(leftSideSx, 0, FSIDE_W, H);
        // Kaldırım çim dokus
        ctx.fillStyle = '#3a5c3a';
        for (let gy = 0; gy < H; gy += 14) {
          for (let gx = 0; gx < FSIDE_W; gx += 12) {
            if ((gx + gy) % 28 < 14) {
              ctx.fillRect(leftSideSx + gx, gy, 11, 13);
            }
          }
        }
        // Başlangıç şeridi
        ctx.fillStyle = '#4ade80'; ctx.fillRect(leftSideSx + FSIDE_W - 4, 0, 4, H);
        // Başlangıç yazısı
        ctx.save();
        ctx.translate(leftSideSx + FSIDE_W * 0.5, H * 0.5);
        ctx.rotate(-Math.PI * 0.5);
        ctx.font = 'bold 11px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 8;
        ctx.fillText('BAŞLANGIÇ', 0, 4); ctx.shadowBlur = 0;
        ctx.restore();
      }
      
      // ── 4. SAĞ KALDIRIM (HEDİF) ──
      const rightSideSx = wx2sx(FSIDE_W + FLANES * FLANE_W);
      if (rightSideSx < W) {
        ctx.fillStyle = '#4a2d2d';
        ctx.fillRect(rightSideSx, 0, FSIDE_W, H);
        // Başarı şeridi
        const finPulse = 0.5 + Math.sin(tk * 0.15) * 0.5;
        ctx.fillStyle = `rgba(251,191,36,${finPulse})`;
        ctx.fillRect(rightSideSx, 0, 4, H);
        // Bitis yazısı
        ctx.save();
        ctx.translate(rightSideSx + FSIDE_W * 0.5, H * 0.5);
        ctx.rotate(Math.PI * 0.5);
        ctx.font = 'bold 11px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
        ctx.fillText('HEDİF!', 0, 4); ctx.shadowBlur = 0;
        ctx.restore();
        // Başarı oku
        const arPulse = 0.6 + Math.sin(tk * 0.18) * 0.4;
        ctx.globalAlpha = arPulse;
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('▶', rightSideSx - 12, H * 0.5 + 7);
        ctx.globalAlpha = 1;
      }
      
      // ── 5. ARAÇLAR ──
      if (this.cars) {
        this.cars.forEach(c => {
          const scrX = wx2sx(c.worldX);
          // Ekran dışındaysa skip
          if (scrX < -60 || scrX > W + 60) return;
          
          ctx.save();
          ctx.translate(scrX, c.y);
          // Araç dikey (yukarı/aşağı) // goesDown=true→ aşağı, sıfır rotasyon = aşağı yönlü
          const rot = c.goesDown ? 0 : Math.PI;
          ctx.rotate(rot);
          
          if (c.neon) { ctx.shadowColor = c.c; ctx.shadowBlur = 14; }
          
          // Gövde: dikey dikdörtgen (c.len=uzunluk dikey, c.wid=genişlik yatay)
          const grad = ctx.createLinearGradient(-c.wid*0.5, -c.len*0.5, c.wid*0.5, -c.len*0.5);
          grad.addColorStop(0, adjustBrightness(c.c, 0.65));
          grad.addColorStop(0.5, c.c);
          grad.addColorStop(1, adjustBrightness(c.c, 0.65));
          ctx.fillStyle = grad;
          rr(-c.wid*0.5, -c.len*0.5, c.wid, c.len, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Ön cam (üst)
          ctx.fillStyle = 'rgba(160,215,255,0.7)';
          ctx.fillRect(-c.wid*0.33, -c.len*0.45, c.wid*0.66, c.len*0.22);
          // Arka cam (alt)
          ctx.fillStyle = 'rgba(110,155,210,0.45)';
          ctx.fillRect(-c.wid*0.28, c.len*0.22, c.wid*0.56, c.len*0.14);
          
          // Ön farlar (üst)
          ctx.fillStyle = '#fef3c7';
          ctx.shadowColor = '#fde68a'; ctx.shadowBlur = c.lights ? 12 : 0;
          ctx.fillRect(-c.wid*0.42, -c.len*0.5, c.wid*0.3, 4);
          ctx.fillRect(c.wid*0.12, -c.len*0.5, c.wid*0.3, 4);
          ctx.shadowBlur = 0;
          // Arka stoplar
          ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 5;
          ctx.fillRect(-c.wid*0.42, c.len*0.46, c.wid*0.3, 4);
          ctx.fillRect(c.wid*0.12, c.len*0.46, c.wid*0.3, 4);
          ctx.shadowBlur = 0;
          
          if (c.type === 'truck') {
            ctx.fillStyle = adjustBrightness(c.c, 0.75);
            rr(-c.wid*0.46, -c.len*0.48, c.wid*0.92, c.len*0.48, 3); ctx.fill();
          }
          ctx.restore();
        });
      }
      
      // ── 6. COINLER ──
      if (this._frogCoins) {
        this._frogCoins.forEach(fc => {
          const scrX = wx2sx(fc.worldX);
          if (scrX < -30 || scrX > W + 30) return;
          const sc = 1 + Math.sin(fc.anim * 2) * 0.09;
          const flipX = Math.abs(Math.cos(fc.anim));
          ctx.save();
          ctx.translate(scrX, fc.y);
          ctx.scale(flipX * sc, sc);
          if (fc.isDiamond) {
            ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 14;
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath(); ctx.moveTo(0,-fc.r); ctx.lineTo(fc.r*0.8,0); ctx.lineTo(0,fc.r); ctx.lineTo(-fc.r*0.8,0); ctx.fill();
            ctx.fillStyle = '#a5f3fc';
            ctx.beginPath(); ctx.moveTo(0,-fc.r+3); ctx.lineTo(fc.r*0.4,0); ctx.lineTo(0,fc.r-3); ctx.lineTo(-fc.r*0.4,0); ctx.fill();
          } else {
            ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(0,0,fc.r,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#78350f'; ctx.font = 'bold 9px Outfit'; ctx.textAlign = 'center';
            ctx.shadowBlur = 0; ctx.fillText('★',0,3);
          }
          ctx.restore();
        });
      }
      
      // ── 7. OYUNCU ──
      if (pl && pl.alive) {
        const isOnSidewalk = this._frogLane < 0;
        ctx.save();
        ctx.translate(W * 0.5, FPLAYER_Y);
        // Araba yön: sağa bakan
        ctx.shadowColor = isOnSidewalk ? '#4ade80' : '#22d3ee';
        ctx.shadowBlur = 16;
        const plGrad = ctx.createLinearGradient(-20, -10, 20, 10);
        plGrad.addColorStop(0, '#4ade80'); plGrad.addColorStop(0.5, '#22c55e'); plGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = plGrad;
        rr(-20, -12, 40, 24, 5); ctx.fill();
        // Cam
        ctx.fillStyle = 'rgba(200,255,240,0.7)'; ctx.fillRect(2, -8, 12, 16);
        // Ön far
        ctx.fillStyle = '#fef3c7'; ctx.shadowColor = '#fef3c7'; ctx.shadowBlur = 12;
        ctx.fillRect(18, -10, 4, 6); ctx.fillRect(18, 4, 4, 6);
        ctx.shadowBlur = 0;
        // Emoji
        const charEmoji = ['\uD83D\uDC24','\uD83C\uDF4E','\uD83D\uDCA7','\uD83C\uDF3F','\uD83E\uDD16','\uD83E\uDD3F','\uD83E\uDDA9','\uD83D\uDE80'][selChar] || '\uD83D\uDC24';
        ctx.font = '11px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowBlur = 0;
        ctx.fillText(charEmoji, 0, 4);
        ctx.restore();
        
        // ─ Hareket animasyonu: şerit atlama sırasında oyuncu hafifçe zıplar ─
        if (this._frogMoving > 0) {
          const bounce = Math.sin((12 - this._frogMoving) / 12 * Math.PI) * 6;
          // Bir sonraki çizimi bounce ile yap — yukardaki draw zaten yapıldı, sadece efekt partikülleri
          if (this._frogMoving === 8) spawnParts(W*0.5, FPLAYER_Y, '#4ade80', 3, 1.5);
        }
      }
      
      // ── 8. KALDIRIM / ŞERİT GÖSTERGESI (sağ kenar) ──
      const barH = H * 0.7, barY = H * 0.15;
      const FTOTAL = FLANES + 2; // kaldirimlar dahil
      const progFrac = (this._frogLane + 1) / (FLANES + 1);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      rr(W - 22, barY, 14, barH, 7); ctx.fill();
      if (progFrac > 0) {
        const fH = barH * progFrac;
        const bGrad = ctx.createLinearGradient(0, barY + barH - fH, 0, barY + barH);
        bGrad.addColorStop(0, '#fbbf24'); bGrad.addColorStop(1, '#4ade80');
        ctx.fillStyle = bGrad; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 6;
        rr(W - 22, barY + barH - fH, 14, fH, 7); ctx.fill(); ctx.shadowBlur = 0;
      }
      // Nokta göstergeleri
      for (let i = 0; i <= FLANES + 1; i++) {
        const dotY = barY + barH - (i / (FLANES + 1)) * barH;
        const isCur = i === this._frogLane + 1;
        ctx.fillStyle = isCur ? '#4ade80' : (i === 0 ? '#4ade80' : (i === FLANES + 1 ? '#fbbf24' : 'rgba(255,255,255,0.25)'));
        ctx.shadowColor = isCur ? '#4ade80' : 'transparent'; ctx.shadowBlur = isCur ? 8 : 0;
        ctx.beginPath(); ctx.arc(W - 15, dotY, isCur ? 5 : 2.5, 0, Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.font = 'bold 9px Outfit'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24'; ctx.fillText('\uD83C\uDFC1', W - 15, barY - 8);
      ctx.fillStyle = '#4ade80'; ctx.fillText('S', W - 15, barY + barH + 14);
      ctx.restore();
      
      // ── 9. ÜST MAÇ HUD (geçiş skoru) ──
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      rr(W/2 - 55, 8, 110, 32, 8); ctx.fill();
      ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`\uD83D\uDE97 ${this.score} / ${this.cfg.tgt}`, W/2, 30);
      // Lane göstergesi
      const laneLabel = this._frogLane < 0 ? 'KALDIRIM' : `${this._frogLane + 1}. ŞERİT`;
      ctx.font = '10px Outfit'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(laneLabel, W/2, 50);
      ctx.restore();
      
      // ── 10. TUTORIAL OVERLAY ──
      if (this._frogTutorial !== undefined && this._frogTutorial > 0) {
        const tA = Math.min(1, this._frogTutorial / 50) * (this._frogTutorial > 50 ? 1 : this._frogTutorial / 50);
        ctx.save();
        ctx.globalAlpha = tA * 0.88;
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,H);
        ctx.globalAlpha = tA;
        const pulse = 0.7 + Math.sin(tk * 0.14) * 0.3;
        const pW = W/2 - 10;
        // SOL PANEL
        ctx.fillStyle = 'rgba(239,68,68,0.13)'; ctx.strokeStyle = 'rgba(239,68,68,0.55)'; ctx.lineWidth = 2;
        rr(4, H*0.28, pW, H*0.44, 12); ctx.fill(); ctx.stroke();
        ctx.save(); ctx.globalAlpha = tA * pulse;
        ctx.font = 'bold 46px serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#f87171'; ctx.shadowColor='#ef4444'; ctx.shadowBlur=18;
        ctx.fillText('\u25C0', pW/2 + Math.sin(tk*0.14)*8, H*0.53);
        ctx.shadowBlur=0; ctx.font='bold 13px Outfit'; ctx.fillStyle='#fca5a5';
        ctx.fillText('GERİ', pW/2, H*0.35);
        ctx.font='11px Outfit'; ctx.fillStyle='rgba(255,255,255,0.6)';
        ctx.fillText('Sol yarıya dokun', pW/2, H*0.67); ctx.restore();
        // SAĞ PANEL
        ctx.fillStyle = 'rgba(74,222,128,0.13)'; ctx.strokeStyle = 'rgba(74,222,128,0.55)'; ctx.lineWidth = 2;
        rr(W/2+6, H*0.28, pW, H*0.44, 12); ctx.fill(); ctx.stroke();
        ctx.save(); ctx.globalAlpha = tA * pulse;
        ctx.font = 'bold 46px serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#4ade80'; ctx.shadowColor='#22c55e'; ctx.shadowBlur=18;
        ctx.fillText('\u25B6', W/2 + pW/2 + Math.sin(tk*0.14+Math.PI)*8, H*0.53);
        ctx.shadowBlur=0; ctx.font='bold 13px Outfit'; ctx.fillStyle='#86efac';
        ctx.fillText('İLERİ', W/2+pW/2, H*0.35);
        ctx.font='11px Outfit'; ctx.fillStyle='rgba(255,255,255,0.6)';
        ctx.fillText('Sağ yarıya dokun', W/2+pW/2, H*0.67); ctx.restore();
        // Orta çizgi
        ctx.strokeStyle='rgba(251,191,36,0.7)'; ctx.lineWidth=2; ctx.setLineDash([5,4]);
        ctx.beginPath(); ctx.moveTo(W/2,H*0.22); ctx.lineTo(W/2,H*0.76); ctx.stroke(); ctx.setLineDash([]);
        // Başlık
        ctx.font='bold 18px Outfit'; ctx.textAlign='center'; ctx.fillStyle='#fbbf24';
        ctx.shadowColor='#f59e0b'; ctx.shadowBlur=12;
        ctx.fillText('\uD83D\uDE97 TÜM ŞERİTLERİ GEÇ!', W/2, H*0.22);
        ctx.shadowBlur=0; ctx.font='12px Outfit'; ctx.fillStyle='rgba(255,255,255,0.45)';
        ctx.fillText(`${this.cfg.tgt} kez karşıya geç → sonuç bozar`, W/2, H*0.76);
        ctx.fillText('YUKARI/AŞ. trafikten kaç!', W/2, H*0.79);
        ctx.restore();
      }
      // ── 11. SUREKLI HATIRLATICI ──
      if (!this._frogTutorial) {
        ctx.save();
        const ra = 0.32 + Math.sin(tk*0.05)*0.12;
        ctx.globalAlpha = ra;
        ctx.font='bold 10px Outfit'; ctx.textAlign='center';
        ctx.fillStyle='#f87171'; ctx.fillText('\u25C4 GERİ', W*0.18, H - 28);
        ctx.fillStyle='#4ade80'; ctx.fillText('İLERİ \u25BA', W*0.82, H - 28);
        ctx.strokeStyle='rgba(251,191,36,0.12)'; ctx.lineWidth=1; ctx.setLineDash([4,8]);
        ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
      }
      ctx.restore(); // main frogger save
    }
    // ── rest of draw continues below ──

    if (this.player && this.cfg.mode !== 'frogger') this.player.draw();


    if (this.player && this.cfg.mode !== 'frogger') this.player.draw();
    drawParts();

    // HALLOWEEN: Darkness overlay (Flashlight effect)
    if (this.cfg.darkness && this.cfg.mode !== 'frogger') {
        ctx.save();
        // Meşale (Flashlight) effect allowing to see slightly ahead
        // Player's crk (rotation) slightly shifts the light forward 
        const px = this.player.x + 80 + Math.max(0, this.player.crk * 20); 
        const py = this.player.y;
        
        const rad = ctx.createRadialGradient(
            px + 40, py, 60,   // light center is big and pushed well ahead of bird
            px, py, 450        // hugely expanded radius to see incoming pipes easily
        );
        rad.addColorStop(0, 'rgba(255, 190, 80, 0.0)');  // fully transparent center
        rad.addColorStop(0.4, 'rgba(0, 0, 0, 0.05)');    // safe visible area stretches far
        rad.addColorStop(1, 'rgba(4, 2, 16, 0.78)');     // dark edges are much lighter (78% vs 92%)

        
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        
        // NOW draw glowing parts so they shine piercingly OVER the dark overlay
        if (this.obs) {
            this.obs.forEach(o => {
                if (o.isSpooky && o._drawSpookyGlow) o._drawSpookyGlow();
            });
        }
    }
    
    // ── TUTORIAL overlay (B1) ──
    if (this.state === ST.PLAY && this.cfg.mode === 'tutorial') {
      const sc = this.score;
      ctx.save();
      // Step 0: before first obstacle — big tap instruction
      if (sc < 1 && this.obs.length === 0) {
        const pulse = 0.7 + Math.sin(this.tick * 0.1) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 28px Outfit'; ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 16;
        ctx.fillText('👆 Dokun / Boşluk', W / 2, H * 0.35);
        ctx.font = '18px Outfit'; ctx.fillStyle = '#fff'; ctx.shadowBlur = 0;
        ctx.fillText('Zıplamak için dokun!', W / 2, H * 0.35 + 36);
        ctx.font = '14px Outfit'; ctx.fillStyle = '#a5f3fc'; ctx.shadowBlur = 0;
        ctx.fillText('Yeşil duvarlar arasından geç', W / 2, H * 0.35 + 66);
      }
      // Step 1-3: hitbox hint
      if (sc >= 1 && sc < 4 && this.player) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const hb = this.player.hb();
        ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
        ctx.setLineDash([]);
        ctx.font = '13px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#f87171';
        ctx.fillText('⬆ Hitbox — engellere çarpma!', W / 2, H - GROUND_H - 22);
      }
      // Step 4-7: gap hint
      if (sc >= 4 && sc < 8) {
        ctx.font = '14px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#4ade80';
        ctx.globalAlpha = 0.8;
        ctx.fillText('✅ Harika! Boşluktan geç!', W / 2, H - GROUND_H - 22);
      }
      // Final step
      if (sc >= 8) {
        ctx.font = 'bold 15px Outfit'; ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.9;
        ctx.fillText(`🌟 ${10 - sc} engel kaldı — neredeyse bitti!`, W / 2, H - GROUND_H - 22);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // Revive wait hint
    if (this.state === ST.PLAY && this.isReviveWait && (!this.cfg || this.cfg.mode !== 'frogger')) {
        ctx.save();
        const pulse = 0.6 + Math.sin(this.tick * 0.1) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 24px Outfit'; ctx.textAlign = 'center';
        ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 14;
        ctx.fillText('👆 BAŞLAMAK İÇİN TIKLA!', W / 2, H * 0.3);
        ctx.shadowBlur = 0;
        ctx.restore();
    }


    // ═══ SAF FLAPPY overlay (B7 — Sonsuz Mod) ═══
    if (this.state === ST.PLAY && this.cfg.mode === 'flappy') {
      const phase = this.flappyPhase;
      const t = this.flappyPhaseT || 0;
      const PHASE_NAMES = ['🌿 Klasik', '💨 Rüzgar', '🌑 Karanlık', '⚡ Glitch', '🚀 Uzay', '🌊 Derin', '🌌 Kaos'];
      const PHASE_COLS = ['#4ade80', '#93c5fd', '#a78bfa', '#ff0080', '#818cf8', '#14b8a6', '#f97316'];
      const col = PHASE_COLS[phase];
      // Phase transition banner — faz değiştiğinde kısa süre göster
      const sincePhase = this.score - this.flappyPhaseScore;
      if (sincePhase < 3 || t < 0.5) {
        const alpha = Math.max(0, 0.9 - t * 1.2);
        if (alpha > 0.05) {
          ctx.save(); ctx.globalAlpha = alpha;
          // Banner slide-in from top
          const bannerY = 80 + (1 - t) * (-80);
          panel((W - 280) / 2, bannerY - 30, 280, 56, 16);
          ctx.font = 'bold 22px Outfit'; ctx.textAlign = 'center';
          ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18;
          ctx.fillText(PHASE_NAMES[phase] + ' Dünyası', W/2, bannerY + 5);
          ctx.shadowBlur = 0;
          ctx.font = '12px Outfit'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
          const phaseDescs = ['Klasik flappy kurallari', 'Rüzgar seni iter!', 'Karanlık engeller hızlandı', 'Ekran titriyor...', 'Uzay görünümü', 'Su akıntısı', 'Tam kaos modu'];
          ctx.fillText(phaseDescs[phase], W/2, bannerY + 24);
          ctx.restore();
        }
      }
      // Faz 1: Rüzgar partikülleri
      if (phase === 1 || phase === 5) {
        ctx.save(); ctx.globalAlpha = 0.35;
        for (let i = 0; i < 10; i++) {
          const lx = ((i * 71 + this.tick * 1.8) % (W + 40) + W + 40) % (W + 40) - 20;
          const ly = 80 + (i * 63 + Math.sin(this.tick * 0.05 + i) * 30) % (H - GROUND_H - 100);
          ctx.strokeStyle = phase === 1 ? '#93c5fd' : '#14b8a6'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 16, ly + 5); ctx.stroke();
        }
        ctx.restore();
      }
      // Faz 2/3: Karanlık/Glitch overlay
      if (phase === 2 || phase === 3 || phase === 6) {
        ctx.save(); ctx.globalAlpha = 0.28 * t;
        ctx.fillStyle = phase === 3 ? '#1a001a' : '#020412';
        ctx.fillRect(0, 0, W, H - GROUND_H);
        ctx.restore();
        // Neon grid
        if (t > 0.3) {
          ctx.save(); ctx.globalAlpha = t * 0.18;
          ctx.strokeStyle = phase === 3 ? '#ff00cc' : '#00ffcc'; ctx.lineWidth = 0.7;
          const horizon = (H - GROUND_H) * 0.55;
          for (let i = 0; i < 8; i++) {
            const yt2 = horizon + (H - GROUND_H - horizon) * (i/7);
            const xw2 = (W/2) * (0.1 + (i/7) * 0.9);
            ctx.beginPath(); ctx.moveTo(W/2-xw2, yt2); ctx.lineTo(W/2+xw2, yt2); ctx.stroke();
          }
          for (let i = -4; i <= 4; i++) {
            ctx.beginPath(); ctx.moveTo(W/2, horizon); ctx.lineTo(W/2 + i*(W/8), H - GROUND_H); ctx.stroke();
          }
          ctx.restore();
        }
      }
      // Faz 3: Glitch flash
      if (phase === 3 && this.flappyGlitchFlash > 0) {
        ctx.save(); ctx.globalAlpha = (this.flappyGlitchFlash / 40) * 0.3;
        ctx.fillStyle = '#ff0080'; ctx.fillRect(0, 0, W, H);
        ctx.restore();
        if (Math.random() < 0.15) {
          ctx.save(); ctx.globalAlpha = 0.12;
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, Math.random() * H, W, 1 + Math.random() * 3);
          ctx.restore();
        }
      }
      // Faz 4: Neon rain (uzay rengi)
      if (phase === 4 || phase === 6) {
        ctx.save(); ctx.globalAlpha = 0.2;
        for (let i = 0; i < 14; i++) {
          const rx = ((i * 31 + this.tick * 0.5) % W + W) % W;
          const ry1 = ((this.tick * (0.7 + i * 0.05) + i * 55) % (H - GROUND_H));
          ctx.strokeStyle = i % 2 === 0 ? '#818cf8' : '#a78bfa'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(rx, ry1); ctx.lineTo(rx - 3, ry1 + 18); ctx.stroke();
        }
        ctx.restore();
      }
      // Phase indicator corner badge
      ctx.save();
      const px2 = W - 56, py2 = 74;
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.arc(px2, py2, 26, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(px2, py2, 26, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = '11px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = col;
      ctx.fillText(PHASE_NAMES[phase].split(' ')[0], px2, py2 - 6);
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#fff';
      ctx.fillText(`${phase+1}/7`, px2, py2 + 10);
      ctx.restore();
    }

    // ── GLITCH overlay (Bölüm 4 – The Glitch) ──
    if (this.state === ST.PLAY && this.cfg.mode === 'glitch') {
      const gt = this.glitchT; // 0→1
      const postG = this.glitchFlipped;

      // Dark cyberpunk overlay — fades in smoothly
      if (gt > 0) {
        ctx.save(); ctx.globalAlpha = gt * 0.72;
        ctx.fillStyle = '#020412'; ctx.fillRect(0, 0, W, H - GROUND_H);
        ctx.restore();
      }

      // Neon perspective grid — appears gradually
      if (gt > 0.08) {
        ctx.save(); ctx.globalAlpha = gt * 0.32;
        ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 0.7;
        ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 4;
        const horizon = (H - GROUND_H) * 0.55;
        // Horizontal lines (perspective)
        for (let i = 0; i < 10; i++) {
          const t = i / 9;
          const yt = horizon + (H - GROUND_H - horizon) * t;
          const xw = (W / 2) * (0.1 + t * 0.9);
          ctx.beginPath(); ctx.moveTo(W / 2 - xw, yt); ctx.lineTo(W / 2 + xw, yt); ctx.stroke();
        }
        // Vertical rays
        for (let i = -5; i <= 5; i++) {
          const bx = W / 2 + i * (W / 10);
          ctx.beginPath(); ctx.moveTo(W / 2, horizon); ctx.lineTo(bx, H - GROUND_H); ctx.stroke();
        }
        ctx.shadowBlur = 0; ctx.restore();
      }

      // Scanlines
      if (gt > 0) {
        ctx.save(); ctx.globalAlpha = gt * 0.15;
        ctx.fillStyle = '#000';
        for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
        ctx.restore();
      }

      // Chromatic aberration (soft color shift)
      if (gt > 0.25) {
        const ab = gt * 0.08;
        ctx.save(); ctx.globalAlpha = ab;
        ctx.fillStyle = '#ff0040'; ctx.fillRect(2, 0, W, H);
        ctx.fillStyle = '#00ffcc'; ctx.fillRect(-2, 0, W, H);
        ctx.restore();
      }

      // VHS horizontal tears (post-flip only)
      if (postG && Math.random() < gt * 0.10) {
        ctx.save(); ctx.globalAlpha = 0.2;
        ctx.fillStyle = Math.random() < 0.5 ? '#fff' : '#00ffcc';
        ctx.fillRect((Math.random() - .5) * 20, Math.random() * H, W, 1 + Math.random() * 5);
        ctx.restore();
      }

      // ── 3-2-1 Countdown Badge (köşe) ──
      if (this.glitchCountdown >= 0) {
        const pulse = 0.6 + Math.sin(this.tick * 0.25) * 0.4;
        ctx.save();
        // Corner circle badge (top-right)
        const bx = W - 68, by = 76, br = 38;
        ctx.globalAlpha = pulse;
        ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 22;
        ctx.fillStyle = 'rgba(15,0,0,0.82)';
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
        // Animated progress ring
        const prog = this.glitchCdTick / 60;
        ctx.strokeStyle = `rgba(255,${Math.floor(100 - prog * 80)},0,0.9)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bx, by, br - 2, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Label
        ctx.font = 'bold 10px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff8800';
        ctx.fillText('GLITCH', bx, by - 14);
        // Number
        ctx.font = '900 26px Outfit'; ctx.fillStyle = '#ff3300';
        ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 16;
        ctx.fillText(this.glitchCountdown, bx, by + 9);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // ── Post-flip HUD indicator ──
      if (postG && this.player) {
        const gLabel = this.player.gravDir === 1 ? '▼ YERÇEKİMİ' : '▲ TERS DÜNYA!';
        const gCol   = this.player.gravDir === 1 ? '#00ffcc' : '#ff0080';
        ctx.save(); ctx.font = 'bold 13px Outfit'; ctx.textAlign = 'center';
        ctx.fillStyle = gCol; ctx.shadowColor = gCol; ctx.shadowBlur = 10;
        ctx.fillText(gLabel, W / 2, H - GROUND_H - 10);
        ctx.restore();
      }

      // ── Warning flash when countdown just started ──
      if (this.glitchTriggered && !this.glitchFlipped && gt < 0.2) {
        ctx.save(); ctx.globalAlpha = (0.2 - gt) * 0.6;
        ctx.fillStyle = '#ff0040'; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    }
    // Darkness/flashlight overlay (Ghost Night + Efsane levels)
    if (this.state === ST.PLAY && this.cfg.darkness && this.player && this.player.alive) {
      const pl = this.player;
      const grd = ctx.createRadialGradient(pl.x, pl.y, 30, pl.x, pl.y, 145);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(.42, 'rgba(0,0,0,.75)');
      grd.addColorStop(1, 'rgba(0,0,0,.97)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    }
    if (zoomed) ctx.restore();
    if (shk) ctx.restore();

    // ═══ PLAY HUD ═══
    if (this.state === ST.PLAY) drawHUD(this.score, this.sesC, this.cfg, this.elapsed);

    // ═══ HTML UI UPDATE ═══
    if (!window._apiBound) {
        try {
            const exp = {};
            if (typeof ST !== 'undefined') exp.ST = ST;
            if (typeof CHARS !== 'undefined') exp.CHARS = CHARS;
            if (typeof LEVELS !== 'undefined') exp.LEVELS = LEVELS;
            if (typeof S !== 'undefined') exp.S = S;
            if (typeof T !== 'undefined') exp.T = T;
            if (typeof devCode !== 'undefined') exp.devCode = devCode;
            if (typeof DEV_SECRET !== 'undefined') exp.DEV_SECRET = DEV_SECRET;
            if (typeof DEV_ALT !== 'undefined') exp.DEV_ALT = DEV_ALT;
            if (typeof lbSubmit !== 'undefined') exp.lbSubmit = lbSubmit;
            if (typeof lbFetchGlobal !== 'undefined') exp.lbFetchGlobal = lbFetchGlobal;
            if (typeof openBox !== 'undefined') exp.openBox = openBox;
            if (typeof CHAR_RARITY !== 'undefined') exp.CHAR_RARITY = CHAR_RARITY;
            if (typeof RARITY_LABELS !== 'undefined') exp.RARITY_LABELS = RARITY_LABELS;
            if (typeof RARITY_REFUND !== 'undefined') exp.RARITY_REFUND = RARITY_REFUND;
            if (typeof spawnParts !== 'undefined') exp.spawnParts = spawnParts;
            if (typeof applyDevMode !== 'undefined') exp.applyDevMode = applyDevMode;
            if (typeof sfxSwsh !== 'undefined') exp.sfxSwsh = sfxSwsh;
            if (typeof sfxCoin !== 'undefined') exp.sfxCoin = sfxCoin;
            if (typeof sfxXP !== 'undefined') exp.sfxXP = sfxXP;
            if (typeof sfxDie !== 'undefined') exp.sfxDie = sfxDie;
            if (typeof sfxWin !== 'undefined') exp.sfxWin = sfxWin;
            if (typeof XP_PER_LV !== 'undefined') exp.XP_PER_LV = XP_PER_LV;
            Object.assign(window, exp);
            window._apiBound = true;
            try { lbFetchGlobal(); } catch(e) {}
        } catch(e) {
            console.error("API BINDING ERROR:", e);
            window._apiBound = true;
        }
    }
    // Sync live game state every frame via a plain object (avoids var redefinition errors)
    window._gs = {
        coins, diamonds, totalCoinsEarned, spentCoins, totalDiamondsEarned,
        playerLv, playerXP, curLang, LANG, devMode,
        bestTimes, lastTimes, unlockedLvs, ownedChars, selChar, sfxMuted
    };
    // Also set direct properties for legacy ui.js references
    window.coins = coins; window.diamonds = diamonds;
    window.totalCoinsEarned = totalCoinsEarned; window.spentCoins = spentCoins;
    window.totalDiamondsEarned = totalDiamondsEarned;
    window.playerLv = playerLv; window.playerXP = playerXP;
    window.curLang = curLang; window.LANG = LANG; window.devMode = devMode;
    window.bestTimes = bestTimes; window.lastTimes = lastTimes;
    window.unlockedLvs = unlockedLvs; window.ownedChars = ownedChars;
    window.selChar = selChar; window.sfxMuted = sfxMuted;
    window.G = this;
    if (typeof updateHTMLUI === 'function') updateHTMLUI(this);
    return; // SKIP CANVAS MENUS

    // ═══ MENU ═══
    if (this.state === ST.MENU) {
      // Title glow — bold Flappyverse branding
      ctx.save();
      ctx.font = '900 52px Outfit'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fff'; ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 36;
      ctx.fillText(T('title'), W / 2, H * .28 + Math.sin(this.menuW) * 7);
      ctx.shadowBlur = 0;
      ctx.font = 'bold 15px Outfit'; ctx.fillStyle = '#00ffcc'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 10;
      ctx.fillText('7 Bölüm · Yerçekimi · Glitch · Kaos', W / 2, H * .28 + Math.sin(this.menuW) * 7 + 42); // H9 FIX
      ctx.shadowBlur = 0;
      ctx.restore();
      // Animated char preview
      drawChar(this.ch, W / 2 - 20, H * .48 + Math.sin(this.menuW * 1.5) * 8, 26, 0);
      goldBadge(W - 14, H * .62); xpBar(16, H * .62 - 16, 140, 8);
      this._bb.play = btn(T('play'), H * .67);
      this._bb.shop = btn(T('shop'), H * .67 + 64, 180, 44, '#a78bfa', '#7c3aed');
      this._bb.sets = smBtn('Profil / Ayarlar', W / 2, H * .67 + 64 + 52, 160, 34);
    }

    // ═══ LEVEL SELECT ═══
    if (this.state === ST.SEL) {
      this._bb.back = backBtn(); goldBadge(W - 14, 50);
      ctx.font = 'bold 24px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(T('levelsel'), W / 2, 102);
      const cW = 308, cH = 76, sY = 115, gap = 8;
      LEVELS.forEach((lv, i) => {
        const x = (W - cW) / 2, y = sY + i * (cH + gap), lock = !unlockedLvs[i]; panel(x, y, cW, cH, 12);
        if (lock) {
          ctx.font = 'bold 14px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.textAlign = 'center';
          ctx.fillText(T('locked') + ' ' + T('lv')[i], W / 2, y + 26);
          ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillText(T('unlock'), W / 2, y + 46);
        } else {
          ctx.fillStyle = lv.sky[1]; ctx.beginPath(); ctx.arc(x + 20, y + cH / 2, 8, 0, Math.PI * 2); ctx.fill();
          ctx.font = 'bold 14px Outfit'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(T('lv')[i], x + 36, y + 22);
          // H7 FIX: dynamic obstacle label per level mode
          const obsLabel = lv.mode==='cyber' ? T('lazer') : lv.mode==='buoy' ? T('dalga') : lv.mode==='space' ? 'hedef' : lv.mode==='flappy' ? 'skor' : T('engel');
          const tgtLabel = lv.mode==='flappy' ? '∞' : lv.tgt;
          ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText(T('lvsub')[i] + '  ·  ' + tgtLabel + ' ' + obsLabel, x + 36, y + 40);
          const bt = bestTimes[i], lt = lastTimes[i];
          ctx.font = '10px Outfit'; ctx.fillStyle = C.gold;
          ctx.fillText(bt ? `${T('bestTime')}: ${bt}${T('sec')}` : '-', x + 36, y + 58);
          if (lt) ctx.fillText(`${T('lastTime')}: ${lt}${T('sec')}`, x + 170, y + 58);
        }
      });
    }

    // ═══ SHOP ═══
    if (this.state === ST.SHOP) {
      this._bb.back = backBtn(); ctx.font = 'bold 24px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(T('shop'), W / 2, 52); goldBadge(W - 14, 52);
      const cW = 312, cH = 96, sY = 68, gap = 8; this._bb.shopBuy = [];
      CHARS.forEach((ch, i) => {
        const x = (W - cW) / 2, y = sY + i * (cH + gap), owned = ownedChars[i], sel = selChar === i; panel(x, y, cW, cH, 12);
        drawChar(ch, x + 34, y + cH / 2, 18, 0);
        ctx.font = 'bold 15px Outfit'; ctx.textAlign = 'left'; ctx.fillStyle = sel ? C.gold : '#fff'; ctx.fillText(ch.emoji + ' ' + T('charName')[i], x + 66, y + 24);
        ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText(T('charDesc')[i], x + 66, y + 42);
        if (sel) { ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#4ade80'; ctx.fillText(T('equipped'), x + 66, y + 62); }
        else if (owned) {
          const b = smBtn(T('equip'), x + cW - 90, y + cH / 2, 80, 28, '#334155', '#1e3a5f'); this._bb.shopBuy.push({ b, i, owned: true });
        } else {
          const cb = coins >= ch.price, b = smBtn(`🌟 ${ch.price}`, x + cW - 98, y + cH / 2, 88, 28, cb ? '#92400e' : '#1e293b', cb ? '#d97706' : '#334155'); this._bb.shopBuy.push({ b, i, owned: false, cb });
        }
      });
      // 💎 Elmas Satın Alma (2000 Altın)
      const dY = sY + CHARS.length * (cH + gap) + 4;
      panel((W - cW) / 2, dY, cW, 64, 12);
      ctx.font = 'bold 18px Outfit'; ctx.fillStyle = '#06b6d4'; ctx.textAlign = 'left';
      ctx.fillText('💎 1x Elmas', (W - cW) / 2 + 20, dY + 38);
      ctx.font = '12px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.fillText(`Mevcut: ${diamonds}`, (W - cW) / 2 + 120, dY + 37);
      
      const cbD = coins >= 2000;
      this._bb.buyDiamond = smBtn('🌟 2000', (W - cW) / 2 + cW - 88, dY + 32, 76, 28, cbD ? '#0ea5e9' : '#1e293b', cbD ? '#0284c7' : '#334155');
    }

    // ═══ SETTINGS -> PROFILE ═══
    if (this.state === ST.SETS) {
      this._bb.back = backBtn();
      this._bb.muteBtn = smBtn(sfxMuted ? '🔇 KAPALI' : '🔊 AÇIK', W - 100, 29, 88, 34, sfxMuted ? '#ef4444' : '#10b981', sfxMuted ? '#b91c1c' : '#059669');
      // Lang selection is removed as requested

      // Player stats
      panel((W - 280) / 2, 200, 280, 100, 14);
      ctx.font = 'bold 13px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(`${T('level')} ${playerLv}`, W / 2, 225);
      xpBar(W / 2 - 100, 233, 200, 9);
      ctx.font = '12px Outfit'; ctx.fillStyle = C.gold; ctx.fillText(`🌟 ${devMode ? '∞' : coins} ${T('coins')}`, W / 2, 267);
      // Dev code input box
      panel((W - 280) / 2, 312, 280, 54, 12);
      ctx.font = 'bold 12px Outfit'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText('🔑 Geliştirici Kodu:', W / 2 - 130, 332);
      rr(W / 2 - 130, 338, 260, 22, 6); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill();
      ctx.strokeStyle = 'rgba(125,211,252,.4)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '13px Outfit'; ctx.fillStyle = '#7dd3fc'; ctx.textAlign = 'left';
      const showCode = devCode.length > 0 ? devCode.replace(/./g, '*') + '_' : '_';
      ctx.fillText(showCode, W / 2 - 124, 354);
      if (devCode.toLowerCase() === DEV_SECRET) {
        ctx.font = 'bold 12px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#4ade80'; ctx.fillText('✔ Kod Doğru! Aşağıdan aktif et.', W / 2, 376);
      }
      // Dev mode toggle
      panel((W - 280) / 2, 380, 280, 60, 12);
      const devC1 = devMode ? '#dc2626' : '#16a34a', devC2 = devMode ? '#7f1d1d' : '#14532d';
      this._bb.devToggle = smBtn(devMode ? '🔴 Dev Mod: AÇIK — Kapat' : '🟢 Dev Mod: KAPALI — Aç', W / 2 - 130, 410, 260, 36, devC1, devC2);
      if (devMode) {
        ctx.font = 'bold 11px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fbbf24';
        ctx.fillText('⚡ Tüm bölümler açık · Sınırsız altın', W / 2, 427);
      }
      // Times
      panel((W - 280) / 2, 450, 280, 70, 12);
      ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.textAlign = 'center';
      LEVELS.forEach((lv, i) => { if (bestTimes[i]) ctx.fillText(`${T('lv')[i]}: ${bestTimes[i]}${T('sec')}`, W / 2, 468 + i * 17); });
    }

    // ═══ PLAY HUD PREVIOUSLY MOVED TOP ═══

    // ═══ PAUSE ═══
    if (this.state === ST.PAUSE) {
      ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H); ctx.restore();
      ctx.font = '900 44px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 24;
      ctx.fillText(T('paused'), W/2, H*0.35); ctx.shadowBlur = 0;
      this._bb.resume = btn('Devam Et', H*0.35 + 80, 200, 48, '#4ade80', '#16a34a');
      this._bb.pmenu = btn(T('toMenu'), H*0.35 + 140, 200, 48, '#f87171', '#dc2626');
    }
    // ═══ GAME OVER ═══
    if (this.state === ST.OVER) {
      if (this.deadT < 60 && this._deathPoint) {
        ctx.save(); ctx.strokeStyle = `rgba(239, 68, 68, ${1 - this.deadT/60})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this._deathPoint.x, this._deathPoint.y, 22 + this.deadT*1.5, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this._deathPoint.x - 10, this._deathPoint.y - 10); ctx.lineTo(this._deathPoint.x + 10, this._deathPoint.y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this._deathPoint.x + 10, this._deathPoint.y - 10); ctx.lineTo(this._deathPoint.x - 10, this._deathPoint.y + 10); ctx.stroke();
        ctx.restore();
      }
      if (this.cfg.mode === 'flappy') {
        // ── Saf Flappy: Özel Tam Sayfa Skorboard ──
        const pw = 340, ph = 480, px = (W - pw) / 2, py = 28;
        panel(px, py, pw, ph, 20);
        // Başlık
        ctx.textAlign = 'center';
        ctx.font = '900 26px Outfit'; ctx.fillStyle = '#f87171';
        ctx.shadowColor = '#f87171'; ctx.shadowBlur = 16;
        ctx.fillText('💥 ' + T('gameover'), W / 2, py + 44); ctx.shadowBlur = 0;
        // Büyük skor
        ctx.font = '900 56px Outfit'; ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 22;
        ctx.fillText(this.score, W / 2, py + 110); ctx.shadowBlur = 0;
        ctx.font = 'bold 13px Outfit'; ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText('SKOR', W / 2, py + 126);
        // Faz bilgisi
        const PHASE_NAMES = ['🌿 Klasik', '💨 Rüzgar', '🌑 Karanlık', '⚡ Glitch', '🚀 Uzay', '🌊 Derin', '🌌 Kaos'];
        const PHASE_COLS = ['#4ade80', '#93c5fd', '#a78bfa', '#ff0080', '#818cf8', '#14b8a6', '#f97316'];
        const lastPhase = Math.floor(this.score / 10) % 7;
        ctx.font = 'bold 13px Outfit'; ctx.fillStyle = PHASE_COLS[lastPhase];
        ctx.shadowColor = PHASE_COLS[lastPhase]; ctx.shadowBlur = 8;
        ctx.fillText('Son Dünya: ' + PHASE_NAMES[lastPhase], W / 2, py + 148); ctx.shadowBlur = 0;
        // Coin + süre
        ctx.font = 'bold 16px Outfit'; ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 6;
        ctx.fillText(`🌟 +${this.sesC} altın`, W / 2, py + 170); ctx.shadowBlur = 0;
        const el = Math.floor(this.elapsed / 60);
        ctx.font = '12px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.fillText(`⏱ ${el}${T('sec')}`, W / 2, py + 188);
        // İsim girişi
        if (this._pendingLbScore !== undefined) {
          ctx.font = '12px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.65)';
          ctx.fillText('Sıralamaya adını yaz:', W / 2, py + 210);
          rr(px + 18, py + 216, pw - 36, 30, 9);
          ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.font = 'bold 16px Outfit'; ctx.fillStyle = '#fbbf24';
          ctx.fillText((this._lbNameInput || '') + '▌', W / 2, py + 237);
          this._bb.lbSave = smBtn('💾 Kaydet', W / 2 - 58, py + 254, 116, 32, '#16a34a', '#15803d');
        } else {
          ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.35)';
          ctx.fillText('✔ Skor kaydedildi', W / 2, py + 218);
        }
        // Liderlik tablosu
        drawLeaderboard(px, py + 290, pw);
        // Butonlar
        const btnY = py + ph + 18;
        if (this.deadT > 50) {
          if (diamonds > 0) {
            this._bb.revive = smBtn('💎 Diril (-1)', W / 2 - 80, btnY, 160, 36, '#0ea5e9', '#0284c7');
            this._bb.retry = btn(T('retry'), btnY + 46, 190, 46, '#ef4444', '#b91c1c');
            this._bb.tmenu = smBtn(T('toMenu'), W / 2 - 50, btnY + 102, 100, 34);
          } else {
            this._bb.retry = btn(T('retry'), btnY, 190, 46, '#ef4444', '#b91c1c');
            this._bb.tmenu = smBtn(T('toMenu'), W / 2 - 50, btnY + 56, 100, 34);
          }
        }
      } else {
        // ── Normal Game Over ──
        const pw = 320, ph = 240, px = (W - pw) / 2, py = H * .14;
        panel(px, py, pw, ph);
        ctx.textAlign = 'center'; ctx.font = 'bold 30px Outfit'; ctx.fillStyle = '#f87171';
        ctx.fillText(T('gameover') + ' 💥', W / 2, py + 46);
        const goLabel = this.cfg.mode==='cyber' ? T('lazer') : this.cfg.mode==='buoy' ? T('dalga') : this.cfg.mode==='space' ? 'hedef' : T('engel');
        ctx.font = '16px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.fillText(`${this.score} / ${this.cfg.tgt} ${goLabel}`, W / 2, py + 82);
        ctx.font = 'bold 20px Outfit'; ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(`🌟 +${this.sesC} ${T('coins')}`, W / 2, py + 118); ctx.shadowBlur = 0;
        const el2 = Math.floor(this.elapsed / 60); ctx.font = '14px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.fillText(`⏱ ${el2}${T('sec')}`, W / 2, py + 148);
        const btnY = py + ph + 28;
        if (this.deadT > 50) {
          if (diamonds > 0) {
            this._bb.revive = smBtn('💎 Diril (-1)', W / 2 - 80, btnY, 160, 36, '#0ea5e9', '#0284c7');
            this._bb.retry = btn(T('retry'), btnY + 46, 190, 46, '#ef4444', '#b91c1c');
            this._bb.tmenu = smBtn(T('toMenu'), W / 2 - 50, btnY + 102, 100, 34);
          } else {
            this._bb.retry = btn(T('retry'), btnY, 190, 46, '#ef4444', '#b91c1c');
            this._bb.tmenu = smBtn(T('toMenu'), W / 2 - 50, btnY + 56, 100, 34);
          }
        }
      }
    }

    // ═══ LEVEL DONE ═══
    if (this.state === ST.DONE) {
      const a = Math.min(this.compA / 30, 1), pw = 318, ph = 270, px = (W - pw) / 2, py = H * .22;
      ctx.save(); ctx.globalAlpha = a; panel(px, py, pw, ph); ctx.textAlign = 'center';
      ctx.font = 'bold 28px Outfit'; ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 16; ctx.fillText(T('victory') + ' 🎉', W / 2, py + 46); ctx.shadowBlur = 0;
      if (this.isRec) { ctx.font = 'bold 16px Outfit'; ctx.fillStyle = '#fbbf24'; ctx.fillText(T('newRecord'), W / 2, py + 76); }
      ctx.font = '15px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText(T('lv')[this.lvi], W / 2, py + 100);
      const el = lastTimes[this.lvi]; ctx.font = 'bold 22px Outfit'; ctx.fillStyle = '#fff'; ctx.fillText(`⏱ ${el}${T('sec')}`, W / 2, py + 130);
      ctx.font = 'bold 18px Outfit'; ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 8; ctx.fillText(`🌟 +${this.sesC} ${T('coins')}!`, W / 2, py + 165); ctx.shadowBlur = 0;
      ctx.font = 'bold 14px Outfit'; ctx.fillStyle = '#a78bfa'; ctx.fillText(`+${this.cfg.xpR} ${T('xp')}  ·  ${T('level')} ${playerLv}`, W / 2, py + 196);
      ctx.font = '12px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillText(`${T('coins')}: ${coins} 🌟`, W / 2, py + 220);
      if (this.compA > 65) { const n = this.lvi + 1; if (n < LEVELS.length) btn(T('next'), py + ph + 36, 220, 48, '#22c55e', '#15803d'); else btn(T('congratz'), py + ph + 36, 220, 48, '#a78bfa', '#7c3aed'); }
      ctx.restore();
    }

    // ═══ WIN / ALL DONE ═══
    if (this.state === ST.WIN) {
      ctx.font = 'bold 42px Outfit'; ctx.textAlign = 'center'; ctx.fillStyle = '#fde68a'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 30; ctx.fillText('🏆', W / 2, H * .28 + Math.sin(this.menuW) * 8); ctx.fillText(T('congratz'), W / 2, H * .38 + Math.sin(this.menuW) * 8); ctx.shadowBlur = 0;
      ctx.font = '18px Outfit'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(T('allDone'), W / 2, H * .48 + Math.sin(this.menuW) * 7);
      ctx.font = 'bold 22px Outfit'; ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 10; ctx.fillText(`🌟 ${coins} ${T('coins')}`, W / 2, H * .56 + Math.sin(this.menuW) * 6); ctx.shadowBlur = 0;
      btn(T('toMenu'), H * .72, 200, 48, '#a78bfa', '#7c3aed');
    }
  },

  click(cx, cy) {
    if (this.state === ST.PLAY) {
        if (this._bb && this._bb.pauseBtn && hitTest(this._bb.pauseBtn, cx, cy)) { this.togglePause(); return; }
        this.tap(cx, cy);
    }
    return; // SKIP ALL CANVAS CLICK HANDLERS
    
    // BACK button
    if ((this.state === ST.SEL || this.state === ST.SHOP || this.state === ST.SETS) && this._bb.back && hitTest(this._bb.back, cx, cy)) { this.state = ST.MENU; sfxSwsh(); return; }
    // E7: pause button click
    if (this.state === ST.PLAY && this._bb.pauseBtn && hitTest(this._bb.pauseBtn, cx, cy)) { this.togglePause(); return; }
    
    // Pause menu clicks
    if (this.state === ST.PAUSE) {
      if (this._bb.resume && hitTest(this._bb.resume, cx, cy)) { this.togglePause(); return; }
      if (this._bb.pmenu && hitTest(this._bb.pmenu, cx, cy)) { this.state = ST.MENU; sfxSwsh(); return; }
      return; // Do not unpause or pass to tap() if clicked elsewhere
    }
    if (this.state === ST.MENU) {
      if (hitTest(this._bb.play, cx, cy)) { this.state = ST.SEL; sfxSwsh(); }
      else if (hitTest(this._bb.shop, cx, cy)) { this.state = ST.SHOP; sfxSwsh(); }
      else if (hitTest(this._bb.sets, cx, cy)) { this.state = ST.SETS; sfxSwsh(); }
    }
    else if (this.state === ST.SEL) {
      const cW = 308, cH = 76, sY = 115, gap = 8;
      LEVELS.forEach((lv, i) => { if (!unlockedLvs[i]) return; const x = (W - cW) / 2, y = sY + i * (cH + gap); if (hitTest({ x, y, w: cW, h: cH }, cx, cy)) this.startLv(i); });
    }
    else if (this.state === ST.SHOP) {
      if (this._bb.buyDiamond && hitTest(this._bb.buyDiamond, cx, cy)) {
        if (devMode || coins >= 2000) {
          if (!devMode) coins -= 2000;
          diamonds++;
          saveAll(); sfxXP(); return;
        } else {
          sfxDie(); return;
        }
      }
      this._bb.shopBuy && this._bb.shopBuy.forEach(({ b, i, owned, cb }) => {
        if (!hitTest(b, cx, cy)) return;
        if (owned) { selChar = i; saveAll(); sfxSwsh(); }
        else if (devMode) { ownedChars[i] = true; selChar = i; saveAll(); sfxCoin(); } // dev: free
        else if (cb) { coins -= CHARS[i].price; ownedChars[i] = true; selChar = i; saveAll(); sfxCoin(); }
      });
    }
    else if (this.state === ST.SETS) {
      if (this._bb.muteBtn && hitTest(this._bb.muteBtn, cx, cy)) { sfxMuted = !sfxMuted; S.s('sfx_mute', sfxMuted); sfxSwsh(); }
      else if (hitTest(this._bb.langTR, cx, cy)) { curLang = 'tr'; sfxSwsh(); }
      else if (hitTest(this._bb.langEN, cx, cy)) { curLang = 'en'; sfxSwsh(); }
      else if (this._bb.devToggle && hitTest(this._bb.devToggle, cx, cy)) {
        const codeOk = devCode.toLowerCase() === DEV_SECRET || devCode.toLowerCase() === DEV_ALT;
        if (!devMode && !codeOk) { sfxDie(); return; } // wrong code
        devMode = !devMode; saveAll(); applyDevMode(); sfxSwsh();
        if (devMode) { spawnParts(W / 2, H / 2, '#fbbf24', 20, 6); }
      }
    }
    else { 
      // Game over actions
      if (this.state === ST.OVER && this.deadT > 50) {
        // Leaderboard save button
        if (this._bb.lbSave && hitTest(this._bb.lbSave, cx, cy) && this._pendingLbScore !== undefined) {
          lbSubmit(this._lbNameInput || 'Anonim', this._pendingLbScore);
          this._pendingLbScore = undefined;
          sfxCoin(); return;
        }
        if (diamonds > 0 && this._bb.revive && hitTest(this._bb.revive, cx, cy)) {
          diamonds--; saveAll(); sfxXP();
          this.state = ST.PLAY; this.player.alive = true; this.player.y = H/2; this.player.vy = 0; 
          this.obs.forEach(o => {
            for(let i=0; i<8; i++) spawnParts(o.x + OW/2, o.topH, o.pc?.[0]||'#fff', 4, 3);
            for(let i=0; i<8; i++) spawnParts(o.x + OW/2, o.botY, o.pc?.[0]||'#fff', 4, 3);
          });
          if (this.spaceObs) this.spaceObs.forEach(o => {
            for(let i=0; i<6; i++) spawnParts(o.x, o.y, '#dc2626', 5, 4);
          });
          this.obs = []; this.spaceObs = []; this.alienObs = [];
          this.pt = -90; 
          this.deadT = 0; return;
        }
        if (this._bb.retry && hitTest(this._bb.retry, cx, cy)) { this.startLv(this.lvi); return; }
        if (this._bb.tmenu && hitTest(this._bb.tmenu, cx, cy)) { this.state = ST.SEL; sfxSwsh(); return; }
        return; // Ölüm ekranında başka yere basınca boşa gitmesin
      }
      this.tap(cx, cy); 
    }
  },
  loop() { this.update(); this.draw(); requestAnimationFrame(() => this.loop()); }
};

/* ── INPUT ── */
function coords(e) { const r = canvas.getBoundingClientRect(), sx = W / r.width, sy = H / r.height, s = e.touches ? e.touches[0] : e; return { x: (s.clientX - r.left) * sx, y: (s.clientY - r.top) * sy }; }
canvas.addEventListener('pointerdown', e => { e.preventDefault(); G.holding = true; const { x, y } = coords(e); G.click(x, y); }, { passive: false });
canvas.addEventListener('pointerup', () => { G.holding = false; });
canvas.addEventListener('pointerleave', () => { G.holding = false; });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); G.holding = true; if (G.cfg?.mode !== 'buoy') G.tap(W*0.5, H*0.4); return; }
  // E7: P key toggles pause
  if (e.code === 'KeyP' && (G.state === ST.PLAY || G.state === ST.PAUSE)) { e.preventDefault(); G.togglePause(); return; }
  // Leaderboard name input (B7 game over)
  if (G.state === ST.OVER && G._pendingLbScore !== undefined) {
    if (e.key === 'Backspace') { G._lbNameInput = (G._lbNameInput || '').slice(0, -1); e.preventDefault(); return; }
    if (e.key === 'Enter') { lbSubmit(G._lbNameInput || 'Anonim', G._pendingLbScore); G._pendingLbScore = undefined; sfxCoin(); e.preventDefault(); return; }
    if (e.key.length === 1 && (G._lbNameInput || '').length < 12) { G._lbNameInput = (G._lbNameInput || '') + e.key; e.preventDefault(); return; }
  }
  if (G.state === ST.SETS) {
    if (e.key === 'Backspace') { devCode = devCode.slice(0, -1); return; }
    if (e.key.length === 1) devCode += e.key;
  }
});
document.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') G.holding = false; });
// E7: auto-pause when tab hidden
document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === ST.PLAY) G.togglePause(); });


applyDevMode(); // restore dev unlocks on page load
G.init(); G.loop();
