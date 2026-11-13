import React, { useState, useMemo, useRef } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  LmsGrade,
  LmsItem,
  LmsItemGrade,
  LmsItemType,
  LmsSubject,
  LmsTeacherAccount
} from '../../types';
import { LMS_FILE_ACCEPT_ATTR } from '../../services/storageService';
import {
  LMS_CLASS_GROUPS,
  formatAssignmentClasses,
  sortLmsClasses,
  deriveGradeFromClasses,
  formatSubjectTeacherSummary
} from '../../constants/lmsClasses';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  FileText,
  Users,
  Layers,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lock,
  UserPlus
} from 'lucide-react';

type LmsAdminSubTab = 'konten' | 'mapel' | 'guru';

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) {
    const def = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${def.getFullYear()}-${pad(def.getMonth() + 1)}-${pad(def.getDate())}T23:59`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const AdminLms: React.FC = () => {
  const {
    adminUser,
    lmsSubjects,
    lmsTeachers,
    lmsItems,
    uploadLmsFile,
    saveLmsSubject,
    deleteLmsSubject,
    saveLmsTeacher,
    deleteLmsTeacher,
    saveLmsItem,
    toggleLmsItemStatus,
    deleteLmsItem,
    showToast
  } = useSchoolData();

  const isAdmin = adminUser?.role === 'admin';
  const [subTab, setSubTab] = useState<LmsAdminSubTab>('konten');

  // Filter table state for Konten LMS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('Semua');
  const [filterType, setFilterType] = useState<'Semua' | LmsItemType>('Semua');
  const [filterGrade, setFilterGrade] = useState<'Semua' | LmsItemGrade>('Semua');

  // Modal state: Konten LMS (Bahan Ajar / PR / Quiz)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingLegacyAssignment, setEditingLegacyAssignment] = useState<LmsItemGrade | null>(null);
  const [itemForm, setItemForm] = useState<{
    subjectId: string;
    type: LmsItemType;
    title: string;
    description: string;
    grade: LmsItemGrade;
    targetClasses: string[];
    teacherName: string;
    status: 'published' | 'draft';
    fileUrl: string;
    fileName: string;
    externalUrl: string;
    dateGiven: string;
    deadline: string;
    quizUrl: string;
  }>({
    subjectId: '',
    type: 'material',
    title: '',
    description: '',
    grade: 'VII',
    targetClasses: [],
    teacherName: adminUser?.name || '',
    status: 'published',
    fileUrl: '',
    fileName: '',
    externalUrl: '',
    dateGiven: new Date().toISOString().slice(0, 10),
    deadline: toDatetimeLocalValue(),
    quizUrl: ''
  });
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state: Mata Pelajaran (Admin only)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<{
    name: string;
    code: string;
    description: string;
    gradeLevels: LmsGrade[];
    assignedTeacherIds: string[];
    legacyTeacherNames: string[];
  }>({
    name: '',
    code: '',
    description: '',
    gradeLevels: ['VII', 'VIII', 'IX'],
    assignedTeacherIds: [],
    legacyTeacherNames: []
  });
  const [isTeacherPickerOpen, setIsTeacherPickerOpen] = useState(false);
  const [teacherPickerSearch, setTeacherPickerSearch] = useState('');
  const [isQuickTeacherFormOpen, setIsQuickTeacherFormOpen] = useState(false);
  const [quickTeacherForm, setQuickTeacherForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isCreatingQuickTeacher, setIsCreatingQuickTeacher] = useState(false);
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Modal state: Akun Guru (Admin only)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherForm, setTeacherForm] = useState<{
    name: string;
    email: string;
    password: string;
    assignedSubjectIds: string[];
    isActive: boolean;
  }>({
    name: '',
    email: '',
    password: '',
    assignedSubjectIds: [],
    isActive: true
  });
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    kind: 'item' | 'subject' | 'teacher';
    id: string;
    label: string;
  } | null>(null);

  // Map subjects and teachers for fast lookup
  const subjectById = useMemo(() => {
    const map = new Map<string, LmsSubject>();
    lmsSubjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [lmsSubjects]);

  const teacherById = useMemo(() => {
    const map = new Map<string, LmsTeacherAccount>();
    lmsTeachers.forEach((t) => map.set(t.id, t));
    return map;
  }, [lmsTeachers]);

  const availableTeachersToAdd = useMemo(() => {
    const selectedSet = new Set(subjectForm.assignedTeacherIds);
    const q = teacherPickerSearch.trim().toLowerCase();
    return lmsTeachers.filter((t) => {
      if (selectedSet.has(t.id)) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    });
  }, [lmsTeachers, subjectForm.assignedTeacherIds, teacherPickerSearch]);

  // Filtered & sorted Konten LMS table (newest first)
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...lmsItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((item) => {
        const subj = subjectById.get(item.subjectId);
        const classLabel = (item.targetClasses || []).join(' ').toLowerCase();
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.teacherName.toLowerCase().includes(q) ||
          classLabel.includes(q) ||
          (subj?.name || '').toLowerCase().includes(q);
        const matchesSubj =
          filterSubjectId === 'Semua' || item.subjectId === filterSubjectId;
        const matchesType = filterType === 'Semua' || item.type === filterType;
        const matchesGrade =
          filterGrade === 'Semua' ||
          item.grade === filterGrade ||
          item.grade === 'Semua' ||
          (item.targetClasses || []).some((cls) => cls.startsWith(`${filterGrade}-`));
        return matchesQuery && matchesSubj && matchesType && matchesGrade;
      });
  }, [lmsItems, searchQuery, filterSubjectId, filterType, filterGrade, subjectById]);

  // --- ITEM MODAL HANDLERS ---
  const openAddItemModal = (defaultType: LmsItemType = 'material') => {
    if (lmsSubjects.length === 0) {
      showToast(
        isAdmin
          ? 'Tambahkan mata pelajaran terlebih dahulu di tab Mata Pelajaran.'
          : 'Belum ada mata pelajaran yang ditugaskan kepada akun Anda. Hubungi Administrator.',
        'error'
      );
      return;
    }
    const defaultSubject =
      filterSubjectId !== 'Semua' ? filterSubjectId : lmsSubjects[0]?.id || '';
    setEditingItemId(null);
    setEditingLegacyAssignment(null);
    setItemForm({
      subjectId: defaultSubject,
      type: defaultType,
      title: '',
      description: '',
      grade: 'VII',
      targetClasses: [],
      teacherName: adminUser?.name || '',
      status: 'published',
      fileUrl: '',
      fileName: '',
      externalUrl: '',
      dateGiven: new Date().toISOString().slice(0, 10),
      deadline: toDatetimeLocalValue(),
      quizUrl: ''
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: LmsItem) => {
    const existingClasses = sortLmsClasses(item.targetClasses || []);
    setEditingItemId(item.id);
    setEditingLegacyAssignment(
      item.type === 'assignment' && existingClasses.length === 0 ? item.grade : null
    );
    setItemForm({
      subjectId: item.subjectId,
      type: item.type,
      title: item.title,
      description: item.description,
      grade: item.grade,
      targetClasses: existingClasses,
      teacherName: item.teacherName,
      status: item.status,
      fileUrl: item.fileUrl || '',
      fileName: item.fileName || '',
      externalUrl: item.externalUrl || '',
      dateGiven: item.dateGiven || new Date().toISOString().slice(0, 10),
      deadline: toDatetimeLocalValue(item.deadline),
      quizUrl: item.quizUrl || ''
    });
    setIsItemModalOpen(true);
  };

  const toggleTargetClass = (cls: string) => {
    setItemForm((prev) => {
      const exists = prev.targetClasses.includes(cls);
      const next = exists
        ? prev.targetClasses.filter((c) => c !== cls)
        : sortLmsClasses([...prev.targetClasses, cls]);
      return { ...prev, targetClasses: next };
    });
  };

  const toggleGradeClasses = (level: LmsGrade) => {
    const group = LMS_CLASS_GROUPS[level];
    setItemForm((prev) => {
      const allSelected = group.every((c) => prev.targetClasses.includes(c));
      if (allSelected) {
        return {
          ...prev,
          targetClasses: prev.targetClasses.filter((c) => !group.includes(c))
        };
      }
      return {
        ...prev,
        targetClasses: sortLmsClasses([...prev.targetClasses, ...group])
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    const uploaded = await uploadLmsFile(file);
    setIsUploadingFile(false);
    if (uploaded) {
      setItemForm((prev) => ({
        ...prev,
        fileUrl: uploaded.url,
        fileName: uploaded.fileName
      }));
      showToast(`File "${uploaded.fileName}" berhasil diunggah ke server`, 'success');
    }
    e.target.value = '';
  };

  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.subjectId || !itemForm.title.trim()) {
      showToast('Mata pelajaran dan judul konten wajib diisi.', 'error');
      return;
    }

    if (itemForm.type === 'material' && !itemForm.fileUrl && !itemForm.externalUrl.trim()) {
      showToast('Untuk Bahan Ajar, silakan unggah file atau tempel link materi.', 'error');
      return;
    }

    if (itemForm.type === 'quiz') {
      const urlTrim = itemForm.quizUrl.trim();
      if (!/^https?:\/\//i.test(urlTrim)) {
        showToast('Link Quiz wajib diisi dan diawali dengan http:// atau https://.', 'error');
        return;
      }
    }

    if (itemForm.externalUrl.trim() && !/^https?:\/\//i.test(itemForm.externalUrl.trim())) {
      showToast('Link tautan eksternal harus diawali dengan http:// atau https://.', 'error');
      return;
    }

    let deadlineIso: string | undefined;
    let resolvedGrade: LmsItemGrade = itemForm.grade;
    let targetClasses: string[] | undefined;

    if (itemForm.type === 'assignment') {
      if (itemForm.targetClasses.length === 0) {
        showToast('Pilih minimal satu kelas tujuan untuk PR / Tugas.', 'error');
        return;
      }
      targetClasses = sortLmsClasses(itemForm.targetClasses);
      resolvedGrade = deriveGradeFromClasses(targetClasses);

      if (!itemForm.deadline) {
        showToast('Batas pengumpulan (deadline) PR / Tugas wajib diisi.', 'error');
        return;
      }
      const parsed = new Date(itemForm.deadline);
      if (Number.isNaN(parsed.getTime())) {
        showToast('Format batas waktu pengumpulan tidak valid.', 'error');
        return;
      }
      deadlineIso = parsed.toISOString();
    }

    setIsSavingItem(true);
    const ok = await saveLmsItem({
      id: editingItemId || undefined,
      subjectId: itemForm.subjectId,
      type: itemForm.type,
      title: itemForm.title.trim(),
      description: itemForm.description.trim(),
      grade: resolvedGrade,
      targetClasses,
      teacherName: itemForm.teacherName.trim() || adminUser?.name || 'Guru SMPN 27',
      status: itemForm.status,
      fileUrl: itemForm.fileUrl || undefined,
      fileName: itemForm.fileName || undefined,
      externalUrl: itemForm.externalUrl.trim() || undefined,
      dateGiven: itemForm.type === 'assignment' ? itemForm.dateGiven : undefined,
      deadline: deadlineIso,
      quizUrl: itemForm.type === 'quiz' ? itemForm.quizUrl.trim() : undefined,
      isSample: false
    });
    setIsSavingItem(false);
    if (ok) {
      setIsItemModalOpen(false);
    }
  };

  // --- SUBJECT MODAL HANDLERS ---
  const openAddSubjectModal = () => {
    setEditingSubjectId(null);
    setSubjectForm({
      name: '',
      code: '',
      description: '',
      gradeLevels: ['VII', 'VIII', 'IX'],
      assignedTeacherIds: [],
      legacyTeacherNames: []
    });
    setIsTeacherPickerOpen(false);
    setTeacherPickerSearch('');
    setIsQuickTeacherFormOpen(false);
    setQuickTeacherForm({ name: '', email: '', password: '' });
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subj: LmsSubject) => {
    const initialLegacy = Array.isArray(subj.legacyTeacherNames)
      ? [...subj.legacyTeacherNames]
      : typeof subj.teacherNames === 'string' &&
        subj.teacherNames.trim() &&
        (!subj.assignedTeacherIds || subj.assignedTeacherIds.length === 0)
      ? [subj.teacherNames.trim()]
      : [];

    setEditingSubjectId(subj.id);
    setSubjectForm({
      name: subj.name,
      code: subj.code,
      description: subj.description,
      gradeLevels: subj.gradeLevels,
      assignedTeacherIds: [...(subj.assignedTeacherIds || [])],
      legacyTeacherNames: initialLegacy
    });
    setIsTeacherPickerOpen(false);
    setTeacherPickerSearch('');
    setIsQuickTeacherFormOpen(false);
    setQuickTeacherForm({ name: '', email: '', password: '' });
    setIsSubjectModalOpen(true);
  };

  const toggleSubjectGrade = (g: LmsGrade) => {
    setSubjectForm((prev) => {
      const exists = prev.gradeLevels.includes(g);
      return {
        ...prev,
        gradeLevels: exists
          ? prev.gradeLevels.filter((item) => item !== g)
          : [...prev.gradeLevels, g]
      };
    });
  };

  const handleAddTeacherToSubject = (teacherId: string) => {
    setSubjectForm((prev) => {
      if (prev.assignedTeacherIds.includes(teacherId)) return prev;
      return {
        ...prev,
        assignedTeacherIds: [...prev.assignedTeacherIds, teacherId]
      };
    });
  };

  const handleRemoveTeacherFromSubject = (teacherId: string) => {
    setSubjectForm((prev) => ({
      ...prev,
      assignedTeacherIds: prev.assignedTeacherIds.filter((id) => id !== teacherId)
    }));
  };

  const handleUpdateLegacyTeacherName = (index: number, value: string) => {
    setSubjectForm((prev) => ({
      ...prev,
      legacyTeacherNames: prev.legacyTeacherNames.map((n, idx) => (idx === index ? value : n))
    }));
  };

  const handleRemoveLegacyTeacherName = (index: number) => {
    setSubjectForm((prev) => ({
      ...prev,
      legacyTeacherNames: prev.legacyTeacherNames.filter((_, idx) => idx !== index)
    }));
  };

  const handleQuickCreateTeacher = async () => {
    const name = quickTeacherForm.name.trim();
    const email = quickTeacherForm.email.trim().toLowerCase();
    const password = quickTeacherForm.password;

    if (!name || !email || !email.includes('@')) {
      showToast('Nama lengkap dan email guru yang valid wajib diisi.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password akun guru baru wajib minimal 6 karakter.', 'error');
      return;
    }

    setIsCreatingQuickTeacher(true);
    const created = await saveLmsTeacher({
      name,
      email,
      password,
      assignedSubjectIds: editingSubjectId ? [editingSubjectId] : [],
      isActive: true
    });
    setIsCreatingQuickTeacher(false);

    if (created?.id) {
      handleAddTeacherToSubject(created.id);
      setQuickTeacherForm({ name: '', email: '', password: '' });
      setIsQuickTeacherFormOpen(false);
      setTeacherPickerSearch('');
    }
  };

  const handleSaveSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showToast('Nama mata pelajaran wajib diisi.', 'error');
      return;
    }
    if (subjectForm.gradeLevels.length === 0) {
      showToast('Pilih minimal satu jenjang kelas (VII, VIII, atau IX).', 'error');
      return;
    }
    setIsSavingSubject(true);
    const ok = await saveLmsSubject({
      id: editingSubjectId || undefined,
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      description: subjectForm.description.trim(),
      gradeLevels: subjectForm.gradeLevels,
      assignedTeacherIds: subjectForm.assignedTeacherIds,
      legacyTeacherNames: subjectForm.legacyTeacherNames
        .map((n) => n.trim())
        .filter(Boolean),
      isSample: false
    });
    setIsSavingSubject(false);
    if (ok) {
      setIsSubjectModalOpen(false);
    }
  };

  // --- TEACHER MODAL HANDLERS ---
  const openAddTeacherModal = () => {
    setEditingTeacherId(null);
    setTeacherForm({
      name: '',
      email: '',
      password: '',
      assignedSubjectIds: [],
      isActive: true
    });
    setIsTeacherModalOpen(true);
  };

  const openEditTeacherModal = (teacher: LmsTeacherAccount) => {
    setEditingTeacherId(teacher.id);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      password: '',
      assignedSubjectIds: [...teacher.assignedSubjectIds],
      isActive: teacher.isActive
    });
    setIsTeacherModalOpen(true);
  };

  const toggleTeacherSubject = (subjectId: string) => {
    setTeacherForm((prev) => {
      const exists = prev.assignedSubjectIds.includes(subjectId);
      return {
        ...prev,
        assignedSubjectIds: exists
          ? prev.assignedSubjectIds.filter((id) => id !== subjectId)
          : [...prev.assignedSubjectIds, subjectId]
      };
    });
  };

  const handleSaveTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.email.trim()) {
      showToast('Nama dan email guru wajib diisi.', 'error');
      return;
    }
    if (!editingTeacherId && teacherForm.password.length < 6) {
      showToast('Password akun guru baru wajib minimal 6 karakter.', 'error');
      return;
    }
    if (editingTeacherId && teacherForm.password && teacherForm.password.length < 6) {
      showToast('Password baru guru minimal 6 karakter.', 'error');
      return;
    }
    setIsSavingTeacher(true);
    const ok = await saveLmsTeacher({
      id: editingTeacherId || undefined,
      name: teacherForm.name.trim(),
      email: teacherForm.email.trim().toLowerCase(),
      password: teacherForm.password || undefined,
      assignedSubjectIds: teacherForm.assignedSubjectIds,
      isActive: teacherForm.isActive
    });
    setIsSavingTeacher(false);
    if (ok) {
      setIsTeacherModalOpen(false);
    }
  };

  // --- CONFIRM DELETE HANDLER ---
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.kind === 'item') {
      await deleteLmsItem(deleteConfirm.id);
    } else if (deleteConfirm.kind === 'subject') {
      await deleteLmsSubject(deleteConfirm.id);
    } else if (deleteConfirm.kind === 'teacher') {
      await deleteLmsTeacher(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Kelola LMS Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? 'Kelola mata pelajaran, akun guru pengampu, bahan ajar, PR/tugas, dan quiz siswa.'
              : `Panel Guru: Kelola Bahan Ajar, PR / Tugas, dan Quiz pada mata pelajaran yang Anda ampu.`}
          </p>
        </div>

        {/* Tombol Tambah Konten Cepat */}
        {subTab === 'konten' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openAddItemModal('material')}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bahan Ajar</span>
            </button>
            <button
              onClick={() => openAddItemModal('assignment')}
              className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah PR / Tugas</span>
            </button>
            <button
              onClick={() => openAddItemModal('quiz')}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Quiz</span>
            </button>
          </div>
        )}
      </div>

      {/* Info Banner Mapel Guru (untuk role guru) */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                Mata Pelajaran yang Anda Ampu ({lmsSubjects.length} Mapel)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {lmsSubjects.length > 0
                  ? lmsSubjects.map((s) => `${s.name} (${s.code})`).join(' • ')
                  : 'Belum ada mata pelajaran yang ditugaskan. Silakan hubungi Admin Sekolah.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation (Admin melihat semua 3 tab, Guru hanya Konten LMS) */}
      {isAdmin && (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setSubTab('konten')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              subTab === 'konten'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Konten LMS ({lmsItems.length})</span>
          </button>

          <button
            onClick={() => setSubTab('mapel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              subTab === 'mapel'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mata Pelajaran ({lmsSubjects.length})</span>
          </button>

          <button
            onClick={() => setSubTab('guru')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              subTab === 'guru'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Akun Guru LMS ({lmsTeachers.length})</span>
          </button>
        </div>
      )}

      {/* ========================================= */}
      {/* SUBTAB 1: DAFTAR & KELOLA KONTEN LMS */}
      {/* ========================================= */}
      {subTab === 'konten' && (
        <div className="space-y-4">
          {/* Pencarian & Filter */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul materi, PR, quiz, guru..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Mata Pelajaran</option>
              {lmsSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'Semua' | LmsItemType)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Jenis Konten</option>
              <option value="material">Bahan Ajar</option>
              <option value="assignment">PR / Tugas</option>
              <option value="quiz">Quiz</option>
            </select>

            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value as 'Semua' | LmsItemGrade)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Filter Kelas</option>
              <option value="VII">Kelas VII</option>
              <option value="VIII">Kelas VIII</option>
              <option value="IX">Kelas IX</option>
            </select>
          </div>

          {/* Tabel Konten LMS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Judul Konten</th>
                    <th className="py-3.5 px-4">Mapel & Kelas</th>
                    <th className="py-3.5 px-4">Jenis</th>
                    <th className="py-3.5 px-4">Guru & Tanggal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        Belum ada item LMS yang sesuai filter. Klik tombol "Tambah" di kanan atas
                        untuk menambahkan materi, PR, atau quiz baru.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const subj = subjectById.get(item.subjectId);
                      const canManageItem = isAdmin || item.createdByUserId === adminUser?.id;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-2">
                              {item.title}
                            </p>
                            {item.type === 'assignment' && item.deadline && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                                Deadline:{' '}
                                {new Date(item.deadline).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                            {item.isSample && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                                Contoh
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-[220px]">
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">
                              {subj?.name || 'Mapel Terhapus'}
                            </span>
                            {item.type === 'assignment' ? (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold leading-snug">
                                {formatAssignmentClasses(item)}
                                {(!item.targetClasses || item.targetClasses.length === 0) &&
                                  ' (Format Lama)'}
                              </span>
                            ) : (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                {item.grade === 'Semua' ? 'Semua Kelas' : `Kelas ${item.grade}`}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {item.type === 'material' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                                <BookOpen className="w-3 h-3" />
                                Bahan Ajar
                              </span>
                            ) : item.type === 'assignment' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                                <ClipboardList className="w-3 h-3" />
                                PR / Tugas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                <HelpCircle className="w-3 h-3" />
                                Quiz
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="block font-medium text-slate-700 dark:text-slate-300">
                              {item.teacherName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {canManageItem ? (
                              <button
                                onClick={() =>
                                  toggleLmsItemStatus(
                                    item.id,
                                    item.status === 'published' ? 'draft' : 'published'
                                  )
                                }
                                title="Klik untuk mengubah status tampil/sembunyi"
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                                  item.status === 'published'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                                }`}
                              >
                                {item.status === 'published' ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    <span>Terbit</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    <span>Draf</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span
                                title="Hanya guru pembuat konten ini atau Admin yang dapat mengubah status"
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold opacity-80 ${
                                  item.status === 'published'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {item.status === 'published' ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    <span>Terbit</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    <span>Draf</span>
                                  </>
                                )}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {(item.fileUrl || item.externalUrl || item.quizUrl) && (
                                <a
                                  href={item.fileUrl || item.quizUrl || item.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Buka lampiran / tautan"
                                  className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              {canManageItem ? (
                                <>
                                  <button
                                    onClick={() => openEditItemModal(item)}
                                    title="Edit Konten"
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        kind: 'item',
                                        id: item.id,
                                        label: item.title
                                      })
                                    }
                                    title="Hapus Konten"
                                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span
                                  title="Anda hanya dapat mengedit dan menghapus konten yang Anda buat sendiri"
                                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-semibold"
                                >
                                  Milik guru lain
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SUBTAB 2: KELOLA MATA PELAJARAN (ADMIN) */}
      {/* ========================================= */}
      {isAdmin && subTab === 'mapel' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddSubjectModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lmsSubjects.map((subj) => {
              const itemsCount = lmsItems.filter((i) => i.subjectId === subj.id).length;
              return (
                <div
                  key={subj.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold">
                        {subj.code}
                      </span>
                      <div className="flex items-center gap-1">
                        {subj.gradeLevels.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {subj.description || 'Belum ada deskripsi.'}
                    </p>
                    {(() => {
                      const teacherSummary = formatSubjectTeacherSummary(subj);
                      if (!teacherSummary.display) return null;
                      return (
                        <p
                          title={teacherSummary.full}
                          className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug"
                        >
                          Pengampu: {teacherSummary.display}
                        </p>
                      );
                    })()}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {itemsCount} Konten LMS
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditSubjectModal(subj)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Ubah</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            kind: 'subject',
                            id: subj.id,
                            label: `${subj.name} (termasuk ${itemsCount} konten di dalamnya)`
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SUBTAB 3: KELOLA AKUN GURU (ADMIN) */}
      {/* ========================================= */}
      {isAdmin && subTab === 'guru' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Guru yang terdaftar dapat masuk melalui halaman login Panel Admin/Guru menggunakan
              email & password di bawah ini, dan hanya bisa mengelola mapel yang ditugaskan.
            </p>
            <button
              onClick={openAddTeacherModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Guru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Nama Guru</th>
                    <th className="py-3.5 px-4">Email Login</th>
                    <th className="py-3.5 px-4">Mapel yang Diampu</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {lmsTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 dark:text-slate-400">
                        Belum ada akun guru LMS. Klik "Tambah Akun Guru" untuk membuat akun guru
                        pertama.
                      </td>
                    </tr>
                  ) : (
                    lmsTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {teacher.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {teacher.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.assignedSubjectIds.length === 0 ? (
                              <span className="text-slate-400 italic">Belum ada mapel</span>
                            ) : (
                              teacher.assignedSubjectIds.map((sid) => {
                                const subj = subjectById.get(sid);
                                return (
                                  <span
                                    key={sid}
                                    className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold"
                                  >
                                    {subj ? subj.name : sid}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {teacher.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                              <AlertCircle className="w-3 h-3" />
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditTeacherModal(teacher)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Edit Guru & Mapel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                kind: 'teacher',
                                id: teacher.id,
                                label: `${teacher.name} (${teacher.email})`
                              })
                            }
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Hapus Akun Guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL TAMBAH / EDIT KONTEN LMS */}
      {/* ========================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingItemId ? 'Edit Konten LMS' : 'Tambah Konten LMS Baru'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="space-y-4 mt-5">
              {/* Jenis Konten */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'material', label: 'Bahan Ajar' },
                    { id: 'assignment', label: 'PR / Tugas' },
                    { id: 'quiz', label: 'Quiz' }
                  ] as const
                ).map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setItemForm((prev) => ({ ...prev, type: tab.id }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      itemForm.type === tab.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                className={
                  itemForm.type === 'assignment'
                    ? 'grid grid-cols-1 gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                }
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran *
                  </label>
                  <select
                    required
                    value={itemForm.subjectId}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, subjectId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {lmsSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {itemForm.type !== 'assignment' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kelas Sasaran *
                    </label>
                    <select
                      value={itemForm.grade}
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          grade: e.target.value as LmsItemGrade
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="VII">Kelas VII</option>
                      <option value="VIII">Kelas VIII</option>
                      <option value="IX">Kelas IX</option>
                      <option value="Semua">Semua Kelas (VII, VIII, IX)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Pemilih Kelas Spesifik (28 Kelas) khusus PR / Tugas */}
              {itemForm.type === 'assignment' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-white">
                        Pilih Kelas Tujuan PR / Tugas *
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Centang satu kelas, beberapa kelas sekaligus, atau gunakan tombol pilih
                        semua per tingkat.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                        {itemForm.targetClasses.length} kelas dipilih
                      </span>
                      {itemForm.targetClasses.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setItemForm((prev) => ({ ...prev, targetClasses: [] }))
                          }
                          className="text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          Reset Pilihan
                        </button>
                      )}
                    </div>
                  </div>

                  {editingLegacyAssignment && itemForm.targetClasses.length === 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        PR ini sebelumnya memakai format kelas lama (
                        <strong>
                          {editingLegacyAssignment === 'Semua'
                            ? 'Semua Kelas'
                            : `Kelas ${editingLegacyAssignment}`}
                        </strong>
                        ). Silakan centang kelas spesifik di bawah ini sebelum menyimpan.
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(['VII', 'VIII', 'IX'] as const).map((level) => {
                      const classes = LMS_CLASS_GROUPS[level];
                      const selectedInGroup = classes.filter((c) =>
                        itemForm.targetClasses.includes(c)
                      ).length;
                      const allSelected = selectedInGroup === classes.length;

                      return (
                        <div
                          key={level}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                              Tingkat {level}{' '}
                              <span className="text-[11px] font-normal text-slate-500">
                                ({selectedInGroup}/{classes.length} kelas)
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleGradeClasses(level)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                allSelected
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {allSelected
                                ? `Batalkan semua kelas ${level}`
                                : `Pilih semua kelas ${level}`}
                            </button>
                          </div>

                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {classes.map((cls) => {
                              const checked = itemForm.targetClasses.includes(cls);
                              return (
                                <label
                                  key={cls}
                                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all ${
                                    checked
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleTargetClass(cls)}
                                    className="sr-only"
                                  />
                                  <span>{cls}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul{' '}
                  {itemForm.type === 'material'
                    ? 'Bahan Ajar'
                    : itemForm.type === 'assignment'
                    ? 'PR / Tugas'
                    : 'Quiz'}{' '}
                  *
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.title}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Modul Bab 2 Aljabar Linear"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {itemForm.type === 'assignment' ? 'Instruksi Pengerjaan PR / Tugas' : 'Deskripsi Singkat'}
                </label>
                <textarea
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={
                    itemForm.type === 'assignment'
                      ? 'Tuliskan langkah pengerjaan, format pengumpulan, atau catatan penting...'
                      : 'Ringkasan isi materi atau keterangan quiz...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Field khusus PR / Tugas */}
              {itemForm.type === 'assignment' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal Diberikan *
                    </label>
                    <input
                      type="date"
                      required
                      value={itemForm.dateGiven}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, dateGiven: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Batas Pengumpulan (Deadline) *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={itemForm.deadline}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, deadline: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Field khusus Quiz */}
              {itemForm.type === 'quiz' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link Quiz (Google Form, Quizizz, Kahoot, dll.) *
                  </label>
                  <input
                    type="url"
                    required
                    value={itemForm.quizUrl}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, quizUrl: e.target.value }))
                    }
                    placeholder="https://docs.google.com/forms/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Unggah File & Tempel Link (untuk Bahan Ajar wajib salah satu, untuk PR opsional) */}
              {itemForm.type !== 'quiz' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Unggah File {itemForm.type === 'assignment' ? '(Opsional)' : ''} — PDF, DOCX,
                      PPTX, atau Gambar (Maks 10 MB)
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={LMS_FILE_ACCEPT_ATTR}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingFile}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingFile ? 'Mengunggah...' : 'Pilih & Unggah File'}</span>
                      </button>

                      {itemForm.fileUrl && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {itemForm.fileName || 'File terunggah'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setItemForm((prev) => ({ ...prev, fileUrl: '', fileName: '' }))
                            }
                            className="text-rose-500 hover:text-rose-700"
                            title="Hapus lampiran file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Atau Tempel Link (Google Drive, YouTube, PDF Online){' '}
                      {itemForm.type === 'assignment' ? '(Opsional)' : ''}
                    </label>
                    <input
                      type="url"
                      value={itemForm.externalUrl}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, externalUrl: e.target.value }))
                      }
                      placeholder="https://drive.google.com/... atau https://youtube.com/..."
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Guru Pembuat
                    </label>
                    <input
                      type="text"
                      value={itemForm.teacherName}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, teacherName: e.target.value }))
                      }
                      placeholder="Nama guru pengampu"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Penayangan
                  </label>
                  <select
                    value={itemForm.status}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        status: e.target.value as 'published' | 'draft'
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="published">Terbitkan (Tampil untuk Siswa)</option>
                    <option value="draft">Sembunyikan Sementara (Draf)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem || isUploadingFile}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-md"
                >
                  {isSavingItem ? 'Menyimpan...' : 'Simpan Konten LMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL TAMBAH / EDIT MATA PELAJARAN */}
      {/* ========================================= */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingSubjectId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubjectSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Mata Pelajaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectForm.name}
                    onChange={(e) =>
                      setSubjectForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: Bahasa Inggris"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) =>
                      setSubjectForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="ING"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenjang Kelas *
                </label>
                <div className="flex gap-2">
                  {(['VII', 'VIII', 'IX'] as const).map((g) => {
                    const active = subjectForm.gradeLevels.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => toggleSubjectGrade(g)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          active
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Kelas {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daftar Guru Pengampu (Multi-Guru) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-white">
                      Daftar Guru Pengampu (
                      {subjectForm.assignedTeacherIds.length +
                        subjectForm.legacyTeacherNames.length}
                      )
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Satu mata pelajaran dapat diampu lebih dari satu guru sekaligus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTeacherPickerOpen((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isTeacherPickerOpen ? 'Tutup Pilihan' : 'Tambah Guru'}</span>
                  </button>
                </div>

                {/* Daftar Guru Terpilih */}
                {subjectForm.assignedTeacherIds.length === 0 &&
                subjectForm.legacyTeacherNames.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    Belum ada guru pengampu. Klik "+ Tambah Guru" untuk memilih dari akun guru atau
                    membuat akun baru.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subjectForm.assignedTeacherIds.map((tid) => {
                      const t = teacherById.get(tid);
                      if (!t) return null;
                      return (
                        <div
                          key={tid}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {t.name}
                              {!t.isActive && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-500">
                                  Nonaktif
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {t.email}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeacherFromSubject(tid)}
                            title="Hapus guru dari mapel ini"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 shrink-0 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {subjectForm.legacyTeacherNames.map((legacyName, idx) => (
                      <div
                        key={`legacy-${idx}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60"
                      >
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={legacyName}
                            onChange={(e) => handleUpdateLegacyTeacherName(idx, e.target.value)}
                            placeholder="Nama pengampu contoh / catatan lama"
                            className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLegacyTeacherName(idx)}
                          title="Hapus nama pengampu ini"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 shrink-0 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Panel Pencarian Akun Guru + Opsi Buat Akun Guru Baru */}
                {isTeacherPickerOpen && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/70 space-y-2.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={teacherPickerSearch}
                        onChange={(e) => setTeacherPickerSearch(e.target.value)}
                        placeholder="Cari nama atau email guru..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {availableTeachersToAdd.length === 0 ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center py-2">
                          {lmsTeachers.length === 0
                            ? 'Belum ada akun guru terdaftar.'
                            : 'Tidak ada akun guru tersisa yang cocok dengan pencarian.'}
                        </p>
                      ) : (
                        availableTeachersToAdd.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleAddTeacherToSubject(t.id)}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                                {t.name}
                              </span>
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {t.email}
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold shrink-0">
                              + Pilih
                            </span>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsQuickTeacherFormOpen((prev) => !prev)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>
                          {isQuickTeacherFormOpen
                            ? 'Tutup Form Buat Guru Baru'
                            : 'Guru belum punya akun? Buat Akun Guru Baru di sini'}
                        </span>
                      </button>

                      {isQuickTeacherFormOpen && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            Buat Akun Guru Baru & Langsung Tambahkan
                          </p>
                          <input
                            type="text"
                            value={quickTeacherForm.name}
                            onChange={(e) =>
                              setQuickTeacherForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Nama Lengkap Guru (mis. Ibu Upik, S.Pd.)"
                            className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                          <input
                            type="email"
                            value={quickTeacherForm.email}
                            onChange={(e) =>
                              setQuickTeacherForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            placeholder="Email Login Guru"
                            className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                          <input
                            type="password"
                            value={quickTeacherForm.password}
                            onChange={(e) =>
                              setQuickTeacherForm((prev) => ({ ...prev, password: e.target.value }))
                            }
                            placeholder="Password Login (minimal 6 karakter)"
                            className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setIsQuickTeacherFormOpen(false)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={isCreatingQuickTeacher}
                              onClick={handleQuickCreateTeacher}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[11px] font-bold"
                            >
                              {isCreatingQuickTeacher
                                ? 'Membuat Akun...'
                                : 'Buat & Tambahkan Guru'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat Mata Pelajaran
                </label>
                <textarea
                  rows={3}
                  value={subjectForm.description}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Keterangan singkat ruang lingkup pembelajaran..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  {isSavingSubject ? 'Menyimpan...' : 'Simpan Mata Pelajaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL TAMBAH / EDIT AKUN GURU LMS */}
      {/* ========================================= */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingTeacherId ? 'Edit Akun Guru LMS' : 'Buat Akun Guru LMS Baru'}
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacherSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Guru *
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Ibu Siti Rahmawati, S.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Login Guru *
                </label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="guru.mapel@smpn27bandung.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {editingTeacherId
                    ? 'Password Baru (Kosongkan jika tidak ingin mengubah)'
                    : 'Password Login Guru (Minimal 6 karakter) *'}
                </label>
                <input
                  type="password"
                  required={!editingTeacherId}
                  value={teacherForm.password}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder={editingTeacherId ? '••••••••' : 'Minimal 6 karakter'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Mata Pelajaran yang Diampu Guru Ini
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  {lmsSubjects.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada mata pelajaran.</p>
                  ) : (
                    lmsSubjects.map((subj) => {
                      const checked = teacherForm.assignedSubjectIds.includes(subj.id);
                      return (
                        <label
                          key={subj.id}
                          className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTeacherSubject(subj.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {subj.name} ({subj.code})
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teacherForm.isActive}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Akun aktif (diizinkan login dan mengelola LMS)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingTeacher}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  {isSavingTeacher ? 'Menyimpan...' : 'Simpan Akun Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteConfirm)}
        title={
          deleteConfirm?.kind === 'subject'
            ? 'Hapus Mata Pelajaran'
            : deleteConfirm?.kind === 'teacher'
            ? 'Hapus Akun Guru'
            : 'Hapus Konten LMS'
        }
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirm?.label}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
