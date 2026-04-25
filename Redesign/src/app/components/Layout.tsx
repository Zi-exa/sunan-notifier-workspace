import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Home, ClipboardList, CheckSquare, Calendar, Settings } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/tugas", label: "Tugas", icon: ClipboardList },
  { path: "/absensi", label: "Absensi", icon: CheckSquare },
  { path: "/kalender", label: "Kalender", icon: Calendar },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#eaf0fb] flex flex-col max-w-sm mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-slate-100 flex shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-200 ${
                isActive ? "text-[#2356c8]" : "text-slate-400"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-[#e8effc]" : ""}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-[#2356c8]" : "text-slate-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
