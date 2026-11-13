import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default keys from environment if available
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const SUPABASE_CONFIG_EVENT = 'smpn27:supabase-config-updated';

export const normalizeSupabaseUrl = (url: string): string => {
  return url.trim().replace(/\/+$/, '');
};

// Load custom configured credentials from localStorage if user set them in admin panel
export const getSavedSupabaseConfig = () => {
  try {
    const raw = localStorage.getItem('smpn27_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      const url = normalizeSupabaseUrl(parsed?.url || envUrl || '');
      const anonKey = String(parsed?.anonKey || envKey || '').trim();
      return {
        url,
        anonKey,
        isConnected: Boolean(url && anonKey)
      };
    }
  } catch (e) {
    console.error('Error reading saved Supabase config', e);
  }
  const normalizedEnvUrl = normalizeSupabaseUrl(envUrl);
  return {
    url: normalizedEnvUrl,
    anonKey: envKey,
    isConnected: Boolean(normalizedEnvUrl && envKey)
  };
};

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export const resetSupabaseClient = () => {
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
};

export const saveSupabaseConfig = (rawUrl: string, rawAnonKey: string) => {
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = rawAnonKey.trim();
  const isConnected = Boolean(url && anonKey);

  localStorage.setItem(
    'smpn27_supabase_config',
    JSON.stringify({ url, anonKey, isConnected })
  );
  resetSupabaseClient();
  window.dispatchEvent(new CustomEvent(SUPABASE_CONFIG_EVENT));

  return { url, anonKey, isConnected };
};

export const isAdminRole = (
  user:
    | {
        app_metadata?: Record<string, unknown>;
        user_metadata?: Record<string, unknown>;
      }
    | null
    | undefined
): boolean => {
  if (!user) return false;
  const rawRole = user.app_metadata?.role ?? user.user_metadata?.role;
  if (rawRole === undefined || rawRole === null || rawRole === '') {
    return true;
  }
  const normalized = String(rawRole).trim().toLowerCase();
  return ['admin', 'administrator', 'super_admin', 'superadmin', 'authenticated'].includes(
    normalized
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSavedSupabaseConfig();
  const url = config.url || normalizeSupabaseUrl(envUrl);
  const key = config.anonKey || envKey;

  if (!url || !key) {
    return null;
  }

  if (!cachedClient || cachedUrl !== url || cachedKey !== key) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      cachedUrl = url;
      cachedKey = key;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
};

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SCHEMA DAN ROW LEVEL SECURITY (RLS) SUPABASE
-- SMP NEGERI 27 KOTA BANDUNG
-- ========================================================

-- 1. Tabel Pengaturan Sekolah
CREATE TABLE IF NOT EXISTS school_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Halaman Tentang (Visi, Misi, Sejarah, Sambutan, Akreditasi)
CREATE TABLE IF NOT EXISTS about_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Berita dan Pengumuman
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  author TEXT NOT NULL,
  views INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Guru dan Tenaga Kependidikan
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nip TEXT,
  role TEXT NOT NULL,
  subject TEXT,
  education TEXT,
  image_url TEXT,
  category TEXT CHECK (category IN ('pimpinan', 'guru', 'tendik')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Fasilitas
CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  capacity TEXT,
  condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Ekstrakurikuler
CREATE TABLE IF NOT EXISTS extracurriculars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  coach TEXT,
  schedule TEXT,
  description TEXT,
  image_url TEXT,
  members_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabel Prestasi Siswa
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Akademik', 'Non-Akademik')),
  level TEXT,
  rank TEXT,
  year INT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabel Galeri Foto
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  image_url TEXT NOT NULL,
  date DATE,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabel Statistik Siswa Per Jenjang
CREATE TABLE IF NOT EXISTS student_stats (
  grade TEXT PRIMARY KEY CHECK (grade IN ('VII', 'VIII', 'IX')),
  classes_count INT DEFAULT 8,
  male INT DEFAULT 0,
  female INT DEFAULT 0,
  total INT DEFAULT 0
);

-- 10. Tabel Pesan Masuk (Form Kontak)
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) DI SEMUA TABEL
-- ========================================================
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurriculars ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN 1: PUBLIK HANYA BOLEH MEMBACA KONTEN (SELECT)
CREATE POLICY "Public Read Settings" ON school_settings FOR SELECT USING (true);
CREATE POLICY "Public Read About" ON about_data FOR SELECT USING (true);
CREATE POLICY "Public Read Published Articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Public Read Facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Public Read Extracurriculars" ON extracurriculars FOR SELECT USING (true);
CREATE POLICY "Public Read Achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Student Stats" ON student_stats FOR SELECT USING (true);

-- KEBIJAKAN 2: PUBLIK DAPAT MENGIRIM PESAN KONTAK (INSERT)
CREATE POLICY "Public Insert Messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- KEBIJAKAN 3: HANYA ADMIN LOGIN (AUTHENTICATED) YANG DAPAT MENGELOLA SEMUA DATA
CREATE POLICY "Admin Full Access Settings" ON school_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access About" ON about_data FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Articles" ON articles FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Teachers" ON teachers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Facilities" ON facilities FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Extracurriculars" ON extracurriculars FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Achievements" ON achievements FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Gallery" ON gallery FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Student Stats" ON student_stats FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Access Messages" ON contact_messages FOR ALL TO authenticated USING (true);

-- ========================================================
-- STORAGE BUCKET UNTUK FOTO SEKOLAH
-- Buat bucket dengan nama: school-assets (Public Bucket)
-- ========================================================
`;
