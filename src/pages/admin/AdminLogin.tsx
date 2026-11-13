import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolLogoSlot } from '../../components/common/SchoolLogoSlot';
import {
  Shield,
  Lock,
  Mail,
  ChevronLeft,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, settings, setCurrentRoute } = useSchoolData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await loginAdmin(email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Email atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to public site button */}
      <button
        type="button"
        onClick={() => setCurrentRoute('beranda')}
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors z-10"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Website Sekolah</span>
      </button>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4 flex items-center justify-center">
            <SchoolLogoSlot
              logoUrl={settings.logoUrl}
              size={72}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Portal Manajemen Sekolah</span>
          </div>

          <h2 className="text-xl font-black text-white">Masuk Panel Admin & Guru SMPN 27</h2>
          <p className="text-xs text-slate-400 mt-1">
            Silakan masuk menggunakan email dan password administrator atau guru LMS
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="break-words leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>{isLoading ? 'Memproses...' : 'Masuk'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
