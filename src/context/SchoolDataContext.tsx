import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SchoolSettings,
  AboutData,
  Article,
  Teacher,
  Facility,
  Extracurricular,
  Achievement,
  GalleryItem,
  ClassGradeStat,
  ContactMessage,
  AdminUser,
  LmsSubject,
  LmsTeacherAccount,
  LmsItem
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_ABOUT,
  INITIAL_ARTICLES,
  INITIAL_TEACHERS,
  INITIAL_FACILITIES,
  INITIAL_EXTRACURRICULARS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_GALLERY,
  INITIAL_STUDENT_STATS
} from '../data/initialData';
import { storageService, clearLegacyLocalData } from '../services/storageService';

export type PublicPageRoute =
  | 'beranda'
  | 'tentang'
  | 'data-sekolah'
  | 'kesiswaan'
  | 'berita-galeri'
  | 'lms'
  | 'kontak'
  | 'detail-berita'
  | 'admin'
  | 'reset-password';

export type AdminTab =
  | 'dashboard'
  | 'kelola-lms'
  | 'berita'
  | 'guru'
  | 'fasilitas'
  | 'ekskul'
  | 'prestasi'
  | 'galeri'
  | 'statistik'
  | 'tentang'
  | 'pengaturan'
  | 'pengaturan-akun'
  | 'pesan'
  | 'supabase';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SchoolContextValue {
  currentRoute: PublicPageRoute;
  setCurrentRoute: (route: PublicPageRoute) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeArticleId: string | null;
  openArticleDetail: (id: string) => void;
  closeArticleDetail: () => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Server load status
  isDataLoaded: boolean;

  // Data states
  settings: SchoolSettings;
  about: AboutData;
  articles: Article[];
  teachers: Teacher[];
  facilities: Facility[];
  extracurriculars: Extracurricular[];
  achievements: Achievement[];
  gallery: GalleryItem[];
  studentStats: ClassGradeStat[];
  messages: ContactMessage[];
  adminUser: AdminUser | null;

  // LMS states
  lmsSubjects: LmsSubject[];
  lmsTeachers: LmsTeacherAccount[];
  lmsItems: LmsItem[];

  // Image & LMS file upload
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
  uploadLmsFile: (file: File) => Promise<{ url: string; fileName: string } | null>;

  // CRUD actions
  updateSettings: (newSettings: SchoolSettings, customToast?: string) => Promise<boolean>;
  updateAbout: (newAbout: AboutData, customToast?: string) => Promise<boolean>;
  saveArticle: (article: Article) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  saveTeacher: (teacher: Teacher) => Promise<boolean>;
  deleteTeacher: (id: string) => Promise<boolean>;
  saveFacility: (facility: Facility) => Promise<boolean>;
  deleteFacility: (id: string) => Promise<boolean>;
  saveExtracurricular: (item: Extracurricular) => Promise<boolean>;
  deleteExtracurricular: (id: string) => Promise<boolean>;
  saveAchievement: (item: Achievement) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  saveGalleryItem: (item: GalleryItem) => Promise<boolean>;
  deleteGalleryItem: (id: string) => Promise<boolean>;
  saveStudentStats: (stats: ClassGradeStat[]) => Promise<boolean>;
  sendContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>) => Promise<boolean>;
  markMessageRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // LMS CRUD actions
  refreshLmsData: () => Promise<void>;
  saveLmsSubject: (subject: Partial<LmsSubject> & { name: string }) => Promise<boolean>;
  deleteLmsSubject: (id: string) => Promise<boolean>;
  saveLmsTeacher: (
    teacher: Partial<LmsTeacherAccount> & { name: string; email: string; password?: string }
  ) => Promise<LmsTeacherAccount | null>;
  deleteLmsTeacher: (id: string) => Promise<boolean>;
  saveLmsItem: (
    item: Partial<LmsItem> & { subjectId: string; type: LmsItem['type']; title: string }
  ) => Promise<boolean>;
  toggleLmsItemStatus: (id: string, status: 'published' | 'draft') => Promise<boolean>;
  deleteLmsItem: (id: string) => Promise<boolean>;

  // Auth
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  resetAllDefaults: () => Promise<void>;

  // Toast
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const SchoolDataContext = createContext<SchoolContextValue | undefined>(undefined);

const resolveInitialLocation = (): { route: PublicPageRoute; tab: AdminTab } => {
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash;
  const cleanHash = hash.replace(/^#\/?/, '').toLowerCase();

  if (
    pathname.startsWith('/reset-password') ||
    cleanHash.startsWith('reset-password') ||
    hash.includes('type=recovery')
  ) {
    return { route: 'admin', tab: 'dashboard' };
  }

  if (
    pathname.startsWith('/admin/pengaturan-akun') ||
    cleanHash.startsWith('admin/pengaturan-akun')
  ) {
    return { route: 'admin', tab: 'pengaturan-akun' };
  }

  if (
    pathname.startsWith('/admin/kelola-lms') ||
    cleanHash.startsWith('admin/kelola-lms')
  ) {
    return { route: 'admin', tab: 'kelola-lms' };
  }

  if (pathname.startsWith('/admin') || cleanHash.startsWith('admin')) {
    return { route: 'admin', tab: 'dashboard' };
  }

  const publicRoutes: PublicPageRoute[] = [
    'tentang',
    'data-sekolah',
    'kesiswaan',
    'berita-galeri',
    'lms',
    'kontak'
  ];
  const matchedPath = pathname.replace(/^\/|\/$/g, '') as PublicPageRoute;
  if (publicRoutes.includes(matchedPath)) {
    return { route: matchedPath, tab: 'dashboard' };
  }
  if (publicRoutes.includes(cleanHash as PublicPageRoute)) {
    return { route: cleanHash as PublicPageRoute, tab: 'dashboard' };
  }

  return { route: 'beranda', tab: 'dashboard' };
};

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocation = resolveInitialLocation();
  const [currentRoute, setCurrentRouteState] = useState<PublicPageRoute>(initialLocation.route);
  const [activeAdminTab, setActiveAdminTabState] = useState<AdminTab>(initialLocation.tab);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const setActiveAdminTab = (tab: AdminTab) => {
    setActiveAdminTabState(tab);
    if (tab === 'pengaturan-akun') {
      window.history.pushState(null, '', '/admin/pengaturan-akun');
    } else if (tab === 'kelola-lms') {
      window.history.pushState(null, '', '/admin/kelola-lms');
    } else if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.pushState(null, '', '/admin');
    }
  };

  // Sync path/hash routing
  const setCurrentRoute = (route: PublicPageRoute) => {
    setCurrentRouteState(route);
    if (route === 'admin') {
      const targetUrl =
        activeAdminTab === 'pengaturan-akun'
          ? '/admin/pengaturan-akun'
          : activeAdminTab === 'kelola-lms'
          ? '/admin/kelola-lms'
          : '/admin';
      window.history.pushState(null, '', targetUrl);
    } else if (route === 'reset-password') {
      window.history.pushState(null, '', '/admin');
    } else if (route === 'beranda') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/#/${route}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openArticleDetail = (id: string) => {
    setActiveArticleId(id);
    storageService.incrementArticleViews(id);
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, views: (a.views || 0) + 1 } : a))
    );
    setCurrentRoute('detail-berita');
  };

  const closeArticleDetail = () => {
    setActiveArticleId(null);
    setCurrentRoute('berita-galeri');
  };

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('smpn27_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smpn27_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smpn27_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // State data — always hydrated from server on load (never from browser storage)
  const [settings, setSettings] = useState<SchoolSettings>(INITIAL_SETTINGS);
  const [about, setAbout] = useState<AboutData>(INITIAL_ABOUT);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [extracurriculars, setExtracurriculars] =
    useState<Extracurricular[]>(INITIAL_EXTRACURRICULARS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [studentStats, setStudentStats] = useState<ClassGradeStat[]>(INITIAL_STUDENT_STATS);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [lmsSubjects, setLmsSubjects] = useState<LmsSubject[]>([]);
  const [lmsTeachers, setLmsTeachers] = useState<LmsTeacherAccount[]>([]);
  const [lmsItems, setLmsItems] = useState<LmsItem[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() =>
    storageService.getCurrentAdmin()
  );

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // URL Path & Hash listener for direct navigation
  useEffect(() => {
    const syncRouteFromBrowser = () => {
      const resolved = resolveInitialLocation();
      setCurrentRouteState(resolved.route);
      if (resolved.route === 'admin' && resolved.tab === 'pengaturan-akun') {
        setActiveAdminTabState('pengaturan-akun');
      }
    };

    window.addEventListener('hashchange', syncRouteFromBrowser);
    window.addEventListener('popstate', syncRouteFromBrowser);
    return () => {
      window.removeEventListener('hashchange', syncRouteFromBrowser);
      window.removeEventListener('popstate', syncRouteFromBrowser);
    };
  }, []);

  // Load latest data & images directly from server on every page load
  useEffect(() => {
    clearLegacyLocalData();
    let cancelled = false;

    const loadFromServer = async () => {
      try {
        const verifiedUser = await storageService.verifyAdminSession();
        if (cancelled) return;
        setAdminUser(verifiedUser);

        if (verifiedUser && verifiedUser.role === 'admin') {
          const adminData = await storageService.fetchAdminData();
          if (cancelled) return;
          setSettings(adminData.settings);
          setAbout(adminData.about);
          setArticles(adminData.articles);
          setTeachers(adminData.teachers);
          setFacilities(adminData.facilities);
          setExtracurriculars(adminData.extracurriculars);
          setAchievements(adminData.achievements);
          setGallery(adminData.gallery);
          setStudentStats(adminData.studentStats);
          setMessages(adminData.messages);
          setLmsSubjects(adminData.lmsSubjects || []);
          setLmsTeachers(adminData.lmsTeachers || []);
          setLmsItems(adminData.lmsItems || []);
        } else {
          const publicData = await storageService.fetchPublicData();
          if (cancelled) return;
          setSettings(publicData.settings);
          setAbout(publicData.about);
          setArticles(publicData.articles);
          setTeachers(publicData.teachers);
          setFacilities(publicData.facilities);
          setExtracurriculars(publicData.extracurriculars);
          setAchievements(publicData.achievements);
          setGallery(publicData.gallery);
          setStudentStats(publicData.studentStats);
          setMessages([]);
          setLmsTeachers([]);

          if (verifiedUser && verifiedUser.role === 'teacher') {
            setActiveAdminTabState('kelola-lms');
            const lmsData = await storageService.fetchLmsManageData();
            if (cancelled) return;
            setLmsSubjects(lmsData.subjects || []);
            setLmsItems(lmsData.items || []);
          } else {
            setLmsSubjects(publicData.lmsSubjects || []);
            setLmsItems(publicData.lmsItems || []);
          }
        }
      } catch (err) {
        console.error('Failed to load server data:', err);
      } finally {
        if (!cancelled) {
          setIsDataLoaded(true);
        }
      }
    };

    loadFromServer();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerError = (err: unknown, fallbackMessage: string) => {
    const msg = err instanceof Error ? err.message : fallbackMessage;
    showToast(msg, 'error');
    if (
      msg.toLowerCase().includes('sesi admin tidak valid') ||
      msg.toLowerCase().includes('sesi login tidak valid')
    ) {
      storageService.logoutAdmin();
      setAdminUser(null);
    }
  };

  // Upload image to permanent server storage
  const uploadImage = async (file: File, folder = 'media'): Promise<string | null> => {
    const res = await storageService.uploadImage(file, folder);
    if (res.error || !res.url) {
      showToast(res.error || 'Gagal mengunggah gambar ke server.', 'error');
      return null;
    }
    return res.url;
  };

  // Upload LMS file (PDF, DOCX, PPTX, image <= 10 MB) to permanent server storage
  const uploadLmsFile = async (
    file: File
  ): Promise<{ url: string; fileName: string } | null> => {
    const res = await storageService.uploadLmsFile(file);
    if (res.error || !res.url) {
      showToast(res.error || 'Gagal mengunggah file materi ke server.', 'error');
      return null;
    }
    return { url: res.url, fileName: res.fileName || file.name };
  };

  // CRUD Implementations (persisted on server)
  const updateSettings = async (
    newSettings: SchoolSettings,
    customToast?: string
  ): Promise<boolean> => {
    try {
      const saved = await storageService.saveSettings(newSettings);
      setSettings(saved);
      showToast(customToast || 'Pengaturan sekolah berhasil diperbarui', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan pengaturan sekolah');
      return false;
    }
  };

  const updateAbout = async (newAbout: AboutData, customToast?: string): Promise<boolean> => {
    try {
      const saved = await storageService.saveAbout(newAbout);
      setAbout(saved);
      showToast(customToast || 'Profil Tentang Sekolah berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan profil Tentang Sekolah');
      return false;
    }
  };

  const saveArticle = async (article: Article): Promise<boolean> => {
    try {
      const updated = await storageService.saveArticle(article);
      setArticles(updated);
      showToast('Berita berhasil disimpan!', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan berita');
      return false;
    }
  };

  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteArticle(id);
      setArticles(updated);
      showToast('Berita berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus berita');
      return false;
    }
  };

  const saveTeacher = async (teacher: Teacher): Promise<boolean> => {
    try {
      const updated = await storageService.saveTeacher(teacher);
      setTeachers(updated);
      showToast('Data guru/tendik berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan data guru/tendik');
      return false;
    }
  };

  const deleteTeacher = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteTeacher(id);
      setTeachers(updated);
      showToast('Data guru/tendik berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus data guru/tendik');
      return false;
    }
  };

  const saveFacility = async (facility: Facility): Promise<boolean> => {
    try {
      const updated = await storageService.saveFacility(facility);
      setFacilities(updated);
      showToast('Fasilitas berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan fasilitas');
      return false;
    }
  };

  const deleteFacility = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteFacility(id);
      setFacilities(updated);
      showToast('Fasilitas berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus fasilitas');
      return false;
    }
  };

  const saveExtracurricular = async (item: Extracurricular): Promise<boolean> => {
    try {
      const updated = await storageService.saveExtracurricular(item);
      setExtracurriculars(updated);
      showToast('Ekstrakurikuler berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan ekstrakurikuler');
      return false;
    }
  };

  const deleteExtracurricular = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteExtracurricular(id);
      setExtracurriculars(updated);
      showToast('Ekstrakurikuler berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus ekstrakurikuler');
      return false;
    }
  };

  const saveAchievement = async (item: Achievement): Promise<boolean> => {
    try {
      const updated = await storageService.saveAchievement(item);
      setAchievements(updated);
      showToast('Prestasi siswa berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan prestasi siswa');
      return false;
    }
  };

  const deleteAchievement = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteAchievement(id);
      setAchievements(updated);
      showToast('Prestasi berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus prestasi');
      return false;
    }
  };

  const saveGalleryItem = async (item: GalleryItem): Promise<boolean> => {
    try {
      const updated = await storageService.saveGalleryItem(item);
      setGallery(updated);
      showToast('Foto galeri berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan foto galeri');
      return false;
    }
  };

  const deleteGalleryItem = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteGalleryItem(id);
      setGallery(updated);
      showToast('Foto galeri berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus foto galeri');
      return false;
    }
  };

  const saveStudentStats = async (stats: ClassGradeStat[]): Promise<boolean> => {
    try {
      const updated = await storageService.saveStudentStats(stats);
      setStudentStats(updated);
      showToast('Statistik siswa berhasil diperbarui', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal memperbarui statistik siswa');
      return false;
    }
  };

  const sendContactMessage = async (
    msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>
  ): Promise<boolean> => {
    try {
      const saved = await storageService.sendContactMessage(msg);
      setMessages((prev) => [saved, ...prev]);
      showToast('Pesan Anda berhasil dikirim ke pihak sekolah. Terima kasih!', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal mengirim pesan. Silakan coba kembali.');
      return false;
    }
  };

  const markMessageRead = async (id: string): Promise<void> => {
    try {
      const updated = await storageService.markMessageAsRead(id, true);
      setMessages(updated);
      showToast('Pesan ditandai telah dibaca', 'info');
    } catch (err) {
      handleServerError(err, 'Gagal memperbarui status pesan');
    }
  };

  const deleteMessage = async (id: string): Promise<void> => {
    try {
      const updated = await storageService.deleteMessage(id);
      setMessages(updated);
      showToast('Pesan berhasil dihapus', 'info');
    } catch (err) {
      handleServerError(err, 'Gagal menghapus pesan');
    }
  };

  // --- LMS CRUD IMPLEMENTATIONS ---
  const refreshLmsData = async (): Promise<void> => {
    try {
      const current = storageService.getCurrentAdmin();
      if (current) {
        const manage = await storageService.fetchLmsManageData();
        setLmsSubjects(manage.subjects || []);
        setLmsTeachers(manage.teachers || []);
        setLmsItems(manage.items || []);
      } else {
        const pub = await storageService.fetchPublicData();
        setLmsSubjects(pub.lmsSubjects || []);
        setLmsItems(pub.lmsItems || []);
      }
    } catch {
      // Non-fatal
    }
  };

  const saveLmsSubject = async (
    subject: Partial<LmsSubject> & { name: string }
  ): Promise<boolean> => {
    try {
      const updated = await storageService.saveLmsSubject(subject);
      setLmsSubjects(updated.subjects);
      setLmsTeachers(updated.teachers);
      showToast('Mata pelajaran LMS berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan mata pelajaran LMS');
      return false;
    }
  };

  const deleteLmsSubject = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteLmsSubject(id);
      setLmsSubjects(updated.subjects);
      setLmsItems(updated.items);
      setLmsTeachers(updated.teachers);
      showToast('Mata pelajaran LMS berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus mata pelajaran LMS');
      return false;
    }
  };

  const saveLmsTeacher = async (
    teacher: Partial<LmsTeacherAccount> & { name: string; email: string; password?: string }
  ): Promise<LmsTeacherAccount | null> => {
    try {
      const updated = await storageService.saveLmsTeacher(teacher);
      setLmsTeachers(updated.teachers);
      setLmsSubjects(updated.subjects);
      showToast('Akun guru LMS berhasil disimpan', 'success');
      return (
        updated.teacher ||
        updated.teachers.find((t) => t.email.toLowerCase() === teacher.email.trim().toLowerCase()) ||
        null
      );
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan akun guru LMS');
      return null;
    }
  };

  const deleteLmsTeacher = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteLmsTeacher(id);
      setLmsTeachers(updated.teachers);
      setLmsSubjects(updated.subjects);
      showToast('Akun guru LMS berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus akun guru LMS');
      return false;
    }
  };

  const saveLmsItem = async (
    item: Partial<LmsItem> & { subjectId: string; type: LmsItem['type']; title: string }
  ): Promise<boolean> => {
    try {
      const updated = await storageService.saveLmsItem(item);
      setLmsItems(updated);
      showToast('Konten LMS berhasil disimpan', 'success');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menyimpan konten LMS');
      return false;
    }
  };

  const toggleLmsItemStatus = async (
    id: string,
    status: 'published' | 'draft'
  ): Promise<boolean> => {
    try {
      const updated = await storageService.toggleLmsItemStatus(id, status);
      setLmsItems(updated);
      showToast(
        status === 'published'
          ? 'Konten LMS diterbitkan untuk siswa'
          : 'Konten LMS disembunyikan sebagai draf',
        'info'
      );
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal memperbarui status konten LMS');
      return false;
    }
  };

  const deleteLmsItem = async (id: string): Promise<boolean> => {
    try {
      const updated = await storageService.deleteLmsItem(id);
      setLmsItems(updated);
      showToast('Konten LMS berhasil dihapus', 'info');
      return true;
    } catch (err) {
      handleServerError(err, 'Gagal menghapus konten LMS');
      return false;
    }
  };

  const loginAdmin = async (email: string, pass: string) => {
    const res = await storageService.loginAdmin(email, pass);
    if (res.user) {
      setAdminUser(res.user);
      try {
        if (res.user.role === 'admin') {
          const adminData = await storageService.fetchAdminData();
          setSettings(adminData.settings);
          setAbout(adminData.about);
          setArticles(adminData.articles);
          setTeachers(adminData.teachers);
          setFacilities(adminData.facilities);
          setExtracurriculars(adminData.extracurriculars);
          setAchievements(adminData.achievements);
          setGallery(adminData.gallery);
          setStudentStats(adminData.studentStats);
          setMessages(adminData.messages);
          setLmsSubjects(adminData.lmsSubjects || []);
          setLmsTeachers(adminData.lmsTeachers || []);
          setLmsItems(adminData.lmsItems || []);
        } else {
          setActiveAdminTabState('kelola-lms');
          const lmsData = await storageService.fetchLmsManageData();
          setLmsSubjects(lmsData.subjects || []);
          setLmsTeachers([]);
          setLmsItems(lmsData.items || []);
        }
      } catch {
        // Non-fatal if already loaded
      }
      showToast(`Selamat datang, ${res.user.name}!`, 'success');
      return { success: true };
    }
    showToast(res.error || 'Email atau password salah', 'error');
    return { success: false, error: res.error };
  };

  const logoutAdmin = () => {
    storageService.logoutAdmin();
    setAdminUser(null);
    setMessages([]);
    setLmsTeachers([]);
    storageService
      .fetchPublicData()
      .then((pub) => {
        setArticles(pub.articles);
        setLmsSubjects(pub.lmsSubjects || []);
        setLmsItems(pub.lmsItems || []);
      })
      .catch(() => {});
    showToast('Anda telah keluar dari Panel Pengelola', 'info');
    setCurrentRoute('beranda');
  };

  const resetAllDefaults = async (): Promise<void> => {
    try {
      const fresh = await storageService.resetAllToDefaults();
      setSettings(fresh.settings);
      setAbout(fresh.about);
      setArticles(fresh.articles);
      setTeachers(fresh.teachers);
      setFacilities(fresh.facilities);
      setExtracurriculars(fresh.extracurriculars);
      setAchievements(fresh.achievements);
      setGallery(fresh.gallery);
      setStudentStats(fresh.studentStats);
      setMessages(fresh.messages);
      setLmsSubjects(fresh.lmsSubjects || []);
      setLmsTeachers(fresh.lmsTeachers || []);
      setLmsItems(fresh.lmsItems || []);
      showToast('Data telah direset ke contoh awal', 'info');
    } catch (err) {
      handleServerError(err, 'Gagal mereset data server');
    }
  };

  return (
    <SchoolDataContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        activeAdminTab,
        setActiveAdminTab,
        activeArticleId,
        openArticleDetail,
        closeArticleDetail,
        isDark,
        toggleTheme,
        isDataLoaded,
        settings,
        about,
        articles,
        teachers,
        facilities,
        extracurriculars,
        achievements,
        gallery,
        studentStats,
        messages,
        adminUser,
        lmsSubjects,
        lmsTeachers,
        lmsItems,
        uploadImage,
        uploadLmsFile,
        updateSettings,
        updateAbout,
        saveArticle,
        deleteArticle,
        saveTeacher,
        deleteTeacher,
        saveFacility,
        deleteFacility,
        saveExtracurricular,
        deleteExtracurricular,
        saveAchievement,
        deleteAchievement,
        saveGalleryItem,
        deleteGalleryItem,
        saveStudentStats,
        sendContactMessage,
        markMessageRead,
        deleteMessage,
        refreshLmsData,
        saveLmsSubject,
        deleteLmsSubject,
        saveLmsTeacher,
        deleteLmsTeacher,
        saveLmsItem,
        toggleLmsItemStatus,
        deleteLmsItem,
        loginAdmin,
        logoutAdmin,
        resetAllDefaults,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return context;
};
