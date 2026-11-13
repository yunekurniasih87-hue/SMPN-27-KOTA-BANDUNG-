import React from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  Newspaper,
  GraduationCap,
  Mail,
  Trophy,
  Building2,
  Activity,
  Image,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getSavedSupabaseConfig } from '../../services/supabaseClient';

export const AdminDashboard: React.FC = () => {
  const {
    articles,
    teachers,
    messages,
    achievements,
    facilities,
    extracurriculars,
    gallery,
    setActiveAdminTab,
    setCurrentRoute,
    settings
  } = useSchoolData();

  const unreadMessages = messages.filter((m) => !m.isRead);
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const draftArticles = articles.filter((a) => a.status === 'draft');

  const supabaseConfig = getSavedSupabaseConfig();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 inline-block mb-1.5">
            Ikhtisar Sistem
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Dashboard Pengelola Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Selamat datang di panel pengelolaan konten resmi {settings.schoolName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('berita')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Berita Baru</span>
          </button>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              supabaseConfig.isConnected
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
            }`}
          >
            {supabaseConfig.isConnected ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Status Database: {supabaseConfig.isConnected ? 'Terhubung ke Supabase Cloud' : 'Mode Offline / Local Storage Aktif'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {supabaseConfig.isConnected
                ? 'Seluruh data tersinkronisasi otomatis dengan PostgreSQL & Supabase Auth.'
                : 'Penyimpanan lokal peramban siap digunakan. Anda dapat menghubungkan URL & Kunci Anon Supabase di tab "Integrasi Supabase".'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveAdminTab('supabase')}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Konfigurasi Supabase</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Berita */}
        <div
          onClick={() => setActiveAdminTab('berita')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Newspaper className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-500 flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {articles.length}
          </div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
            Total Berita & Pengumuman
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{publishedArticles.length} Terbit</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{draftArticles.length} Draf</span>
          </div>
        </div>

        {/* Guru & Tendik */}
        <div
          onClick={() => setActiveAdminTab('guru')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-500 flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {teachers.length}
          </div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
            Guru & Tenaga Kependidikan
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Data tenaga pendidik aktif
          </div>
        </div>

        {/* Pesan Masuk (Form Kontak) */}
        <div
          onClick={() => setActiveAdminTab('pesan')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            {unreadMessages.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                {unreadMessages.length} Baru
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {messages.length}
          </div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
            Pesan Masuk Kontak
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {unreadMessages.length} pesan belum dibaca
          </div>
        </div>

        {/* Prestasi */}
        <div
          onClick={() => setActiveAdminTab('prestasi')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-500 flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {achievements.length}
          </div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
            Prestasi Terverifikasi
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Tingkat Kota, Jabar & Nasional
          </div>
        </div>
      </div>

      {/* Two Column: Pesan Masuk Terbaru & Quick Navigasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Pesan Masuk Terbaru */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-500" />
              <span>Pesan Masuk Terbaru</span>
            </h3>
            <button
              onClick={() => setActiveAdminTab('pesan')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Belum ada pesan masuk dari pengunjung.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setActiveAdminTab('pesan')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !msg.isRead
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {msg.name}
                    </span>
                    {!msg.isRead && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                        Belum Dibaca
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    {msg.subject}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Akses Cepat Kelola Modul */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Akses Cepat Pengelolaan
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'fasilitas', label: 'Fasilitas', count: facilities.length, icon: <Building2 className="w-4 h-4" /> },
              { id: 'ekskul', label: 'Ekstrakurikuler', count: extracurriculars.length, icon: <Activity className="w-4 h-4" /> },
              { id: 'galeri', label: 'Galeri Foto', count: gallery.length, icon: <Image className="w-4 h-4" /> },
              { id: 'statistik', label: 'Statistik Siswa', count: 'Kelas VII-IX', icon: <Building2 className="w-4 h-4" /> },
              { id: 'tentang', label: 'Visi & Sejarah', count: 'Halaman Profil', icon: <Newspaper className="w-4 h-4" /> },
              { id: 'pengaturan', label: 'Identitas & Logo', count: 'Pengaturan Umum', icon: <ShieldCheck className="w-4 h-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveAdminTab(item.id as any)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-1.5">{item.icon}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
