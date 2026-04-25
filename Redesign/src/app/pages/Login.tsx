import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, BellRing, AlertCircle } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("Sesi demo lama terdeteksi. Silakan login ulang dengan akun SUNAN kamu.");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!nim || !password) {
      setError("NIM dan password tidak boleh kosong.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0f1e52] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a2e6e] rounded-full -translate-y-32 translate-x-32 opacity-60" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1a2e6e] rounded-full translate-y-24 -translate-x-24 opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-[#2356c8] rounded-full opacity-10 blur-2xl" />

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#2356c8] flex items-center justify-center">
              <BellRing size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-[#7da8f0] text-sm font-medium tracking-wide">Universitas Muria Kudus</span>
          </div>
          <h1 className="text-white mb-3" style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 }}>
            SUNAN<br />Notifier
          </h1>
          <p className="text-[#8faad4] text-sm leading-relaxed max-w-xs">
            Login dengan akun portal UMK untuk aktifkan notifikasi tugas, deadline, dan absensi.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          {/* NIM */}
          <div className="mb-4">
            <label className="block text-[#0f1e52] text-sm font-semibold mb-2">NIM</label>
            <input
              type="text"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 202351207"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#f0f4fb] text-[#0f1e52] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2356c8] transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[#0f1e52] text-sm font-semibold mb-2">Password Portal</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password SUNAN"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#f0f4fb] text-[#0f1e52] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2356c8] transition-all text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 rounded-xl">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#1e3a8a] to-[#2356c8] text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-900/30 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? "Masuk..." : "Masuk ke SUNAN"}
          </button>
        </div>

        <p className="text-center text-[#4a6394] text-xs mt-6">
          © 2026 SUNAN Notifier · Universitas Muria Kudus
        </p>
      </div>
    </div>
  );
}
