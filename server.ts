import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT) || 3000;
const IS_DEV = process.env.NODE_ENV === 'development';

const VALID_ADMIN_EMAIL = 'smpn.27.kota.bandung@gmail.com';
const VALID_ADMIN_PASSWORD = 'esempe dua tujuh';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_LMS_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const STORAGE_DIR = path.resolve(process.cwd(), 'storage');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const DB_PATH = path.join(STORAGE_DIR, 'db.json');
const SECRET_PATH = path.join(STORAGE_DIR, '.session-secret');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function getSessionSecret(): string {
  if (process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 16) {
    return process.env.ADMIN_SESSION_SECRET;
  }
  try {
    if (fs.existsSync(SECRET_PATH)) {
      const existing = fs.readFileSync(SECRET_PATH, 'utf8').trim();
      if (existing.length >= 32) return existing;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_PATH, generated, { mode: 0o600 });
    return generated;
  } catch {
    return crypto.createHash('sha256').update(process.cwd()).digest('hex');
  }
}

const SESSION_SECRET = getSessionSecret();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  assignedSubjectIds?: string[];
  exp: number;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  assignedSubjectIds?: string[];
}

function createAuthToken(user: AuthenticatedUser): { token: string; user: AuthenticatedUser } {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    assignedSubjectIds: user.assignedSubjectIds,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return {
    token: `${encoded}.${sig}`,
    user
  };
}

function verifyAuthToken(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    if (parsed.role === 'admin') {
      if (parsed.sub !== 'admin-smpn27' || parsed.email.toLowerCase() !== VALID_ADMIN_EMAIL) {
        return null;
      }
      return parsed;
    }
    if (parsed.role === 'teacher' && parsed.sub && parsed.email) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return undefined;
  return header.slice(7).trim();
}

function resolveAuthenticatedUser(token: string | undefined): AuthenticatedUser | null {
  const verified = verifyAuthToken(token);
  if (!verified) return null;
  if (verified.role === 'admin') {
    return {
      id: verified.sub,
      email: verified.email,
      name: verified.name,
      role: 'admin'
    };
  }
  const db = readDb();
  const teacher = db.lmsTeachers.find((t) => t.id === verified.sub && t.isActive);
  if (!teacher) return null;
  return {
    id: teacher.id,
    email: teacher.email,
    name: teacher.name,
    role: 'teacher',
    assignedSubjectIds: [...teacher.assignedSubjectIds]
  };
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = resolveAuthenticatedUser(extractBearerToken(req));
  if (!user || user.role !== 'admin') {
    res.status(user ? 403 : 401).json({
      error: user
        ? 'Akses ditolak. Fitur ini hanya dapat diakses oleh Administrator.'
        : 'Sesi admin tidak valid atau telah berakhir. Silakan login kembali di Panel Admin.'
    });
    return;
  }
  (req as Request & { authUser?: AuthenticatedUser }).authUser = user;
  next();
}

function requireLmsStaff(req: Request, res: Response, next: NextFunction): void {
  const user = resolveAuthenticatedUser(extractBearerToken(req));
  if (!user) {
    res.status(401).json({
      error: 'Sesi login tidak valid atau telah berakhir. Silakan masuk kembali.'
    });
    return;
  }
  (req as Request & { authUser?: AuthenticatedUser }).authUser = user;
  next();
}

function sanitizeImageUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Reject base64 data URLs and blob URLs — images must use server /uploads/ or http(s) URLs
  if (/^(data:|blob:)/i.test(trimmed)) {
    return '';
  }
  if (trimmed.startsWith('/uploads/') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

function validateHttpUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

interface SchoolDb {
  settings: {
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
    logoUrl: string;
    heroSlides: Array<{ id: string; title: string; subtitle: string; imageUrl: string }>;
    featuredPrograms: Array<{ id: string; title: string; description: string; icon: string }>;
  };
  about: {
    history: string;
    timeline: Array<{ year: string; title: string; description: string }>;
    vision: string;
    missions: string[];
    goals: string[];
    logoPhilosophy: Array<{ symbol: string; meaning: string }>;
    accreditation: {
      grade: string;
      score: number;
      skNumber: string;
      year: string;
      validUntil: string;
      institution: string;
    };
    headmasterWelcome: {
      title: string;
      name: string;
      nip: string;
      photoUrl: string;
      message: string;
    };
    orgChart: Array<{ id: string; role: string; name: string; nip?: string; level: number }>;
  };
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    publishedAt: string;
    status: 'published' | 'draft';
    author: string;
    views: number;
  }>;
  teachers: Array<{
    id: string;
    name: string;
    nip: string;
    role: string;
    subject: string;
    education: string;
    imageUrl: string;
    category: string;
    order: number;
  }>;
  facilities: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    capacity: string;
    condition: string;
  }>;
  extracurriculars: Array<{
    id: string;
    name: string;
    category: string;
    coach: string;
    schedule: string;
    description: string;
    imageUrl: string;
    membersCount: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    studentName: string;
    category: string;
    level: string;
    rank: string;
    year: number;
    description: string;
    imageUrl: string;
  }>;
  gallery: Array<{
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    date: string;
    caption: string;
  }>;
  studentStats: Array<{
    grade: 'VII' | 'VIII' | 'IX';
    classesCount: number;
    male: number;
    female: number;
    total: number;
  }>;
  messages: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    createdAt: string;
    isRead: boolean;
  }>;
  lmsSubjects: Array<{
    id: string;
    name: string;
    code: string;
    description: string;
    gradeLevels: Array<'VII' | 'VIII' | 'IX'>;
    assignedTeacherIds?: string[];
    legacyTeacherNames?: string[];
    teacherNamesList?: string[];
    teacherNames?: string;
    isSample?: boolean;
    createdAt: string;
  }>;
  lmsTeachers: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    assignedSubjectIds: string[];
    isActive: boolean;
    createdAt: string;
  }>;
  lmsItems: Array<{
    id: string;
    subjectId: string;
    type: 'material' | 'assignment' | 'quiz';
    title: string;
    description: string;
    grade: 'VII' | 'VIII' | 'IX' | 'Semua';
    targetClasses?: string[];
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
  }>;
}

const VALID_LMS_CLASS_LIST = [
  'VII-A', 'VII-B', 'VII-C', 'VII-D', 'VII-E', 'VII-F', 'VII-G', 'VII-H', 'VII-I', 'VII-J',
  'VIII-A', 'VIII-B', 'VIII-C', 'VIII-D', 'VIII-E', 'VIII-F', 'VIII-G', 'VIII-H', 'VIII-I',
  'IX-A', 'IX-B', 'IX-C', 'IX-D', 'IX-E', 'IX-F', 'IX-G', 'IX-H', 'IX-I'
];
const VALID_LMS_CLASS_SET = new Set(VALID_LMS_CLASS_LIST);
const LMS_CLASS_ORDER = new Map(VALID_LMS_CLASS_LIST.map((cls, idx) => [cls, idx]));

function deriveGradeFromTargetClasses(classes: string[]): 'VII' | 'VIII' | 'IX' | 'Semua' {
  const levels = new Set<'VII' | 'VIII' | 'IX'>();
  for (const cls of classes) {
    if (cls.startsWith('VII-')) levels.add('VII');
    else if (cls.startsWith('VIII-')) levels.add('VIII');
    else if (cls.startsWith('IX-')) levels.add('IX');
  }
  if (levels.size === 1) {
    return Array.from(levels)[0];
  }
  return 'Semua';
}

function stripTeacherSecrets(
  teachers: SchoolDb['lmsTeachers']
): Array<Omit<SchoolDb['lmsTeachers'][number], 'passwordHash'>> {
  return teachers.map(({ passwordHash: _ignored, ...rest }) => rest);
}

function createInitialDb(): SchoolDb {
  return {
    settings: {
      schoolName: 'SMP Negeri 27 Kota Bandung',
      slogan: 'Unggul dalam Prestasi, Berkarakter, Berakhlak Mulia, dan Berwawasan Lingkungan (Contoh)',
      address: 'Jl. Contoh Alamat Sekolah No. 27, Kelurahan Contoh, Kec. Contoh (Ganti di Panel Admin)',
      city: 'Kota Bandung, Jawa Barat',
      postalCode: '40123 (Contoh)',
      phone: '(022) 7123456 (Contoh)',
      whatsapp: '081234567890 (Contoh)',
      email: 'info@smpn27bandung.sch.id (Contoh)',
      operatingHours: 'Senin - Jumat: 07.00 - 15.30 WIB',
      googleMapsEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.5634786224!2d107.5731168!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e0f5f0!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
      instagramUrl: 'https://instagram.com/smpn27bandung_contoh',
      youtubeUrl: 'https://youtube.com/@smpn27bandung_contoh',
      whatsappUrl: 'https://wa.me/6281234567890',
      logoUrl: '',
      heroSlides: [
        {
          id: 'slide-1',
          title: 'Selamat Datang di SMP Negeri 27 Kota Bandung',
          subtitle: 'Membina Generasi Unggul, Cerdas Berakhlak, dan Cinta Lingkungan Hidup',
          imageUrl: ''
        },
        {
          id: 'slide-2',
          title: 'Pembelajaran Kreatif Berbasis Teknologi Digital',
          subtitle: 'Menyiapkan siswa-siswi yang adaptif menyongsong masa depan Indonesia Emas',
          imageUrl: ''
        },
        {
          id: 'slide-3',
          title: 'Pengembangan Minat & Bakat Siswa Terpadu',
          subtitle: 'Ragam kegiatan ekstrakurikuler prestasi dan kepemimpinan berkarakter',
          imageUrl: ''
        }
      ],
      featuredPrograms: [
        {
          id: 'prog-1',
          title: 'Sekolah Adiwiyata & Peduli Lingkungan',
          description:
            'Program pembiasaan cinta lingkungan, pemilahan sampah mandiri, taman hidroponik, dan konservasi energi oleh seluruh warga sekolah.',
          icon: 'Leaf'
        },
        {
          id: 'prog-2',
          title: 'Penguatan Literasi & Numerasi Digital',
          description:
            'Optimalisasi sudut baca kelas, perpustakaan digital, serta pemanfaatan e-learning dalam pembelajaran sehari-hari.',
          icon: 'BookOpen'
        },
        {
          id: 'prog-3',
          title: 'Pengembangan Karakter & Budi Pekerti',
          description:
            'Pembiasaan 5S (Senyum, Sapa, Salam, Sopan, Santun), shalat berjamaah, doa bersama, dan kegiatan keputrian.',
          icon: 'HeartHandshake'
        },
        {
          id: 'prog-4',
          title: 'Pembinaan Prestasi OSN & O2SN & FLS2N',
          description:
            'Bimbingan intensif bagi siswa bertalenta di bidang sains, olahraga, seni budaya, serta bahasa.',
          icon: 'Trophy'
        }
      ]
    },
    about: {
      history:
        'SMP Negeri 27 Kota Bandung berdiri sebagai institusi pendidikan menengah pertama negeri yang berdedikasi tinggi mencerdaskan generasi penerus bangsa di Kota Kembang Bandung. Selama puluhan tahun, sekolah terus berinovasi dalam sarana pembelajaran, pembinaan karakter, dan pencapaian prestasi akademik maupun non-akademik.',
      timeline: [
        {
          year: '1985 (Contoh)',
          title: 'Awal Pendirian Sekolah',
          description:
            'Didirikan untuk memenuhi kebutuhan pendidikan berkualitas bagi masyarakat di kawasan Kota Bandung.'
        },
        {
          year: '1998 (Contoh)',
          title: 'Pembangunan Gedung & Laboratorium',
          description: 'Perluasan ruang kelas, penambahan laboratorium IPA dan perpustakaan sekolah.'
        },
        {
          year: '2014 (Contoh)',
          title: 'Perintisan Sekolah Berwawasan Lingkungan',
          description: 'Pencanangan program Adiwiyata tingkat Kota Bandung dan digitalisasi sistem administrasi.'
        },
        {
          year: '2022 (Contoh)',
          title: 'Raihan Akreditasi A (Unggul)',
          description: 'Meraih predikat Akreditasi A dari BAN-S/M dengan nilai sangat memuaskan.'
        },
        {
          year: '2024 - Sekarang',
          title: 'Transformasi Digital & Kurikulum Merdeka',
          description:
            'Penerapan Kurikulum Merdeka secara penuh dengan fokus pada Projek Penguatan Profil Pelajar Pancasila (P5).'
        }
      ],
      vision:
        'Terwujudnya Peserta Didik yang Berakhlak Mulia, Unggul dalam Prestasi, Terampil Menguasai Teknologi, dan Berwawasan Lingkungan.',
      missions: [
        'Menyelenggarakan proses pembelajaran yang mendidik, aktif, kreatif, dan berbasis nilai-nilai keimanan.',
        'Menumbuhkembangkan semangat keunggulan secara intensif kepada seluruh warga sekolah di bidang akademik dan non-akademik.',
        'Mendorong dan memfasilitasi potensi siswa dalam penguasaan teknologi informasi dan komunikasi yang bertanggung jawab.',
        'Mewujudkan lingkungan sekolah yang bersih, asri, sehat, dan ramah anak sebagai sarana pelestarian fungsi lingkungan hidup.',
        'Meningkatkan kompetensi pendidik dan tenaga kependidikan secara berkelanjutan.'
      ],
      goals: [
        'Meningkatkan rerata capaian asesmen kompetensi minimum (AKM) literasi dan numerasi siswa.',
        'Melahirkan juara kompetisi sains, olahraga, dan seni di tingkat Kota Bandung, Provinsi Jawa Barat, hingga Nasional.',
        'Menanamkan pembiasaan profil pelajar Pancasila dalam setiap aktivitas keseharian siswa.',
        'Mempertahankan predikat sekolah Adiwiyata berkelanjutan.'
      ],
      logoPhilosophy: [
        {
          symbol: 'Buku Terbuka & Pena Emas',
          meaning:
            'Melambangkan sumber ilmu pengetahuan yang tak pernah kering dan tekad belajar tanpa henti untuk masa depan gemilang.'
        },
        {
          symbol: 'Kujang / Lambang Kota Bandung',
          meaning:
            'Menunjukkan identitas kearifan lokal Sunda dan pengabdian sekolah bagi masyarakat Kota Bandung.'
        },
        {
          symbol: 'Sayap Berhelai Tiga',
          meaning:
            'Melambangkan tiga pilar tripusat pendidikan: keluarga, sekolah, dan masyarakat yang bersinergi secara harmonis.'
        },
        {
          symbol: 'Warna Biru dan Emas',
          meaning:
            'Biru melambangkan kedalaman wawasan, kejujuran, dan ketenangan; Emas melambangkan kemuliaan akhlak dan puncak prestasi.'
        }
      ],
      accreditation: {
        grade: 'A (Unggul)',
        score: 94,
        skNumber: '1347/BAN-SM/SK/2022 (Data Contoh)',
        year: '2022',
        validUntil: '2027',
        institution: 'Badan Akreditasi Nasional Sekolah/Madrasah (BAN-S/M)'
      },
      headmasterWelcome: {
        title: 'Sambutan Kepala Sekolah',
        name: 'Drs. H. Nama Kepala Sekolah, M.Pd. (Contoh)',
        nip: 'NIP. 19680101 199303 1 005 (Contoh)',
        photoUrl: '',
        message:
          'Assalamu’alaikum Warahmatullahi Wabarakatuh, Sampurasun.\n\nSelamat datang di website resmi SMP Negeri 27 Kota Bandung. Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa atas limpahan rahmat dan hidayah-Nya sehingga portal resmi sekolah ini dapat hadir sebagai jembatan informasi dan komunikasi terbuka antara sekolah, orang tua, alumni, dan masyarakat luas.\n\nDi era keterbukaan informasi dan percepatan teknologi saat ini, kami berkomitmen menyajikan informasi yang akurat, transparan, dan edukatif. SMP Negeri 27 Kota Bandung terus berupaya mendidik generasi bangsa yang tidak hanya cerdas dalam ilmu pengetahuan, tetapi juga santun berbudi pekerti, mencintai lingkungan, dan siap bersaing di kancah global.\n\nTerima kasih atas kepercayaan dan kerja sama seluruh keluarga besar sekolah serta para pemangku kepentingan. Mari bersama-sama kita wujudkan pendidikan berkualitas demi masa depan putra-putri tercinta kita.\n\nWassalamu’alaikum Warahmatullahi Wabarakatuh.'
      },
      orgChart: [
        { id: '1', role: 'Kepala Sekolah', name: 'Drs. H. Nama Kepala Sekolah, M.Pd. (Contoh)', nip: '19680101 199303 1 005', level: 1 },
        { id: '2', role: 'Komite Sekolah', name: 'Drs. Nama Ketua Komite (Contoh)', nip: '-', level: 2 },
        { id: '3', role: 'Kepala Tata Usaha', name: 'Nama Kepala TU, S.Sos. (Contoh)', nip: '19750505 200212 1 002', level: 2 },
        { id: '4', role: 'Wakasek Kurikulum', name: 'Nama Wakasek Kurikulum, M.Pd. (Contoh)', nip: '19720315 199802 1 003', level: 3 },
        { id: '5', role: 'Wakasek Kesiswaan', name: 'Nama Wakasek Kesiswaan, S.Pd. (Contoh)', nip: '19780820 200312 2 004', level: 3 },
        { id: '6', role: 'Wakasek Sarana & Prasarana', name: 'Nama Wakasek Sarpras, S.Pd. (Contoh)', nip: '19761109 200501 1 006', level: 3 },
        { id: '7', role: 'Wakasek Humas', name: 'Nama Wakasek Humas, S.Pd. (Contoh)', nip: '19800412 200604 2 008', level: 3 }
      ]
    },
    articles: [
      {
        id: 'art-1',
        title: 'Peringatan Hari Guru Nasional dan Apresiasi Pendidik Berprestasi (Contoh)',
        slug: 'peringatan-hari-guru-nasional-contoh',
        category: 'Kegiatan',
        excerpt:
          'Suasana khidmat dan penuh haru mewarnai upacara bendera memperingati Hari Guru Nasional di lapangan utama SMP Negeri 27 Kota Bandung.',
        content:
          'Bandung - Keluarga besar SMP Negeri 27 Kota Bandung menggelar upacara peringatan Hari Guru Nasional dengan khidmat di lapangan sekolah. Petugas upacara kali ini secara istimewa dibawakan oleh bapak dan ibu guru serta tenaga kependidikan.\n\nDalam amanatnya, Kepala Sekolah menyampaikan apresiasi setinggi-tingginya kepada para pendidik yang tak pernah lelah membimbing siswa dengan kasih sayang dan dedikasi. Acara dilanjutkan dengan persembahan bunga mawar dari pengurus OSIS serta penampilan paduan suara Gita Suara 27 yang membawakan lagu Hymne Guru dan Terima Kasih Guruku.',
        imageUrl: '',
        publishedAt: '2025-11-25',
        status: 'published',
        author: 'Tim Humas SMPN 27 (Contoh)',
        views: 342
      },
      {
        id: 'art-2',
        title: 'Siswa SMPN 27 Raih Medali Emas Olimpiade Sains Tingkat Kota Bandung (Contoh)',
        slug: 'siswa-raih-medali-emas-olimpiade-sains-contoh',
        category: 'Prestasi',
        excerpt:
          'Prestasi membanggakan kembali diraih peserta didik SMP Negeri 27 Kota Bandung pada ajang kompetisi sains dan matematika tingkat kota.',
        content:
          'Prestasi gemilang kembali dipersembahkan oleh ananda Ahmad Fauzi (Siswa Contoh Kelas IX) yang berhasil menyabet Medali Emas dalam ajang Olimpiade Sains Pelajar Kota Bandung.\n\nKepala Sekolah mengalungkan medali saat apel pagi sekolah dan menyampaikan pesan agar raihan prestasi ini menjadi pelecut semangat bagi siswa lainnya untuk giat belajar dan berani berkompetisi.',
        imageUrl: '',
        publishedAt: '2025-11-18',
        status: 'published',
        author: 'Koordinator Pembina Prestasi (Contoh)',
        views: 520
      },
      {
        id: 'art-3',
        title: 'Aksi Nyata Gerakan Adiwiyata: Bersih Sungai dan Penanaman 100 Bibit Pohon (Contoh)',
        slug: 'aksi-nyata-gerakan-adiwiyata-contoh',
        category: 'Kegiatan',
        excerpt:
          'Kader lingkungan sekolah bersama relawan OSIS menggelar aksi penanaman pohon dan edukasi pilah sampah di lingkungan sekitar sekolah.',
        content:
          'Sebagai wujud komitmen sekolah berwawasan lingkungan, seluruh kader Adiwiyata SMP Negeri 27 Kota Bandung bersama tim pembina menyelenggarakan aksi peduli bumi bertajuk "Green Movement 27".\n\nKegiatan diisi dengan pemilahan sampah organik dan anorganik, pembuatan kompos cair, serta pembagian bibit tanaman obat keluarga (toga) kepada warga sekitar.',
        imageUrl: '',
        publishedAt: '2025-11-10',
        status: 'published',
        author: 'Tim Adiwiyata (Contoh)',
        views: 289
      },
      {
        id: 'art-4',
        title: 'Jadwal Penilaian Sumatif Akhir Semester (PSAS) Ganjil Tahun Ajaran 2025/2026 (Contoh)',
        slug: 'jadwal-penilaian-sumatif-akhir-semester-contoh',
        category: 'Pengumuman',
        excerpt:
          'Diberitahukan kepada seluruh siswa kelas VII, VIII, dan IX mengenai pelaksanaan PSAS berbasis komputer dan lembar kerja.',
        content:
          'Sehubungan dengan agenda kalender pendidikan semester ganjil, disampaikan kepada seluruh orang tua/wali dan siswa bahwa Penilaian Sumatif Akhir Semester (PSAS) akan berlangsung mulai tanggal 1 Desember hingga 8 Desember 2025.\n\nSiswa diharapkan mempersiapkan diri dengan baik, menjaga kesehatan, dan mematuhi tata tertib ujian.',
        imageUrl: '',
        publishedAt: '2025-11-05',
        status: 'published',
        author: 'Kurikulum Sekolah (Contoh)',
        views: 615
      }
    ],
    teachers: [
      {
        id: 't-1',
        name: 'Drs. H. Pimpinan Sekolah, M.Pd. (Contoh)',
        nip: '19680101 199303 1 005',
        role: 'Kepala Sekolah',
        subject: 'Manajemen Pendidikan',
        education: 'S2 Magister Pendidikan Univ. Pendidikan Indonesia',
        imageUrl: '',
        category: 'pimpinan',
        order: 1
      },
      {
        id: 't-2',
        name: 'Dra. Hj. Guru Matematika, M.M. (Contoh)',
        nip: '19720315 199802 2 003',
        role: 'Wakasek Kurikulum & Guru Matematika',
        subject: 'Matematika',
        education: 'S1 Pendidikan Matematika, S2 Manajemen',
        imageUrl: '',
        category: 'guru',
        order: 2
      },
      {
        id: 't-3',
        name: 'Ahmad Guru IPA, S.Pd., M.Si. (Contoh)',
        nip: '19780820 200312 1 004',
        role: 'Wakasek Kesiswaan & Guru IPA',
        subject: 'Ilmu Pengetahuan Alam (Fisika & Biologi)',
        education: 'S2 Biologi Sains ITB',
        imageUrl: '',
        category: 'guru',
        order: 3
      },
      {
        id: 't-4',
        name: 'Siti Guru Bahasa Indonesia, S.Pd. (Contoh)',
        nip: '19820510 200604 2 015',
        role: 'Guru Bahasa Indonesia',
        subject: 'Bahasa Indonesia & Literasi',
        education: 'S1 Pendidikan Bahasa & Sastra Indonesia UNINUS',
        imageUrl: '',
        category: 'guru',
        order: 4
      },
      {
        id: 't-5',
        name: 'Budi Guru Bahasa Inggris, S.Pd. (Contoh)',
        nip: '19850912 201001 1 018',
        role: 'Guru Bahasa Inggris',
        subject: 'Bahasa Inggris',
        education: 'S1 Pendidikan Bahasa Inggris UNPAS',
        imageUrl: '',
        category: 'guru',
        order: 5
      },
      {
        id: 't-6',
        name: 'Nurul Guru IPS, S.Pd. (Contoh)',
        nip: '19890204 201503 2 021',
        role: 'Guru Ilmu Pengetahuan Sosial',
        subject: 'IPS Terpadu',
        education: 'S1 Pendidikan Geografi UPI',
        imageUrl: '',
        category: 'guru',
        order: 6
      },
      {
        id: 't-7',
        name: 'Iwan Guru PJOK, S.Pd. (Contoh)',
        nip: '19870425 201101 1 012',
        role: 'Guru Pendidikan Jasmani & Olahraga',
        subject: 'Pendidikan Jasmani, Olahraga & Kesehatan',
        education: 'S1 Kepelatihan Olahraga FPOK UPI',
        imageUrl: '',
        category: 'guru',
        order: 7
      },
      {
        id: 't-8',
        name: 'Ratna Guru Informatika, S.Kom. (Contoh)',
        nip: '19920815 201903 2 016',
        role: 'Guru Informatika & Operator Lab Komputer',
        subject: 'Informatika & Koding Dasar',
        education: 'S1 Teknik Informatika Politeknik Negeri Bandung',
        imageUrl: '',
        category: 'guru',
        order: 8
      },
      {
        id: 't-9',
        name: 'Dewi Guru Seni Budaya, S.Sn. (Contoh)',
        nip: '19900330 201704 2 009',
        role: 'Guru Seni Budaya & Pembina Karawitan',
        subject: 'Seni Musik & Tari Sunda',
        education: 'S1 Seni Karawitan ISBI Bandung',
        imageUrl: '',
        category: 'guru',
        order: 9
      },
      {
        id: 't-10',
        name: 'Hendrik Kepala Tata Usaha, S.A.P. (Contoh)',
        nip: '19750505 200212 1 002',
        role: 'Kepala Urusan Tata Usaha',
        subject: 'Administrasi Sekolah',
        education: 'S1 Administrasi Publik',
        imageUrl: '',
        category: 'tendik',
        order: 10
      },
      {
        id: 't-11',
        name: 'Yuli Pustakawan Sekolah, A.Md. (Contoh)',
        nip: '19841112 201202 2 010',
        role: 'Pengelola Perpustakaan Digital',
        subject: 'Perpustakaan & Kearsipan',
        education: 'D3 Perpustakaan & Informasi UNPAD',
        imageUrl: '',
        category: 'tendik',
        order: 11
      }
    ],
    facilities: [
      {
        id: 'f-1',
        name: 'Laboratorium Komputer & TIK Modern (Contoh)',
        description:
          'Dilengkapi 40 unit PC modern dengan koneksi internet fiber optic berkecepatan tinggi untuk ujian CBT dan pembelajaran informatika.',
        category: 'Laboratorium',
        imageUrl: '',
        capacity: '40 Siswa',
        condition: 'Sangat Baik'
      },
      {
        id: 'f-2',
        name: 'Laboratorium IPA Terpadu (Fisika & Biologi) (Contoh)',
        description:
          'Sarana eksperimen sains lengkap dengan mikroskop digital, torso anatomi, alat peraga optik, dan lemari asam.',
        category: 'Laboratorium',
        imageUrl: '',
        capacity: '36 Siswa',
        condition: 'Sangat Baik'
      },
      {
        id: 'f-3',
        name: 'Perpustakaan & Pojok Baca Digital (Contoh)',
        description:
          'Koleksi ribuan buku pelajaran, referensi sastra, ensiklopedia, dan terminal komputer pencarian katalog digital.',
        category: 'Pembelajaran',
        imageUrl: '',
        capacity: '60 Siswa',
        condition: 'Sangat Baik'
      },
      {
        id: 'f-4',
        name: 'Lapangan Olahraga Multi-Fungsi (Contoh)',
        description:
          'Lapangan outdoor berlapis sintetis untuk basket, futsal, voli, bulutangkis, serta kegiatan upacara bendera.',
        category: 'Sarana Olahraga',
        imageUrl: '',
        capacity: '1000 Orang',
        condition: 'Baik'
      },
      {
        id: 'f-5',
        name: 'Masjid & Ruang Ibadah Sekolah (Contoh)',
        description:
          'Tempat ibadah shalat berjamaah, kegiatan kajian rohis, dan pembinaan karakter religius seluruh siswa.',
        category: 'Penunjang',
        imageUrl: '',
        capacity: '300 Jamaah',
        condition: 'Sangat Baik'
      },
      {
        id: 'f-6',
        name: 'Ruang Seni Budaya & Karawitan Sunda (Contoh)',
        description:
          'Ruang kedap suara dilengkapi seperangkat gamelan degung pelog salendro dan alat musik modern.',
        category: 'Pembelajaran',
        imageUrl: '',
        capacity: '40 Siswa',
        condition: 'Baik'
      },
      {
        id: 'f-7',
        name: 'Ruang UKS (Unit Kesehatan Sekolah) (Contoh)',
        description:
          'Dilengkapi ranjang periksa, tabung oksigen, obat-obatan P3K, dan tenaga perawat bermitra dengan Puskesmas setempat.',
        category: 'Penunjang',
        imageUrl: '',
        capacity: '6 Ranjang',
        condition: 'Sangat Baik'
      },
      {
        id: 'f-8',
        name: 'Green House & Taman Hidroponik (Contoh)',
        description:
          'Laboratorium alam untuk budidaya tanaman hortikultura, sayuran organik, dan pembuatan pupuk kompos.',
        category: 'Penunjang',
        imageUrl: '',
        capacity: '30 Siswa',
        condition: 'Sangat Baik'
      }
    ],
    extracurriculars: [
      {
        id: 'ekskul-1',
        name: 'Paskibra Pasukan 27 (Contoh)',
        category: 'Kepemimpinan',
        coach: 'Kak Pelatih Paskibra, S.Pd. (Contoh)',
        schedule: 'Selasa & Kamis, 15.30 - 17.00 WIB',
        description:
          'Melatih kedisiplinan, baris berbaris (PBB), kepemimpinan, dan patriotisme generasi muda.',
        imageUrl: '',
        membersCount: 45
      },
      {
        id: 'ekskul-2',
        name: 'Pramuka Gudep 27 (Wajib) (Contoh)',
        category: 'Wajib',
        coach: 'Kak Pembina Pramuka (Contoh)',
        schedule: 'Jumat, 13.30 - 15.30 WIB',
        description:
          'Pendidikan kepanduan kepramukaan untuk melatih kemandirian, kecakapan hidup, dan cinta tanah air.',
        imageUrl: '',
        membersCount: 650
      },
      {
        id: 'ekskul-3',
        name: 'PMR (Palang Merah Remaja) (Contoh)',
        category: 'Kepemimpinan',
        coach: 'Kak Pembina PMR (Contoh)',
        schedule: 'Rabu, 15.30 - 17.00 WIB',
        description:
          'Membina relawan muda dalam pertolongan pertama pada kecelakaan, sanitasi, dan aksi kemanusiaan.',
        imageUrl: '',
        membersCount: 38
      },
      {
        id: 'ekskul-4',
        name: 'Futsal & Sepakbola (Contoh)',
        category: 'Olahraga',
        coach: 'Coach Pelatih Sepakbola (Contoh)',
        schedule: 'Senin & Rabu, 16.00 - 17.45 WIB',
        description:
          'Pengembangan fisik, teknik bermain bola, kerja sama tim, dan pembinaan atlet kompetisi pelajar.',
        imageUrl: '',
        membersCount: 52
      },
      {
        id: 'ekskul-5',
        name: 'Bola Basket (Contoh)',
        category: 'Olahraga',
        coach: 'Coach Pelatih Basket (Contoh)',
        schedule: 'Selasa & Jumat, 15.45 - 17.30 WIB',
        description:
          'Klub basket unggulan sekolah dengan latihan dribble, passing, shooting, dan simulasi tanding.',
        imageUrl: '',
        membersCount: 40
      },
      {
        id: 'ekskul-6',
        name: 'Paduan Suara & Ansambel Musik (Contoh)',
        category: 'Seni Budaya',
        coach: 'Ibu Pelatih Vokal (Contoh)',
        schedule: 'Kamis, 15.30 - 17.00 WIB',
        description:
          'Melatih olah vokal, harmonisasi suara multi-part, dan penyajian lagu daerah maupun nasional.',
        imageUrl: '',
        membersCount: 35
      },
      {
        id: 'ekskul-7',
        name: 'KIR (Karya Ilmiah Remaja) & Robotik (Contoh)',
        category: 'Sains & Teknologi',
        coach: 'Bapak Pembina Riset (Contoh)',
        schedule: 'Sabtu, 08.30 - 11.00 WIB',
        description:
          'Eksperimen sains terapan, koding mikro-kontroler Arduino dasar, dan penulisan makalah ilmiah.',
        imageUrl: '',
        membersCount: 28
      },
      {
        id: 'ekskul-8',
        name: 'Seni Tari Tradisional Sunda (Contoh)',
        category: 'Seni Budaya',
        coach: 'Ibu Pembina Tari Tradisional (Contoh)',
        schedule: 'Rabu, 15.30 - 17.00 WIB',
        description:
          'Melestarikan tarian klasik dan kreasi Sunda seperti Jaipongan, Merak, dan Tari Rampak.',
        imageUrl: '',
        membersCount: 30
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'Medali Emas Olimpiade Sains Nasional (OSN) Tingkat Kota Bandung (Contoh)',
        studentName: 'Ahmad Fauzi & Tim Sains (Contoh)',
        category: 'Akademik',
        level: 'Kota',
        rank: 'Juara 1 (Medali Emas)',
        year: 2025,
        description:
          'Meraih skor tertinggi bidang Matematika dan Ilmu Pengetahuan Alam dalam seleksi OSN Pelajar Kota Bandung.',
        imageUrl: ''
      },
      {
        id: 'ach-2',
        title: 'Juara 1 Lomba Cepat Tepat Wawasan Kebangsaan se-Jawa Barat (Contoh)',
        studentName: 'Tim Cerdas Cermat 27 (Contoh)',
        category: 'Akademik',
        level: 'Provinsi',
        rank: 'Juara 1',
        year: 2025,
        description:
          'Menyisihkan 48 sekolah se-Jawa Barat dalam penguasaan UUD 1945, sejarah perjuangan, dan wawasan nusantara.',
        imageUrl: ''
      },
      {
        id: 'ach-3',
        title: 'Juara 1 Turnamen Futsal Pelajar Walikota Cup Bandung (Contoh)',
        studentName: 'Tim Futsal Putra SMPN 27 (Contoh)',
        category: 'Non-Akademik',
        level: 'Kota',
        rank: 'Juara 1 (Piala Bergilir)',
        year: 2024,
        description:
          'Menjuarai turnamen futsal antar-SMP se-Kota Bandung setelah melalui babak adu penalti yang dramatis.',
        imageUrl: ''
      },
      {
        id: 'ach-4',
        title: 'Medali Perak Festival Lomba Seni Siswa Nasional (FLS2N) Vokal Solo (Contoh)',
        studentName: 'Nadia Putri Rahayu (Contoh)',
        category: 'Non-Akademik',
        level: 'Nasional',
        rank: 'Juara 2 (Medali Perak)',
        year: 2024,
        description:
          'Mewakili Provinsi Jawa Barat pada ajang FLS2N tingkat Nasional kategori Menyanyi Solo dengan membawakan lagu daerah Sunda.',
        imageUrl: ''
      },
      {
        id: 'ach-5',
        title: 'Juara Umum Lomba Keterampilan Baris Berbaris (LKBB) Tingkat Jawa Barat (Contoh)',
        studentName: 'Peleton Paskibra SMPN 27 (Contoh)',
        category: 'Non-Akademik',
        level: 'Provinsi',
        rank: 'Juara Umum',
        year: 2024,
        description:
          'Menyabet predikat PBB Dasar Terbaik, Danton Terbaik, dan Kostum Terbaik dalam gelaran LKBB Pelajar.',
        imageUrl: ''
      },
      {
        id: 'ach-6',
        title: 'Penghargaan Sekolah Sahabat Lingkungan Hidup Adiwiyata (Contoh)',
        studentName: 'Keluarga Besar SMP Negeri 27 Bandung (Contoh)',
        category: 'Non-Akademik',
        level: 'Kota',
        rank: 'Penghargaan Terbaik I',
        year: 2023,
        description:
          'Diberikan oleh Dinas Lingkungan Hidup Kota Bandung atas konsistensi pengelolaan bank sampah dan konservasi air.',
        imageUrl: ''
      }
    ],
    gallery: [
      {
        id: 'g-1',
        title: 'Upacara Bendera Senin Pagi (Contoh)',
        category: 'Upacara',
        imageUrl: '',
        date: '2025-11-17',
        caption:
          'Kedisiplinan siswa-siswi berbaris rapi dalam pelaksanaan upacara rutin hari Senin di lapangan sekolah.'
      },
      {
        id: 'g-2',
        title: 'Praktikum IPA di Laboratorium Biologi (Contoh)',
        category: 'Akademik',
        imageUrl: '',
        date: '2025-11-14',
        caption: 'Siswa kelas VIII melakukan pengamatan sel tumbuhan menggunakan mikroskop terpandu.'
      },
      {
        id: 'g-3',
        title: 'Aktivitas Membaca di Perpustakaan (Contoh)',
        category: 'Akademik',
        imageUrl: '',
        date: '2025-11-08',
        caption: 'Gerakan literasi 15 menit sebelum pembelajaran di perpustakaan sekolah.'
      },
      {
        id: 'g-4',
        title: 'Latihan Bersama Peleton Paskibra (Contoh)',
        category: 'Kesiswaan',
        imageUrl: '',
        date: '2025-10-29',
        caption: 'Persiapan regu Paskibra menghadapi lomba baris berbaris tingkat Kota Bandung.'
      },
      {
        id: 'g-5',
        title: 'Panen Sayur Hidroponik Kader Adiwiyata (Contoh)',
        category: 'Lingkungan',
        imageUrl: '',
        date: '2025-10-15',
        caption: 'Hasil budidaya sawi dan pakcoy hidroponik karya siswa binaan Pokja Tanaman Sekolah.'
      },
      {
        id: 'g-6',
        title: 'Pemberian Apresiasi Siswa Berprestasi (Contoh)',
        category: 'Prestasi',
        imageUrl: '',
        date: '2025-10-02',
        caption: 'Kepala sekolah memberikan piagam penghargaan kepada para juara kompetisi sains.'
      }
    ],
    studentStats: [
      { grade: 'VII', classesCount: 8, male: 128, female: 144, total: 272 },
      { grade: 'VIII', classesCount: 8, male: 132, female: 136, total: 268 },
      { grade: 'IX', classesCount: 8, male: 125, female: 135, total: 260 }
    ],
    messages: [
      {
        id: 'msg-1',
        name: 'Budi Santoso (Orang Tua Siswa Contoh)',
        email: 'budi.santoso@example.com',
        phone: '081298765432',
        subject: 'Konsultasi Program Ekstrakurikuler Robotik',
        message:
          'Selamat siang bapak/ibu guru pembina, ingin menanyakan syarat dan jadwal bergabung di klub robotik untuk siswa kelas VII.',
        createdAt: '2025-11-10T10:30:00Z',
        isRead: false
      },
      {
        id: 'msg-2',
        name: 'Dra. Maya Indah (Alumni Contoh)',
        email: 'maya.indah@example.com',
        phone: '085712349988',
        subject: 'Rencana Donasi Buku Perpustakaan Sekolah',
        message:
          'Halo almamater tercinta SMPN 27 Bandung, ikatan alumni angkatan 2005 bermaksud mendonasikan 150 eksemplar buku ensiklopedia sains untuk perpustakaan.',
        createdAt: '2025-11-04T14:15:00Z',
        isRead: true
      }
    ],
    lmsSubjects: [
      {
        id: 'subj-matematika',
        name: 'Matematika',
        code: 'MTK',
        description:
          'Pembelajaran aljabar, geometri, aritmetika sosial, statistika, dan pemecahan masalah logika untuk siswa SMP.',
        gradeLevels: ['VII', 'VIII', 'IX'],
        assignedTeacherIds: [],
        legacyTeacherNames: ['Dra. Hj. Guru Matematika, M.M. (Contoh)'],
        teacherNamesList: ['Dra. Hj. Guru Matematika, M.M. (Contoh)'],
        teacherNames: 'Dra. Hj. Guru Matematika, M.M. (Contoh)',
        isSample: true,
        createdAt: '2025-11-01T07:00:00.000Z'
      },
      {
        id: 'subj-ipa',
        name: 'Ilmu Pengetahuan Alam (IPA)',
        code: 'IPA',
        description:
          'Eksplorasi konsep fisika, biologi, kimia terpadu, serta praktikum laboratorium dan lingkungan hidup.',
        gradeLevels: ['VII', 'VIII', 'IX'],
        assignedTeacherIds: [],
        legacyTeacherNames: ['Ahmad Guru IPA, S.Pd., M.Si. (Contoh)'],
        teacherNamesList: ['Ahmad Guru IPA, S.Pd., M.Si. (Contoh)'],
        teacherNames: 'Ahmad Guru IPA, S.Pd., M.Si. (Contoh)',
        isSample: true,
        createdAt: '2025-11-01T07:05:00.000Z'
      },
      {
        id: 'subj-bindo',
        name: 'Bahasa Indonesia',
        code: 'BIN',
        description:
          'Penguatan literasi membaca, menulis teks fiksi dan nonfiksi, berbicara efektif, serta apresiasi sastra Indonesia.',
        gradeLevels: ['VII', 'VIII', 'IX'],
        assignedTeacherIds: [],
        legacyTeacherNames: ['Siti Guru Bahasa Indonesia, S.Pd. (Contoh)'],
        teacherNamesList: ['Siti Guru Bahasa Indonesia, S.Pd. (Contoh)'],
        teacherNames: 'Siti Guru Bahasa Indonesia, S.Pd. (Contoh)',
        isSample: true,
        createdAt: '2025-11-01T07:10:00.000Z'
      }
    ],
    lmsTeachers: [],
    lmsItems: [
      {
        id: 'lms-mtk-mat-1',
        subjectId: 'subj-matematika',
        type: 'material',
        title: 'Modul Persamaan Linear Satu Variabel (Contoh)',
        description:
          'Ringkasan materi konsep dasar persamaan linear satu variabel beserta contoh soal terapan sehari-hari. Silakan dipelajari sebelum pertemuan berikutnya.',
        grade: 'VII',
        teacherName: 'Dra. Hj. Guru Matematika, M.M. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        externalUrl: 'https://belajar.kemdikbud.go.id',
        isSample: true
      },
      {
        id: 'lms-mtk-pr-1',
        subjectId: 'subj-matematika',
        type: 'assignment',
        title: 'Latihan Soal Sistem Persamaan Linear Dua Variabel (Contoh)',
        description:
          'Kerjakan 5 soal cerita SPLDV di buku tugas dengan menuliskan langkah substitusi dan eliminasi secara rapi, lalu kumpulkan saat jam pelajaran.',
        grade: 'VIII',
        targetClasses: ['VIII-A', 'VIII-B', 'VIII-C'],
        teacherName: 'Dra. Hj. Guru Matematika, M.M. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        dateGiven: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deadline: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(), // < 2 hari -> Segera berakhir
        isSample: true
      },
      {
        id: 'lms-mtk-pr-2',
        subjectId: 'subj-matematika',
        type: 'assignment',
        title: 'Tugas Eksplorasi Teorema Pythagoras (Contoh)',
        description:
          'Buatlah pembuktian sederhana Teorema Pythagoras menggunakan kertas berpetak untuk dikumpulkan di meja guru.',
        grade: 'VIII',
        targetClasses: ['VIII-D', 'VIII-E', 'VIII-F'],
        teacherName: 'Dra. Hj. Guru Matematika, M.M. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        dateGiven: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Sudah lewat
        isSample: true
      },
      {
        id: 'lms-mtk-quiz-1',
        subjectId: 'subj-matematika',
        type: 'quiz',
        title: 'Kuis Harian Bangun Ruang Sisi Lengkung (Contoh)',
        description:
          'Kuis evaluasi 10 soal pilihan ganda mengenai volume dan luas permukaan tabung, kerucut, dan bola.',
        grade: 'IX',
        teacherName: 'Dra. Hj. Guru Matematika, M.M. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        quizUrl: 'https://docs.google.com/forms',
        isSample: true
      },
      {
        id: 'lms-ipa-mat-1',
        subjectId: 'subj-ipa',
        type: 'material',
        title: 'Slide Pengamatan Sel Hewan dan Tumbuhan (Contoh)',
        description:
          'Materi pengantar struktur organel sel serta panduan praktikum menggunakan mikroskop cahaya di Laboratorium IPA.',
        grade: 'VIII',
        teacherName: 'Ahmad Guru IPA, S.Pd., M.Si. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        externalUrl: 'https://www.youtube.com',
        isSample: true
      },
      {
        id: 'lms-ipa-pr-1',
        subjectId: 'subj-ipa',
        type: 'assignment',
        title: 'Laporan Pengamatan Ekosistem Taman Sekolah (Contoh)',
        description:
          'Catat minimal 5 komponen biotik dan 5 komponen abiotik yang ada di sekitar taman hidroponik sekolah, sertakan diagram rantai makanannya.',
        grade: 'VII',
        targetClasses: ['VII-A', 'VII-B', 'VII-C', 'VII-D', 'VII-E'],
        teacherName: 'Ahmad Guru IPA, S.Pd., M.Si. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        dateGiven: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true
      },
      {
        id: 'lms-ipa-quiz-1',
        subjectId: 'subj-ipa',
        type: 'quiz',
        title: 'Latihan Soal Listrik Statis dan Dinamis (Contoh)',
        description:
          'Uji pemahaman Hukum Ohm dan rangkaian seri-paralel sebelum penilaian sumatif berlangsung.',
        grade: 'IX',
        teacherName: 'Ahmad Guru IPA, S.Pd., M.Si. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        quizUrl: 'https://quizizz.com',
        isSample: true
      },
      {
        id: 'lms-bin-mat-1',
        subjectId: 'subj-bindo',
        type: 'material',
        title: 'Panduan Menulis Teks Berita dan Unsur ADIKSIMBA (Contoh)',
        description:
          'Materi lengkap mengenai struktur piramida terbalik serta kaidah kebahasaan dalam menyusun teks berita yang faktual.',
        grade: 'VII',
        teacherName: 'Siti Guru Bahasa Indonesia, S.Pd. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        externalUrl: 'https://kbbi.kemdikbud.go.id',
        isSample: true
      },
      {
        id: 'lms-bin-pr-1',
        subjectId: 'subj-bindo',
        type: 'assignment',
        title: 'Membuat Resensi Buku Fiksi Pilihan Perpustakaan (Contoh)',
        description:
          'Pilih satu novel remaja dari perpustakaan sekolah, lalu buatlah ulasan struktur orientasi, tafsiran, evaluasi, dan rangkuman.',
        grade: 'IX',
        targetClasses: ['IX-A', 'IX-B', 'IX-C'],
        teacherName: 'Siti Guru Bahasa Indonesia, S.Pd. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        dateGiven: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // < 2 hari -> Segera berakhir
        isSample: true
      },
      {
        id: 'lms-bin-quiz-1',
        subjectId: 'subj-bindo',
        type: 'quiz',
        title: 'Kuis Kalimat Efektif dan Ejaan yang Disempurnakan (Contoh)',
        description:
          'Latihan interaktif memperbaiki penulisan kata baku, tanda baca, dan penggunaan huruf kapital yang tepat.',
        grade: 'Semua',
        teacherName: 'Siti Guru Bahasa Indonesia, S.Pd. (Contoh)',
        createdByUserId: 'admin-smpn27',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        quizUrl: 'https://docs.google.com/forms',
        isSample: true
      }
    ]
  };
}

function syncLmsSubjectTeacherRelations(db: SchoolDb): SchoolDb {
  const validSubjectIds = new Set(db.lmsSubjects.map((s) => s.id));

  // Pastikan setiap guru memiliki daftar ID mapel yang valid & unik
  db.lmsTeachers = db.lmsTeachers.map((t) => ({
    ...t,
    assignedSubjectIds: Array.from(
      new Set((Array.isArray(t.assignedSubjectIds) ? t.assignedSubjectIds : []).filter((sid) => validSubjectIds.has(sid)))
    )
  }));

  const updatedTeacherMap = new Map(db.lmsTeachers.map((t) => [t.id, t]));

  db.lmsSubjects = db.lmsSubjects.map((subj) => {
    // Migrasi otomatis mapel format lama yang hanya memiliki 1 string teacherNames
    let legacyNames: string[];
    if (Array.isArray(subj.legacyTeacherNames)) {
      legacyNames = Array.from(
        new Set(
          subj.legacyTeacherNames
            .filter((n): n is string => typeof n === 'string')
            .map((n) => n.trim())
            .filter(Boolean)
        )
      );
    } else if (
      typeof subj.teacherNames === 'string' &&
      subj.teacherNames.trim() &&
      (!Array.isArray(subj.assignedTeacherIds) || subj.assignedTeacherIds.length === 0)
    ) {
      legacyNames = [subj.teacherNames.trim()];
    } else {
      legacyNames = [];
    }

    // Rekonsiliasi dua arah antara assignedTeacherIds pada mapel dan assignedSubjectIds pada akun guru
    const orderedTeacherIds: string[] = [];
    const seenIds = new Set<string>();
    if (Array.isArray(subj.assignedTeacherIds)) {
      for (const tid of subj.assignedTeacherIds) {
        if (typeof tid === 'string' && updatedTeacherMap.has(tid) && !seenIds.has(tid)) {
          seenIds.add(tid);
          orderedTeacherIds.push(tid);
          const teacher = updatedTeacherMap.get(tid)!;
          if (!teacher.assignedSubjectIds.includes(subj.id)) {
            teacher.assignedSubjectIds.push(subj.id);
          }
        }
      }
    }
    for (const teacher of db.lmsTeachers) {
      if (teacher.assignedSubjectIds.includes(subj.id) && !seenIds.has(teacher.id)) {
        seenIds.add(teacher.id);
        orderedTeacherIds.push(teacher.id);
      }
    }

    const accountNames = orderedTeacherIds
      .map((tid) => updatedTeacherMap.get(tid)?.name.trim() || '')
      .filter(Boolean);

    const combinedNames = Array.from(new Set([...accountNames, ...legacyNames]));

    return {
      ...subj,
      assignedTeacherIds: orderedTeacherIds,
      legacyTeacherNames: legacyNames,
      teacherNamesList: combinedNames,
      teacherNames: combinedNames.join(', ')
    };
  });

  return db;
}

function readDb(): SchoolDb {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<SchoolDb>;
      const initial = createInitialDb();
      return syncLmsSubjectTeacherRelations({
        settings: { ...initial.settings, ...(parsed.settings || {}) },
        about: { ...initial.about, ...(parsed.about || {}) },
        articles: Array.isArray(parsed.articles) ? parsed.articles : initial.articles,
        teachers: Array.isArray(parsed.teachers) ? parsed.teachers : initial.teachers,
        facilities: Array.isArray(parsed.facilities) ? parsed.facilities : initial.facilities,
        extracurriculars: Array.isArray(parsed.extracurriculars)
          ? parsed.extracurriculars
          : initial.extracurriculars,
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : initial.achievements,
        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : initial.gallery,
        studentStats: Array.isArray(parsed.studentStats) ? parsed.studentStats : initial.studentStats,
        messages: Array.isArray(parsed.messages) ? parsed.messages : initial.messages,
        lmsSubjects: Array.isArray(parsed.lmsSubjects) ? parsed.lmsSubjects : initial.lmsSubjects,
        lmsTeachers: Array.isArray(parsed.lmsTeachers) ? parsed.lmsTeachers : initial.lmsTeachers,
        lmsItems: Array.isArray(parsed.lmsItems) ? parsed.lmsItems : initial.lmsItems
      });
    }
  } catch (err) {
    console.error('Failed to read db.json, initializing fresh database:', err);
  }
  const initial = syncLmsSubjectTeacherRelations(createInitialDb());
  writeDb(initial);
  return initial;
}

function writeDb(db: SchoolDb): void {
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

function detectImageType(
  buf: Buffer,
  contentType: string,
  originalName: string
): { ext: string; mime: string } | null {
  const ct = contentType.toLowerCase().split(';')[0].trim();
  const extMatch = path.extname(originalName).toLowerCase();

  // PNG magic bytes: 89 50 4E 47
  if (
    buf.length >= 4 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { ext: 'png', mime: 'image/png' };
  }

  // JPEG magic bytes: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }

  // WEBP magic bytes: RIFF....WEBP
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }

  // SVG check
  if (ct === 'image/svg+xml' || extMatch === '.svg') {
    const text = buf.toString('utf8').trim();
    if (/<svg[\s>]/i.test(text)) {
      return { ext: 'svg', mime: 'image/svg+xml' };
    }
  }

  return null;
}

function sanitizeSvgBuffer(buf: Buffer): Buffer {
  const raw = buf.toString('utf8');
  const cleaned = raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, '');
  return Buffer.from(cleaned, 'utf8');
}

function detectLmsFileType(
  buf: Buffer,
  contentType: string,
  originalName: string
): { ext: string; mime: string } | null {
  const imageMatch = detectImageType(buf, contentType, originalName);
  if (imageMatch) return imageMatch;

  const ct = contentType.toLowerCase().split(';')[0].trim();
  const extMatch = path.extname(originalName).toLowerCase();

  // PDF magic bytes: %PDF-
  if (buf.length >= 5 && buf.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { ext: 'pdf', mime: 'application/pdf' };
  }

  // ZIP-based Office Open XML (DOCX / PPTX): 50 4B 03 04
  const isZipMagic =
    buf.length >= 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07) &&
    (buf[3] === 0x04 || buf[3] === 0x06 || buf[3] === 0x08);

  if (isZipMagic) {
    if (
      extMatch === '.docx' ||
      ct === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return {
        ext: 'docx',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    }
    if (
      extMatch === '.pptx' ||
      ct === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return {
        ext: 'pptx',
        mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      };
    }
  }

  return null;
}

function getMimeByExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (ext === '.pptx') {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  return 'application/octet-stream';
}

function noCacheHeaders(res: Response): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');

  // Ensure initial DB exists on startup
  readDb();

  // Public file serving (images & LMS attachments readable by ALL visitors without login)
  app.get('/uploads/:filename', (req: Request, res: Response) => {
    const safeName = path.basename(String(req.params.filename || ''));
    if (!safeName || safeName.startsWith('.')) {
      res.status(404).send('File not found');
      return;
    }
    const filePath = path.join(UPLOADS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      res.status(404).send('File not found');
      return;
    }

    const mime = getMimeByExtension(safeName);
    res.setHeader('Content-Type', mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (mime === 'image/svg+xml') {
      res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'; style-src 'unsafe-inline'");
    } else if (safeName.endsWith('.docx') || safeName.endsWith('.pptx')) {
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    } else if (safeName.endsWith('.pdf')) {
      res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    }
    res.sendFile(filePath);
  });

  // Admin-only binary image upload endpoint (PNG, JPG, WEBP, SVG max 2 MB)
  app.post(
    '/api/upload',
    requireAdmin,
    express.raw({ type: '*/*', limit: '3mb' }),
    (req: Request, res: Response) => {
      const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      if (buf.length === 0) {
        res.status(400).json({ error: 'File gambar kosong atau gagal dibaca.' });
        return;
      }
      if (buf.length > MAX_IMAGE_BYTES) {
        res.status(413).json({
          error: 'Ukuran file melebihi batas maksimal 2 MB. Silakan kompres atau pilih gambar lain.'
        });
        return;
      }

      const contentType = String(req.headers['content-type'] || '');
      const rawName = decodeURIComponent(String(req.headers['x-file-name'] || 'image'));
      const rawFolder = String(req.headers['x-upload-folder'] || 'media')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '');
      const folderPrefix = rawFolder || 'media';

      const detected = detectImageType(buf, contentType, rawName);
      if (!detected) {
        res.status(400).json({
          error:
            'Format file tidak didukung. Hanya file gambar PNG, JPG, WEBP, atau SVG yang diperbolehkan.'
        });
        return;
      }

      const timestamp = Date.now();
      const rand = crypto.randomBytes(4).toString('hex');
      const filename = `${folderPrefix}-${timestamp}-${rand}.${detected.ext}`;
      const targetPath = path.join(UPLOADS_DIR, filename);

      const finalBuffer = detected.ext === 'svg' ? sanitizeSvgBuffer(buf) : buf;
      fs.writeFileSync(targetPath, finalBuffer);

      const publicUrl = `/uploads/${filename}?v=${timestamp}`;
      res.status(201).json({
        url: publicUrl,
        filename,
        size: finalBuffer.length,
        mime: detected.mime
      });
    }
  );

  // Authenticated LMS staff file upload (PDF, DOCX, PPTX, PNG, JPG, WEBP, SVG max 10 MB)
  app.post(
    '/api/lms/upload',
    requireLmsStaff,
    express.raw({ type: '*/*', limit: '11mb' }),
    (req: Request, res: Response) => {
      const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      if (buf.length === 0) {
        res.status(400).json({ error: 'File materi/lampiran kosong atau gagal dibaca.' });
        return;
      }
      if (buf.length > MAX_LMS_FILE_BYTES) {
        res.status(413).json({
          error: 'Ukuran file melebihi batas maksimal 10 MB. Silakan pilih file yang lebih kecil.'
        });
        return;
      }

      const contentType = String(req.headers['content-type'] || '');
      let rawName = 'materi';
      try {
        rawName = decodeURIComponent(String(req.headers['x-file-name'] || 'materi'));
      } catch {
        rawName = String(req.headers['x-file-name'] || 'materi');
      }

      const detected = detectLmsFileType(buf, contentType, rawName);
      if (!detected) {
        res.status(400).json({
          error:
            'Format file tidak didukung. Hanya file PDF, DOCX, PPTX, PNG, JPG, WEBP, atau SVG yang diperbolehkan.'
        });
        return;
      }

      const timestamp = Date.now();
      const rand = crypto.randomBytes(4).toString('hex');
      const filename = `lms-${timestamp}-${rand}.${detected.ext}`;
      const targetPath = path.join(UPLOADS_DIR, filename);

      const finalBuffer = detected.ext === 'svg' ? sanitizeSvgBuffer(buf) : buf;
      fs.writeFileSync(targetPath, finalBuffer);

      const publicUrl = `/uploads/${filename}?v=${timestamp}`;
      res.status(201).json({
        url: publicUrl,
        fileName: path.basename(rawName) || filename,
        size: finalBuffer.length,
        mime: detected.mime
      });
    }
  );

  // JSON parser for API endpoints
  app.use('/api', express.json({ limit: '2mb' }));

  // Admin-only delete uploaded file
  app.delete('/api/upload', requireAdmin, (req: Request, res: Response) => {
    const rawUrl = String(req.body?.url || req.query?.filename || '');
    const cleanPath = rawUrl.split('?')[0];
    const safeName = path.basename(cleanPath);
    if (safeName && cleanPath.includes('/uploads/')) {
      const targetPath = path.join(UPLOADS_DIR, safeName);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
    }
    res.json({ success: true });
  });

  // Admin & Teacher authentication endpoints
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (email === VALID_ADMIN_EMAIL && password === VALID_ADMIN_PASSWORD) {
      const session = createAuthToken({
        id: 'admin-smpn27',
        email: VALID_ADMIN_EMAIL,
        name: 'Administrator SMPN 27',
        role: 'admin'
      });
      res.json(session);
      return;
    }

    const db = readDb();
    const matchedTeacher = db.lmsTeachers.find(
      (t) => t.email.trim().toLowerCase() === email && t.isActive
    );
    if (matchedTeacher && verifyPassword(password, matchedTeacher.passwordHash)) {
      const session = createAuthToken({
        id: matchedTeacher.id,
        email: matchedTeacher.email,
        name: matchedTeacher.name,
        role: 'teacher',
        assignedSubjectIds: [...matchedTeacher.assignedSubjectIds]
      });
      res.json(session);
      return;
    }

    res.status(401).json({ error: 'Email atau password salah' });
  });

  app.get('/api/auth/verify', (req: Request, res: Response) => {
    noCacheHeaders(res);
    const user = resolveAuthenticatedUser(extractBearerToken(req));
    if (!user) {
      res.status(401).json({ valid: false });
      return;
    }
    res.json({
      valid: true,
      user
    });
  });

  // Public read endpoint — ALWAYS fetched fresh from server on page load (never exposes teacher passwords/emails)
  app.get('/api/public-data', (_req: Request, res: Response) => {
    noCacheHeaders(res);
    const db = readDb();
    res.json({
      settings: db.settings,
      about: db.about,
      articles: db.articles.filter((a) => a.status === 'published'),
      teachers: db.teachers,
      facilities: db.facilities,
      extracurriculars: db.extracurriculars,
      achievements: db.achievements,
      gallery: db.gallery,
      studentStats: db.studentStats,
      lmsSubjects: db.lmsSubjects,
      lmsItems: db.lmsItems.filter((item) => item.status === 'published')
    });
  });

  // Public contact message submission
  app.post('/api/contact', (req: Request, res: Response) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Semua kolom wajib diisi.' });
      return;
    }

    const db = readDb();
    const newMessage = {
      id: 'msg-' + Date.now(),
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    db.messages.unshift(newMessage);
    writeDb(db);
    res.status(201).json({ message: newMessage });
  });

  // Public article view increment
  app.post('/api/articles/:id/view', (req: Request, res: Response) => {
    const db = readDb();
    const article = db.articles.find((a) => a.id === req.params.id);
    if (article) {
      article.views = (article.views || 0) + 1;
      writeDb(db);
    }
    res.json({ success: true });
  });

  // Admin full data endpoint (includes draft articles, contact messages, and LMS data without password hashes)
  app.get('/api/admin/data', requireAdmin, (_req: Request, res: Response) => {
    noCacheHeaders(res);
    const db = readDb();
    res.json({
      ...db,
      lmsTeachers: stripTeacherSecrets(db.lmsTeachers)
    });
  });

  // Admin settings update
  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Data pengaturan tidak valid.' });
      return;
    }
    const db = readDb();
    const slides = Array.isArray(incoming.heroSlides)
      ? incoming.heroSlides.map((slide: any) => ({
          ...slide,
          imageUrl: sanitizeImageUrl(slide?.imageUrl)
        }))
      : db.settings.heroSlides;

    db.settings = {
      ...db.settings,
      ...incoming,
      logoUrl: sanitizeImageUrl(incoming.logoUrl),
      heroSlides: slides
    };
    writeDb(db);
    res.json({ settings: db.settings });
  });

  // Admin about update
  app.put('/api/admin/about', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Data tentang sekolah tidak valid.' });
      return;
    }
    const db = readDb();
    db.about = {
      ...db.about,
      ...incoming,
      headmasterWelcome: {
        ...db.about.headmasterWelcome,
        ...(incoming.headmasterWelcome || {}),
        photoUrl: sanitizeImageUrl(incoming.headmasterWelcome?.photoUrl)
      }
    };
    writeDb(db);
    res.json({ about: db.about });
  });

  // Admin articles CRUD
  app.post('/api/admin/articles', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming?.id || !incoming?.title) {
      res.status(400).json({ error: 'Judul berita wajib diisi.' });
      return;
    }
    const db = readDb();
    const item = {
      ...incoming,
      imageUrl: sanitizeImageUrl(incoming.imageUrl)
    };
    const idx = db.articles.findIndex((a) => a.id === item.id);
    if (idx >= 0) db.articles[idx] = item;
    else db.articles.unshift(item);
    writeDb(db);
    res.json({ articles: db.articles });
  });

  app.delete('/api/admin/articles/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.articles = db.articles.filter((a) => a.id !== req.params.id);
    writeDb(db);
    res.json({ articles: db.articles });
  });

  // Admin teachers CRUD
  app.post('/api/admin/teachers', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming?.id || !incoming?.name) {
      res.status(400).json({ error: 'Nama guru/tendik wajib diisi.' });
      return;
    }
    const db = readDb();
    const item = {
      ...incoming,
      imageUrl: sanitizeImageUrl(incoming.imageUrl)
    };
    const idx = db.teachers.findIndex((t) => t.id === item.id);
    if (idx >= 0) db.teachers[idx] = item;
    else db.teachers.push(item);
    writeDb(db);
    res.json({ teachers: db.teachers });
  });

  app.delete('/api/admin/teachers/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.teachers = db.teachers.filter((t) => t.id !== req.params.id);
    writeDb(db);
    res.json({ teachers: db.teachers });
  });

  // Admin facilities CRUD
  app.post('/api/admin/facilities', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming?.id || !incoming?.name) {
      res.status(400).json({ error: 'Nama fasilitas wajib diisi.' });
      return;
    }
    const db = readDb();
    const item = {
      ...incoming,
      imageUrl: sanitizeImageUrl(incoming.imageUrl)
    };
    const idx = db.facilities.findIndex((f) => f.id === item.id);
    if (idx >= 0) db.facilities[idx] = item;
    else db.facilities.push(item);
    writeDb(db);
    res.json({ facilities: db.facilities });
  });

  app.delete('/api/admin/facilities/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.facilities = db.facilities.filter((f) => f.id !== req.params.id);
    writeDb(db);
    res.json({ facilities: db.facilities });
  });

  // Admin extracurriculars CRUD
  app.post('/api/admin/extracurriculars', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming?.id || !incoming?.name) {
      res.status(400).json({ error: 'Nama ekstrakurikuler wajib diisi.' });
      return;
    }
    const db = readDb();
    const item = {
      ...incoming,
      imageUrl: sanitizeImageUrl(incoming.imageUrl)
    };
    const idx = db.extracurriculars.findIndex((e) => e.id === item.id);
    if (idx >= 0) db.extracurriculars[idx] = item;
    else db.extracurriculars.push(item);
    writeDb(db);
    res.json({ extracurriculars: db.extracurriculars });
  });

  app.delete('/api/admin/extracurriculars/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.extracurriculars = db.extracurriculars.filter((e) => e.id !== req.params.id);
    writeDb(db);
    res.json({ extracurriculars: db.extracurriculars });
  });

  // Admin achievements CRUD
  app.post('/api/admin/achievements', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming?.id || !incoming?.title) {
      res.status(400).json({ error: 'Judul prestasi wajib diisi.' });
      return;
    }
    const db = readDb();
    const item = {
      ...incoming,
      imageUrl: sanitizeImageUrl(incoming.imageUrl)
    };
    const idx = db.achievements.findIndex((a) => a.id === item.id);
    if (idx >= 0) db.achievements[idx] = item;
    else db.achievements.unshift(item);
    writeDb(db);
    res.json({ achievements: db.achievements });
  });

  app.delete('/api/admin/achievements/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.achievements = db.achievements.filter((a) => a.id !== req.params.id);
    writeDb(db);
    res.json({ achievements: db.achievements });
  });

  // Admin gallery CRUD
  app.post('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming?.id || !incoming?.title) {
      res.status(400).json({ error: 'Judul foto galeri wajib diisi.' });
      return;
    }
    const db = readDb();
    const item = {
      ...incoming,
      imageUrl: sanitizeImageUrl(incoming.imageUrl)
    };
    const idx = db.gallery.findIndex((g) => g.id === item.id);
    if (idx >= 0) db.gallery[idx] = item;
    else db.gallery.unshift(item);
    writeDb(db);
    res.json({ gallery: db.gallery });
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.gallery = db.gallery.filter((g) => g.id !== req.params.id);
    writeDb(db);
    res.json({ gallery: db.gallery });
  });

  // Admin student stats update
  app.put('/api/admin/student-stats', requireAdmin, (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: 'Data statistik siswa tidak valid.' });
      return;
    }
    const db = readDb();
    db.studentStats = req.body;
    writeDb(db);
    res.json({ studentStats: db.studentStats });
  });

  // Admin contact messages management
  app.patch('/api/admin/messages/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const msg = db.messages.find((m) => m.id === req.params.id);
    if (msg) {
      msg.isRead = req.body?.isRead !== undefined ? Boolean(req.body.isRead) : true;
      writeDb(db);
    }
    res.json({ messages: db.messages });
  });

  app.delete('/api/admin/messages/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    db.messages = db.messages.filter((m) => m.id !== req.params.id);
    writeDb(db);
    res.json({ messages: db.messages });
  });

  // Admin reset defaults
  app.post('/api/admin/reset', requireAdmin, (_req: Request, res: Response) => {
    const fresh = createInitialDb();
    writeDb(fresh);
    res.json({
      ...fresh,
      lmsTeachers: stripTeacherSecrets(fresh.lmsTeachers)
    });
  });

  // ========================
  // LMS MANAGEMENT ENDPOINTS
  // ========================

  // Authenticated Admin / Teacher LMS data view (scoped for teacher)
  app.get('/api/lms/manage', requireLmsStaff, (req: Request, res: Response) => {
    noCacheHeaders(res);
    const authUser = (req as Request & { authUser?: AuthenticatedUser }).authUser!;
    const db = readDb();

    if (authUser.role === 'admin') {
      res.json({
        subjects: db.lmsSubjects,
        teachers: stripTeacherSecrets(db.lmsTeachers),
        items: db.lmsItems
      });
      return;
    }

    const allowedIds = new Set(authUser.assignedSubjectIds || []);
    res.json({
      subjects: db.lmsSubjects.filter((s) => allowedIds.has(s.id)),
      teachers: [],
      items: db.lmsItems.filter((item) => allowedIds.has(item.subjectId))
    });
  });

  // Admin-only: Create or update Mata Pelajaran (mendukung multi-guru pengampu)
  app.post('/api/lms/subjects', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    const name = typeof incoming?.name === 'string' ? incoming.name.trim() : '';
    const code = typeof incoming?.code === 'string' ? incoming.code.trim().toUpperCase() : '';
    const description = typeof incoming?.description === 'string' ? incoming.description.trim() : '';
    const rawGrades = Array.isArray(incoming?.gradeLevels) ? incoming.gradeLevels : [];
    const validGrades = rawGrades.filter(
      (g: unknown): g is 'VII' | 'VIII' | 'IX' => g === 'VII' || g === 'VIII' || g === 'IX'
    );

    if (!name) {
      res.status(400).json({ error: 'Nama mata pelajaran wajib diisi.' });
      return;
    }
    if (validGrades.length === 0) {
      res.status(400).json({ error: 'Pilih minimal satu jenjang kelas (VII, VIII, atau IX).' });
      return;
    }

    const db = readDb();
    const id =
      typeof incoming?.id === 'string' && incoming.id.trim()
        ? incoming.id.trim()
        : `subj-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const existing = db.lmsSubjects.find((s) => s.id === id);
    const validTeacherSet = new Set(db.lmsTeachers.map((t) => t.id));

    const hasTeacherIdsPayload = Array.isArray(incoming?.assignedTeacherIds);
    const hasLegacyNamesPayload = Array.isArray(incoming?.legacyTeacherNames);

    const assignedTeacherIds: string[] = hasTeacherIdsPayload
      ? Array.from(
          new Set(
            incoming.assignedTeacherIds.filter(
              (tid: unknown): tid is string => typeof tid === 'string' && validTeacherSet.has(tid)
            )
          )
        )
      : existing?.assignedTeacherIds || [];

    let legacyTeacherNames: string[];
    if (hasLegacyNamesPayload) {
      legacyTeacherNames = Array.from(
        new Set(
          incoming.legacyTeacherNames
            .filter((n: unknown): n is string => typeof n === 'string')
            .map((n: string) => n.trim())
            .filter(Boolean)
        )
      );
    } else if (!hasTeacherIdsPayload && typeof incoming?.teacherNames === 'string') {
      legacyTeacherNames = incoming.teacherNames.trim() ? [incoming.teacherNames.trim()] : [];
    } else {
      legacyTeacherNames = existing?.legacyTeacherNames || [];
    }

    const record = {
      id,
      name,
      code: code || name.slice(0, 4).toUpperCase(),
      description,
      gradeLevels: validGrades,
      assignedTeacherIds,
      legacyTeacherNames,
      teacherNamesList: [],
      teacherNames: '',
      isSample: incoming?.isSample === true ? true : undefined,
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    if (existing) {
      db.lmsSubjects = db.lmsSubjects.map((s) => (s.id === id ? record : s));
    } else {
      db.lmsSubjects.push(record);
    }

    // Sinkronisasi dua arah: perbarui daftar mapel di setiap akun guru sesuai pilihan mapel ini
    const selectedTeacherSet = new Set(assignedTeacherIds);
    db.lmsTeachers = db.lmsTeachers.map((t) => {
      const withoutThisSubject = t.assignedSubjectIds.filter((sid) => sid !== id);
      return {
        ...t,
        assignedSubjectIds: selectedTeacherSet.has(t.id)
          ? [...withoutThisSubject, id]
          : withoutThisSubject
      };
    });

    syncLmsSubjectTeacherRelations(db);
    writeDb(db);
    res.json({
      subjects: db.lmsSubjects,
      teachers: stripTeacherSecrets(db.lmsTeachers)
    });
  });

  // Admin-only: Delete Mata Pelajaran (also removes teacher assignments and items under that subject)
  app.delete('/api/lms/subjects/:id', requireAdmin, (req: Request, res: Response) => {
    const targetId = String(req.params.id || '');
    const db = readDb();
    db.lmsSubjects = db.lmsSubjects.filter((s) => s.id !== targetId);
    db.lmsItems = db.lmsItems.filter((item) => item.subjectId !== targetId);
    db.lmsTeachers = db.lmsTeachers.map((t) => ({
      ...t,
      assignedSubjectIds: t.assignedSubjectIds.filter((sid) => sid !== targetId)
    }));
    syncLmsSubjectTeacherRelations(db);
    writeDb(db);
    res.json({
      subjects: db.lmsSubjects,
      items: db.lmsItems,
      teachers: stripTeacherSecrets(db.lmsTeachers)
    });
  });

  // Admin-only: Create or update Teacher Account (password hashed with scrypt + salt)
  app.post('/api/lms/teachers', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body;
    const name = typeof incoming?.name === 'string' ? incoming.name.trim() : '';
    const email = typeof incoming?.email === 'string' ? incoming.email.trim().toLowerCase() : '';
    const password = typeof incoming?.password === 'string' ? incoming.password : '';
    const isActive = incoming?.isActive !== false;
    const assignedSubjectIds = Array.isArray(incoming?.assignedSubjectIds)
      ? incoming.assignedSubjectIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];

    if (!name || !email || !email.includes('@')) {
      res.status(400).json({ error: 'Nama guru dan alamat email yang valid wajib diisi.' });
      return;
    }

    if (email === VALID_ADMIN_EMAIL) {
      res.status(400).json({ error: 'Email tersebut sudah digunakan oleh akun Administrator utama.' });
      return;
    }

    const db = readDb();
    const id =
      typeof incoming?.id === 'string' && incoming.id.trim()
        ? incoming.id.trim()
        : `guru-lms-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const duplicateEmail = db.lmsTeachers.find(
      (t) => t.email.trim().toLowerCase() === email && t.id !== id
    );
    if (duplicateEmail) {
      res.status(400).json({ error: 'Email guru sudah terdaftar pada akun lain.' });
      return;
    }

    const existing = db.lmsTeachers.find((t) => t.id === id);
    if (!existing && password.length < 6) {
      res.status(400).json({ error: 'Password guru baru wajib minimal 6 karakter.' });
      return;
    }
    if (existing && password && password.length < 6) {
      res.status(400).json({ error: 'Password baru guru wajib minimal 6 karakter.' });
      return;
    }

    const validSubjectSet = new Set(db.lmsSubjects.map((s) => s.id));
    const filteredSubjects = Array.from(
      new Set<string>(assignedSubjectIds.filter((sid: string) => validSubjectSet.has(sid)))
    );

    const record = {
      id,
      name,
      email,
      passwordHash: password ? hashPassword(password) : existing!.passwordHash,
      assignedSubjectIds: filteredSubjects,
      isActive,
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    if (existing) {
      db.lmsTeachers = db.lmsTeachers.map((t) => (t.id === id ? record : t));
    } else {
      db.lmsTeachers.push(record);
    }

    // Sinkronisasi dua arah: perbarui daftar assignedTeacherIds pada semua mapel
    const filteredSubjectSet = new Set(filteredSubjects);
    db.lmsSubjects = db.lmsSubjects.map((s) => {
      const currentIds = Array.isArray(s.assignedTeacherIds) ? s.assignedTeacherIds : [];
      const withoutThisTeacher = currentIds.filter((tid) => tid !== id);
      return {
        ...s,
        assignedTeacherIds: filteredSubjectSet.has(s.id)
          ? [...withoutThisTeacher, id]
          : withoutThisTeacher
      };
    });

    syncLmsSubjectTeacherRelations(db);
    writeDb(db);
    res.json({
      teachers: stripTeacherSecrets(db.lmsTeachers),
      subjects: db.lmsSubjects,
      teacher: {
        id: record.id,
        name: record.name,
        email: record.email,
        assignedSubjectIds: record.assignedSubjectIds,
        isActive: record.isActive,
        createdAt: record.createdAt
      }
    });
  });

  // Admin-only: Delete Teacher Account
  app.delete('/api/lms/teachers/:id', requireAdmin, (req: Request, res: Response) => {
    const targetTeacherId = String(req.params.id || '');
    const db = readDb();
    db.lmsTeachers = db.lmsTeachers.filter((t) => t.id !== targetTeacherId);
    db.lmsSubjects = db.lmsSubjects.map((s) => ({
      ...s,
      assignedTeacherIds: (s.assignedTeacherIds || []).filter((tid) => tid !== targetTeacherId)
    }));
    syncLmsSubjectTeacherRelations(db);
    writeDb(db);
    res.json({
      teachers: stripTeacherSecrets(db.lmsTeachers),
      subjects: db.lmsSubjects
    });
  });

  // Admin or assigned Teacher: Create or update LMS item (Bahan Ajar, PR / Tugas, Quiz)
  app.post('/api/lms/items', requireLmsStaff, (req: Request, res: Response) => {
    const authUser = (req as Request & { authUser?: AuthenticatedUser }).authUser!;
    const incoming = req.body;
    const subjectId = typeof incoming?.subjectId === 'string' ? incoming.subjectId.trim() : '';
    const type = incoming?.type;
    const title = typeof incoming?.title === 'string' ? incoming.title.trim() : '';
    const description = typeof incoming?.description === 'string' ? incoming.description.trim() : '';
    const status: 'published' | 'draft' = incoming?.status === 'draft' ? 'draft' : 'published';

    if (!subjectId || !title) {
      res.status(400).json({ error: 'Mata pelajaran dan judul konten wajib diisi.' });
      return;
    }
    if (type !== 'material' && type !== 'assignment' && type !== 'quiz') {
      res.status(400).json({ error: 'Jenis konten LMS tidak valid.' });
      return;
    }

    let grade: 'VII' | 'VIII' | 'IX' | 'Semua' = incoming?.grade;
    if (type !== 'assignment') {
      if (grade !== 'VII' && grade !== 'VIII' && grade !== 'IX' && grade !== 'Semua') {
        res.status(400).json({ error: 'Pilihan kelas tidak valid.' });
        return;
      }
    }

    let targetClasses: string[] | undefined;
    if (type === 'assignment') {
      const rawClasses = Array.isArray(incoming?.targetClasses) ? incoming.targetClasses : [];
      const cleanedSet = new Set<string>(
        rawClasses
          .filter((c: unknown): c is string => typeof c === 'string')
          .map((c: string) => c.trim().toUpperCase())
          .filter((c: string) => VALID_LMS_CLASS_SET.has(c))
      );
      const cleanedClasses = Array.from(cleanedSet).sort(
        (a: string, b: string) => (LMS_CLASS_ORDER.get(a) ?? 999) - (LMS_CLASS_ORDER.get(b) ?? 999)
      );

      if (cleanedClasses.length === 0) {
        res.status(400).json({
          error: 'Pilih minimal satu kelas tujuan untuk PR / Tugas (mis. VII-A, VIII-B, atau IX-C).'
        });
        return;
      }
      targetClasses = cleanedClasses;
      grade = deriveGradeFromTargetClasses(cleanedClasses);
    }

    const db = readDb();
    const subjectExists = db.lmsSubjects.some((s) => s.id === subjectId);
    if (!subjectExists) {
      res.status(404).json({ error: 'Mata pelajaran tidak ditemukan.' });
      return;
    }

    // Teacher authorization: can only manage items in assigned subjects
    if (authUser.role === 'teacher') {
      const allowedIds = new Set(authUser.assignedSubjectIds || []);
      if (!allowedIds.has(subjectId)) {
        res.status(403).json({
          error: 'Anda tidak memiliki izin mengelola konten pada mata pelajaran ini.'
        });
        return;
      }
    }

    const id =
      typeof incoming?.id === 'string' && incoming.id.trim()
        ? incoming.id.trim()
        : `lms-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const existing = db.lmsItems.find((item) => item.id === id);

    if (existing && authUser.role === 'teacher') {
      const allowedIds = new Set(authUser.assignedSubjectIds || []);
      if (!allowedIds.has(existing.subjectId)) {
        res.status(403).json({
          error: 'Anda tidak memiliki izin mengubah konten dari mata pelajaran lain.'
        });
        return;
      }
      if (existing.createdByUserId !== authUser.id) {
        res.status(403).json({
          error: 'Anda hanya diperbolehkan mengedit konten LMS milik Anda sendiri.'
        });
        return;
      }
    }

    const fileUrl = sanitizeImageUrl(incoming?.fileUrl);
    const fileName =
      typeof incoming?.fileName === 'string' ? incoming.fileName.trim().slice(0, 180) : '';

    let externalUrl: string | undefined;
    if (typeof incoming?.externalUrl === 'string' && incoming.externalUrl.trim()) {
      const validated = validateHttpUrl(incoming.externalUrl);
      if (!validated) {
        res.status(400).json({
          error: 'Link tautan eksternal harus berupa URL valid yang diawali http:// atau https://.'
        });
        return;
      }
      externalUrl = validated;
    }

    let quizUrl: string | undefined;
    if (type === 'quiz') {
      const validatedQuiz = validateHttpUrl(incoming?.quizUrl);
      if (!validatedQuiz) {
        res.status(400).json({
          error: 'Link Quiz wajib diisi dengan URL valid yang diawali http:// atau https://.'
        });
        return;
      }
      quizUrl = validatedQuiz;
    }

    let dateGiven: string | undefined;
    let deadline: string | undefined;
    if (type === 'assignment') {
      dateGiven =
        typeof incoming?.dateGiven === 'string' && incoming.dateGiven.trim()
          ? incoming.dateGiven.trim()
          : new Date().toISOString().slice(0, 10);
      deadline = typeof incoming?.deadline === 'string' ? incoming.deadline.trim() : '';
      if (!deadline || Number.isNaN(new Date(deadline).getTime())) {
        res.status(400).json({
          error: 'Batas waktu pengumpulan (deadline) PR / Tugas wajib diisi dengan tanggal yang valid.'
        });
        return;
      }
    }

    if (type === 'material' && !fileUrl && !externalUrl) {
      res.status(400).json({
        error: 'Bahan ajar wajib menyertakan file unggahan atau link materi.'
      });
      return;
    }

    const teacherName =
      authUser.role === 'teacher'
        ? authUser.name
        : typeof incoming?.teacherName === 'string' && incoming.teacherName.trim()
        ? incoming.teacherName.trim()
        : authUser.name;

    const record = {
      id,
      subjectId,
      type,
      title,
      description,
      grade,
      targetClasses,
      teacherName,
      createdByUserId: existing?.createdByUserId || authUser.id,
      createdAt: existing?.createdAt || new Date().toISOString(),
      status,
      fileUrl: fileUrl || undefined,
      fileName: fileUrl && fileName ? fileName : undefined,
      externalUrl,
      dateGiven,
      deadline,
      quizUrl,
      isSample: incoming?.isSample === true ? true : undefined
    };

    if (existing) {
      db.lmsItems = db.lmsItems.map((item) => (item.id === id ? record : item));
    } else {
      db.lmsItems.unshift(record);
    }

    writeDb(db);
    const responseItems =
      authUser.role === 'admin'
        ? db.lmsItems
        : db.lmsItems.filter((item) => (authUser.assignedSubjectIds || []).includes(item.subjectId));
    res.json({ items: responseItems });
  });

  // Admin or assigned Teacher: Toggle published / draft status
  app.patch('/api/lms/items/:id/status', requireLmsStaff, (req: Request, res: Response) => {
    const authUser = (req as Request & { authUser?: AuthenticatedUser }).authUser!;
    const db = readDb();
    const target = db.lmsItems.find((item) => item.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Item LMS tidak ditemukan.' });
      return;
    }
    if (authUser.role === 'teacher') {
      if (!(authUser.assignedSubjectIds || []).includes(target.subjectId)) {
        res.status(403).json({
          error: 'Anda tidak memiliki izin mengubah status konten mata pelajaran ini.'
        });
        return;
      }
      if (target.createdByUserId !== authUser.id) {
        res.status(403).json({
          error: 'Anda hanya diperbolehkan mengubah status konten LMS milik Anda sendiri.'
        });
        return;
      }
    }

    target.status = req.body?.status === 'draft' ? 'draft' : 'published';
    writeDb(db);
    const responseItems =
      authUser.role === 'admin'
        ? db.lmsItems
        : db.lmsItems.filter((item) => (authUser.assignedSubjectIds || []).includes(item.subjectId));
    res.json({ items: responseItems });
  });

  // Admin or assigned Teacher: Delete LMS item
  app.delete('/api/lms/items/:id', requireLmsStaff, (req: Request, res: Response) => {
    const authUser = (req as Request & { authUser?: AuthenticatedUser }).authUser!;
    const db = readDb();
    const target = db.lmsItems.find((item) => item.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Item LMS tidak ditemukan.' });
      return;
    }
    if (authUser.role === 'teacher') {
      if (!(authUser.assignedSubjectIds || []).includes(target.subjectId)) {
        res.status(403).json({
          error: 'Anda tidak memiliki izin menghapus konten mata pelajaran ini.'
        });
        return;
      }
      if (target.createdByUserId !== authUser.id) {
        res.status(403).json({
          error: 'Anda hanya diperbolehkan menghapus konten LMS milik Anda sendiri.'
        });
        return;
      }
    }

    db.lmsItems = db.lmsItems.filter((item) => item.id !== req.params.id);
    writeDb(db);
    const responseItems =
      authUser.role === 'admin'
        ? db.lmsItems
        : db.lmsItems.filter((item) => (authUser.assignedSubjectIds || []).includes(item.subjectId));
    res.json({ items: responseItems });
  });

  // Error handler for oversized payloads on /api/upload and /api/lms/upload
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err?.type === 'entity.too.large' || err?.status === 413) {
      const isLms = req.path.startsWith('/api/lms/upload');
      res.status(413).json({
        error: isLms
          ? 'Ukuran file melebihi batas maksimal 10 MB. Silakan pilih file yang lebih kecil.'
          : 'Ukuran file melebihi batas maksimal 2 MB. Silakan pilih file gambar yang lebih kecil.'
      });
      return;
    }
    next(err);
  });

  // Frontend serving (Vite middleware in dev, static dist in production)
  const distDir = path.resolve(process.cwd(), 'dist');
  const useViteDev = IS_DEV || !fs.existsSync(path.join(distDir, 'index.html'));

  if (useViteDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        next();
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SMP Negeri 27 Kota Bandung running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
