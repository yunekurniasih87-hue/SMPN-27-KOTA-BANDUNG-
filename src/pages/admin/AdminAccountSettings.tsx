import React from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { ShieldCheck, Info, LogOut } from 'lucide-react';

export const AdminAccountSettings: React.FC = () => {
  const { adminUser, logoutAdmin, setActiveAdminTab } = useSchoolData();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Keamanan Akun Admin</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Informasi Akun Administrator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Status sesi login panel admin saat ini untuk akun{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {adminUser?.email}
          </span>
          .
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 leading-relaxed">
            <p className="font-bold">Sistem Login Sederhana Aktif (Non-Supabase Auth)</p>
            <p>
              Login panel admin menggunakan autentikasi langsung dengan sesi tersimpan di browser agar admin tetap masuk saat halaman dimuat ulang. Untuk mengakhiri sesi, gunakan tombol Keluar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setActiveAdminTab('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Kembali ke Dashboard
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Panel Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
