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

const AUTH_TOKEN_KEY = 'smpn27_auth_token';
const AUTH_USER_KEY = 'smpn27_auth_user';

const LEGACY_DATA_KEYS = [
  'smpn27_settings',
  'smpn27_about',
  'smpn27_articles',
  'smpn27_teachers',
  'smpn27_facilities',
  'smpn27_extracurriculars',
  'smpn27_achievements',
  'smpn27_gallery',
  'smpn27_student_stats',
  'smpn27_messages'
];

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const IMAGE_ACCEPT_ATTR =
  '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml';

const ALLOWED_IMAGE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml'
]);

const ALLOWED_IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

export const MAX_LMS_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const LMS_FILE_ACCEPT_ATTR =
  '.pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp,.svg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/png,image/jpeg,image/webp,image/svg+xml';

const ALLOWED_LMS_EXTS = ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.svg'];

export interface ServerPublicPayload {
  settings: SchoolSettings;
  about: AboutData;
  articles: Article[];
  teachers: Teacher[];
  facilities: Facility[];
  extracurriculars: Extracurricular[];
  achievements: Achievement[];
  gallery: GalleryItem[];
  studentStats: ClassGradeStat[];
  lmsSubjects: LmsSubject[];
  lmsItems: LmsItem[];
}

export interface ServerAdminPayload extends ServerPublicPayload {
  messages: ContactMessage[];
  lmsTeachers: LmsTeacherAccount[];
}

export interface ServerLmsManagePayload {
  subjects: LmsSubject[];
  teachers: LmsTeacherAccount[];
  items: LmsItem[];
}

function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...(extra || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function sanitizeImageUrlInput(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^(data:|blob:)/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}

export function clearLegacyLocalData(): void {
  try {
    for (const key of LEGACY_DATA_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access restrictions
  }
}

export const storageService = {
  // --- AUTHENTICATION ---
  getCurrentAdmin(): AdminUser | null {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const rawUser = localStorage.getItem(AUTH_USER_KEY);
      if (!token || !rawUser) {
        return null;
      }
      const parsed = JSON.parse(rawUser) as AdminUser;
      const isValidAdmin = parsed?.id === 'admin-smpn27' && parsed?.role === 'admin';
      const isValidTeacher = Boolean(parsed?.id) && parsed?.role === 'teacher';
      if (!parsed || (!isValidAdmin && !isValidTeacher)) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  async verifyAdminSession(): Promise<AdminUser | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) {
        this.logoutAdmin();
        return null;
      }
      const data = await res.json();
      if (data?.valid && data?.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        return data.user as AdminUser;
      }
      this.logoutAdmin();
      return null;
    } catch {
      // Keep cached admin state only if network temporarily offline; server still gates writes
      return this.getCurrentAdmin();
    }
  },

  async loginAdmin(email: string, pass: string): Promise<{ user: AdminUser | null; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
        cache: 'no-store'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token || !data?.user) {
        return {
          user: null,
          error: data?.error || 'Email atau password salah'
        };
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      return { user: data.user as AdminUser };
    } catch {
      return {
        user: null,
        error: 'Gagal terhubung ke server autentikasi. Silakan coba lagi.'
      };
    }
  },

  logoutAdmin(): void {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      // Ignore
    }
  },

  // --- IMAGE UPLOAD / DELETE (PERMANENT SERVER STORAGE) ---
  async uploadImage(
    file: File,
    folder = 'media'
  ): Promise<{ url?: string; error?: string }> {
    const lowerName = file.name.toLowerCase();
    const mime = (file.type || '').toLowerCase();
    const hasValidExt = ALLOWED_IMAGE_EXTS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = mime ? ALLOWED_IMAGE_MIMES.has(mime) : hasValidExt;

    if (!hasValidExt && !hasValidMime) {
      return {
        error:
          'Format file tidak didukung. Hanya file gambar PNG, JPG, WEBP, atau SVG yang diperbolehkan.'
      };
    }

    if (file.size <= 0) {
      return { error: 'File gambar kosong atau tidak valid.' };
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        error: 'Ukuran file melebihi batas maksimal 2 MB. Silakan pilih file gambar yang lebih kecil.'
      };
    }

    const token = getAuthToken();
    if (!token) {
      return {
        error: 'Sesi admin tidak aktif. Silakan login kembali di Panel Admin untuk mengunggah gambar.'
      };
    }

    const fallbackMime = lowerName.endsWith('.svg')
      ? 'image/svg+xml'
      : lowerName.endsWith('.webp')
      ? 'image/webp'
      : lowerName.endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mime || fallbackMime,
          'X-File-Name': encodeURIComponent(file.name),
          'X-Upload-Folder': folder
        },
        body: file
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        return {
          error: data?.error || `Gagal mengunggah gambar ke server (status ${res.status}).`
        };
      }

      return { url: String(data.url) };
    } catch {
      return {
        error: 'Gagal mengunggah gambar ke server. Periksa koneksi internet Anda lalu coba lagi.'
      };
    }
  },

  async deleteUploadedImage(url: string): Promise<void> {
    if (!url || !url.includes('/uploads/')) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ url })
      });
    } catch {
      // Non-fatal cleanup
    }
  },

  // --- SERVER DATA FETCH ---
  async fetchPublicData(): Promise<ServerPublicPayload> {
    const res = await fetch(`/api/public-data?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error('Gagal memuat data website dari server');
    }
    return (await res.json()) as ServerPublicPayload;
  },

  async fetchAdminData(): Promise<ServerAdminPayload> {
    const res = await fetch(`/api/admin/data?t=${Date.now()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Gagal memuat data admin dari server');
    }
    return (await res.json()) as ServerAdminPayload;
  },

  // --- SERVER MUTATIONS ---
  async saveSettings(settings: SchoolSettings): Promise<SchoolSettings> {
    const cleanPayload: SchoolSettings = {
      ...settings,
      logoUrl: sanitizeImageUrlInput(settings.logoUrl),
      heroSlides: settings.heroSlides.map((s) => ({
        ...s,
        imageUrl: sanitizeImageUrlInput(s.imageUrl)
      }))
    };

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(cleanPayload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan pengaturan ke server');
    }
    return data.settings as SchoolSettings;
  },

  async saveAbout(about: AboutData): Promise<AboutData> {
    const cleanPayload: AboutData = {
      ...about,
      headmasterWelcome: {
        ...about.headmasterWelcome,
        photoUrl: sanitizeImageUrlInput(about.headmasterWelcome.photoUrl)
      }
    };

    const res = await fetch('/api/admin/about', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(cleanPayload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan data tentang sekolah ke server');
    }
    return data.about as AboutData;
  },

  async saveArticle(article: Article): Promise<Article[]> {
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...article,
        imageUrl: sanitizeImageUrlInput(article.imageUrl)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan berita ke server');
    }
    return data.articles as Article[];
  },

  async deleteArticle(id: string): Promise<Article[]> {
    const res = await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus berita di server');
    }
    return data.articles as Article[];
  },

  async incrementArticleViews(id: string): Promise<void> {
    await fetch(`/api/articles/${encodeURIComponent(id)}/view`, {
      method: 'POST'
    }).catch(() => {});
  },

  async saveTeacher(teacher: Teacher): Promise<Teacher[]> {
    const res = await fetch('/api/admin/teachers', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...teacher,
        imageUrl: sanitizeImageUrlInput(teacher.imageUrl)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan data guru/tendik ke server');
    }
    return data.teachers as Teacher[];
  },

  async deleteTeacher(id: string): Promise<Teacher[]> {
    const res = await fetch(`/api/admin/teachers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus data guru/tendik di server');
    }
    return data.teachers as Teacher[];
  },

  async saveFacility(facility: Facility): Promise<Facility[]> {
    const res = await fetch('/api/admin/facilities', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...facility,
        imageUrl: sanitizeImageUrlInput(facility.imageUrl)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan fasilitas ke server');
    }
    return data.facilities as Facility[];
  },

  async deleteFacility(id: string): Promise<Facility[]> {
    const res = await fetch(`/api/admin/facilities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus fasilitas di server');
    }
    return data.facilities as Facility[];
  },

  async saveExtracurricular(item: Extracurricular): Promise<Extracurricular[]> {
    const res = await fetch('/api/admin/extracurriculars', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...item,
        imageUrl: sanitizeImageUrlInput(item.imageUrl)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan ekstrakurikuler ke server');
    }
    return data.extracurriculars as Extracurricular[];
  },

  async deleteExtracurricular(id: string): Promise<Extracurricular[]> {
    const res = await fetch(`/api/admin/extracurriculars/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus ekstrakurikuler di server');
    }
    return data.extracurriculars as Extracurricular[];
  },

  async saveAchievement(item: Achievement): Promise<Achievement[]> {
    const res = await fetch('/api/admin/achievements', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...item,
        imageUrl: sanitizeImageUrlInput(item.imageUrl)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan prestasi ke server');
    }
    return data.achievements as Achievement[];
  },

  async deleteAchievement(id: string): Promise<Achievement[]> {
    const res = await fetch(`/api/admin/achievements/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus prestasi di server');
    }
    return data.achievements as Achievement[];
  },

  async saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...item,
        imageUrl: sanitizeImageUrlInput(item.imageUrl)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan foto galeri ke server');
    }
    return data.gallery as GalleryItem[];
  },

  async deleteGalleryItem(id: string): Promise<GalleryItem[]> {
    const res = await fetch(`/api/admin/gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus foto galeri di server');
    }
    return data.gallery as GalleryItem[];
  },

  async saveStudentStats(stats: ClassGradeStat[]): Promise<ClassGradeStat[]> {
    const res = await fetch('/api/admin/student-stats', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(stats)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan statistik siswa ke server');
    }
    return data.studentStats as ClassGradeStat[];
  },

  async sendContactMessage(
    msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>
  ): Promise<ContactMessage> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.message) {
      throw new Error(data?.error || 'Gagal mengirim pesan ke server');
    }
    return data.message as ContactMessage;
  },

  async markMessageAsRead(id: string, isRead = true): Promise<ContactMessage[]> {
    const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ isRead })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal memperbarui status pesan');
    }
    return data.messages as ContactMessage[];
  },

  async deleteMessage(id: string): Promise<ContactMessage[]> {
    const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus pesan di server');
    }
    return data.messages as ContactMessage[];
  },

  async resetAllToDefaults(): Promise<ServerAdminPayload> {
    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal mereset data server');
    }
    return data as ServerAdminPayload;
  },

  // --- LMS FILE UPLOAD (10 MB) & LMS CRUD ---
  async uploadLmsFile(
    file: File
  ): Promise<{ url?: string; fileName?: string; error?: string }> {
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_LMS_EXTS.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      return {
        error:
          'Format file tidak didukung. Hanya file PDF, DOCX, PPTX, PNG, JPG, WEBP, atau SVG yang diperbolehkan.'
      };
    }

    if (file.size <= 0) {
      return { error: 'File kosong atau tidak valid.' };
    }

    if (file.size > MAX_LMS_FILE_SIZE_BYTES) {
      return {
        error: 'Ukuran file melebihi batas maksimal 10 MB. Silakan pilih file yang lebih kecil.'
      };
    }

    const token = getAuthToken();
    if (!token) {
      return {
        error: 'Sesi login tidak aktif. Silakan masuk kembali untuk mengunggah file.'
      };
    }

    const mime =
      file.type ||
      (lowerName.endsWith('.pdf')
        ? 'application/pdf'
        : lowerName.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : lowerName.endsWith('.pptx')
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/octet-stream');

    try {
      const res = await fetch('/api/lms/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mime,
          'X-File-Name': encodeURIComponent(file.name)
        },
        body: file
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        return {
          error: data?.error || `Gagal mengunggah file ke server (status ${res.status}).`
        };
      }
      return { url: String(data.url), fileName: String(data.fileName || file.name) };
    } catch {
      return {
        error: 'Gagal mengunggah file ke server. Periksa koneksi internet Anda lalu coba lagi.'
      };
    }
  },

  async fetchLmsManageData(): Promise<ServerLmsManagePayload> {
    const res = await fetch(`/api/lms/manage?t=${Date.now()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal memuat data LMS dari server');
    }
    return data as ServerLmsManagePayload;
  },

  async saveLmsSubject(
    subject: Partial<LmsSubject> & { name: string }
  ): Promise<{ subjects: LmsSubject[]; teachers: LmsTeacherAccount[] }> {
    const res = await fetch('/api/lms/subjects', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(subject)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan mata pelajaran ke server');
    }
    return {
      subjects: (data.subjects || []) as LmsSubject[],
      teachers: (data.teachers || []) as LmsTeacherAccount[]
    };
  },

  async deleteLmsSubject(id: string): Promise<ServerLmsManagePayload> {
    const res = await fetch(`/api/lms/subjects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus mata pelajaran');
    }
    return data as ServerLmsManagePayload;
  },

  async saveLmsTeacher(
    teacher: Partial<LmsTeacherAccount> & { name: string; email: string; password?: string }
  ): Promise<{
    teachers: LmsTeacherAccount[];
    subjects: LmsSubject[];
    teacher?: LmsTeacherAccount;
  }> {
    const res = await fetch('/api/lms/teachers', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(teacher)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan akun guru');
    }
    return {
      teachers: (data.teachers || []) as LmsTeacherAccount[],
      subjects: (data.subjects || []) as LmsSubject[],
      teacher: data.teacher as LmsTeacherAccount | undefined
    };
  },

  async deleteLmsTeacher(
    id: string
  ): Promise<{ teachers: LmsTeacherAccount[]; subjects: LmsSubject[] }> {
    const res = await fetch(`/api/lms/teachers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus akun guru');
    }
    return {
      teachers: (data.teachers || []) as LmsTeacherAccount[],
      subjects: (data.subjects || []) as LmsSubject[]
    };
  },

  async saveLmsItem(item: Partial<LmsItem> & { subjectId: string; type: LmsItem['type']; title: string }): Promise<LmsItem[]> {
    const res = await fetch('/api/lms/items', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...item,
        fileUrl: item.fileUrl ? sanitizeImageUrlInput(item.fileUrl) : undefined
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyimpan konten LMS ke server');
    }
    return data.items as LmsItem[];
  },

  async toggleLmsItemStatus(id: string, status: 'published' | 'draft'): Promise<LmsItem[]> {
    const res = await fetch(`/api/lms/items/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal memperbarui status konten LMS');
    }
    return data.items as LmsItem[];
  },

  async deleteLmsItem(id: string): Promise<LmsItem[]> {
    const res = await fetch(`/api/lms/items/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menghapus konten LMS');
    }
    return data.items as LmsItem[];
  }
};
