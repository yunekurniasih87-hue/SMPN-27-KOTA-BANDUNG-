import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  getSavedSupabaseConfig,
  getSupabaseClient,
  saveSupabaseConfig,
  SUPABASE_SQL_SCHEMA
} from '../../services/supabaseClient';
import {
  Database,
  Shield,
  Key,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';

export const AdminSupabase: React.FC = () => {
  const { showToast } = useSchoolData();
  const currentConfig = getSavedSupabaseConfig();

  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [hasCopiedSql, setHasCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      showToast('Project URL Supabase harus diawali dengan https://', 'error');
      return;
    }

    setIsTesting(true);
    const saved = saveSupabaseConfig(trimmedUrl, trimmedKey);
    setUrl(saved.url);
    setAnonKey(saved.anonKey);

    if (saved.isConnected) {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.auth.getSession();
        setIsTesting(false);
        if (error) {
          showToast(`Konfigurasi disimpan, namun koneksi gagal: ${error.message}`, 'error');
          return;
        }
      }
    }

    setIsTesting(false);
    showToast('Konfigurasi Supabase berhasil disimpan!', 'success');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setHasCopiedSql(true);
    showToast('Skrip SQL & RLS Supabase berhasil disalin!', 'success');
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Integrasi Cloud Database</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Pengaturan Supabase & Row Level Security (RLS)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Panduan integrasi database PostgreSQL, autentikasi Supabase Auth, dan keamanan hak akses RLS.
        </p>
      </div>

      {/* Status Connection Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              currentConfig.isConnected
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
            }`}
          >
            {currentConfig.isConnected ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentConfig.isConnected
                  ? 'Supabase Cloud Terhubung'
                  : 'Mode Mandiri / Local Storage Aktif'}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  currentConfig.isConnected
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {currentConfig.isConnected ? 'ONLINE' : 'OFFLINE PERSISTENCE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              {currentConfig.isConnected
                ? 'Aplikasi telah mengonfigurasi endpoint Supabase. Data publik dan admin disinkronkan langsung ke cloud PostgreSQL.'
                : 'Aplikasi saat ini berjalan mulus memakai penyimpanan IndexedDB/LocalStorage browser. Masukkan URL dan Kunci Anon di bawah untuk menghubungkan ke instance Supabase sekolah.'}
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Buka Dashboard Supabase</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Form Kredensial Supabase */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Konfigurasi API Supabase
            </h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project URL Supabase
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ditemukan di: Project Settings &gt; API &gt; Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kunci Anon Publik (anon key)
              </label>
              <textarea
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ditemukan di: Project Settings &gt; API &gt; Project API Keys (anon public)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Aturan Keamanan Sesuai Brief:</span>
              </div>
              <p>
                Kunci rahasia (service_role key) <strong>TIDAK PERNAH</strong> ditaruh di kode tampilan. Seluruh keamanan dijamin oleh Row Level Security (RLS) di sisi server Supabase.
              </p>
            </div>

            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menghubungkan Supabase...' : 'Simpan & Sambungkan Supabase'}</span>
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Panduan Eksekusi Skrip SQL & RLS */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Skrip SQL Schema & Row Level Security (RLS)
              </h3>
            </div>

            <button
              onClick={handleCopySql}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {hasCopiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Skrip SQL</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Jalankan skrip ini di <strong>SQL Editor</strong> Supabase untuk membuat tabel dan memberlakukan keamanan RLS: pengunjung hanya dapat membaca konten terbit, hanya akun admin yang berhak mengelola data.
          </p>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-4 max-h-96 overflow-y-auto">
            <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Langkah 3 Menit Menyiapkan Database Supabase:
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-[11px]">
              <li>Buka dashboard proyek Anda di Supabase, pilih menu <strong>SQL Editor</strong>.</li>
              <li>Klik tombol "Salin Skrip SQL" di atas, lalu tempel (paste) dan klik <strong>Run</strong>.</li>
              <li>Buka menu <strong>Authentication &gt; Users</strong>, buat akun admin sekolah (misalnya <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">admin@smpn27bandung.sch.id</code>).</li>
              <li>Buka menu <strong>Storage</strong>, pastikan bucket bernama <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">school-assets</code> telah aktif (Public).</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
