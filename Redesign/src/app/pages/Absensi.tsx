import React, { useState } from "react";
import { CheckSquare, Clock, Users, ShieldCheck } from "lucide-react";

const filters = [
  { key: "semua", label: "Semua" },
  { key: "dibuka", label: "Dibuka" },
  { key: "segera_tutup", label: "Segera Tutup" },
  { key: "akan_datang", label: "Akan Datang" },
  { key: "riwayat", label: "Riwayat" },
];

const riwayatAbsensi = [
  {
    id: 1,
    course: "SISTEM TERDISTRIBUSI (JAR606A)",
    semester: "Genap 2025/2026",
    pertemuan: "Pertemuan 8",
    date: "Sen, 14 Apr 2026 08.00",
    status: "hadir",
  },
  {
    id: 2,
    course: "METODOLOGI PENELITIAN (IFT602E)",
    semester: "Genap 2025/2026",
    pertemuan: "Pertemuan 7",
    date: "Sel, 15 Apr 2026 10.00",
    status: "hadir",
  },
  {
    id: 3,
    course: "KAPITA SELEKTA (IFT608A)",
    semester: "Genap 2025/2026",
    pertemuan: "Pertemuan 6",
    date: "Rab, 09 Apr 2026 13.00",
    status: "izin",
  },
];

function AbsensiStatusBadge({ status }: { status: string }) {
  if (status === "hadir")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Hadir</span>;
  if (status === "izin")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Izin</span>;
  if (status === "alfa")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Alfa</span>;
  return null;
}

export function AbsensiPage() {
  const [activeFilter, setActiveFilter] = useState("riwayat");

  const showEmpty = activeFilter !== "riwayat";
  const items = activeFilter === "riwayat" ? riwayatAbsensi : [];

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-slate-500 text-xs mb-0.5">Pantau kehadiran kamu</p>
        <h1 className="text-[#0f1e52]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Absensi</h1>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#0f1e52] to-[#1e3a8a] rounded-3xl p-5 mb-5 relative overflow-hidden shadow-xl shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 right-4 w-16 h-16 bg-white/5 rounded-full translate-y-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck size={18} color="white" />
            </div>
            <div>
              <h2 className="text-white" style={{ fontWeight: 700, fontSize: "1rem" }}>Monitoring Absensi</h2>
              <p className="text-white/60 text-xs">Real-time attendance tracking</p>
            </div>
          </div>
          <p className="text-white/70 text-xs leading-relaxed">
            Pantau sesi absensi yang sedang dibuka, akan dibuka, atau hampir ditutup.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/70 text-xs">Dibuka: 0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-white/70 text-xs">Segera tutup: 0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeFilter === key
                ? "bg-[#2356c8] text-white shadow-md shadow-blue-700/30"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {showEmpty ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#e8effc] flex items-center justify-center mx-auto mb-3">
            <CheckSquare size={22} className="text-[#2356c8]" />
          </div>
          <p className="text-slate-700 font-semibold text-sm">Tidak ada absensi</p>
          <p className="text-slate-400 text-xs mt-1">Belum ada sesi absensi untuk filter yang dipilih.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">{item.course}</p>
                  <p className="text-[10px] text-slate-400">{item.semester}</p>
                </div>
                <AbsensiStatusBadge status={item.status} />
              </div>
              <h4 className="text-[#0f1e52] font-semibold mb-1">{item.pertemuan}</h4>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-50">
                <Clock size={11} className="text-slate-400" />
                <span className="text-slate-500 text-xs">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
