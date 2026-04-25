import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Dot } from "lucide-react";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];
const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

const taskEvents: Record<string, { title: string; course: string; type: string; time: string; status: string }[]> = {
  "2026-04-08": [
    { title: "Discussion", course: "PENGEMBANGAN SISTEM INFORMASI (IFT604E)", type: "Tugas", time: "11.00", status: "sudah_submit" },
  ],
  "2026-04-12": [
    { title: "Submit Tugas 1", course: "KAPITA SELEKTA (IFT608A)", type: "Tugas", time: "13.00", status: "sudah_submit" },
  ],
  "2026-04-17": [
    { title: "Tugas Project 1", course: "PENGEMBANGAN SISTEM INFORMASI (IFT604E)", type: "Tugas", time: "13.00", status: "terlambat" },
  ],
  "2026-04-21": [
    { title: "UTS", course: "METODOLOGI PENELITIAN (IFT602E)", type: "Quiz", time: "09.40", status: "sudah_submit" },
  ],
  "2026-04-26": [
    { title: "Implementasi Naive Bayes", course: "KECERDASAN BUATAN (IFT605A)", type: "Tugas", time: "13.00", status: "belum" },
  ],
  "2026-04-30": [
    { title: "Laporan Praktikum #3", course: "REKAYASA PERANGKAT LUNAK (IFT601A)", type: "Tugas", time: "23.59", status: "belum" },
  ],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function StatusBadge({ status }: { status: string }) {
  if (status === "sudah_submit")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Sudah Submit</span>;
  if (status === "terlambat")
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Terlambat</span>;
  return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Belum</span>;
}

export function KalenderPage() {
  const today = new Date(2026, 3, 22); // April 22, 2026
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(1);
  };

  const selectedKey = `${year}-${pad(month + 1)}-${pad(selectedDay)}`;
  const selectedEvents = taskEvents[selectedKey] || [];

  // Mark dates with events
  const eventDates = new Set(Object.keys(taskEvents).map(k => {
    const [y, m, d] = k.split("-");
    if (parseInt(y) === year && parseInt(m) === month + 1) return parseInt(d);
    return null;
  }).filter(Boolean));

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-slate-500 text-xs mb-0.5">Jadwal & Deadline</p>
        <h1 className="text-[#0f1e52]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Kalender</h1>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-xl bg-[#f0f4fb] flex items-center justify-center"
          >
            <ChevronLeft size={16} className="text-[#2356c8]" />
          </button>
          <h3 className="text-[#0f1e52]" style={{ fontWeight: 700, fontSize: "1rem" }}>
            {MONTHS[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-xl bg-[#f0f4fb] flex items-center justify-center"
          >
            <ChevronRight size={16} className="text-[#2356c8]" />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const isSelected = day === selectedDay;
            const hasEvent = eventDates.has(day);
            const isTodayDay = isToday(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col items-center justify-center h-9 w-full rounded-xl text-sm transition-all ${
                  isSelected
                    ? "bg-[#2356c8] text-white shadow-md shadow-blue-700/30"
                    : isTodayDay
                    ? "bg-[#e8effc] text-[#2356c8]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span style={{ fontWeight: isSelected || isTodayDay ? 700 : 400, fontSize: "0.8rem" }}>{day}</span>
                {hasEvent && !isSelected && (
                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isTodayDay ? "bg-[#2356c8]" : "bg-[#2356c8]"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#0f1e52]" style={{ fontWeight: 600 }}>
            Deadline pada {year}-{pad(month + 1)}-{pad(selectedDay)}
          </h3>
        </div>
        {selectedEvents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {selectedEvents.map((ev, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">{ev.course}</p>
                  </div>
                  <StatusBadge status={ev.status} />
                </div>
                <h4 className="text-[#0f1e52] font-semibold mb-1">{ev.title}</h4>
                <p className="text-[#2356c8] text-xs font-medium">{ev.type}</p>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-50">
                  <Clock size={11} className="text-slate-400" />
                  <span className="text-slate-500 text-xs">Deadline</span>
                  <span className="text-slate-700 text-xs font-semibold ml-auto">
                    {DAYS[new Date(year, month, selectedDay).getDay()]}, {selectedDay} {MONTHS[month].slice(0,3)} {year} {ev.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-slate-700 font-semibold text-sm">Tidak ada deadline</p>
            <p className="text-slate-400 text-xs mt-0.5">Tidak ada tugas yang jatuh tempo pada tanggal ini.</p>
          </div>
        )}
      </div>

      {/* Event Kalender SUNAN */}
      <div>
        <h3 className="text-[#0f1e52] mb-3" style={{ fontWeight: 600 }}>Event Kalender SUNAN</h3>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-slate-700 font-semibold text-sm">Tidak ada event</p>
          <p className="text-slate-400 text-xs mt-0.5">Kalender Moodle tidak memiliki event pada tanggal ini.</p>
        </div>
      </div>
    </div>
  );
}
