import React, { useState, useEffect } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolLogoSlot } from '../../components/common/SchoolLogoSlot';
import { SchoolImage } from '../../components/common/SchoolImage';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  GraduationCap,
  Trophy,
  Activity,
  Calendar,
  Sparkles,
  BookOpen,
  Leaf,
  HeartHandshake,
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const Home: React.FC = () => {
  const {
    settings,
    about,
    articles,
    teachers,
    extracurriculars,
    achievements,
    studentStats,
    setCurrentRoute,
    openArticleDetail
  } = useSchoolData();

  // Hero Slider index
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = settings.heroSlides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Total student calculation
  const totalStudents = studentStats.reduce((sum, item) => sum + item.total, 0);
  const totalTeachers = teachers.length;
  const totalExtracurriculars = extracurriculars.length;
  const totalAchievements = achievements.length;

  // 3 Latest Published Articles
  const latestArticles = articles.filter((a) => a.status === 'published').slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ======================================================== */}
      {/* HERO SECTION DENGAN SLOT LOGO SEKOLAH 80x80 PX           */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Decorative background grid and glows */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-center">
              <SchoolLogoSlot
                logoUrl={settings.logoUrl}
                size={92}
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Sub-badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Website Resmi Sekolah Negeri Berakreditasi A (Unggul)</span>
            </div>

            {/* School Name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none mb-6">
              {settings.schoolName}
            </h1>

            {/* Slogan */}
            <p className="text-lg sm:text-xl text-sky-100/90 font-medium max-w-2xl leading-relaxed mb-10">
              "{settings.slogan}"
            </p>

            {/* Call To Action Buttons (Profil Sekolah & Hubungi Kami) */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setCurrentRoute('tentang')}
                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/40 hover:shadow-blue-500/50 transition-all flex items-center gap-2 group"
              >
                <span>Profil Sekolah</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentRoute('kontak')}
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 hover:border-white/40 transition-all"
              >
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SLIDER FOTO KEGIATAN SEKOLAH                            */}
      {/* ======================================================== */}
      <section className="-mt-14 relative z-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900 group aspect-[16/9] md:aspect-[21/9]">
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <SchoolImage
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
                containerClassName="aspect-[16/9] md:aspect-[21/9]"
                placeholderText="Foto slide belum diunggah"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-white">
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-600/80 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                  Kegiatan Unggulan
                </span>
                <h3 className="text-xl md:text-3xl font-extrabold leading-tight drop-shadow-md">
                  {slide.title}
                </h3>
                <p className="text-sm md:text-base text-slate-200 mt-1 max-w-2xl drop-shadow line-clamp-2">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 group-hover:opacity-100"
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 group-hover:opacity-100"
                aria-label="Slide selanjutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'w-6 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* STATISTIK SEKOLAH ANIMASI / HIGHLIGHT                   */}
      {/* ======================================================== */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/80 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalStudents}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Peserta Didik Aktif
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/80 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalTeachers}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Guru & Tenaga Kependidikan
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700/80 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalExtracurriculars}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Ekstrakurikuler Pilihan
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-purple-50/70 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700/80 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalAchievements}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Prestasi Juara
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SAMBUTAN KEPALA SEKOLAH                                  */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Foto Kepala Sekolah */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
                  <SchoolImage
                    src={about.headmasterWelcome.photoUrl}
                    alt={about.headmasterWelcome.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    placeholderText="Foto Kepala Sekolah belum diunggah"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-3.5 rounded-2xl shadow-xl">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {about.headmasterWelcome.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Kepala SMP Negeri 27 Kota Bandung
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {about.headmasterWelcome.nip}
                </p>
              </div>
            </div>

            {/* Sambutan */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
                {about.headmasterWelcome.title}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                Membangun Generasi Cerdas Berkarakter Menuju Indonesia Emas
              </h2>

              <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line border-l-4 border-blue-600 pl-6 my-6">
                {about.headmasterWelcome.message}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => setCurrentRoute('tentang')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Selengkapnya di Profil Sekolah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* PROGRAM UNGGULAN SEKOLAH                                 */}
      {/* ======================================================== */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
              Pilar Keunggulan
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Program Prioritas SMPN 27
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Mewujudkan lingkungan belajar holistik yang menumbuhkan kecerdasan intelektual, emosional, dan spiritual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.featuredPrograms.map((prog, i) => (
              <div
                key={prog.id || i}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {i === 0 ? (
                    <Leaf className="w-6 h-6 text-emerald-600" />
                  ) : i === 1 ? (
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  ) : i === 2 ? (
                    <HeartHandshake className="w-6 h-6 text-rose-600" />
                  ) : (
                    <Trophy className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {prog.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {prog.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3 BERITA TERBARU                                         */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                Warta & Pengumuman
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
                Kabar Terkini SMPN 27
              </h2>
            </div>
            <button
              onClick={() => setCurrentRoute('berita-galeri')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 self-start sm:self-auto group"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((art) => (
              <article
                key={art.id}
                onClick={() => openArticleDetail(art.id)}
                className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <SchoolImage
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    placeholderText="Foto warta belum diunggah"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow">
                      {art.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{art.publishedAt}</span>
                    <span>•</span>
                    <span>{art.author}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed flex-1">
                    {art.excerpt}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* BANNER AJAKAN KOLABORASI / HUBUNGI SEKOLAH               */}
      {/* ======================================================== */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ingin Mengetahui Lebih Jauh Tentang SMPN 27 Bandung?
            </h2>
            <p className="text-sky-100 text-sm mt-2 leading-relaxed">
              Tim pelayanan informasi sekolah siap melayani pertanyaan seputar kegiatan akademik, program kesiswaan, dan agenda sekolah.
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('kontak')}
            className="px-6 py-3 rounded-2xl bg-white text-blue-800 font-bold text-sm shadow-xl hover:bg-sky-50 transition-all shrink-0 flex items-center gap-2"
          >
            <span>Kirim Pesan ke Sekolah</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
