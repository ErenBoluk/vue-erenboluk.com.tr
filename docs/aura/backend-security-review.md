# Mail backend güvenlik incelemesi

**Guncelleme:** Bu rapor duzeltme oncesi kaynak bulgularinin tarihsel kaydidir; satir referanslari onceki surume aittir. Yerel duzeltmeler ve kalan native-runtime/release kontrolleri icin [backend-hardening.md](backend-hardening.md) belgesine bakin. Canli ortam degistirilmedi.

Tarih: 2026-10-19. İncelenen çalışma: `C:\Users\erenb\Desktop\Sandbox\vue-erenboluk.com.tr`.

**Sonuç:** Mevcut endpoint için güçlü bir spam/kaynak tüketimi koruması doğrulanamıyor. Öncelik güvenilir IP/rate-limit modeli ve sunucu tarafı şema/boyut doğrulaması. Bu bir kod incelemesidir; canlı Railway ortamında istismar veya veri ihlali tespit edildiği anlamına gelmez.

## Bulgular

### 1. Yüksek öncelik — Rate-limit kimliği doğrulanmamış X-Forwarded-For değerinden geliyor

Kaynak: `backend-hireme/index.ts:29`, 34–49.

Başlığın tamamı Map anahtarı olarak kullanılıyor. Kaynak testinde aynı başlıkla 200/200/429 alınırken başlık değerini değiştirerek 200/200/200 elde edildi. Başlık yoksa bütün ziyaretçiler `unknown_ip` kovasını paylaşıyor. Bu hem spam korumasını zayıflatabilir hem de meşru ziyaretçileri birlikte engelleyebilir.

**Koşul:** Canlıda atlatılabilirlik, Railway/ön proxy'nin başlığı silme, ekleme veya yeniden yazma davranışına bağlıdır; canlı başlık davranışı test edilmedi. Railway, istemci IP'si için X-Real-IP başlığını belgeliyor; kaynak yalnızca X-Forwarded-For okuyor. [Railway public networking specs](https://docs.railway.com/networking/public-networking/specs-and-limits).

**Düzeltme:** Dağıtım topolojisine göre güvenilen proxy'yi ve tek bir kanonik IP kaynağını belirlemek; key'i doğrulamak; başlık eksik/geçersiz durumunu bilinçli ele almak. Çok instance varsa ortak/atomik TTL'li limit deposu kullanmak. Doğrudan istemci başlığına veya frontend cooldown'una güvenmemek. Gerekirse ölçülen abuse düzeyine göre sunucuda doğrulanan bot challenge eklemek; frontend'e gizli anahtar koymamak.

### 2. Yüksek öncelik — İstek şeması ve boyut sınırları eksik

Kaynak: `backend-hireme/index.ts:52`, 55–57, 78–80.

Yalnızca truthy kontrolü var. Adın nesne, reply_to'nun dizi, mesajın yalnızca boşluk olduğu değerler provider çağrısına ulaşabiliyor. 200KB mesaj da provider payload'una taşındı. Gerçek provider'ın bu girdileri kabul ettiği iddia edilmiyor; uygulama reddetmesi gereken girdiyi üçüncü tarafa bırakıyor.

İçerik türü için uygulama düzeyinde kontrol ve parse öncesinde dar body limiti bulunmuyor. Runtime/proxy'nin kendi limitlerinin sınırsız olduğu iddia edilmiyor.

**Düzeltme:** application/json kontrolü; parse öncesi makul body limiti (örneğin 16KiB); yalnızca nesne payload; trim edilmiş string alanlar; ad/e-posta/mesaj için ayrı uzunluk sınırları; tek geçerli reply-to adresi; konuya giren ad ve e-postada CR/LF/kontrol karakterlerini reddetme. Bozuk JSON 400, aşırı body 413, yanlış içerik türü 415 olmalı. Mevcut `{name,email,message}` frontend sözleşmesini korumak. [Hono Body Limit](https://hono.dev/docs/middleware/builtin/body-limit).

### 3. Orta öncelik — CORS allowlist alan adı sınırını yanlış kontrol ediyor

Kaynak: `backend-hireme/index.ts:14`, özellikle 16.

`https://noterenboluk.com.tr`, sonu erenboluk.com.tr olduğu için allowlist'ten geçiyor. Sadece gerçek origin'leri tam eşleşmeyle kabul etmek gerekir. Localhost yalnızca geliştirme ortamında açılmalı.

Ayrıca CORS bir authentication/spam engeli değildir: handler'da izin verilmeyen Origin için 403 kontrolü yoktur; browser dışı istemciler CORS'a uymaz. Bazı basit cross-origin isteklerde yanıt okunamasa da isteğin yan etkisi gerçekleşebilir. Bu endpoint cookie/session tabanlı bir kullanıcı işlemi değil; klasik hesap-CSRF açığı iddia edilmiyor, kötüye kullanım yüzeyi vurgulanıyor. [Hono CORS](https://hono.dev/docs/middleware/builtin/cors), [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

**Düzeltme:** Kesin origin allowlist, gerekiyorsa handler/middleware seviyesinde Origin reddi ve doğru Content-Type kontrolü. Bunlar tek başına botları durdurmaz; madde 1'deki limitlerle birlikte uygulanmalı.

### 4. Orta öncelik — Rate-limit belleği sınırsız anahtar biriktiriyor; konfigürasyon fail-open

Kaynak: `backend-hireme/index.ts:11`, 31–32, 46–49.

Süresi dolan ve tekrar gelmeyen anahtarlar hiç silinmiyor. Kaynak testinde pencere dolduktan sonra eski kovalar Map'te kaldı. Çok sayıda farklı anahtar belleği büyütebilir; gerçek memory-DoS yük testi yapılmadı.

`RATE_LIMIT_MAX=not-a-number` parseInt sonrası NaN olur; karşılaştırma limit koymaz. Aynı IP ile dört istek de mock provider'a ulaştı. Pencere ayarı için de pozitif/tam sayı doğrulaması yok. Map process-local; restart'ta sıfırlanır ve replikalar arasında paylaşılmaz.

**Düzeltme:** Başlangıçta pozitif, makul tamsayı config doğrulaması; TTL/pruning, boyut tavanı; ölçekleme durumunda atomik ortak depo. Yanıtta standart Retry-After başlığı da kullanılabilir; mevcut retryAfterMs frontend davranışı korunmalı.

### 5. Orta öncelik — Provider hata ayrıntıları dışarı dönüyor; uygulama timeout'u yok

Kaynak: `backend-hireme/index.ts:68`, 84–94.

Resend errorData.message dış istemciye dönen 500 mesajına ekleniyor. Mock provider ayrıntısı yanıtta aynen gözlendi. Bozuk JSON da catch'e düşüp ayrıntılı 500 üretiyor. Bu inceleme anahtarın veya başka bir sırrın bu yolla sızdığını göstermiyor; gereksiz iç hata detayını gösteriyor.

Provider fetch için uygulama kontrollü signal/timeout veya eşzamanlı gönderim bütçesi yok. Yavaş upstream kaynakları uzun süre tutabilir; platformun varsayılan timeout'u uygulama için dar bir sınır değildir. Provider log objeleri de log mahremiyeti açısından daraltılmalı.

**Düzeltme:** Kullanıcıya genel hata, sunucu loguna redakte edilmiş request-id/status; dar AbortSignal timeout'u; gerekiyorsa in-flight/global quota limiti. Provider kabulünden önce kör otomatik retry eklememek; çift mail riskini gözetmek.

### 6. Düşük öncelik — Kullanılmayan eski Nodemailer bağımlılığı

Kaynak: `backend-hireme/package.json:10`, `backend-hireme/bun.lock` nodemailer 6.10.1.

Endpoint Nodemailer import etmiyor; Resend HTTP API kullanıyor. Buna rağmen kilitli 6.10.1 sürümü, addressparser DoS advisory'sinin etkilenen aralığında. Bu handler'dan erişilebilir bir Nodemailer exploit yolu tespit edilmedi; kullanılmayan bağımlılık/supply-chain temizliği olarak ele alınmalı. [Maintainer advisory GHSA-rcmh-qjqh-p98v](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-rcmh-qjqh-p98v).

**Düzeltme:** Kullanılmayan nodemailer/@types bağımlılıklarını kontrollü kaldırıp lockfile'ı güncellemek; gerçekten kullanılacaksa o günkü danışmalarla uygun sürümü seçmek. Bu incelemede bağımlılıklar kurulmadı/güncellenmedi ve tam bir bağımlılık güvenlik taraması yapılmadı.

## Olumlu noktalar ve diğer notlar

- Resend anahtarı backend environment'dan okunuyor; frontend'e API key aktarılmıyor.
- Alıcı server-side RECEIVER_EMAIL; istemci `to`, `from` veya provider URL'sini seçemiyor. Serbest alıcılı bir open relay tespit edilmedi.
- İçerik text olarak gönderiliyor; bu yol için HTML enjeksiyonu iddia edilmiyor. Doğrudan SMTP başlık enjeksiyonu da doğrulanmadı; provider üzerinden JSON kullanılıyor.
- Kontrol edilen `.env.example` anahtar değeri placeholder. İncelenen tracked text dosyalarında kullanılan sınırlı secret-pattern taramasında doğrulanmış gerçek anahtar bulunmadı; tüm Git geçmişi, Railway variable'ları ve gizli dosyalar taranmadı.
- Backend `.gitignore` yalnızca `.env` adını dışlıyor; gelecekteki `.env.production` gibi dosyalar için allowlist'li `.env*` ignore kuralı düşünülmeli. Mevcut gerçek secret dosyası commit edildiği iddia edilmiyor.
- Frontend'in localStorage cooldown'u UX içindir, güvenlik sınırı değildir; istemci tarafından kaldırılabilir. Backend koruması bağımsız olmalı.

## Doğrulama ve kapsam

`node tests/security/hireme-audit.mjs` çalıştırıldı: **8 kaynak düzeyi gözlem yeniden üretildi**. Bunlar güvenlik testleri yeşil, backend güvenli anlamına gelmez; mevcut zayıf davranışları belgeleyen audit probe'larıdır. Çıktı: `docs/aura/review/backend-security/source-probes.json`.

Harness gerçek index.ts kaynak kodunu Node type stripping ile yükler; Hono route kaydı/context, saat, environment ve provider fetch taklit edilir. Provider endpoint'ine ağ çıkışı yok, kullanılan anahtar/addressler sahtedir, gerçek mail sayısı sıfırdır. Gerçek Hono CORS middleware'i, Bun HTTP parser'ı ve Railway edge davranışı bu harness ile test edilmez.

Bun komutu ve backend node_modules bu ortamda bulunmadığından gerçek Bun/Hono integration suite'i veya dependency audit çalıştırılmadı. Paket kurulmadı. Canlı endpoint'e deneme, spam/yük testi, deploy, push veya production environment değişikliği yapılmadı. Backend/uygulama kaynak kodu değiştirilmedi; build gerektiren bir ürün değişikliği yok.

Oluşturulan dosyalar: bu rapor; `tests/security/hireme-audit.mjs`; `docs/aura/review/backend-security/source-probes.json`.
