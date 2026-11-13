import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Article, NewsCategory } from '../../types';
import {
  IMAGE_ACCEPT_ATTR,
  sanitizeImageUrlInput,
  storageService
} from '../../services/storageService';
import { SchoolImage } from '../../components/common/SchoolImage';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Calendar,
  Eye,
  CheckCircle2,
  X,
  FileText,
  Loader2
} from 'lucide-react';

export const AdminArticles: React.FC = () => {
  const { articles, saveArticle, deleteArticle, uploadImage } = useSchoolData();

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingModalPhoto, setUploadingModalPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({
    id: '',
    title: '',
    slug: '',
    category: 'Kegiatan',
    excerpt: '',
    content: '',
    imageUrl: '',
    publishedAt: new Date().toISOString().split('T')[0],
    status: 'published',
    author: 'Admin SMPN 27',
    views: 0
  });

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const categories: NewsCategory[] = [
    'Kegiatan',
    'Prestasi',
    'Pengumuman',
    'Akademik',
    'Ekstrakurikuler'
  ];

  const handleOpenAdd = () => {
    setCurrentArticle({
      id: 'art-' + Date.now(),
      title: '',
      slug: '',
      category: 'Kegiatan',
      excerpt: '',
      content: '',
      imageUrl: '',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      author: 'Admin SMPN 27',
      views: 0
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (art: Article) => {
    setCurrentArticle({ ...art });
    setIsEditing(true);
  };

  const handleQuickChangePhoto = async (art: Article, file: File) => {
    setUploadingId(art.id);
    try {
      const oldUrl = art.imageUrl;
      const uploadedUrl = await uploadImage(file, 'articles');
      if (uploadedUrl) {
        const ok = await saveArticle({ ...art, imageUrl: uploadedUrl });
        if (ok && oldUrl && oldUrl !== uploadedUrl) {
          storageService.deleteUploadedImage(oldUrl);
        }
      }
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploadingModalPhoto(true);
    try {
      const uploadedUrl = await uploadImage(file, 'articles');
      if (uploadedUrl) {
        setCurrentArticle((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } finally {
      setUploadingModalPhoto(false);
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArticle.title || !currentArticle.content) return;

    const slug =
      currentArticle.slug ||
      currentArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const articleToSave: Article = {
      id: currentArticle.id || 'art-' + Date.now(),
      title: currentArticle.title,
      slug,
      category: (currentArticle.category as NewsCategory) || 'Kegiatan',
      excerpt: currentArticle.excerpt || currentArticle.content.slice(0, 150) + '...',
      content: currentArticle.content,
      imageUrl: sanitizeImageUrlInput(currentArticle.imageUrl || ''),
      publishedAt: currentArticle.publishedAt || new Date().toISOString().split('T')[0],
      status: currentArticle.status || 'published',
      author: currentArticle.author || 'Admin SMPN 27',
      views: currentArticle.views || 0
    };

    setIsSaving(true);
    try {
      const ok = await saveArticle(articleToSave);
      if (ok) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'all' || a.category === filterCategory;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Berita & Pengumuman
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publikasikan warta, agenda, kegiatan siswa, dan pengumuman resmi sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Berita Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="published">Terbit (Published)</option>
            <option value="draft">Draf (Draft)</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Foto & Judul</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Tidak ada berita yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative group">
                          <SchoolImage
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full text-[9px] p-1"
                            placeholderText="Belum ada foto"
                            showIcon={false}
                          />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {art.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <label
                              className={`text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 ${
                                uploadingId === art.id ? 'opacity-60 pointer-events-none' : ''
                              }`}
                            >
                              {uploadingId === art.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Upload className="w-3 h-3" />
                              )}
                              <span>{uploadingId === art.id ? 'Mengunggah...' : 'Ganti Foto'}</span>
                              <input
                                type="file"
                                accept={IMAGE_ACCEPT_ATTR}
                                disabled={uploadingId === art.id}
                                onChange={(e) => {
                                  const input = e.target;
                                  const file = input.files?.[0];
                                  if (file) handleQuickChangePhoto(art, file);
                                  input.value = '';
                                }}
                                className="hidden"
                              />
                            </label>
                            {art.imageUrl && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const oldUrl = art.imageUrl;
                                  const ok = await saveArticle({ ...art, imageUrl: '' });
                                  if (ok && oldUrl) {
                                    storageService.deleteUploadedImage(oldUrl);
                                  }
                                }}
                                className="text-[10px] text-rose-500 hover:underline"
                                title="Setel foto ke kosong"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {art.publishedAt}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          art.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {art.status === 'published' ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{art.views || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ubah Berita"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(art)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Berita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Ubah Berita */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentArticle.id?.startsWith('art-') && !articles.find((a) => a.id === currentArticle.id)
                  ? 'Tambah Berita Baru'
                  : 'Ubah Data Berita'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Berita <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul warta / pengumuman..."
                  value={currentArticle.title}
                  onChange={(e) =>
                    setCurrentArticle((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={currentArticle.category}
                    onChange={(e) =>
                      setCurrentArticle((prev) => ({
                        ...prev,
                        category: e.target.value as NewsCategory
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={currentArticle.publishedAt}
                    onChange={(e) =>
                      setCurrentArticle((prev) => ({ ...prev, publishedAt: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={currentArticle.status}
                    onChange={(e) =>
                      setCurrentArticle((prev) => ({
                        ...prev,
                        status: e.target.value as 'published' | 'draft'
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="published">Terbitkan (Published)</option>
                    <option value="draft">Simpan Draf (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Foto Berita (Upload atau URL) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Utama Berita
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <SchoolImage
                      src={currentArticle.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full text-[9px] p-1"
                      placeholderText="Foto belum diunggah"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm ${
                          uploadingModalPhoto ? 'opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        {uploadingModalPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingModalPhoto ? 'Mengunggah...' : 'Ganti Foto'}</span>
                        <input
                          type="file"
                          accept={IMAGE_ACCEPT_ATTR}
                          disabled={uploadingModalPhoto}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {currentArticle.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentArticle((prev) => ({ ...prev, imageUrl: '' }))
                          }
                          className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      PNG, JPG, WEBP, atau SVG • Maks. 2 MB.
                    </p>
                    <input
                      type="text"
                      placeholder="Atau tempel URL Gambar (https://... atau /uploads/...)"
                      value={currentArticle.imageUrl}
                      onChange={(e) =>
                        setCurrentArticle((prev) => ({
                          ...prev,
                          imageUrl: sanitizeImageUrlInput(e.target.value)
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ringkasan Singkat (Excerpt)
                </label>
                <input
                  type="text"
                  placeholder="Ringkasan 1-2 kalimat untuk pratinjau kartu berita..."
                  value={currentArticle.excerpt}
                  onChange={(e) =>
                    setCurrentArticle((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Berita Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Tuliskan berita lengkap di sini..."
                  value={currentArticle.content}
                  onChange={(e) =>
                    setCurrentArticle((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingModalPhoto}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Berita"
        message="Apakah Anda yakin ingin menghapus berita ini secara permanen?"
        itemName={deleteTarget?.title}
        onConfirm={() => {
          if (deleteTarget) {
            deleteArticle(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
