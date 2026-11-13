import React from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolLogoSlot } from './SchoolLogoSlot';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Youtube,
  MessageCircle,
  Shield,
  Heart,
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setCurrentRoute } = useSchoolData();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SchoolLogoSlot
                logoUrl={settings.logoUrl}
                size={72}
              />
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight">
                  {settings.schoolName}
                </h3>
                <p className="text-xs text-sky-400 font-semibold tracking-wide uppercase mt-0.5">
                  Kota Bandung
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "{settings.slogan}"
            </p>
            <div className="pt-2 flex items-center gap-3">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors text-slate-400"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors text-slate-400"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.whatsappUrl && (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors text-slate-400"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat (No PPDB) */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-sky-400 pl-3">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentRoute('beranda')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute('tentang')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  Profil & Visi Misi
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute('data-sekolah')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  Pendidik & Data Siswa
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute('kesiswaan')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  Ekstrakurikuler & Prestasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute('berita-galeri')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  Berita Terkini & Galeri
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute('lms')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  LMS (Portal Belajar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute('kontak')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  Kontak & Lokasi Peta
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Alamat */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-sky-400 pl-3">
              Kontak Sekolah
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-snug">
                  {settings.address}, {settings.city}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-300">{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-300">{settings.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-300">{settings.operatingHours}</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Akreditasi & Portal Kelola */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-sky-400 pl-3">
              Status & Pengelolaan
            </h4>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Akreditasi Sekolah:</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  A (Unggul)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tersertifikasi BAN-S/M dengan komitmen mutu pendidikan berkarakter.
              </p>
            </div>

            <button
              onClick={() => setCurrentRoute('admin')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-sky-900 border border-slate-700 hover:border-sky-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Masuk Panel Pengelola (Admin)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {settings.schoolName}. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-2">
            <span>Dikelola dengan sistem manajemen mandiri</span>
            <span>•</span>
            <button
              onClick={() => setCurrentRoute('admin')}
              className="text-slate-400 hover:text-sky-300 underline underline-offset-2"
            >
              Login Staf Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
