import React, { useState } from 'react';
import { useSchoolData, AdminTab } from '../../context/SchoolDataContext';
import { SchoolLogoSlot } from '../../components/common/SchoolLogoSlot';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import {
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  Building2,
  Activity,
  Trophy,
  Image,
  BarChart3,
  BookOpen,
  Settings,
  KeyRound,
  Mail,
  Database,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  RotateCcw,
  Layers
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    adminUser,
    logoutAdmin,
    activeAdminTab,
    setActiveAdminTab,
    setCurrentRoute,
    settings,
    messages,
    articles,
    teachers,
    lmsItems,
    isDark,
    toggleTheme,
    resetAllDefaults
  } = useSchoolData();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;
  const isTeacher = adminUser?.role === 'teacher';

  const allMenuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'kelola-lms',
      label: 'Kelola LMS',
      icon: <Layers className="w-4 h-4 text-sky-400" />,
      badge: lmsItems.length
    },
    {
      id: 'berita',
      label: 'Berita & Pengumuman',
      icon: <Newspaper className="w-4 h-4" />,
      badge: articles.length
    },
    {
      id: 'guru',
      label: 'Guru & Tenaga Kependidikan',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: teachers.length
    },
    { id: 'fasilitas', label: 'Fasilitas Sekolah', icon: <Building2 className="w-4 h-4" /> },
    { id: 'ekskul', label: 'Ekstrakurikuler', icon: <Activity className="w-4 h-4" /> },
    { id: 'prestasi', label: 'Prestasi Siswa', icon: <Trophy className="w-4 h-4" /> },
    { id: 'galeri', label: 'Galeri Foto', icon: <Image className="w-4 h-4" /> },
    { id: 'statistik', label: 'Statistik Siswa', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'tentang', label: 'Halaman Tentang', icon: <BookOpen className="w-4 h-4" /> },
    {
      id: 'pesan',
      label: 'Pesan Masuk Kontak',
      icon: <Mail className="w-4 h-4" />,
      badge: unreadMessagesCount
    },
    { id: 'pengaturan', label: 'Pengaturan Umum', icon: <Settings className="w-4 h-4" /> },
    { id: 'pengaturan-akun', label: 'Akun Admin', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'supabase', label: 'Integrasi Supabase & RLS', icon: <Database className="w-4 h-4 text-emerald-500" /> }
  ];

  const menuItems = isTeacher
    ? allMenuItems.filter((item) => item.id === 'kelola-lms')
    : allMenuItems;

  const handleTabClick = (tab: AdminTab) => {
    setActiveAdminTab(tab);
    setIsSidebarOpen(false);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top bar */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="font-bold text-sm truncate">{settings.schoolName} - Admin</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-300">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCurrentRoute('beranda')}
            className="p-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            title="Lihat Website"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <SchoolLogoSlot
              logoUrl={settings.logoUrl}
              size={56}
            />
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                {isTeacher ? 'Panel Guru LMS' : 'Panel Admin'}
              </span>
              <h2 className="text-sm font-extrabold text-white truncate">
                {settings.schoolName}
              </h2>
              <span className="text-[10px] text-slate-400 block truncate">
                Kota Bandung
              </span>
            </div>
          </div>

          {/* Nav List */}
          <div className="py-4 px-3 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : item.id === 'pesan' && unreadMessagesCount > 0
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-white text-xs truncate">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser?.email}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              title="Ganti Tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setCurrentRoute('beranda')}
              className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Web Publik</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="py-2 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          {!isTeacher && (
            <button
              onClick={handleReset}
              className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 pt-1"
              title="Kembalikan data ke contoh awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Contoh</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

      <ConfirmDeleteModal
        isOpen={showResetConfirm}
        title="Reset Data Contoh"
        message="Apakah Anda yakin ingin mereset seluruh data ke data contoh bawaan? Seluruh perubahan lokal akan dikembalikan."
        onConfirm={() => {
          resetAllDefaults();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
