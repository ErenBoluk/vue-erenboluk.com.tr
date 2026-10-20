# ASCII hover — kullanım ve doğrulama

Çalışılan proje: `C:\Users\erenb\Desktop\Sandbox\vue-erenboluk.com.tr`.
Geliştirme: http://127.0.0.1:5176/tr
Yerel üretim önizlemesi: http://127.0.0.1:5177/tr

## Değişiklikler

- **İyileştirildi:** `src/components/AsciiHoverBackground.vue`: yalnızca şeffaf Canvas; glyph atlası; düşük çözünürlüklü simülasyon; hover/click/drag; safe-area; görünürlük ve reduced-motion yönetimi.
- **İyileştirildi:** `src/utils/asciiFluid.js`: kullanıcının çözücüsü ve yardımcıları korundu; referans varsayılanları, hızdan türeyen kuvvet/drag artışı, sayısal sınırlar ve güvenli karakter eşlemesi eklendi.
- **Yeni:** `src/utils/asciiVideo.js`: isteğe bağlı video parlaklığı, object-fit/object-position, video-frame callback temizliği, CORS fallback.
- **Değiştirildi:** `src/views/HomeView.vue`: yalnızca mevcut bileşen çağrısına başlık/metin/buton/portre için safe-area yapılandırması eklendi. Kullanıcının diğer Home düzenlemeleri birebir korundu.
- **Genişletildi:** `tests/unit/ascii-fluid.test.mjs`.
- **Yeni:** `tests/unit/ascii-video.test.mjs`.
- **Yeni:** `tests/browser/aura-ascii.cjs`, `aura-ascii-lifecycle.cjs`, `aura-ascii-accessibility.cjs`.
- **Güncellendi:** `docs/superpowers/plans/2026-10-19-ascii-hover.md`.
- **Yeni:** bu belge ve `docs/aura/review/ascii/` inceleme çıktıları.

Kullanıcının başlangıç dosyaları değişiklikten önce `%TEMP%\aura-ascii-user-backup-20261019` içine yedeklendi. Eski Codex worktree'sindeki yarım ASCII çalışması bu dizine kopyalanmadı; kullanıcının Sandbox sürümü temel alındı.

## Kullanım

Kapsayıcı mevcut yerleşimde `position: relative` olmalıdır. Bileşen absolute/inset:0 olduğu için ölçülere katkı yapmaz. Home zaten `home-page-wrapper` içinde bu koşulu sağlıyor.

```vue
<AsciiHoverBackground
  charset="—>o"
  color="var(--aura-muted)"
  :opacity="0.65"
  :char-width="14"
  :fps="30"
  :fluid="{ enabled: true, hoverRadiusPx: 28, densityDissipation: 0.8 }"
  :safe-area="{ enabled: true, selector: 'h1, button, a', fadeSize: 18 }"
  @video-fallback="handleOptionalVideoFallback"
/>
```

`handleOptionalVideoFallback` isteğe bağlıdır; olay taşınmasa da fallback otomatik çalışır. Ek video veya paket gerekli değildir.

Önemli prop'lar: `charset` (varsayılan **—>o**), `color` (mevcut muted token), `opacity` (.65), `charWidth` (14), `fontSize`, `cellHeight`, `cellPadding`, `fps` (30, güvenlik sınırı 1–60), `isVisible`, `safeArea`, `fluid`, `disableHover`, `disableClick`, `disableDrag`, `lumaOverride`, `contrast`, `gamma`, `invertLuma`, `mapping`, `videoSelector`.

`mapping(luma)` kaynakla aynı şekilde bir **karakter indeksi** döndürür; sonuç tam sayıya ve charset sınırlarına çekilir. Charset en fazla 128 Unicode karakteriyle sınırlandırılır.

`fluid`: `enabled`, `resolutionScale`, `velocityDissipation`, `densityDissipation`, `decayMs`, `diffusion`, `iterations`, `forceScale`, `hoverRadiusPx`, `strength`, `project`, `projectIterations`, `splashRangePx`, `splashVelocityScale`, `splashForceScale`, `splashDensity`, `splashRandomness`, `splashThicknessPx`, `splashTravelEasePower`, `splashForceDecayPower`, `splashDensityDecayPower`, `dragBoostScale`, `dragBoostMaxPx`, `dragThresholdPx`. Kaynakta verilen genel varsayılanlar kullanılır; etkileşim için enabled=true. Açık densityDissipation, decayMs'den önceliklidir. Sıfır değerler varsayılanla değiştirilmez.

## Simülasyon ve performans

Sekiz Float32Array alanında iteratif hız diffusion, isteğe bağlı basınç/projection, bilinear örneklemeli semi-Lagrangian advection ve `exp(-dissipation*dt)` sönüm uygulanır. dt en çok .1 saniye. Fare hızı mesafe/zamandan çıkarılır; hızlı yollar ara damgalarla doldurulur. Drag eşiği aşılınca yarıçap ve yoğunluk kontrollü artar. Click, sinüslerle düzensizleştirilen genişleyen bir yoğunluk/hız halkası oluşturur; kalan ömrüne göre gücü azalır.

DPR en çok 2. Simülasyon ayrı/düşük çözünürlüklüdür; en çok 160×100 hücre. Görünür ızgara en çok 220×160 hücreye sınırlandırılır. Karakter atlası yalnızca charset/ölçü/renk değiştiğinde oluşturulur; görünür canvas'ta fillText kullanılmaz. Her çizimde clearRect ile şeffaf temizlenir; arka plan doldurulmaz. Hücrelerde Vue reactivity veya yeni dizi/nesne tahsisi yoktur. Video okuma gerekiyorsa getImageData'nın doğal piksel tamponu tahsisi vardır.

Safe-area alfa değerleri önbelleklidir. En fazla sekiz eşzamanlı click dalgası tutulur. Yoğunluk eşiğin altına indiğinde diziler/canvas temizlenir ve RAF tamamen uyur. Sekme gizli, offscreen, isVisible=false veya reduced-motion durumunda RAF/video callback iptal edilir. Dönüşte uzun dt biriktirilmez; temiz başlangıç yapılır. Unmount observer/listener/callback/tamponları serbest bırakır. Video için requestVideoFrameCallback örneklemeyi kirli işaretler; simülasyon RAF kullanır, böylece duraklatılmış video fare efektini dondurmaz.

## Tasarım ve referans

`C:\Users\erenb\Downloads\kod.js` okunarak diffusion/projection/advection, smoothstep, düzensiz halka, parlaklık eşleme, atlas ve pointer davranışları incelendi. Turbopack paketi kopyalanmadı, çalıştırılmadı, analytics eklenmedi.

Yeni video eklenmedi. Videosuz modda sabit/prosedürel alan **yalnızca karakter seçimi** içindir. Gerçek Codex videosu ve sayfanın dışarıdan verdiği ayarlar olmadığı için birebir aynılık iddia edilmez. Güvenli bölgeler, sınırlı hız/çözünürlük, tamamen sönme ve boşta uyuma bu projeye uyarlamalardır.

Kullanıcının bileşenindeki showBackdrop/gradient seçeneği kaldırıldı: ilk talimattaki şeffaflık şartıyla çelişiyordu. Yeni CSS'te background/background-color/background-image yoktur. Global imleç, portre GSAP animasyonu, sayfa renkleri/yazıları/butonları/navigation değiştirilmedi. Home'un ölçüleri değişiklik öncesi JSON referansıyla aynı; kullanıcı Home dosyasının bileşen çağrısı dışındaki bölümleri yedekle birebir aynı. Diğer kaynak dosyalarına, route/i18n/backend/Railway/dependency dosyalarına dokunulmadı.

## Doğrulama

- `node --test tests/unit/ascii-fluid.test.mjs tests/unit/ascii-video.test.mjs`: **13/13 geçti**. Eklenen kuvvet/sınır/video testleri önce eksik veya yanlış davranışla başarısız gözlendi, ardından geçti.
- `npm run build`: **geçti**, 418 modül, 1.53 s. Bu aşamada tek production build çalıştırıldı. Ayrı typecheck/lint script'i yok; proje JavaScript.
- `aura-ascii.cjs`: hem geliştirme hem üretim önizlemesinde geçti. Boş başlangıç, şeffaflık, aynı layout, hover, tamamen sönme, click, drag, canlı reduced-motion, butonla rota geçişi, tekrar mount, mobil ve runtime hataları kontrol edildi.
- `aura-ascii-lifecycle.cjs`: geçti. Vite üzerinden izole fixture kullanır; boşta sıfır RAF, görünür canvas'ta sıfır fillText, isVisible, gizli-sekme olayının emülasyonu, gerçek IntersectionObserver offscreen geçişi, resize, canlı renk/charset, safe-area, gerçek captureStream video kareleri, emüle SecurityError/CORS fallback, sıfır/disabled seçenekleri ve unmount sonrası sıfır listener/RAF doğrulandı. CDP dokunma hareketiyle mobil iç scroll bölgesinin kaydığı doğrulandı.
- `aura-ascii-accessibility.cjs`: üretimde 390/1440px **2 axe taraması, 0 ihlal**; DPR=3 ekran emülasyonunda canvas DPR en çok 2.
- Mevcut `aura-regression.cjs all`: **12/12 geçti**, gerçek mail yerine ağ mock'ları kullanıldı.
- Mevcut `aura-sitewide.cjs`: portfolyo modları/filtreler/dialog, tekrar route geçişleri, mobil drawer ve sekiz TR/EN metadata/deep-route kontrolleri geçti.
- `git diff --check`: geçti; yalnızca çalışma kopyasına ait CRLF dönüşüm uyarıları vardı.

Ekran görüntüleri: `review/ascii/hover-desktop.png`, `click-desktop.png`, `mobile-reduced.png`. `before.png` kullanıcının gradient içeren başlangıç sürümüdür; güncel sonuç değildir. `layout-before.json` ölçü referansı; `accessibility.json` iki axe sonucudur.

Sınırlar: Chromium otomasyonu kullanıldı; fiziksel telefon, Safari/Firefox veya screen reader testi yapılmadı. Hedef 30 FPS'tir; cihazlar arası sabit FPS garantisi verilmez. CORS hata yolu kontrollü SecurityError ile test edildi, harici üçüncü taraf video indirilmedi. Production preview yereldir; push/deploy/commit yapılmadı.

## Görünürlük düzeltmesi

Kullanıcı 5177 önizlemesinde efekt göremediğini bildirdi. Başlık/metin bloklarının tüm sütun genişliğini maskelemesi boş alanı da kapatıyordu. Başlık yanındaki yerel Canvas bölgesini ölçen regresyon testi bu hatayla önce başarısız oldu. `safeArea.textSelector` eklenerek bu elemanlarda TreeWalker/Range ile yalnızca gerçek metin parçalarının dikdörtgenleri korunuyor. Buton, bağlantı ve portre blok koruması sürüyor; geçiş mesafesi Home için 10px. Yerleşim ve renkler değiştirilmedi.

Düzeltmeden sonra ASCII entegrasyon ve lifecycle/video/touch testleri geçti. Yeni production build 418 modülle 1.41 saniyede geçti; 5177 üretim önizlemesi güncellendi. Aynı 5177 adresinde başlık yanındaki boş alanda görünür pikseller ölçüldü. `review/ascii/hover-title-fixed.png` düzeltme sonrası görüntüdür.

## Buton çevresi ve cursor düzenlemesi

Kullanıcı isteğiyle Home'da tüm `.hero-actions` satırı yerine yalnızca gerçek `.aura-button` elemanları korunuyor; böylece satırın sağındaki boş alan kesilmiyor. Route-strip maskesi de tüm satır yerine bağlantı metinlerine daraltıldı. Gerçek butonların renkleri/arka planları değiştirilmedi.

`src/App.vue` Home rotasında `Cursor` bileşenini mount etmiyor; diğer rotalarda aynı cursor sürüyor. Home'a dönüşte GSAP/listener cleanup mevcut Cursor unmount işlemiyle gerçekleşiyor. Native mouse pointer korunuyor.

Yeni `tests/browser/aura-ascii-controls.cjs`: önce iki davranışta başarısız oldu; düzeltmeden sonra hem 5176 hem 5177'de geçti. Home'da halka yok, buton yanındaki boşlukta ASCII var, hire bağlantısı çalışıyor, diğer rotada halka geri geliyor ve Home'a dönüşte kaldırılıyor. `tests/browser/aura-regression.cjs` global cursor testinin rotası artık `/en/about`; Home'da cursor olmaması yeni beklenen davranıştır. Motion grubu geçti. Production build 418 modül/1.52s ile geçti. `git diff --check` geçti (yalnızca CRLF bildirimleri). Ekran görüntüsü: `review/ascii/button-row-fixed.png`.

## Son görsel ayarlar ve kenar kapsamı

Home entegrasyonunda `fontSize=15`, `fluid.hoverRadiusPx=24`, `fluid.densityDissipation=1.4` kullanılıyor. Kaynak varsayılanı 0.8 olan sönüme göre eşit yoğunluktaki izler daha kısa sürede kaybolur; charset veya sayfa fontları değiştirilmez.

`fullWidth` prop'u yalnızca Canvas katmanını kapsayıcının ortasından 100vw genişliğine taşır; mevcut hero/grid/padding değişmez. Üst sınır hero'nun başlangıcında kalır, menüye taşmaz. Opsiyonel video örnekleyicisi video aramasını eski kapsayıcıdan yaparken çizim sınırları için ayrı viewport elemanı kabul eder.

Yeni `tests/browser/aura-ascii-edges.cjs`, değişiklikten önce kenar kapsamı kontrolünde başarısız oldu. Düzeltmeden sonra 390/1440/1920px ekranlarda iki kenarda ASCII pikselleri, menünün kapsam dışında kalması ve yatay overflow olmaması doğrulandı. Lifecycle/video/touch testi tekrar geçti.

Bu ayarlarda değişen kaynaklar: `src/views/HomeView.vue`, `src/components/AsciiHoverBackground.vue`, `src/utils/asciiVideo.js`. Ek olarak kenar testi ve bu belge eklendi/güncellendi.
