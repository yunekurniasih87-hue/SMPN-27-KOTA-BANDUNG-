import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Extracurricular } from '../../types';
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
  Activity,
  Users,
  Calendar,
  X,
  Loader2
} from 'lucide-react';

export const AdminExtracurriculars: React.FC = () => {
  const { extracurriculars, saveExtracurricular, deleteExtracurricular, uploadImage } =
    useSchoolData();

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingModalPhoto, setUploadingModalPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEkskul, setCurrentEkskul] = useState<Partial<Extracurricular>>({
    id: '',
    name: '',
    category: 'Olahraga',
    coach: '',
    schedule: '',
    description: '',
    imageUrl: '',
    membersCount: 30
  });

  const [deleteTarget, setDeleteTarget] = useState<Extracurricular | null>(null);

  const categories = ['Wajib', 'Olahraga', 'Seni Budaya', 'Sains & Teknologi', 'Kepemimpinan'] as const;

  const handleOpenAdd = () => {
    setCurrentEkskul({
      id: 'ekskul-' + Date.now(),
      name: '',
      category: 'Olahraga',
      coach: '',
      schedule: 'Rabu, 15.30 - 17.00 WIB',
      description: '',
      imageUrl: '',
      membersCount: 30
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: Extracurricular) => {
    setCurrentEkskul({ ...item });
    setIsEditing(true);
  };

  const handleQuickChangePhoto = async (item: Extracurricular, file: File) => {
    setUploadingId(item.id);
    try {
      const oldUrl = item.imageUrl;
      const uploadedUrl = await uploadImage(file, 'extracurriculars');
      if (uploadedUrl) {
        const ok = await saveExtracurricular({ ...item, imageUrl: uploadedUrl });
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
      const uploadedUrl = await uploadImage(file, 'extracurriculars');
      if (uploadedUrl) {
        setCurrentEkskul((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } finally {
      setUploadingModalPhoto(false);
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEkskul.name || !currentEkskul.description) return;

    const ekskulToSave: Extracurricular = {
      id: currentEkskul.id || 'ekskul-' + Date.now(),
      name: currentEkskul.name,
      category: (currentEkskul.category as any) || 'Olahraga',
      coach: currentEkskul.coach || 'Pelatih Ekskul',
      schedule: currentEkskul.schedule || 'Sesuai Jadwal',
      description: currentEkskul.description,
      imageUrl: sanitizeImageUrlInput(currentEkskul.imageUrl || ''),
      membersCount: Number(currentEkskul.membersCount) || 25
    };

    setIsSaving(true);
    try {
      const ok = await saveExtracurricular(ekskulToSave);
      if (ok) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = extracurriculars.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.coach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Ekstrakurikuler
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen klub minat dan bakat, jadwal kegiatan, serta pembina siswa.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ekstrakurikuler</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ekstrakurikuler..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of Extracurriculars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <SchoolImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full text-[10px]"
                  placeholderText="Foto belum diunggah"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow">
                  {item.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                  {item.membersCount} Anggota
                </span>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <div>Jadwal: {item.schedule}</div>
                  <div>Pembina: {item.coach}</div>
                </div>
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
                  title="Hapus Ekskul"
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
                {currentEkskul.id?.startsWith('ekskul-') && !extracurriculars.find((e) => e.id === currentEkskul.id)
                  ? 'Tambah Ekstrakurikuler'
                  : 'Ubah Data Ekstrakurikuler'}
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
                  Nama Ekstrakurikuler <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paskibra / Bola Basket"
                  value={currentEkskul.name}
                  onChange={(e) =>
                    setCurrentEkskul((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Bidang
                  </label>
                  <select
                    value={currentEkskul.category}
                    onChange={(e) =>
                      setCurrentEkskul((prev) => ({
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
                    Estimasi Jumlah Anggota
                  </label>
                  <input
                    type="number"
                    value={currentEkskul.membersCount}
                    onChange={(e) =>
                      setCurrentEkskul((prev) => ({ ...prev, membersCount: Number(e.target.value) }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pembina / Pelatih
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kak Pelatih, S.Pd."
                    value={currentEkskul.coach}
                    onChange={(e) =>
                      setCurrentEkskul((prev) => ({ ...prev, coach: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jadwal Latihan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rabu & Jumat, 15.30 WIB"
                    value={currentEkskul.schedule}
                    onChange={(e) =>
                      setCurrentEkskul((prev) => ({ ...prev, schedule: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Foto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Kegiatan Ekskul
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <SchoolImage
                      src={currentEkskul.imageUrl}
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
                      {currentEkskul.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentEkskul((prev) => ({ ...prev, imageUrl: '' }))
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
                      value={currentEkskul.imageUrl}
                      onChange={(e) =>
                        setCurrentEkskul((prev) => ({
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
                  Deskripsi Kegiatan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan tujuan, materi pembinaan, dan manfaat ekskul ini..."
                  value={currentEkskul.description}
                  onChange={(e) =>
                    setCurrentEkskul((prev) => ({ ...prev, description: e.target.value }))
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
                  {isSaving ? 'Menyimpan...' : 'Simpan Ekstrakurikuler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Ekstrakurikuler"
        message="Apakah Anda yakin ingin menghapus ekstrakurikuler ini?"
        itemName={deleteTarget?.name}
        onConfirm={() => {
          if (deleteTarget) {
            deleteExtracurricular(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
