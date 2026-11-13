import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { GalleryItem } from '../../types';
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
  Image,
  Calendar,
  X,
  Loader2
} from 'lucide-react';

export const AdminGallery: React.FC = () => {
  const { gallery, saveGalleryItem, deleteGalleryItem, uploadImage } = useSchoolData();

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingModalPhoto, setUploadingModalPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<GalleryItem>>({
    id: '',
    title: '',
    category: 'Akademik' as any,
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    caption: ''
  });

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const categories = ['Akademik', 'Kesiswaan', 'Upacara', 'Lingkungan', 'Prestasi'] as const;

  const handleOpenAdd = () => {
    setCurrentItem({
      id: 'g-' + Date.now(),
      title: '',
      category: 'Akademik',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
      caption: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setCurrentItem({ ...item });
    setIsEditing(true);
  };

  const handleQuickChangePhoto = async (item: GalleryItem, file: File) => {
    setUploadingId(item.id);
    try {
      const oldUrl = item.imageUrl;
      const uploadedUrl = await uploadImage(file, 'gallery');
      if (uploadedUrl) {
        const ok = await saveGalleryItem({ ...item, imageUrl: uploadedUrl });
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
      const uploadedUrl = await uploadImage(file, 'gallery');
      if (uploadedUrl) {
        setCurrentItem((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } finally {
      setUploadingModalPhoto(false);
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.title) return;

    const itemToSave: GalleryItem = {
      id: currentItem.id || 'g-' + Date.now(),
      title: currentItem.title,
      category: (currentItem.category as any) || 'Akademik',
      imageUrl: sanitizeImageUrlInput(currentItem.imageUrl || ''),
      date: currentItem.date || new Date().toISOString().split('T')[0],
      caption: currentItem.caption || ''
    };

    setIsSaving(true);
    try {
      const ok = await saveGalleryItem(itemToSave);
      if (ok) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = gallery.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.caption.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === 'all' || g.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Galeri Foto Sekolah
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dokumentasi foto kegiatan belajar, upacara, lingkungan hidup, dan ekstrakurikuler.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Baru</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari foto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Album</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <SchoolImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full text-[10px]"
                  placeholderText="Foto belum diunggah"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                  {item.category}
                </span>
              </div>

              <div className="p-4">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block mb-0.5">
                  {item.date}
                </span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.caption}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
              <label
                className={`px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm ${
                  uploadingId === item.id ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {uploadingId === item.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingId === item.id ? 'Mengunggah...' : 'Ganti Foto'}</span>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT_ATTR}
                  disabled={uploadingId === item.id}
                  onChange={(e) => {
                    const input = e.target;
                    const file = input.files?.[0];
                    if (file) handleQuickChangePhoto(item, file);
                    input.value = '';
                  }}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold"
                  title="Ubah Data Lengkap"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Tambah/Ubah */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentItem.id?.startsWith('g-') && !gallery.find((g) => g.id === currentItem.id)
                  ? 'Tambah Foto Galeri'
                  : 'Ubah Data Galeri'}
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
                  Judul Foto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Upacara Bendera Senin Pagi"
                  value={currentItem.title}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Album
                  </label>
                  <select
                    value={currentItem.category}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({
                        ...prev,
                        category: e.target.value as any
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
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={currentItem.date}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Foto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  File Foto Galeri
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <SchoolImage
                      src={currentItem.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full text-[9px] p-1"
                      placeholderText="Foto belum diunggah"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
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
                      {currentItem.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentItem((prev) => ({ ...prev, imageUrl: '' }))
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
                      placeholder="Atau tempel URL Foto (https://... atau /uploads/...)"
                      value={currentItem.imageUrl}
                      onChange={(e) =>
                        setCurrentItem((prev) => ({
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
                  Keterangan Singkat (Caption)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan momen dalam foto ini..."
                  value={currentItem.caption}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({ ...prev, caption: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                  {isSaving ? 'Menyimpan...' : 'Simpan Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Foto Galeri"
        message="Apakah Anda yakin ingin menghapus foto ini dari galeri?"
        itemName={deleteTarget?.title}
        onConfirm={() => {
          if (deleteTarget) {
            deleteGalleryItem(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
