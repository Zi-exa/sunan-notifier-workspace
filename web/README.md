# SUNAN Notifier — Web Download Center

Landing page statis buat orang awam: 1 tombol download APK, panduan install bergambar,
FAQ, dan deteksi versi otomatis dari GitHub Releases.

Tanpa build, tanpa framework. Cukup file statis → bisa di-host gratis di mana aja.

## Isi folder

```text
web/
├── index.html   # halaman utama (Bahasa Indonesia)
├── styles.css   # styling, mobile-first
├── app.js       # fetch versi terbaru dari GitHub API + QR
└── README.md    # file ini
```

Tombol download otomatis mengambil rilis terbaru dari:

`https://api.github.com/repos/Zi-exa/sunan-notifier-releases/releases/latest`

mencari asset bernama `app-release.apk`. Kalau API gagal (offline/rate-limit),
otomatis fallback ke `v1.0.1`.

## Coba lokal

```powershell
cd "D:\Belajar\sunan notifier\web"
npx serve .
# atau: python -m http.server 8080
```

Buka `http://localhost:3000` atau `http://localhost:8080`.

## Deploy gratis — Cloudflare Pages (disarankan)

1. Push folder ini ke GitHub (misal sebagai folder `web/` di repo workspace,
   atau repo sendiri).
2. Buka https://dash.cloudflare.com → Pages → Create → Connect to Git.
3. Pilih repo → Framework preset: **None** → Build command: kosong →
   Output directory: `web` (kalau deploy dari workspace) atau `/` (kalau repo khusus web).
4. Deploy. Jadi `https://sunan-notifier.pages.dev`.

## Alternatif gratis

**Vercel:**

1. Import repo di https://vercel.com → Framework: Other → Output: `web`.
2. Jadi `https://sunan-notifier.vercel.app`.

**GitHub Pages (aktif ✅):**

Deploy otomatis via `.github/workflows/pages.yml` setiap ada push ke folder `web/`.
Jadi `https://zi-exa.github.io/sunan-notifier-workspace/`.

**Netlify Drop (paling cepat coba-coba):**

1. Buka https://app.netlify.com/drop → drag folder `web/` → langsung dapat link.

## Ganti versi / repo

Edit atas file `web/app.js`:

```js
var RELEASE_OWNER = "Zi-exa";
var RELEASE_REPO = "sunan-notifier-releases";
var ASSET_NAME = "app-release.apk";
var FALLBACK_TAG = "v1.0.1";
```
