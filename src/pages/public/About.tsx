import React from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolLogoSlot } from '../../components/common/SchoolLogoSlot';
import {
  Compass,
  CheckCircle2,
  Award,
  ShieldCheck,
  Calendar,
  Users,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const About: React.FC = () => {
  const { about, settings } = useSchoolData();

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 inline-block mb-3">
            Profil Sekolah
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Tentang SMP Negeri 27 Kota Bandung
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Menelusuri jejak sejarah dedikasi, landasan visi misi, filosofi lambang kebanggaan, dan komitmen mutu pendidikan berakreditasi unggul.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. VISI, MISI & TUJUAN SEKOLAH                           */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visi */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-6">
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>Visi Utama Sekolah</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-6">
                  "{about.vision}"
                </h3>
              </div>
              <div className="pt-6 border-t border-white/20 text-xs text-blue-100 flex items-center justify-between">
                <span>Panduan Moral & Arah Kebijakan</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>

            {/* Misi & Tujuan */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Target className="w-3.5 h-3.5" />
                  <span>Misi Sekolah</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Langkah Strategis Pembinaan Peserta Didik
                </h3>
                <ul className="space-y-3">
                  {about.missions.map((mission, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{mission}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tujuan */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Target & Tujuan Pendidikan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {about.goals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2"
                    >
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. SEJARAH SEKOLAH (INTERACTIVE TIMELINE)                 */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                Lintas Masa
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                Sejarah Singkat SMPN 27 Bandung
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                {about.history}
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Vertical line */}
              <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-blue-200 dark:bg-blue-900/60 hidden sm:block" />

              <div className="space-y-8">
                {about.timeline.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col sm:flex-row items-center gap-6 ${
                        isEven ? 'sm:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Center Point */}
                      <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white items-center justify-center font-bold text-xs shadow-md shadow-blue-600/40 z-10 border-2 border-white dark:border-slate-900">
                        {idx + 1}
                      </div>

                      {/* Card Content */}
                      <div className="w-full sm:w-1/2 sm:px-6">
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              Tahun {item.year}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Empty space for alternate column */}
                      <div className="hidden sm:block w-1/2 sm:px-6" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. MAKNA LOGO & SLOT LOGO SEKOLAH (80x80 px)             */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Kolom Logo */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex items-center justify-center">
                  <SchoolLogoSlot logoUrl={settings.logoUrl} size={96} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Lambang SMPN 27 Bandung
                </h3>
              </div>

              {/* Kolom Makna & Filosofi */}
              <div className="lg:col-span-8">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/30">
                  Filosofi Lambang
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-6">
                  Makna dan Filosofi Simbol Sekolah
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {about.logoPhilosophy.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                      <h4 className="text-sm font-bold text-sky-300 mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item.symbol}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. AKREDITASI SEKOLAH                                    */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                  <Award className="w-10 h-10" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Terakreditasi BAN-S/M</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Peringkat Akreditasi: {about.accreditation.grade}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Nilai Perolehan: <span className="font-bold text-slate-900 dark:text-white">{about.accreditation.score} / 100</span> (Kategori Unggul)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block">Nomor SK:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {about.accreditation.skNumber}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block">Masa Berlaku:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Tahun {about.accreditation.year} - {about.accreditation.validUntil}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. STRUKTUR ORGANISASI SEKOLAH                           */}
        {/* ======================================================== */}
        <section>
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                Tata Kelola
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                Bagan Struktur Organisasi Sekolah
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Hierarki kepemimpinan dan manajemen koordinasi SMP Negeri 27 Kota Bandung.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.orgChart.map((node) => (
                <div
                  key={node.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    node.level === 1
                      ? 'sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-blue-600 shadow-lg text-center'
                      : node.level === 2
                      ? 'bg-blue-50/80 dark:bg-slate-800/90 border-blue-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        node.level === 1
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider block ${
                          node.level === 1
                            ? 'text-sky-200'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {node.role}
                      </span>
                      <h4 className="text-sm font-bold leading-tight mt-0.5">
                        {node.name}
                      </h4>
                      {node.nip !== '-' && (
                        <p
                          className={`text-[11px] mt-0.5 ${
                            node.level === 1
                              ? 'text-blue-100'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          NIP. {node.nip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
