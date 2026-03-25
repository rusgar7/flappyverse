# 🚀 Mobil Optimizasyon, Yeni Bölümler ve Mağaza Genişletmesi

Bu belge, oyunumuzun yaşadığı mobil optimizasyon sorunlarının temel nedenlerini ve oyuna eklenecek yepyeni mekaniklere sahip bölümlerin, yeni karakterlerin detaylı dökümünü içermektedir.

---

## 📱 1. Mobil Kasma Problemi ve Çözünürlük Çözümleri

**Sorun Tespiti:** Oyunun sadece mobilde (Hem Android hem iOS) oynanılamaz derecede kasmasının temel nedenleri detaylıca incelenmiştir:
1.  **Canvas shadowBlur Kullanımı:** Oyunda (game.js) efektler için her saniye 60 kez çalışan 45'ten fazla `shadowBlur` (gölge efekti) kodu bulunmaktadır. Mobil işlemciler bu matematiksel yükü taşıyamaz ve oyun donar.
2.  **CSS backdrop-filter:** Arayüzde (ui.js ve style.css) kullanılan ağır `blur(14px)` cam efektleri mobil ekran kartlarını yorar.

**Çözüm Planı:**
- Oyuna bir mobil cihaz algılama sistemi (`isMobile`) entegre edilecek. Mobil cihazlarda gölge (`shadowBlur`) ve ekran bulanıklaştırma (`backdrop-filter`) özellikleri otomatik olarak **devre dışı bırakılarak** oyun yağ gibi akıcı hale getirilecek.
- Ebatlar, ekranı tam dolduracak şekilde dinamik viewport ayarları (CSS ve meta etiketleri) ile sabitlenecek. Oyun sadece **dikey (portrait)** modda çalışmaya kilitlenecektir.

---

## 🦅 2. Karakterler & Mağaza Güncellemeleri

- **Neon Sayborg Rarity:** "Neon Sayborg" tekrar **Nadir (Rare)** seviyesine çekilecektir.
- **Yeni 3 Pixel Karakter:** "Klasik Piksel" ailesine benzeyen 3 yepyeni karakter eklenecektir (Örn; Kırmızı, Mavi, Yeşil Piksel). Bunlar **Sıradan (Common)** kategorisinde yer alacaktır.
- **Sıralama Düzeni:** Mağazadaki karakter dizilimi, mantıksal olarak Rarity'ye göre sıraya konulacaktır: *Önce Sıradanlar > Sonra Nadirler > En son Efsanevi karakterler*.
- **Mağaza UI Rötüşü:** Mağazadaki "Kuşlar" sekmesine eksik olan emoji eklenecektir.

---

## 🗺️ 3. Yeni Eklenecek Özel Bölümler (Bölüm 4 ve 6)

### 🎃 Yeni Bölüm 4: Karanlık / Cadılar Bayramı Modu
- **Tema:** Tamamen ürpertici ve gerilimli zifiri karanlık ortam.
- **Mekanik:** Ekran kararmış olacak. Karakterinizin etrafında sadece ufak bir aydınlanma (el feneri/hale) alanı bulunacak. İlerideki tehlikeler veya borular önceden seçilemeyecek, oyun aşırı hızlı refleks gerektirecek ama aynı zamanda da eğlenceli olacak.

### 🚗 Yeni Bölüm 6: 10 Şeritli Otoban Geçişi (Frogger Modu)
- **Tema:** Kuşbakışı (Top-down) 10 şeritli bir otobanda trafiğin içinden yaya geçidiyle karşıya geçiş.
- **Mekanikler:** Flappy mekaniği uçuş **tamamen iptal edilecek**. Mekanik ızgara (grid) atlama şeklini alacaktır:
  - Ekranı hayali olarak ortadan ikiye ayıracağız.
  - **Ekranın Soluna Tıklama:** Karakteri bir önceki şeride geri döndürür.
  - **Ekranın Sağına Tıklama:** Karakteri bir sonraki şeride ileri atlatır.
  - Şeritlerde hızla geçen arabalar durmayacaktır, arabalara çarpmadan 10 şeridi başarıyla geçmek hedeftir.

---

## 🎓 4. Öğretici (1. Bölüm) Revizyonu

- *Klasik Nostalji (Öğretici)* adlı 1. bölüm yeniden yapılandırılacak.
- **Yeni Bitiş Mekaniği:** Oyuncu 1. bölümde belirtilen asgari hedef skora ulaştığı **an**, dünya sonsuz olarak ilerlemeyi kesecek, engel doğumu duracak ve oyun ekranı direkt olarak **"Bölüm Tamamlandı (DONE)"** ekranına geçiş yapacaktır. Bu sadece 1. bölüme özgü bir eğitim tamamlama hissiyatı sağlayacaktır.

---

***Gelecek Planları:** İlerleyen süreçte çok özel mekaniklere sahip 10. Bölüm içeriği konuşulup eklenecektir. Toplamda (mevcut eklenenler dahil) 9 bölüm bulunmaktadır.*
