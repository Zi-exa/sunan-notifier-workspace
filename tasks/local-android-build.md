# Build Android Lokal Tanpa EAS Cloud

Panduan ini untuk build aplikasi Android langsung di mesin Windows sendiri, tanpa memakai kuota EAS Build cloud.

## Prasyarat

- Android Studio terpasang
- Android SDK, Build-Tools, dan Platform-Tools terpasang
- `java` dan `keytool` tersedia di `PATH`
- `adb` tersedia di `PATH`
- Dependency project sudah terpasang dengan `npm install`

Verifikasi cepat:

```powershell
java -version
keytool -help
adb version
```

Jika salah satu command di atas tidak ditemukan, selesaikan setup Android Studio/JDK dulu sebelum build.

## Jalur Tercepat: APK Internal Yang Bisa Langsung Di-install

Jalur ini paling cocok untuk testing di HP Android tanpa Expo Go.

1. Masuk ke folder mobile:

```powershell
cd D:\Belajar\sunan notifier\mobile
```

2. Generate native Android dengan package `preview`:

```powershell
npm run prebuild:android:preview
```

3. Build APK release lokal:

```powershell
npm run build:local:apk
```

4. Hasil APK ada di:

```text
mobile\android\app\build\outputs\apk\release\app-release.apk
```

5. Install ke device:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

## Kenapa Jalur APK Ini Bisa Langsung Dipakai

Template Android hasil `expo prebuild` pada project ini saat ini masih menandatangani `release` dengan debug keystore bawaan Gradle. Itu cukup untuk APK internal/testing yang di-install manual ke device.

Artinya, untuk kebutuhan:

- tes di HP sendiri
- kirim APK ke tester internal
- menghindari Expo Go

jalur `prebuild:android:preview` + `build:local:apk` sudah cukup.

## Jalur Production AAB Lokal

Kalau nanti targetnya Play Store:

1. Generate native Android untuk package production:

```powershell
npm run prebuild:android:production
```

2. Ganti signing `release` dari debug ke upload keystore milik sendiri

3. Build App Bundle:

```powershell
npm run build:local:aab
```

Output:

```text
mobile\android\app\build\outputs\bundle\release\app-release.aab
```

Catatan penting:

- `npm run prebuild:android:preview` memakai package `id.umk.sunannotifier.preview`
- `npm run prebuild:android:production` memakai package `id.umk.sunannotifier`
- Script `prebuild:*:clean` akan regenerate folder `android`, jadi perubahan native manual seperti signing release perlu diterapkan lagi setelah clean prebuild

## Script Yang Tersedia

Di `mobile/package.json` sekarang tersedia:

- `npm run prebuild:android`
- `npm run prebuild:android:clean`
- `npm run prebuild:android:preview`
- `npm run prebuild:android:production`
- `npm run build:local:apk`
- `npm run build:local:aab`

## Referensi Resmi Expo

- Create a release build locally: https://docs.expo.dev/guides/local-app-production/
- Run EAS Build locally with `--local`: https://docs.expo.dev/build-reference/local-builds/
- Continuous Native Generation / prebuild: https://docs.expo.dev/workflow/prebuild/
