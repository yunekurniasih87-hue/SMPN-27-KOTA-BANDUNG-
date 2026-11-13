import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolImage } from '../../components/common/SchoolImage';
import {
  Trophy,
  Activity,
  Users,
  Calendar,
  Award,
  Medal,
  CheckCircle2,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export const Studentship: React.FC = () => {
  const { extracurriculars, achievements } = useSchoolData();

  // Ekskul Category Filter
  const [ekskulTab, setEkskulTab] = useState<string>('all');
  const ekskulCategories = [
    { id: 'all', label: 'Semua Ekskul' },
    { id: 'Wajib', label: 'Wajib' },
    { id: 'Olahraga', label: 'Olahraga' },
    { id: 'Seni Budaya', label: 'Seni & Budaya' },
    { id: 'Sains & Teknologi', label: 'Sains & TIK' },
    { id: 'Kepemimpinan', label: 'Kepemimpinan' }
  ];

  const filteredEkskul = extracurriculars.filter(
    (e) => ekskulTab === 'all' || e.category === ekskulTab
  );

  // Prestasi Filter
  const [prestasiType, setPrestasiType] = useState<'all' | 'Akademik' | 'Non-Akademik'>('all');
  const [prestasiLevel, setPrestasiLevel] = useState<string>('all');
  const [prestasiSearch, setPrestasiSearch] = useState('');

  const filteredAchievements = achievements.filter((a) => {
    const matchType = prestasiType === 'all' || a.category === prestasiType;
    const matchLevel = prestasiLevel === 'all' || a.level === prestasiLevel;
    const matchSearch =
      a.title.toLowerCase().includes(prestasiSearch.toLowerCase()) ||
      a.studentName.toLowerCase().includes(prestasiSearch.toLowerCase()) ||
      a.rank.toLowerCase().includes(prestasiSearch.toLowerCase());
    return matchType && matchLevel && matchSearch;
  });

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 inline-block mb-3">
            Aktivitas & Prestasi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Kesiswaan SMP Negeri 27 Bandung
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Wadah aktualisasi diri, kepemimpinan organisasi siswa, dan torehan prestasi membanggakan di tingkat kota, provinsi, hingga nasional.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. OSIS & MPK SECTION                                    */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/30">
                  Kepemimpinan Siswa
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-tight">
                  Organisasi Siswa Intra Sekolah (OSIS) & MPK
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
                  OSIS SMP Negeri 27 Kota Bandung berperan aktif sebagai motor penggerak kreativitas, disiplin, toleransi, serta penyalur aspirasi positif seluruh peserta didik.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-xs">
                  <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <span className="text-sky-300 font-bold block">Periode Kepengurusan</span>
                    <span className="text-white font-medium">2024 / 2025 (Aktif)</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <span className="text-sky-300 font-bold block">Jumlah Sekbid</span>
                    <span className="text-white font-medium">8 Seksi Bidang</span>
                  </div>
                </div>
              </div>

              {/* Program Kerja Utama */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Program Kerja Utama OSIS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Pekan Olahraga & Seni (PORSENI)',
                      desc: 'Kompetisi antar-kelas dalam ajang bakat seni, olahraga, dan e-sports sportif.'
                    },
                    {
                      title: 'Gerakan 27 Peduli Sesama',
                      desc: 'Bakti sosial, penggalangan bantuan korban bencana, dan santunan anak yatim.'
                    },
                    {
                      title: 'Bulan Bahasa & Literasi Kreasi',
                      desc: 'Lomba cipta puisi, debat bahasa Sunda, pidato bahasa Inggris, dan bedah buku.'
                    },
                    {
                      title: 'Kaderisasi LDKS & Masa Bimbingan',
                      desc: 'Latihan dasar kepemimpinan siswa untuk membentuk pengurus yang tangguh dan berintegritas.'
                    }
                  ].map((prog, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {prog.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{prog.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. DAFTAR EKSTRAKURIKULER                                */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Ekstrakurikuler Pilihan
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Wadah minat bakat dengan pembina profesional dan fasilitas lengkap
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {ekskulCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setEkskulTab(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    ekskulTab === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEkskul.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col group"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <SchoolImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    placeholderText="Foto ekskul belum diunggah"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 shadow">
                      <Users className="w-3 h-3 text-sky-400" />
                      {item.membersCount} Anggota
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{item.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Pembina: {item.coach}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. PRESTASI SISWA DENGAN FILTER MULTI-LEVEL              */}
        {/* ======================================================== */}
        <section>
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                  Hall of Fame
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Prestasi & Penghargaan Siswa
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Bukti nyata komitmen sekolah dalam membina talenta siswa berprestasi
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari prestasi, nama siswa..."
                    value={prestasiSearch}
                    onChange={(e) => setPrestasiSearch(e.target.value)}
                    className="w-full sm:w-56 pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Filter Akademik / Non-Akademik */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(
                    [
                      { id: 'all', label: 'Semua' },
                      { id: 'Akademik', label: 'Akademik' },
                      { id: 'Non-Akademik', label: 'Non-Akademik' }
                    ] as const
                  ).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPrestasiType(type.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        prestasiType === type.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Filter Tingkat */}
                <select
                  value={prestasiLevel}
                  onChange={(e) => setPrestasiLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="Kota">Tingkat Kota</option>
                  <option value="Provinsi">Tingkat Provinsi</option>
                  <option value="Nasional">Tingkat Nasional</option>
                </select>
              </div>
            </div>

            {filteredAchievements.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tidak ada prestasi yang cocok dengan kriteria filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500/80 transition-all hover:shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.category === 'Akademik'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                          Tingkat {item.level}
                        </span>
                      </div>

                      <div className="mb-4 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                        <SchoolImage
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          containerClassName="w-full h-full"
                          placeholderText="Foto belum diunggah"
                        />
                      </div>

                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block leading-tight">
                            {item.rank} ({item.year})
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Pemenang:</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {item.studentName}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
