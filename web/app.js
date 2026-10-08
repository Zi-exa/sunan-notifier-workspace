// Konfigurasi rilis — ganti kalau repo pindah.
var RELEASE_OWNER = "Zi-exa";
var RELEASE_REPO = "sunan-notifier-releases";
var ASSET_NAME = "app-release.apk";
var FALLBACK_TAG = "v1.1.0";
var FALLBACK_URL =
  "https://github.com/" + RELEASE_OWNER + "/" + RELEASE_REPO +
  "/releases/download/" + FALLBACK_TAG + "/" + ASSET_NAME;

function formatMB(bytes) {
  if (!bytes) return "~80 MB";
  return "~" + Math.max(1, Math.round(bytes / 1024 / 1024)) + " MB";
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  } catch (e) { return ""; }
}

function setDownloads(url) {
  ["dlBtnHero", "dlBtnBottom", "dlBtnHeader"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = url;
  });
}

async function loadLatest() {
  var status = document.getElementById("statusText");
  try {
    var res = await fetch(
      "https://api.github.com/repos/" + RELEASE_OWNER + "/" + RELEASE_REPO + "/releases/latest",
      { headers: { "Accept": "application/vnd.github+json" } }
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    var data = await res.json();
    var tag = data.tag_name || FALLBACK_TAG;
    var asset = (data.assets || []).find(function (a) { return a.name === ASSET_NAME; });
    var url = (asset && asset.browser_download_url) || FALLBACK_URL;
    var date = formatDate(asset ? asset.updated_at : data.published_at);

    setDownloads(url);
    var verBadge = document.getElementById("verBadge");
    if (verBadge) verBadge.textContent = tag;
    var verText = document.getElementById("verText");
    if (verText) verText.textContent = "Versi " + tag;
    var verText2 = document.getElementById("verText2");
    if (verText2) verText2.textContent = tag;
    var sizeText = document.getElementById("sizeText");
    if (sizeText) sizeText.textContent = formatMB(asset ? asset.size : 0);
    var dateText = document.getElementById("dateText");
    if (dateText) dateText.textContent = date ? "Update " + date + " • Android 8+" : "Android 8+";
    var note = document.getElementById("releaseNote");
    if (note) note.textContent = (date ? "Dirilis " + date + ". " : "") + "Klik tombol untuk download dan install.";
    if (status) status.textContent = "Versi terbaru sudah siap. Tinggal klik download.";
  } catch (e) {
    setDownloads(FALLBACK_URL);
    if (status) status.textContent = "Gagal cek versi otomatis, memakai link versi " + FALLBACK_TAG + ". Tetap aman diklik.";
  }
}

// QR menuju URL halaman ini (biar bisa di-scan dari HP)
function renderQR() {
  var img = document.getElementById("qrImg");
  if (!img) return;
  img.src = "https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=" +
    encodeURIComponent(window.location.href);
}

async function loadChangelog() {
  var box = document.getElementById("changelog");
  if (!box) return;
  function item(tag, date, body, url) {
    var div = document.createElement("div");
    div.className = "log-item";
    var head = document.createElement("div");
    head.className = "log-head";
    var info = document.createElement("div");
    info.className = "log-info";
    var strong = document.createElement("strong");
    strong.textContent = tag;
    var span = document.createElement("span");
    span.textContent = date;
    info.appendChild(strong);
    info.appendChild(span);
    head.appendChild(info);
    if (url) {
      var a = document.createElement("a");
      a.className = "btn btn-primary btn-sm";
      a.href = url;
      a.textContent = "\u2B07 Download";
      head.appendChild(a);
    }
    div.appendChild(head);
    if (body) {
      var p = document.createElement("p");
      p.textContent = body;
      div.appendChild(p);
    }
    return div;
  }
  try {
    var res = await fetch(
      "https://api.github.com/repos/" + RELEASE_OWNER + "/" + RELEASE_REPO + "/releases?per_page=10",
      { headers: { "Accept": "application/vnd.github+json" } }
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    var data = await res.json();
    box.textContent = "";
    if (!data.length) throw new Error("empty");
    data.forEach(function (r) {
      var asset = (r.assets || []).find(function (a) { return a.name === ASSET_NAME; });
      box.appendChild(item(
        r.tag_name || FALLBACK_TAG,
        formatDate(r.published_at) || "",
        (r.body || "").trim(),
        (asset && asset.browser_download_url) || null
      ));
    });
  } catch (e) {
    box.textContent = "";
    box.appendChild(item(FALLBACK_TAG, "", "", FALLBACK_URL));
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
renderQR();
loadLatest();
loadChangelog();

// Mode gelap/terang seluruh web (tersimpan di HP)
var themeBtn = document.getElementById("themeBtn");
function setTheme(dark) {
  document.body.classList.toggle("dark", dark);
  if (themeBtn) {
    themeBtn.textContent = dark ? "\u2600" : "\ud83c\udf19";
    themeBtn.setAttribute("aria-label", dark ? "Mode terang" : "Mode gelap");
  }
  try { localStorage.setItem("sunan-theme", dark ? "dark" : "light"); } catch (e) {}
}
if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    setTheme(!document.body.classList.contains("dark"));
  });
}
(function () {
  var saved = null;
  try { saved = localStorage.getItem("sunan-theme"); } catch (e) {}
  setTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
})();

