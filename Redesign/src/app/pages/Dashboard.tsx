import React from "react";
import { useNavigate } from "react-router";
import {
  BellRing, BookOpen, ClipboardX, CheckCircle2, AlertCircle,
  Clock, ChevronRight, Wifi, TrendingUp
} from "lucide-react";

const tasks = [
  {
    id: 1,
    course: "SISTEM TERDISTRIBUSI (JAR606A)",
    semester: "Genap 2025/2026",
    title: "Aktifitas Partisipatif #1",
    type: "Tugas",
    deadline: "Sen, 09 Mar 2026 13.00",
    status: "terlambat",
  },
  {
    id: 2,
    course: "PENGEMBANGAN SISTEM INFORMASI (IFT604E)",
    semester: "Genap 2025/2026",
    title: "Discussion",
    type: "Tugas",
    deadline: "Rab, 08 Apr 2026 11.00",
    status: "sudah_submit",
  },
  {
    id: 3,
    course: "KAPITA SELEKTA (IFT608A)",
    semester: "Genap 2025/2026",
    title: "Submit Tugas 1",
    type: "Tugas",
    deadline: "Min, 12 Apr 2026 13.00",
    status: "sudah_submit",
  },
  {
    id: 4,
    course: "METODOLOGI PENELITIAN (IFT602E)",
    semester: "Genap 2025/2026",
    title: "UTS",
    type: "Quiz",
    deadline: "Sel, 21 Apr 2026 09.40",
    status: "sudah_submit",
  },
];

const stats = [
  { label: "Matkul Aktif", value: "8", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
  { label: "Belum Dikerjakan", value: "5", icon: ClipboardX, color: "bg-amber-50 text-amber-600" },
  { label: "Overdue", value: "2", icon: AlertCircle, color: "bg-red-50 text-red-600" },
  { label: "Sudah Submit", value: "4", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "sudah_submit")
    return (
      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
        Sudah Submit
      </span>
    );
  if (status === "terlambat")
    return (
      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
        Terlambat
      </span>
    );
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
      Belum
    </span>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-slate-500 text-xs mb-0.5">Selamat datang 👋</p>
          <h1 className="text-[#0f1e52]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#e8effc] flex items-center justify-center">
          <BellRing size={18} className="text-[#2356c8]" />
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#0f1e52] to-[#2356c8] rounded-3xl p-5 mb-5 relative overflow-hidden shadow-xl shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full translate-y-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/70 text-xs font-medium">202351207 · MUHAMMAD ZAHIRUL KHABSI</span>
          </div>
          <h2 className="text-white mb-1" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            SUNAN Notifier Aktif
          </h2>
          <p className="text-white/70 text-xs leading-relaxed">
            Notifikasi tugas dan absensi akan dipantau otomatis sesuai pengaturanmu.
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <Wifi size={12} className="text-white/50" />
            <span className="text-white/50 text-[10px]">Terhubung ke SUNAN API</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-slate-500 text-xs mb-0.5">{label}</p>
            <p className="text-[#0f1e52]" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Absensi Aktif */}
      <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>Absensi Aktif</h3>
          <span className="text-xs text-slate-500">Sedang dibuka: 0 | Segera tutup: 0</span>
        </div>
        <div className="bg-[#f0f4fb] rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#e8effc] flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={20} className="text-[#2356c8]" />
          </div>
          <p className="text-slate-700 text-sm font-medium">Belum ada absensi aktif</p>
          <p className="text-slate-400 text-xs mt-0.5">Saat ini tidak ada sesi absensi yang dibuka atau akan dibuka.</p>
        </div>
      </div>

      {/* Deadline Terdekat */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>Deadline Terdekat</h3>
            <p className="text-slate-400 text-xs">4 tugas paling dekat</p>
          </div>
          <button
            onClick={() => navigate("/tugas")}
            className="flex items-center gap-1 text-[#2356c8] text-xs font-medium"
          >
            Lihat semua <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-[10px] text-slate-400 font-medium leading-tight flex-1">
                  {task.course} · {task.semester}
                </p>
                <StatusBadge status={task.status} />
              </div>
              <h4 className="text-[#0f1e52] mb-1" style={{ fontWeight: 600 }}>{task.title}</h4>
              <p className="text-[#2356c8] text-xs font-medium">{task.type}</p>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-50">
                <Clock size={11} className="text-slate-400" />
                <span className="text-slate-500 text-xs">Deadline</span>
                <span className="text-slate-700 text-xs font-medium ml-auto">{task.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
