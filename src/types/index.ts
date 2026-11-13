export type NewsCategory = 'Akademik' | 'Prestasi' | 'Kegiatan' | 'Pengumuman' | 'Ekstrakurikuler';

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  excerpt: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  status: 'published' | 'draft';
  author: string;
  views: number;
}

export type StaffCategory = 'pimpinan' | 'guru' | 'tendik';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  role: string;
  subject: string;
  education: string;
  imageUrl: string;
  category: StaffCategory;
  order: number;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  category: 'Laboratorium' | 'Sarana Olahraga' | 'Pembelajaran' | 'Penunjang';
  imageUrl: string;
  capacity: string;
  condition: 'Sangat Baik' | 'Baik';
}

export interface Extracurricular {
  id: string;
  name: string;
  category: 'Wajib' | 'Olahraga' | 'Seni Budaya' | 'Sains & Teknologi' | 'Kepemimpinan';
  coach: string;
  schedule: string;
  description: string;
  imageUrl: string;
  membersCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  studentName: string;
  category: 'Akademik' | 'Non-Akademik';
  level: 'Kecamatan' | 'Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  rank: string;
  year: number;
  description: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Akademik' | 'Kesiswaan' | 'Upacara' | 'Lingkungan' | 'Prestasi';
  imageUrl: string;
  date: string;
  caption: string;
}

export interface ClassGradeStat {
  grade: 'VII' | 'VIII' | 'IX';
  classesCount: number;
  male: number;
  female: number;
  total: number;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface LogoPhilosophy {
  symbol: string;
  meaning: string;
}

export interface AccreditationData {
  grade: string;
  score: number;
  skNumber: string;
  year: string;
  validUntil: string;
  institution: string;
}

export interface OrgNode {
  id: string;
  role: string;
  name: string;
  nip: string;
  level: number;
}

export interface AboutData {
  history: string;
  timeline: TimelineEvent[];
  vision: string;
  missions: string[];
  goals: string[];
  logoPhilosophy: LogoPhilosophy[];
  accreditation: AccreditationData;
  headmasterWelcome: {
    title: string;
    name: string;
    nip: string;
    photoUrl: string;
    message: string;
  };
  orgChart: OrgNode[];
}

export interface SchoolSettings {
  schoolName: string;
  slogan: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  operatingHours: string;
  googleMapsEmbedUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
  logoUrl: string; // custom school logo file / URL, if empty uses placeholder
  heroSlides: {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
  }[];
  featuredPrograms: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  assignedSubjectIds?: string[];
}

export type LmsGrade = 'VII' | 'VIII' | 'IX';
export type LmsItemGrade = 'VII' | 'VIII' | 'IX' | 'Semua';
export type LmsItemType = 'material' | 'assignment' | 'quiz';

export interface LmsSubject {
  id: string;
  name: string;
  code: string;
  description: string;
  gradeLevels: LmsGrade[];
  assignedTeacherIds?: string[];
  legacyTeacherNames?: string[];
  teacherNamesList?: string[];
  teacherNames?: string;
  isSample?: boolean;
  createdAt: string;
}

export interface LmsTeacherAccount {
  id: string;
  name: string;
  email: string;
  assignedSubjectIds: string[];
  isActive: boolean;
  createdAt: string;
}

export interface LmsItem {
  id: string;
  subjectId: string;
  type: LmsItemType;
  title: string;
  description: string; // digunakan sebagai deskripsi atau instruksi PR/Tugas
  grade: LmsItemGrade;
  targetClasses?: string[]; // Daftar kelas spesifik untuk PR/Tugas, mis. ['VII-A', 'VII-B']
  teacherName: string;
  createdByUserId: string;
  createdAt: string;
  status: 'published' | 'draft';
  fileUrl?: string;
  fileName?: string;
  externalUrl?: string;
  dateGiven?: string;
  deadline?: string;
  quizUrl?: string;
  isSample?: boolean;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
}
