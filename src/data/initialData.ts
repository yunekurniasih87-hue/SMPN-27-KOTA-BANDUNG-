import {
  Article,
  Teacher,
  Facility,
  Extracurricular,
  Achievement,
  GalleryItem,
  ClassGradeStat,
  AboutData,
  SchoolSettings,
  ContactMessage
} from '../types';

export const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'SMP Negeri 27 Kota Bandung',
  slogan: 'Unggul dalam Prestasi, Berkarakter, Berakhlak Mulia, dan Berwawasan Lingkungan (Contoh)',
  address: 'Jl. Contoh Alamat Sekolah No. 27, Kelurahan Contoh, Kec. Contoh (Ganti di Panel Admin)',
  city: 'Kota Bandung, Jawa Barat',
  postalCode: '40123 (Contoh)',
  phone: '(022) 7123456 (Contoh)',
  whatsapp: '081234567890 (Contoh)',
  email: 'info@smpn27bandung.sch.id (Contoh)',
  operatingHours: 'Senin - Jumat: 07.00 - 15.30 WIB',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.5634786224!2d107.5731168!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e0f5f0!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
  instagramUrl: 'https://instagram.com/smpn27bandung_contoh',
  youtubeUrl: 'https://youtube.com/@smpn27bandung_contoh',
  whatsappUrl: 'https://wa.me/6281234567890',
  logoUrl: '', // Kosong agar slot placeholder 80x80 px dengan komentar TEMPAT LOGO SEKOLAH tampil default
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
      description: 'Program pembiasaan cinta lingkungan, pemilahan sampah mandiri, taman hidroponik, dan konservasi energi oleh seluruh warga sekolah.',
      icon: 'Leaf'
    },
    {
      id: 'prog-2',
      title: 'Penguatan Literasi & Numerasi Digital',
      description: 'Optimalisasi sudut baca kelas, perpustakaan digital, serta pemanfaatan e-learning dalam pembelajaran sehari-hari.',
      icon: 'BookOpen'
    },
    {
      id: 'prog-3',
      title: 'Pengembangan Karakter & Budi Pekerti',
      description: 'Pembiasaan 5S (Senyum, Sapa, Salam, Sopan, Santun), shalat berjamaah, doa bersama, dan kegiatan keputrian.',
      icon: 'HeartHandshake'
    },
    {
      id: 'prog-4',
      title: 'Pembinaan Prestasi OSN & O2SN & FLS2N',
      description: 'Bimbingan intensif bagi siswa bertalenta di bidang sains, olahraga, seni budaya, serta bahasa.',
      icon: 'Trophy'
    }
  ]
};

export const INITIAL_ABOUT: AboutData = {
  history: 'SMP Negeri 27 Kota Bandung berdiri sebagai institusi pendidikan menengah pertama negeri yang berdedikasi tinggi mencerdaskan generasi penerus bangsa di Kota Kembang Bandung. Selama puluhan tahun, sekolah terus berinovasi dalam sarana pembelajaran, pembinaan karakter, dan pencapaian prestasi akademik maupun non-akademik.',
  timeline: [
    {
      year: '1985 (Contoh)',
      title: 'Awal Pendirian Sekolah',
      description: 'Didirikan untuk memenuhi kebutuhan pendidikan berkualitas bagi masyarakat di kawasan Kota Bandung.'
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
      description: 'Penerapan Kurikulum Merdeka secara penuh dengan fokus pada Projek Penguatan Profil Pelajar Pancasila (P5).'
    }
  ],
  vision: 'Terwujudnya Peserta Didik yang Berakhlak Mulia, Unggul dalam Prestasi, Terampil Menguasai Teknologi, dan Berwawasan Lingkungan.',
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
      meaning: 'Melambangkan sumber ilmu pengetahuan yang tak pernah kering dan tekad belajar tanpa henti untuk masa depan gemilang.'
    },
    {
      symbol: 'Kujang / Lambang Kota Bandung',
      meaning: 'Menunjukkan identitas kearifan lokal Sunda dan pengabdian sekolah bagi masyarakat Kota Bandung.'
    },
    {
      symbol: 'Sayap Berhelai Tiga',
      meaning: 'Melambangkan tiga pilar tripusat pendidikan: keluarga, sekolah, dan masyarakat yang bersinergi secara harmonis.'
    },
    {
      symbol: 'Warna Biru dan Emas',
      meaning: 'Biru melambangkan kedalaman wawasan, kejujuran, dan ketenangan; Emas melambangkan kemuliaan akhlak dan puncak prestasi.'
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
    message: 'Assalamu’alaikum Warahmatullahi Wabarakatuh, Sampurasun.\n\nSelamat datang di website resmi SMP Negeri 27 Kota Bandung. Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa atas limpahan rahmat dan hidayah-Nya sehingga portal resmi sekolah ini dapat hadir sebagai jembatan informasi dan komunikasi terbuka antara sekolah, orang tua, alumni, dan masyarakat luas.\n\nDi era keterbukaan informasi dan percepatan teknologi saat ini, kami berkomitmen menyajikan informasi yang akurat, transparan, dan edukatif. SMP Negeri 27 Kota Bandung terus berupaya mendidik generasi bangsa yang tidak hanya cerdas dalam ilmu pengetahuan, tetapi juga santun berbudi pekerti, mencintai lingkungan, dan siap bersaing di kancah global.\n\nTerima kasih atas kepercayaan dan kerja sama seluruh keluarga besar sekolah serta para pemangku kepentingan. Mari bersama-sama kita wujudkan pendidikan berkualitas demi masa depan putra-putri tercinta kita.\n\nWassalamu’alaikum Warahmatullahi Wabarakatuh.'
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
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Peringatan Hari Guru Nasional dan Apresiasi Pendidik Berprestasi (Contoh)',
    slug: 'peringatan-hari-guru-nasional-contoh',
    category: 'Kegiatan',
    excerpt: 'Suasana khidmat dan penuh haru mewarnai upacara bendera memperingati Hari Guru Nasional di lapangan utama SMP Negeri 27 Kota Bandung.',
    content: 'Bandung - Keluarga besar SMP Negeri 27 Kota Bandung menggelar upacara peringatan Hari Guru Nasional dengan khidmat di lapangan sekolah. Petugas upacara kali ini secara istimewa dibawakan oleh bapak dan ibu guru serta tenaga kependidikan.\n\nDalam amanatnya, Kepala Sekolah menyampaikan apresiasi setinggi-tingginya kepada para pendidik yang tak pernah lelah membimbing siswa dengan kasih sayang dan dedikasi. Acara dilanjutkan dengan persembahan bunga mawar dari pengurus OSIS serta penampilan paduan suara Gita Suara 27 yang membawakan lagu Hymne Guru dan Terima Kasih Guruku.',
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
    excerpt: 'Prestasi membanggakan kembali diraih peserta didik SMP Negeri 27 Kota Bandung pada ajang kompetisi sains dan matematika tingkat kota.',
    content: 'Prestasi gemilang kembali dipersembahkan oleh ananda Ahmad Fauzi (Siswa Contoh Kelas IX) yang berhasil menyabet Medali Emas dalam ajang Olimpiade Sains Pelajar Kota Bandung.\n\nKepala Sekolah mengalungkan medali saat apel pagi sekolah dan menyampaikan pesan agar raihan prestasi ini menjadi pelecut semangat bagi siswa lainnya untuk giat belajar dan berani berkompetisi.',
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
    excerpt: 'Kader lingkungan sekolah bersama relawan OSIS menggelar aksi penanaman pohon dan edukasi pilah sampah di lingkungan sekitar sekolah.',
    content: 'Sebagai wujud komitmen sekolah berwawasan lingkungan, seluruh kader Adiwiyata SMP Negeri 27 Kota Bandung bersama tim pembina menyelenggarakan aksi peduli bumi bertajuk "Green Movement 27".\n\nKegiatan diisi dengan pemilahan sampah organik dan anorganik, pembuatan kompos cair, serta pembagian bibit tanaman obat keluarga (toga) kepada warga sekitar.',
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
    excerpt: 'Diberitahukan kepada seluruh siswa kelas VII, VIII, dan IX mengenai pelaksanaan PSAS berbasis komputer dan lembar kerja.',
    content: 'Sehubungan dengan agenda kalender pendidikan semester ganjil, disampaikan kepada seluruh orang tua/wali dan siswa bahwa Penilaian Sumatif Akhir Semester (PSAS) akan berlangsung mulai tanggal 1 Desember hingga 8 Desember 2025.\n\nSiswa diharapkan mempersiapkan diri dengan baik, menjaga kesehatan, dan mematuhi tata tertib ujian.',
    imageUrl: '',
    publishedAt: '2025-11-05',
    status: 'published',
    author: 'Kurikulum Sekolah (Contoh)',
    views: 615
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
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
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'f-1',
    name: 'Laboratorium Komputer & TIK Modern (Contoh)',
    description: 'Dilengkapi 40 unit PC modern dengan koneksi internet fiber optic berkecepatan tinggi untuk ujian CBT dan pembelajaran informatika.',
    category: 'Laboratorium',
    imageUrl: '',
    capacity: '40 Siswa',
    condition: 'Sangat Baik'
  },
  {
    id: 'f-2',
    name: 'Laboratorium IPA Terpadu (Fisika & Biologi) (Contoh)',
    description: 'Sarana eksperimen sains lengkap dengan mikroskop digital, torso anatomi, alat peraga optik, dan lemari asam.',
    category: 'Laboratorium',
    imageUrl: '',
    capacity: '36 Siswa',
    condition: 'Sangat Baik'
  },
  {
    id: 'f-3',
    name: 'Perpustakaan & Pojok Baca Digital (Contoh)',
    description: 'Koleksi ribuan buku pelajaran, referensi sastra, ensiklopedia, dan terminal komputer pencarian katalog digital.',
    category: 'Pembelajaran',
    imageUrl: '',
    capacity: '60 Siswa',
    condition: 'Sangat Baik'
  },
  {
    id: 'f-4',
    name: 'Lapangan Olahraga Multi-Fungsi (Contoh)',
    description: 'Lapangan outdoor berlapis sintetis untuk basket, futsal, voli, bulutangkis, serta kegiatan upacara bendera.',
    category: 'Sarana Olahraga',
    imageUrl: '',
    capacity: '1000 Orang',
    condition: 'Baik'
  },
  {
    id: 'f-5',
    name: 'Masjid & Ruang Ibadah Sekolah (Contoh)',
    description: 'Tempat ibadah shalat berjamaah, kegiatan kajian rohis, dan pembinaan karakter religius seluruh siswa.',
    category: 'Penunjang',
    imageUrl: '',
    capacity: '300 Jamaah',
    condition: 'Sangat Baik'
  },
  {
    id: 'f-6',
    name: 'Ruang Seni Budaya & Karawitan Sunda (Contoh)',
    description: 'Ruang kedap suara dilengkapi seperangkat gamelan degung pelog salendro dan alat musik modern.',
    category: 'Pembelajaran',
    imageUrl: '',
    capacity: '40 Siswa',
    condition: 'Baik'
  },
  {
    id: 'f-7',
    name: 'Ruang UKS (Unit Kesehatan Sekolah) (Contoh)',
    description: 'Dilengkapi ranjang periksa, tabung oksigen, obat-obatan P3K, dan tenaga perawat bermitra dengan Puskesmas setempat.',
    category: 'Penunjang',
    imageUrl: '',
    capacity: '6 Ranjang',
    condition: 'Sangat Baik'
  },
  {
    id: 'f-8',
    name: 'Green House & Taman Hidroponik (Contoh)',
    description: 'Laboratorium alam untuk budidaya tanaman hortikultura, sayuran organik, dan pembuatan pupuk kompos.',
    category: 'Penunjang',
    imageUrl: '',
    capacity: '30 Siswa',
    condition: 'Sangat Baik'
  }
];

export const INITIAL_EXTRACURRICULARS: Extracurricular[] = [
  {
    id: 'ekskul-1',
    name: 'Paskibra Pasukan 27 (Contoh)',
    category: 'Kepemimpinan',
    coach: 'Kak Pelatih Paskibra, S.Pd. (Contoh)',
    schedule: 'Selasa & Kamis, 15.30 - 17.00 WIB',
    description: 'Melatih kedisiplinan, baris berbaris (PBB), kepemimpinan, dan patriotisme generasi muda.',
    imageUrl: '',
    membersCount: 45
  },
  {
    id: 'ekskul-2',
    name: 'Pramuka Gudep 27 (Wajib) (Contoh)',
    category: 'Wajib',
    coach: 'Kak Pembina Pramuka (Contoh)',
    schedule: 'Jumat, 13.30 - 15.30 WIB',
    description: 'Pendidikan kepanduan kepramukaan untuk melatih kemandirian, kecakapan hidup, dan cinta tanah air.',
    imageUrl: '',
    membersCount: 650
  },
  {
    id: 'ekskul-3',
    name: 'PMR (Palang Merah Remaja) (Contoh)',
    category: 'Kepemimpinan',
    coach: 'Kak Pembina PMR (Contoh)',
    schedule: 'Rabu, 15.30 - 17.00 WIB',
    description: 'Membina relawan muda dalam pertolongan pertama pada kecelakaan, sanitasi, dan aksi kemanusiaan.',
    imageUrl: '',
    membersCount: 38
  },
  {
    id: 'ekskul-4',
    name: 'Futsal & Sepakbola (Contoh)',
    category: 'Olahraga',
    coach: 'Coach Pelatih Sepakbola (Contoh)',
    schedule: 'Senin & Rabu, 16.00 - 17.45 WIB',
    description: 'Pengembangan fisik, teknik bermain bola, kerja sama tim, dan pembinaan atlet kompetisi pelajar.',
    imageUrl: '',
    membersCount: 52
  },
  {
    id: 'ekskul-5',
    name: 'Bola Basket (Contoh)',
    category: 'Olahraga',
    coach: 'Coach Pelatih Basket (Contoh)',
    schedule: 'Selasa & Jumat, 15.45 - 17.30 WIB',
    description: 'Klub basket unggulan sekolah dengan latihan dribble, passing, shooting, dan simulasi tanding.',
    imageUrl: '',
    membersCount: 40
  },
  {
    id: 'ekskul-6',
    name: 'Paduan Suara & Ansambel Musik (Contoh)',
    category: 'Seni Budaya',
    coach: 'Ibu Pelatih Vokal (Contoh)',
    schedule: 'Kamis, 15.30 - 17.00 WIB',
    description: 'Melatih olah vokal, harmonisasi suara multi-part, dan penyajian lagu daerah maupun nasional.',
    imageUrl: '',
    membersCount: 35
  },
  {
    id: 'ekskul-7',
    name: 'KIR (Karya Ilmiah Remaja) & Robotik (Contoh)',
    category: 'Sains & Teknologi',
    coach: 'Bapak Pembina Riset (Contoh)',
    schedule: 'Sabtu, 08.30 - 11.00 WIB',
    description: 'Eksperimen sains terapan, koding mikro-kontroler Arduino dasar, dan penulisan makalah ilmiah.',
    imageUrl: '',
    membersCount: 28
  },
  {
    id: 'ekskul-8',
    name: 'Seni Tari Tradisional Sunda (Contoh)',
    category: 'Seni Budaya',
    coach: 'Ibu Pembina Tari Tradisional (Contoh)',
    schedule: 'Rabu, 15.30 - 17.00 WIB',
    description: 'Melestarikan tarian klasik dan kreasi Sunda seperti Jaipongan, Merak, dan Tari Rampak.',
    imageUrl: '',
    membersCount: 30
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Medali Emas Olimpiade Sains Nasional (OSN) Tingkat Kota Bandung (Contoh)',
    studentName: 'Ahmad Fauzi & Tim Sains (Contoh)',
    category: 'Akademik',
    level: 'Kota',
    rank: 'Juara 1 (Medali Emas)',
    year: 2025,
    description: 'Meraih skor tertinggi bidang Matematika dan Ilmu Pengetahuan Alam dalam seleksi OSN Pelajar Kota Bandung.',
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
    description: 'Menyisihkan 48 sekolah se-Jawa Barat dalam penguasaan UUD 1945, sejarah perjuangan, dan wawasan nusantara.',
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
    description: 'Menjuarai turnamen futsal antar-SMP se-Kota Bandung setelah melalui babak adu penalti yang dramatis.',
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
    description: 'Mewakili Provinsi Jawa Barat pada ajang FLS2N tingkat Nasional kategori Menyanyi Solo dengan membawakan lagu daerah Sunda.',
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
    description: 'Menyabet predikat PBB Dasar Terbaik, Danton Terbaik, dan Kostum Terbaik dalam gelaran LKBB Pelajar.',
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
    description: 'Diberikan oleh Dinas Lingkungan Hidup Kota Bandung atas konsistensi pengelolaan bank sampah dan konservasi air.',
    imageUrl: ''
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Upacara Bendera Senin Pagi (Contoh)',
    category: 'Upacara',
    imageUrl: '',
    date: '2025-11-17',
    caption: 'Kedisiplinan siswa-siswi berbaris rapi dalam pelaksanaan upacara rutin hari Senin di lapangan sekolah.'
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
];

export const INITIAL_STUDENT_STATS: ClassGradeStat[] = [
  {
    grade: 'VII',
    classesCount: 8,
    male: 128,
    female: 144,
    total: 272
  },
  {
    grade: 'VIII',
    classesCount: 8,
    male: 132,
    female: 136,
    total: 268
  },
  {
    grade: 'IX',
    classesCount: 8,
    male: 125,
    female: 135,
    total: 260
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Budi Santoso (Orang Tua Siswa Contoh)',
    email: 'budi.santoso@example.com',
    phone: '081298765432',
    subject: 'Konsultasi Program Ekstrakurikuler Robotik',
    message: 'Selamat siang bapak/ibu guru pembina, ingin menanyakan syarat dan jadwal bergabung di klub robotik untuk siswa kelas VII.',
    createdAt: '2025-11-10T10:30:00Z',
    isRead: false
  },
  {
    id: 'msg-2',
    name: 'Dra. Maya Indah (Alumni Contoh)',
    email: 'maya.indah@example.com',
    phone: '085712349988',
    subject: 'Rencana Donasi Buku Perpustakaan Sekolah',
    message: 'Halo almamater tercinta SMPN 27 Bandung, ikatan alumni angkatan 2005 bermaksud mendonasikan 150 eksemplar buku ensiklopedia sains untuk perpustakaan.',
    createdAt: '2025-11-04T14:15:00Z',
    isRead: true
  }
];
