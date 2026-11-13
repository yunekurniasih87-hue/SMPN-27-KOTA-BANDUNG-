import React, { useState, useMemo } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { LmsGrade, LmsItem, LmsItemType, LmsSubject } from '../../types';
import {
  LMS_CLASS_GROUPS,
  formatAssignmentClasses,
  assignmentMatchesFilter,
  getSubjectTeacherNames,
  formatSubjectTeacherSummary
} from '../../constants/lmsClasses';
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  UserCheck,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GraduationCap,
  FileText
} from 'lucide-react';

function formatDateId(isoOrDate?: string, includeTime = false): string {
  if (!isoOrDate) return '-';
  const parsed = new Date(isoOrDate);
  if (Number.isNaN(parsed.getTime())) return isoOrDate;
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit'
        }
      : {})
  });
}

function getDeadlineBadge(deadline?: string): {
  label: string;
  variant: 'expired' | 'soon' | 'active';
} | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  if (Number.isNaN(target)) return null;
  const now = Date.now();
  const diff = target - now;
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

  if (diff <= 0) {
    return { label: 'Sudah lewat', variant: 'expired' };
  }
  if (diff < twoDaysMs) {
    return { label: 'Segera berakhir', variant: 'soon' };
  }
  return { label: 'Masih dibuka', variant: 'active' };
}

export const LmsPage: React.FC = () => {
  const { lmsSubjects, lmsItems } = useSchoolData();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'Semua' | LmsGrade>('Semua');
  const [activeTab, setActiveTab] = useState<LmsItemType>('material');
  const [detailGradeFilter, setDetailGradeFilter] = useState<'Semua' | LmsGrade>('Semua');
  const [assignmentLevelFilter, setAssignmentLevelFilter] = useState<'Semua' | LmsGrade>('Semua');
  const [assignmentClassFilter, setAssignmentClassFilter] = useState<string>('Semua');

  // Hanya tampilkan item berstatus published di halaman publik siswa
  const publishedItems = useMemo(
    () => lmsItems.filter((item) => item.status === 'published'),
    [lmsItems]
  );

  const selectedSubject: LmsSubject | undefined = useMemo(
    () => lmsSubjects.find((s) => s.id === selectedSubjectId),
    [lmsSubjects, selectedSubjectId]
  );

  // Filter daftar mata pelajaran berdasarkan pencarian dan jenjang kelas
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lmsSubjects.filter((subj) => {
      const matchesGrade =
        gradeFilter === 'Semua' || subj.gradeLevels.includes(gradeFilter);
      const teacherText = getSubjectTeacherNames(subj).join(' ').toLowerCase();
      const matchesQuery =
        !q ||
        subj.name.toLowerCase().includes(q) ||
        subj.code.toLowerCase().includes(q) ||
        subj.description.toLowerCase().includes(q) ||
        teacherText.includes(q);
      return matchesGrade && matchesQuery;
    });
  }, [lmsSubjects, searchQuery, gradeFilter]);

  // Hitung jumlah item published per mapel (sesuai filter kelas aktif jika dipilih)
  const getSubjectCounts = (subjectId: string) => {
    const items = publishedItems.filter((item) => {
      if (item.subjectId !== subjectId) return false;
      if (gradeFilter === 'Semua') return true;
      if (item.type === 'assignment') {
        return assignmentMatchesFilter(item, gradeFilter, 'Semua');
      }
      return item.grade === 'Semua' || item.grade === gradeFilter;
    });
    return {
      material: items.filter((i) => i.type === 'material').length,
      assignment: items.filter((i) => i.type === 'assignment').length,
      quiz: items.filter((i) => i.type === 'quiz').length
    };
  };

  // Item dalam mapel terpilih, diurutkan terbaru ke terlama
  const subjectItemsByType = useMemo(() => {
    if (!selectedSubject) {
      return { material: [], assignment: [], quiz: [] } as Record<LmsItemType, LmsItem[]>;
    }
    const baseItems = publishedItems
      .filter((item) => item.subjectId === selectedSubject.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const matchesBasicGrade = (item: LmsItem) =>
      detailGradeFilter === 'Semua' ||
      item.grade === 'Semua' ||
      item.grade === detailGradeFilter;

    return {
      material: baseItems.filter((i) => i.type === 'material' && matchesBasicGrade(i)),
      assignment: baseItems.filter(
        (i) =>
          i.type === 'assignment' &&
          assignmentMatchesFilter(i, assignmentLevelFilter, assignmentClassFilter)
      ),
      quiz: baseItems.filter((i) => i.type === 'quiz' && matchesBasicGrade(i))
    };
  }, [
    selectedSubject,
    publishedItems,
    detailGradeFilter,
    assignmentLevelFilter,
    assignmentClassFilter
  ]);

  const handleOpenSubject = (subject: LmsSubject) => {
    setSelectedSubjectId(subject.id);
    setActiveTab('material');
    setDetailGradeFilter(gradeFilter);
    setAssignmentLevelFilter(gradeFilter);
    setAssignmentClassFilter('Semua');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedSubjectId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =====================================
  // DETAIL MATA PELAJARAN (3 TAB LMS)
  // =====================================
  if (selectedSubject) {
    const currentList = subjectItemsByType[activeTab];

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Header Mapel */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/15 transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Mata Pelajaran</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider">
                    {selectedSubject.code}
                  </span>
                  {selectedSubject.gradeLevels.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold"
                    >
                      Kelas {g}
                    </span>
                  ))}
                  {selectedSubject.isSample && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/50 text-slate-200 text-[11px] font-semibold">
                      Data Contoh
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {selectedSubject.name}
                </h1>
                <p className="text-sm text-blue-100 leading-relaxed">
                  {selectedSubject.description}
                </p>
                {(() => {
                  const summary = formatSubjectTeacherSummary(selectedSubject);
                  if (!summary.full) return null;
                  return (
                    <p className="text-xs text-sky-200 flex items-start gap-1.5 pt-1">
                      <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Pengampu: {summary.full}</span>
                    </p>
                  );
                })()}
              </div>

              {/* Filter Kelas di dalam Mapel */}
              <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/15 shrink-0">
                <span className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-2">
                  Filter Tingkat Kelas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['Semua', 'VII', 'VIII', 'IX'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setDetailGradeFilter(g);
                        setAssignmentLevelFilter(g);
                        setAssignmentClassFilter('Semua');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        (activeTab === 'assignment' ? assignmentLevelFilter : detailGradeFilter) ===
                        g
                          ? 'bg-white text-blue-800 shadow-sm'
                          : 'bg-white/10 text-blue-100 hover:bg-white/20'
                      }`}
                    >
                      {g === 'Semua' ? 'Semua' : `Kelas ${g}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Tab Navigasi: Bahan Ajar, PR / Tugas, Quiz */}
        <section className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-lg border border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('material')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'material'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Bahan Ajar</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'material'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {subjectItemsByType.material.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'assignment'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>PR / Tugas</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'assignment'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {subjectItemsByType.assignment.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Quiz</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'quiz'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {subjectItemsByType.quiz.length}
              </span>
            </button>
          </div>
        </section>

        {/* Daftar Konten Tab */}
        <section className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
          {/* Filter Dua Tingkat Khusus Tab PR / Tugas */}
          {activeTab === 'assignment' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Filter Kelas PR / Tugas
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {assignmentLevelFilter === 'Semua'
                      ? 'Menampilkan seluruh PR terbaru. Pilih tingkat lalu pilih kelas Anda untuk menyaring.'
                      : assignmentClassFilter === 'Semua'
                      ? `Menampilkan PR untuk tingkat ${assignmentLevelFilter}. Pilih kelas spesifik (contoh: ${LMS_CLASS_GROUPS[assignmentLevelFilter][0]}) di bawah.`
                      : `Menampilkan khusus PR untuk kelas ${assignmentClassFilter}.`}
                  </p>
                </div>
                {(assignmentLevelFilter !== 'Semua' || assignmentClassFilter !== 'Semua') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentLevelFilter('Semua');
                      setAssignmentClassFilter('Semua');
                    }}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Tampilkan Semua PR
                  </button>
                )}
              </div>

              {/* Langkah 1: Pilih Tingkat */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                  1. Tingkat:
                </span>
                {(['Semua', 'VII', 'VIII', 'IX'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setAssignmentLevelFilter(level);
                      setAssignmentClassFilter('Semua');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      assignmentLevelFilter === level
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {level === 'Semua' ? 'Semua Tingkat' : `Kelas ${level}`}
                  </button>
                ))}
              </div>

              {/* Langkah 2: Pilih Kelas (A-J untuk VII, A-I untuk VIII & IX) */}
              {assignmentLevelFilter !== 'Semua' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                    2. Kelas:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAssignmentClassFilter('Semua')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      assignmentClassFilter === 'Semua'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Semua {assignmentLevelFilter}
                  </button>
                  {LMS_CLASS_GROUPS[assignmentLevelFilter].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setAssignmentClassFilter(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        assignmentClassFilter === cls
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Belum Ada{' '}
                {activeTab === 'material'
                  ? 'Bahan Ajar'
                  : activeTab === 'assignment'
                  ? 'PR / Tugas'
                  : 'Quiz'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {activeTab === 'assignment' && assignmentClassFilter !== 'Semua'
                  ? `Belum ada PR / Tugas yang ditujukan untuk kelas ${assignmentClassFilter}. Coba pilih kelas lain atau klik "Tampilkan Semua PR".`
                  : 'Guru belum menerbitkan konten untuk kategori dan filter kelas ini. Silakan periksa tab lainnya atau ubah filter kelas di atas.'}
              </p>
            </div>
          ) : (
            currentList.map((item) => {
              const deadlineBadge =
                item.type === 'assignment' ? getDeadlineBadge(item.deadline) : null;

              return (
                <article
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      {/* Meta Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70 text-[11px] font-bold">
                          {item.type === 'assignment'
                            ? formatAssignmentClasses(item)
                            : item.grade === 'Semua'
                            ? 'Semua Kelas'
                            : `Kelas ${item.grade}`}
                        </span>

                        {deadlineBadge && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                              deadlineBadge.variant === 'expired'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : deadlineBadge.variant === 'soon'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {deadlineBadge.variant === 'expired' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : deadlineBadge.variant === 'soon' ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>{deadlineBadge.label}</span>
                          </span>
                        )}

                        {item.isSample && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                            Contoh
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>
                      )}

                      {/* Info Guru, Tanggal Dibuat & Deadline (untuk PR) */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.teacherName}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dibuat: {formatDateId(item.createdAt)}</span>
                        </span>
                        {item.type === 'assignment' && item.dateGiven && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Diberikan: {formatDateId(item.dateGiven)}</span>
                          </span>
                        )}
                        {item.type === 'assignment' && item.deadline && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Batas Kumpul: {formatDateId(item.deadline, true)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tombol Aksi Item */}
                    <div className="flex flex-wrap lg:flex-col items-stretch sm:items-center lg:items-end justify-start gap-2.5 shrink-0 pt-2 lg:pt-0">
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={item.fileName || undefined}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>
                            {item.fileName
                              ? `Unduh / Buka (${item.fileName.length > 22 ? item.fileName.slice(0, 20) + '...' : item.fileName})`
                              : 'Unduh / Buka File'}
                          </span>
                        </a>
                      )}

                      {item.externalUrl && (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Buka Tautan Materi</span>
                        </a>
                      )}

                      {item.type === 'quiz' && item.quizUrl && (
                        <a
                          href={item.quizUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Kerjakan Quiz</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    );
  }

  // =====================================
  // HALAMAN UTAMA LMS (DAFTAR MAPEL)
  // =====================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Banner Header LMS */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-sky-200">
            <GraduationCap className="w-4 h-4" />
            <span>Portal Belajar Siswa (Tanpa Login)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            LMS SMP Negeri 27 Kota Bandung
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Akses Bahan Ajar, PR / Tugas harian, serta Quiz interaktif dari Bapak & Ibu Guru secara
            langsung di HP, tablet, maupun laptop.
          </p>
        </div>
      </section>

      {/* Kolom Pencarian & Filter Kelas */}
      <section className="max-w-6xl mx-auto px-4 -mt-7 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata pelajaran, kode mapel, atau nama guru..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
              Kelas:
            </span>
            {(['Semua', 'VII', 'VIII', 'IX'] as const).map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  gradeFilter === grade
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {grade === 'Semua' ? 'Semua Kelas' : `Kelas ${grade}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Kartu Mata Pelajaran */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        {filteredSubjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Mata Pelajaran Tidak Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Coba kata kunci pencarian lain atau pilih "Semua Kelas".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subj) => {
              const counts = getSubjectCounts(subj.id);
              return (
                <div
                  key={subj.id}
                  onClick={() => handleOpenSubject(subj)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-extrabold tracking-wide">
                        {subj.code}
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        {subj.gradeLevels.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {subj.name}
                      </h2>
                      {subj.isSample && (
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Data Contoh (Dapat Diedit/Dihapus)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {subj.description || 'Klik untuk melihat bahan ajar, tugas, dan quiz terbaru.'}
                    </p>

                    {(() => {
                      const teacherSummary = formatSubjectTeacherSummary(subj);
                      if (!teacherSummary.display) return null;
                      return (
                        <p
                          title={teacherSummary.full}
                          className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            Pengampu: {teacherSummary.display}
                          </span>
                        </p>
                      );
                    })()}
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    {/* Ringkasan Jumlah Konten */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                        <span className="block text-sm font-black text-blue-700 dark:text-blue-400">
                          {counts.material}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Bahan Ajar
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                        <span className="block text-sm font-black text-amber-600 dark:text-amber-400">
                          {counts.assignment}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          PR / Tugas
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                        <span className="block text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {counts.quiz}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Quiz
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-700 group-hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Buka Mata Pelajaran</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
