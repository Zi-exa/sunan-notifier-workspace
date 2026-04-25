import React, { useState } from "react";
import { Clock, Search, SlidersHorizontal } from "lucide-react";

const allTasks = [
  {
    id: 1,
    course: "SISTEM TERDISTRIBUSI (JAR606A)",
    semester: "Genap 2025/2026",
    title: "Aktifitas Partisipatif #1",
    type: "Tugas",
    description: "",
    deadline: "Sen, 09 Mar 2026 13.00",
    status: "terlambat",
  },
  {
    id: 2,
    course: "PENGEMBANGAN SISTEM INFORMASI (IFT604E)",
    semester: "Genap 2025/2026",
    title: "Discussion",
    type: "Tugas",
    description: "Discussion, save dalam pdf : NIM_Nama",
    deadline: "Rab, 08 Apr 2026 11.00",
    status: "sudah_submit",
  },
  {
    id: 3,
    course: "KAPITA SELEKTA (IFT608A)",
    semester: "Genap 2025/2026",
    title: "Submit Tugas 1",
    type: "Tugas",
    description: "Silahkan upload paper/artikel yang sudah anda cari sesuai dengan kriteria :...",
    deadline: "Min, 12 Apr 2026 13.00",
    status: "sudah_submit",
  },
  {
    id: 4,
    course: "PENGEMBANGAN SISTEM INFORMASI (IFT604E)",
    semester: "Genap 2025/2026",
    title: "Tugas Project 1",
    type: "Tugas",
    description: "Tugas Project 1",
    deadline: "Jum, 17 Apr 2026 13.00",
    status: "terlambat",
  },
  {
    id: 5,
    course: "METODOLOGI PENELITIAN (IFT602E)",
    semester: "Genap 2025/2026",
    title: "UTS",
    type: "Quiz",
    description: "soal UTS 10, waktu pengerjaan 10 menit...",
    deadline: "Sel, 21 Apr 2026 09.40",
    status: "sudah_submit",
  },
  {
    id: 6,
    course: "REKAYASA PERANGKAT LUNAK (IFT601A)",
    semester: "Genap 2025/2026",
    title: "Laporan Praktikum #3",
    type: "Tugas",
    description: "Upload laporan praktikum dalam format PDF",
    deadline: "Kam, 30 Apr 2026 23.59",
    status: "belum",
  },
  {
    id: 7,
    course: "KECERDASAN BUATAN (IFT605A)",
    semester: "Genap 2025/2026",
    title: "Implementasi Naive Bayes",
    type: "Tugas",
    description: "Implementasikan algoritma Naive Bayes pada dataset yang telah disediakan",
    deadline: "Min, 26 Apr 2026 13.00",
    status: "belum",
  },
];

const filters = [
  { key: "semua", label: "Semua" },
  { key: "belum", label: "Belum Dikerjakan" },
  { key: "sudah_submit", label: "Sudah Submit" },
  { key: "terlambat", label: "Terlambat" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "sudah_submit")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">Sudah Submit</span>;
  if (status === "terlambat")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">Terlambat</span>;
  return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">Belum</span>;
}

export function TugasPage() {
  const [activeFilter, setActiveFilter] = useState("semua");

  const filtered = allTasks.filter((t) => {
    if (activeFilter === "semua") return true;
    if (activeFilter === "belum") return t.status === "belum";
    return t.status === activeFilter;
  });

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-slate-500 text-xs mb-0.5">Semester Genap 2025/2026</p>
          <h1 className="text-[#0f1e52]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Tugas</h1>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <SlidersHorizontal size={18} className="text-slate-500" />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl flex items-center gap-3 px-4 py-3 mb-4 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Cari tugas..."
          className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
        />
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

      {/* Count */}
      <p className="text-slate-400 text-xs mb-3">{filtered.length} tugas ditemukan</p>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {filtered.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                  {task.course}
                </p>
                <p className="text-[10px] text-slate-400">{task.semester}</p>
              </div>
              <StatusBadge status={task.status} />
            </div>
            <h4 className="text-[#0f1e52] mb-1" style={{ fontWeight: 600, fontSize: "1rem" }}>{task.title}</h4>
            <p className="text-[#2356c8] text-xs font-semibold">{task.type}</p>
            {task.description && (
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
              <Clock size={11} className="text-slate-400" />
              <span className="text-slate-400 text-xs">Deadline</span>
              <span className="text-slate-700 text-xs font-semibold ml-auto">{task.deadline}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#e8effc] flex items-center justify-center mx-auto mb-3">
            <Clock size={22} className="text-[#2356c8]" />
          </div>
          <p className="text-slate-700 font-semibold text-sm">Tidak ada tugas</p>
          <p className="text-slate-400 text-xs mt-1">Tidak ada tugas untuk filter yang dipilih.</p>
        </div>
      )}
    </div>
  );
}
