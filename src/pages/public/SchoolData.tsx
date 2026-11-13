import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Lightbox } from '../../components/common/Lightbox';
import { SchoolImage } from '../../components/common/SchoolImage';
import {
  Search,
  Users,
  GraduationCap,
  Building2,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { StaffCategory, Facility } from '../../types';

export const SchoolData: React.FC = () => {
  const { teachers, facilities, studentStats, settings } = useSchoolData();

  // Filter & Search Guru / Tendik
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | StaffCategory>('all');

  // Facilities Lightbox
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Facility filter
  const [facilityCategory, setFacilityCategory] = useState<string>('all');

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const facilityCategories = ['all', ...Array.from(new Set(facilities.map((f) => f.category)))];
  const filteredFacilities = facilities.filter(
    (f) => facilityCategory === 'all' || f.category === facilityCategory
  );

  // Calculations for Student Stats
  const totalMale = studentStats.reduce((sum, s) => sum + s.male, 0);
  const totalFemale = studentStats.reduce((sum, s) => sum + s.female, 0);
  const grandTotal = studentStats.reduce((sum, s) => sum + s.total, 0);
  const totalClasses = studentStats.reduce((sum, s) => sum + s.classesCount, 0);

  const maxGradeTotal = Math.max(...studentStats.map((s) => s.total), 1);

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 inline-block mb-3">
            Transparansi Informasi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Data Sekolah & Sarana Prasarana
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Profil pendidik dan tenaga kependidikan berdedikasi, statistik jumlah peserta didik, serta sarana penunjang pembelajaran berkualitas.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. DATA GURU DAN TENAGA KEPENDIDIKAN                      */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Pendidik & Tenaga Kependidikan
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Total {teachers.length} personil terdata dalam database sekolah
              </p>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, mapel, jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'pimpinan', label: 'Pimpinan' },
                    { id: 'guru', label: 'Guru' },
                    { id: 'tendik', label: 'Tendik' }
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tidak ada data pendidik yang cocok dengan pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col group"
                >
                  <div className="relative aspect-[4/4.5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <SchoolImage
                      src={teacher.imageUrl}
                      alt={teacher.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      containerClassName="w-full h-full"
                      placeholderText="Foto pendidik belum diunggah"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow ${
                          teacher.category === 'pimpinan'
                            ? 'bg-amber-500 text-slate-950'
                            : teacher.category === 'guru'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {teacher.category === 'pimpinan'
                          ? 'Pimpinan'
                          : teacher.category === 'guru'
                          ? 'Guru Mapel'
                          : 'Tenaga Kependidikan'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {teacher.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                        {teacher.role}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        NIP. {teacher.nip || '-'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Mata Pelajaran:
                        </span>{' '}
                        {teacher.subject}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Pendidikan:
                        </span>{' '}
                        {teacher.education}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 2. JUMLAH SISWA PER KELAS (TABEL & GRAFIK VISUAL)        */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                  Data Pokok Pendidikan
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Jumlah Siswa per Jenjang Kelas
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Distribusi peserta didik aktif Tahun Ajaran Berjalan
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                    Total Siswa
                  </span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {grandTotal} Siswa
                  </span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                    Total Rombel
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {totalClasses} Kelas
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Tabel Interaktif */}
              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-bold">Jenjang Kelas</th>
                      <th className="py-3 px-4 font-bold text-center">Rombel</th>
                      <th className="py-3 px-4 font-bold text-center">Laki-laki (L)</th>
                      <th className="py-3 px-4 font-bold text-center">Perempuan (P)</th>
                      <th className="py-3 px-4 font-bold text-right">Jumlah Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentStats.map((stat) => (
                      <tr
                        key={stat.grade}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            {stat.grade}
                          </span>
                          <span>Kelas {stat.grade}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                          {stat.classesCount} Rombel
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                          {stat.male}
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-pink-600 dark:text-pink-400">
                          {stat.female}
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">
                          {stat.total} Siswa
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-white">
                      <td className="py-4 px-4">Total Keseluruhan</td>
                      <td className="py-4 px-4 text-center">{totalClasses} Rombel</td>
                      <td className="py-4 px-4 text-center text-blue-600 dark:text-blue-400">{totalMale}</td>
                      <td className="py-4 px-4 text-center text-pink-600 dark:text-pink-400">{totalFemale}</td>
                      <td className="py-4 px-4 text-right text-base text-blue-600 dark:text-blue-400">{grandTotal} Siswa</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Grafik Batang Visual Responsif */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Komposisi Peserta Didik
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6">
                  Perbandingan rasio siswa Laki-laki vs Perempuan per jenjang
                </p>

                <div className="space-y-6">
                  {studentStats.map((stat) => {
                    const malePercent = Math.round((stat.male / stat.total) * 100);
                    const femalePercent = 100 - malePercent;
                    const barWidth = Math.round((stat.total / maxGradeTotal) * 100);

                    return (
                      <div key={stat.grade}>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                          <span>Kelas {stat.grade}</span>
                          <span>{stat.total} Siswa</span>
                        </div>
                        {/* Dual Bar (Blue for Male, Pink for Female) */}
                        <div
                          className="h-6 rounded-xl overflow-hidden flex bg-slate-200 dark:bg-slate-700 shadow-inner"
                          style={{ width: `${barWidth}%`, minWidth: '60%' }}
                        >
                          <div
                            style={{ width: `${malePercent}%` }}
                            className="bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center transition-all duration-500"
                            title={`Laki-laki: ${stat.male} (${malePercent}%)`}
                          >
                            {malePercent}% L
                          </div>
                          <div
                            style={{ width: `${femalePercent}%` }}
                            className="bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center transition-all duration-500"
                            title={`Perempuan: ${stat.female} (${femalePercent}%)`}
                          >
                            {femalePercent}% P
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 px-1">
                          <span>L: {stat.male} siswa</span>
                          <span>P: {stat.female} siswa</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">Laki-laki ({totalMale})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-slate-700 dark:text-slate-300">Perempuan ({totalFemale})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. FASILITAS SEKOLAH DENGAN LIGHTBOX                     */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Fasilitas & Sarana Prasarana
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Fasilitas berstandar nasional untuk mendukung pembelajaran optimal
              </p>
            </div>

            {/* Filter Kategori Fasilitas */}
            <div className="flex flex-wrap items-center gap-2">
              {facilityCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFacilityCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    facilityCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  {cat === 'all' ? 'Semua Fasilitas' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFacilities.map((facility) => (
              <div
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer group"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <SchoolImage
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    placeholderText="Foto fasilitas belum diunggah"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      {facility.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      Kapasitas: <strong className="text-slate-700 dark:text-slate-300">{facility.capacity}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      {facility.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. PROGRAM UNGGULAN SEKOLAH                              */}
        {/* ======================================================== */}
        <section>
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white shadow-xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/30">
                Rencana & Pelaksanaan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                Program Unggulan Sekolah Berkelanjutan
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Strategi komprehensif mengawal mutu lulusan berdaya saing global.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.featuredPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1.5">{prog.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{prog.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {selectedFacility && (
        <Lightbox
          isOpen={Boolean(selectedFacility)}
          imageUrl={selectedFacility.imageUrl}
          title={selectedFacility.name}
          caption={`${selectedFacility.description} | Kapasitas: ${selectedFacility.capacity} | Kondisi: ${selectedFacility.condition}`}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </div>
  );
};
