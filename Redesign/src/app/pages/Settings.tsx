import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  User, Bell, Clock, Moon, LogOut, ChevronRight,
  Shield, Wifi, RefreshCw, Info
} from "lucide-react";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
        value ? "bg-[#2356c8]" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
          value ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    tugasBaru: true,
    deadlineH1: true,
    deadlineHariH: true,
    absensi: true,
  });
  const [polling, setPolling] = useState(15);
  const [dndStart, setDndStart] = useState("22:00");
  const [dndEnd, setDndEnd] = useState("07:00");

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notifItems = [
    { key: "tugasBaru" as const, label: "Tugas Baru", description: "Notifikasi saat ada tugas baru" },
    { key: "deadlineH1" as const, label: "Deadline H-1", description: "Ingatkan sehari sebelum deadline" },
    { key: "deadlineHariH" as const, label: "Deadline Hari H", description: "Ingatkan di hari deadline" },
    { key: "absensi" as const, label: "Absensi (dibuka & segera ditutup)", description: "Notifikasi sesi absensi" },
  ];

  const pollingOptions = [15, 30, 60];

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-slate-500 text-xs mb-0.5">Konfigurasi aplikasi</p>
        <h1 className="text-[#0f1e52]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#0f1e52] to-[#2356c8] rounded-3xl p-5 mb-5 relative overflow-hidden shadow-xl shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <User size={22} color="white" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Akun SUNAN Aktif</p>
              <h2 className="text-white" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                MUHAMMAD ZAHIRUL KHABSI
              </h2>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-white/50 text-[10px]">NIM</p>
              <p className="text-white text-xs font-semibold">202351207</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">Username</p>
              <p className="text-white text-xs font-semibold">202351207</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">Sumber</p>
              <p className="text-white text-xs font-semibold">SUNAN API</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5">
        <Info size={15} className="text-[#2356c8] mt-0.5 shrink-0" />
        <p className="text-[#2356c8] text-xs leading-relaxed">
          Jika data tidak sesuai akunmu, logout SUNAN lalu login ulang dengan NIM yang benar.
        </p>
      </div>

      {/* Jenis Notifikasi */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-[#e8effc] flex items-center justify-center">
            <Bell size={14} className="text-[#2356c8]" />
          </div>
          <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>Jenis Notifikasi</h3>
        </div>
        <div className="flex flex-col gap-0">
          {notifItems.map(({ key, label, description }, idx) => (
            <div key={key}>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-700 text-sm font-medium">{label}</p>
                  <p className="text-slate-400 text-xs">{description}</p>
                </div>
                <Toggle value={notifications[key]} onChange={() => toggleNotif(key)} />
              </div>
              {idx < notifItems.length - 1 && <div className="h-px bg-slate-50" />}
            </div>
          ))}
        </div>
      </div>

      {/* Interval Polling */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-[#e8effc] flex items-center justify-center">
            <RefreshCw size={14} className="text-[#2356c8]" />
          </div>
          <div>
            <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>Interval Polling</h3>
            <p className="text-slate-400 text-xs">Seberapa sering app mengecek data baru</p>
          </div>
        </div>
        <div className="flex gap-2">
          {pollingOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setPolling(opt)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                polling === opt
                  ? "bg-[#2356c8] text-white shadow-md shadow-blue-700/20"
                  : "bg-[#f0f4fb] text-slate-600"
              }`}
            >
              {opt} menit
            </button>
          ))}
        </div>
      </div>

      {/* Jam Diam */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-[#e8effc] flex items-center justify-center">
            <Moon size={14} className="text-[#2356c8]" />
          </div>
          <div>
            <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>Jam Diam (Do Not Disturb)</h3>
            <p className="text-slate-400 text-xs">Tidak ada notifikasi pada jam ini</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-500 text-xs font-medium mb-1.5">Mulai</label>
            <input
              type="time"
              value={dndStart}
              onChange={e => setDndStart(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#f0f4fb] text-[#0f1e52] text-sm outline-none focus:ring-2 focus:ring-[#2356c8] transition-all"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-medium mb-1.5">Selesai</label>
            <input
              type="time"
              value={dndEnd}
              onChange={e => setDndEnd(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#f0f4fb] text-[#0f1e52] text-sm outline-none focus:ring-2 focus:ring-[#2356c8] transition-all"
            />
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-[#e8effc] flex items-center justify-center">
            <Shield size={14} className="text-[#2356c8]" />
          </div>
          <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>Tentang Aplikasi</h3>
        </div>
        <div className="flex flex-col gap-0">
          {[
            { label: "Versi Aplikasi", value: "2.1.0" },
            { label: "Environment", value: "Production" },
            { label: "Server Status", value: "Online" },
          ].map(({ label, value }, idx, arr) => (
            <div key={label}>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500 text-sm">{label}</span>
                <span className={`text-sm font-medium ${value === "Online" ? "text-emerald-600" : "text-[#0f1e52]"}`}>{value}</span>
              </div>
              {idx < arr.length - 1 && <div className="h-px bg-slate-50" />}
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => navigate("/login")}
        className="w-full py-4 bg-white rounded-2xl shadow-sm flex items-center justify-center gap-2 text-red-500 font-semibold text-sm active:scale-[0.99] transition-transform"
      >
        <LogOut size={17} />
        Logout SUNAN
      </button>

      <p className="text-center text-slate-400 text-xs mt-4">
        © 2026 SUNAN Notifier · UMK
      </p>
    </div>
  );
}
