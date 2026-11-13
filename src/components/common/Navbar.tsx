import React, { useState, useEffect } from 'react';
import { useSchoolData, PublicPageRoute } from '../../context/SchoolDataContext';
import { SchoolLogoSlot } from './SchoolLogoSlot';
import {
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Phone,
  Mail,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, setCurrentRoute, settings, isDark, toggleTheme } = useSchoolData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: PublicPageRoute; label: string }[] = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'data-sekolah', label: 'Data Sekolah' },
    { id: 'kesiswaan', label: 'Kesiswaan' },
    { id: 'berita-galeri', label: 'Berita & Galeri' },
    { id: 'lms', label: 'LMS' },
    { id: 'kontak', label: 'Kontak' }
  ];

  const handleNavClick = (route: PublicPageRoute) => {
    setCurrentRoute(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Bar Informasi Ringkas (Kota Bandung, Telp, Jam Layanan) */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-1.5 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-sky-400">
              <MapPin className="w-3.5 h-3.5" />
              Kota Bandung, Jawa Barat
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-3.5 h-3.5" />
              {settings.phone}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              {settings.email}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{settings.operatingHours}</span>
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs text-sky-300 hover:text-white flex items-center gap-1 transition-colors ml-2 bg-sky-950/80 hover:bg-sky-900 px-2.5 py-0.5 rounded-full border border-sky-800/60"
            >
              <Shield className="w-3 h-3 text-sky-400" />
              Portal Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 py-2 border-b border-slate-200/80 dark:border-slate-800'
            : 'bg-white dark:bg-slate-900 py-3 border-b border-slate-200/60 dark:border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="flex items-center justify-center shrink-0">
              <SchoolLogoSlot
                logoUrl={settings.logoUrl}
                size={isScrolled ? 64 : 72}
                className="group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {settings.schoolName}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pendidikan Berkualitas & Berkarakter
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-sm line-clamp-1">
                {settings.slogan}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 relative ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Tools: Dark/Light Mode + Portal Admin + Hamburger */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Portal Admin Button (Desktop) */}
            <button
              onClick={() => handleNavClick('admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm shadow-blue-700/30 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden px-4 pt-3 pb-6 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-slide-in">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                );
              })}

              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm shadow-md"
                >
                  <Shield className="w-4 h-4" />
                  <span>Masuk ke Panel Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
