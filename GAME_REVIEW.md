# Flappyverse - Oyun Inceleme Raporu

**Tarih:** 2026-03-26
**Incelenen Dosyalar:** `game.js` (3159 satir), `ui.js` (635 satir), `style.css` (488 satir), `index.html` (85 satir)
**Surum:** v2.0 Premium

---

## 1. Tespit Edilen Performans Sorunlari

### P1 — Her Karede Sky Gradient Yeniden Olusturma (ORTA)
- **Dosya:** `game.js:1232-1258`
- Sky gradient cache mevcut (`_skyGradCache`) ancak `addColorStop()` her `drawSky()` cagrisinda tekrar ekleniyor. CanvasGradient nesnelerine tekrarlanan `addColorStop` cagrilari birikerek bellek sisirmesine yol acar.
- **Oneri:** Gradient'i sadece key degistiginde yeniden olustur VE color stop'lari yalnizca o anda ekle.

### P2 — Obstacle Sinifinda Her Frame Yeni Canvas Olusturma (YUKSEK)
- **Dosya:** `game.js:595-607`
- Her `Obstacle` constructor'inda `document.createElement('canvas')` ile offscreen canvas olusturuluyor (mercan/coral engelleri icin). Her engel icin 800px yuksekliginde yeni bir canvas = ciddi bellek kullanimi.
- **Oneri:** Offscreen canvas'lari havuzlama (pool) sistemiyle yonet veya tek bir shared buffer kullan.

### P3 — PARTS Dizisi Sinirsiz Buyuyebilir (ORTA)
- **Dosya:** `game.js:394-401`
- `spawnParts` icinde `MAX_PARTS = 120` siniri var, ancak `game.js:1534` satirinda `PARTS.length > 200 && PARTS.splice(0, 50)` ile ayri bir kontrol mevcut. Bu iki sinir tutarsiz; 120-200 arasi "hayalet bolge" olusturuyor.
- **Oneri:** Tek bir tutarli limit uygula.

### P4 — Mobil Cihazlarda Backdrop-Filter Performansi (DUSUK)
- **Dosya:** `style.css:452-465`
- Mobil icin `backdrop-filter: none` dogru uygulanmis, ancak `@media (max-width: 768px)` breakpoint'i tablet boyutundaki cihazlari da kapsiyor. iPad gibi cihazlarda backdrop-filter destegi varken gereksiz yere kapatiliyor.
- **Oneri:** `max-width: 768px` yerine daha spesifik bir breakpoint veya `prefers-reduced-motion` media query kullan.

### P5 — Frogger Modunda Cim Doku Dongusu (DUSUK)
- **Dosya:** `game.js:2113-2120`
- Her frame'de sol kaldirim icin ic ice iki dongu (`gy < H`, `gx < FSIDE_W`) ile piksel piksel cim dokusu ciziliyor. Bu statik icerik offscreen canvas'a bir kez cizilebilir.

### P6 — `updateHTMLUI` Her Frame Cagriliyor (ORTA)
- **Dosya:** `game.js:2793`
- `PLAY` durumunda bile `updateHTMLUI(this)` her frame cagriliyor. Fonksiyon icinde erken return (`_lastGameState` kontrolu) var ama yine de her frame DOM sorgulari yapiliyor (getElementById, innerText atamalari).
- **Oneri:** Dirty flag pattern'ini daha siki uygula; PLAY durumunda sadece skor/zaman degistiginde guncelle.

### P7 — window Nesnesine Surekli Atama (DUSUK)
- **Dosya:** `game.js:2778-2793`
- Her `draw()` cagrisinda 20+ degisken `window` nesnesine ataniyor. Bu yaklasik saniyede 60 kez gereksiz atama demek.

---

## 2. Tespit Edilen Hatalar / Buglar

### B1 — Oyuncu Cift Ciziliyor (KRITIK)
- **Dosya:** `game.js:2370` ve `game.js:2373`
- `this.player.draw()` AYNI KOSULLA iki kez ust uste cagriliyor:
  ```js
  if (this.player && this.cfg.mode !== 'frogger') this.player.draw();  // satir 2370
  if (this.player && this.cfg.mode !== 'frogger') this.player.draw();  // satir 2373
  ```
- Bu, oyuncunun her frame'de iki kez cizilmesine neden olur. Ozellikle yari-saydam karakterlerde (Owl, `globalAlpha = 0.85`) gorsel hata olusturur.

### B2 — Olagan Disi Canvas Menu Kodlari Erisilemez (ORTA)
- **Dosya:** `game.js:2794-3031`
- `draw()` fonksiyonunda `return;` ifadesinden sonra yaklasik 240 satirlik canvas-tabanli menu kodu var. Bu kod ASLA calistirilmaz (dead code). Ayni sekilde `click()` fonksiyonunda `game.js:3039` satirindaki `return;` ifadesinden sonra ~80 satirlik click handler kodu erisilemez.
- **Etki:** Dosya boyutunu gereksiz yere sisirir (~320 satir olum kodu).

### B3 — `isTutorial` Ozelligi Tanimlanmamis (ORTA)
- **Dosya:** `game.js:582`
- `if (this.isTutorial || this.isWind)` kontrolu yapiliyor ancak `this.isTutorial` hicbir yerde atanmiyor. Constructor'da sadece `this.isOcean`, `this.isCyber`, `this.isDigital`, `this.isWind`, `this.isSpooky` var.
- **Sonuc:** Tutorial modundaki (B1) engellerin platform stili yerine varsayilan pipe stili ile cizilmesi.

### B4 — Falcon Zirhi Kirildiginda Karakter Sifirlaniyor (ORTA)
- **Dosya:** `game.js:1418-1419`
- `_checkDamage` icinde Falcon'un zirhi kirildiktan sonra `pl.ch = CHARS[0]` ile karakter zorla "Klasik Piksel"e donduruluyor. Oyuncu secili karakterini kaybediyor.
- **Beklenen:** Ayni karakter kalsin, sadece zirh ozelligi kaldirilsin.

### B5 — Revive Sonrasi `this.blocks = []` Hatasi (DUSUK)
- **Dosya:** `game.js:1442`
- `revive()` icinde `this.blocks = []` atanmis ancak `G` nesnesinde `blocks` diye bir alan yok. Bu islemsiz bir atama.

### B6 — Flappy Modunda `buyD` Action Handler Eksik (DUSUK)
- **Dosya:** `ui.js:420-422`
- Elmas satin alma butonlari `window.uiC('buyD', 50)` seklinde cagri yapiyor, ancak `uiC` fonksiyonunda `buyD` action'i hic tanimlanmamis. Butona tiklandiginda hicbir sey olmuyor.

### B7 — Leaderboard Isim Girisi Canvas'ta Kaliyor (DUSUK)
- **Dosya:** `game.js:2955-2967`
- Flappy modunda game over'da leaderboard isim girisi canvas-tabanli ciziliyor, ancak `draw()` fonksiyonu `return;` nedeniyle bu koda ulasamiyor. Sonuc: Flappy modunda isim girisi gorunmuyor.

### B8 — `shoptab` Action Iki Kez Tanimlanmis (DUSUK)
- **Dosya:** `ui.js:530` ve `ui.js:622-627`
- `uiC` fonksiyonunda `action === 'shoptab'` iki ayri `else if` bloguyla kontrol ediliyor. Ilki calisir, ikincisine asla ulasilmaz.

### B9 — Frogger Tutorial Metni Yanlis (DUSUK)
- **Dosya:** `game.js:2350`
- Tutorial overlay'de `"15 kez karsiya gec -> sonuc bozar"` yaziyor. "sonuc bozar" ifadesi anlamsiz; muhtemelen "bolumu bitir" olmali.

---

## 3. Eksik veya Yarim Kalan Ozellikler

### E1 — Elmas Satin Alma Sistemi (Gercek Odeme Yok)
- **Dosya:** `ui.js:416-422`
- Elmas satin alma ekrani "9.99 TL", "24.99 TL", "49.99 TL" fiyatlar gosteriyor ama `buyD` action'i tanimli degil. Butona tiklandiginda hicbir sey olmuyor.
- **Durum:** Tamamen placeholder/dekoratif.

### E2 — Dil Degistirme Butonu Kaldirilmis
- **Dosya:** `game.js:2874`
- Yorumda "Lang selection is removed as requested" yaziyor. i18n altyapisi (`LANG.tr`, `LANG.en`) eksiksiz mevcut ama kullanicinin dili degistirmesi icin arayuz yok.

### E3 — Canvas-Tabanli Menuler Devre Disi
- **Dosya:** `game.js:2794`, `game.js:3039`
- HTML UI'a gecis yapilmis ama eski canvas menuleri silinmemis, sadece `return;` ile atlanmis. Bu ~400 satirlik dead code.

### E4 — Frogger Modunda Zorluk Artisi Yok
- **Dosya:** `game.js:1389`
- `_frogDiffMul` sabiti `0.5` olarak ayarlanmis ve hic arttirilmiyor. Oyun baslangicindan sonuna kadar ayni zorlukta kaliyor.
- Yorumda `"Sabit 'Cok Kolay'"` yaziyor — kasitli olabilir ama oyunun diger seviyeleriyle tutarsiz.

### E5 — Profile Ekraninda Toplam Oyun Suresi / Olum Sayisi Yok
- Profil ekraninda altin/elmas istatistikleri gosteriliyor ama toplam oyun suresi, olum sayisi gibi ilgi cekici istatistikler eksik.

### E6 — Leaderboard Sadece Flappy Modunda Aktif
- **Dosya:** `game.js:1972`
- Leaderboard sistemi sadece `mode === 'flappy'` icin calistirilmis. Diger bolumlerin rekorlari paylasilamiyor.

### E7 — Revive Prompt'ta Reklam Secenegi Yok
- Revive mekanizmasi sadece elmas tüketiyor. Tipik mobil oyunlarda olan "Reklam izle ve diril" secenegi mevcut degil.

---

## 4. Iyilestirme Onerileri

### O1 — Dead Code Temizligi (Oncelik: YUKSEK)
- `game.js:2794-3031` ve `game.js:3039-3117` arasindaki erisilemez canvas menu/click kodlarini sil. Bu ~400 satir gereksiz kod.

### O2 — Cift Player Draw Duzelt (Oncelik: YUKSEK)
- `game.js:2373` satirindaki tekrarlanan `this.player.draw()` cagrisini sil.

### O3 — `isTutorial` Bayragini Ekle (Oncelik: YUKSEK)
- Obstacle constructor'inda `this.isTutorial = lv.mode === 'tutorial';` ekle.

### O4 — Falcon Zirh Mekanigini Duzelt (Oncelik: ORTA)
- `game.js:1419`'da `pl.ch = CHARS[0]` yerine sadece `pl.armor = false` birak.

### O5 — Offscreen Canvas Havuzu (Oncelik: ORTA)
- Coral engelleri icin offscreen canvas'lari havuzla veya tek bir shared canvas kullan.

### O6 — Frogger Zorluk Skalasi (Oncelik: DUSUK)
- `_frogDiffMul` degerini skor arttikca kademeli olarak artir.

### O7 — Erisilebilirlik: Renk Koru Modu (Oncelik: DUSUK)
- Lazer kirmizi/yesil renk kodlamasi renk koru kullanicilar icin sorunlu. Ek gorsel isaretler (sekil, desen) ekle.

### O8 — Sesli Geri Bildirim Gelistirmeleri (Oncelik: DUSUK)
- Web Audio API synthesizer'i calisiyor ama tum sesler benzer ton araliklarina sahip. Farkli mekanikler icin daha belirgin sesler tasarla.

### O9 — Tailwind CDN Yerine Lokal Build (Oncelik: ORTA)
- `index.html:20`'de `cdn.tailwindcss.com` runtime'da tum Tailwind'i yukluyor (~300KB+). Production icin sadece kullanilan siniflari iceren bir build yapilmali.

### O10 — Lottie Player Kullanilmiyor (Oncelik: DUSUK)
- `index.html:23`'de `@lottiefiles/lottie-player` yukleniyor ama kodda hicbir yerde `<lottie-player>` elementi veya Lottie API cagirisi yok. Gereksiz ~150KB yuklenme.

---

## 5. Guvenlik Notlari

### G1 — Firebase API Anahtarlari Acik (BILGI)
- **Dosya:** `index.html:68-76`
- Firebase konfigurasyonu (apiKey, projectId, appId, measurementId) istemci tarafinda acik sekilde mevcut.
- **Deger:** Firebase web uygulamalarinda API anahtari public olmak zorundadir — bu kendi basina bir guvenlik acigi degildir. ANCAK:
  - Firestore Security Rules'un dogru yapilandirildigini dogrulama gereklidir.
  - Suan `leaderboard` collection'ina herkes yazabiliyor gibi gorunuyor (`ref.set(...)` direkt cagiriliyor).
  - **Risk:** Kotu niyetli kullanici konsoldan `window.fbDb.collection('leaderboard').doc('hacker').set({...})` ile sahte skor yazabilir.

### G2 — Gelistirici Kodlari Kaynak Kodda Acik (ORTA)
- **Dosya:** `game.js:91-92`, `ui.js:542`
- `DEV_SECRET = 'gelistirici'` ve `DEV_ALT = 'dev123'` gizli kodlar kaynak kodda plaintext olarak mevcut.
- Herhangi bir kullanici DevTools'tan bu kodlari gorebilir ve dev moduna erisebilir (sinirsiz altin/elmas, tum bolumler acik).
- **Etki:** Tek oyunculu oyun oldugu icin kritik degil, ama leaderboard ile birlestiginde sahte skorlar gonderilebilir.

### G3 — Icerik Kodu Girisi XSS'e Acik Degil (OLUMLU)
- `ui.js:539` satirindaki icerik kodu girisi `.value` ile alinip `.toLowerCase().trim()` yapiliyor, DOM'a `innerHTML` olarak enjekte edilmiyor. XSS riski yok.

### G4 — localStorage'da Hassas Veri Yok (OLUMLU)
- Kayit sistemi (`S.g`/`S.s`) sadece oyun ilerlemesi, altin/elmas miktarlari gibi verileri saklayiyor. Kisisel bilgi veya kimlik dogrulama tokenlari yok.

### G5 — Kufur Filtresi Basit (DUSUK)
- **Dosya:** `game.js:141`
- Leaderboard isim filtresi basit `includes()` kontrolu kullaniyor. "amk123", "f.u.c.k" gibi varyasyonlar gecebilir.
- **Oneri:** Regex tabanli veya uzakligi olcen bir filtre kullan.

### G6 — CDN Bagimliliklari SRI Hash'siz (DUSUK)
- **Dosya:** `index.html:20, 23, 64-66`
- Tailwind CDN, Lottie ve Firebase SDK'lari `integrity` attribute'u olmadan yukleniyor. CDN'e saldiri durumunda kotu amacli kod enjekte edilebilir.

---

## 6. Genel Degerlendirme

### Guclu Yonler
- **9 benzersiz oyun modu:** Tutorial, Wind, Buoy (denizalti), Halloween (karanlik), Glitch (yer cekimi degisimi), Cyber (lazer), Space (sifir yer cekimi), Frogger (otoyol) ve Sonsuz Flappy. Her birinin farkli fizik motoru ve gorsel temasi var — etkileyici cesitlilik.
- **Gacha kutu sistemi:** Nadir/efsanevi karakter nadirlik sistemi, cift gelme iadesi gibi detaylar oyuncu motivasyonunu artiriyor.
- **Web Audio API kullanimi:** Harici ses dosyasi gerektirmeden tamamen synthesizer tabanli ses efektleri — sifir ek yuklenme.
- **Mobil optimizasyonlar:** `shadowBlur` override, backdrop-filter devre disi birakma, portrait-lock gibi mobil odakli iyilestirmeler mevcut.
- **HTML UI gecisi:** Glassmorphism temali modern HTML overlay sistemi (ui.js) canvas menulerinin yerine gecmis — daha iyi kullanici deneyimi ve erisebilirlik.
- **i18n altyapisi:** Turkce/Ingilizce dil destegi hazir (arayuz butonu eksik olsa da).

### Zayif Yonler
- **Kod kalitesi:** ~3800 satirlik (game.js + ui.js) tek monolitik dosya, sinif yapisi zayif, degisken isimleri kisaltilmis (`S.g`, `S.s`, `C`, `rr`, `btn`). Bakimi zor.
- **~400 satir dead code:** Canvas menu sistemi HTML UI'a gecilmesine ragmen silinmemis.
- **Kritik cizim hatalari:** Oyuncu her frame'de 2 kez ciziliyor, tutorial engelleri yanlis stilde goruntuleniyor.
- **Eksik ozellikler:** Elmas satin alma calismaz, Frogger zorluk artisi yok, leaderboard sadece tek modda.
- **Test altyapisi yok:** Hicbir unit test veya e2e test mevcut degil.

### Genel Puan

| Kategori | Puan (10 uzerinden) |
|---|---|
| Oyun Tasarimi & Cesitlilik | 8.5 |
| Gorsel Kalite | 8.0 |
| Kod Kalitesi & Bakim | 4.5 |
| Performans | 6.0 |
| Hata/Bug Durumu | 5.5 |
| Guvenlik | 7.0 |
| Mobil Uyumluluk | 7.5 |
| **GENEL** | **6.7** |

### Oncelikli Aksiyon Plani
1. **Acil:** B1 (cift player draw) ve B3 (isTutorial eksik) duzelt
2. **Kisa Vade:** Dead code temizligi, B4 (Falcon zirh hatasi) duzelt
3. **Orta Vade:** Performans iyilestirmeleri (P2 offscreen canvas, P6 UI guncelleme), Elmas satin alma sistemi
4. **Uzun Vade:** Kod refactoring (modullere ayirma), test altyapisi, Firestore guvenlik kurallari

---

*Bu rapor QA & Integration Engineer tarafindan hazirlanmistir.*
