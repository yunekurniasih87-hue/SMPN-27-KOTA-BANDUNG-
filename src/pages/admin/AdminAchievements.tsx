import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Achievement } from '../../types';
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
  Trophy,
  X,
  Loader2
} from 'lucide-react';

export const AdminAchievements: React.FC = () => {
  const { achievements, saveAchievement, deleteAchievement, uploadImage } = useSchoolData();

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingModalPhoto, setUploadingModalPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentAch, setCurrentAch] = useState<Partial<Achievement>>({
    id: '',
    title: '',
    studentName: '',
    category: 'Akademik',
    level: 'Kota',
    rank: 'Juara 1',
    year: new Date().getFullYear(),
    description: '',
    imageUrl: ''
  });

  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);

  const levels = ['Kecamatan', 'Kota', 'Provinsi', 'Nasional', 'Internasional'] as const;

  const handleOpenAdd = () => {
    setCurrentAch({
      id: 'ach-' + Date.now(),
      title: '',
      studentName: '',
      category: 'Akademik',
      level: 'Kota',
      rank: 'Juara 1',
      year: new Date().getFullYear(),
      description: '',
      imageUrl: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: Achievement) => {
    setCurrentAch({ ...item });
    setIsEditing(true);
  };

  const handleQuickChangePhoto = async (item: Achievement, file: File) => {
    setUploadingId(item.id);
    try {
      const oldUrl = item.imageUrl;
      const uploadedUrl = await uploadImage(file, 'achievements');
      if (uploadedUrl) {
        const ok = await saveAchievement({ ...item, imageUrl: uploadedUrl });
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
      const uploadedUrl = await uploadImage(file, 'achievements');
      if (uploadedUrl) {
        setCurrentAch((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } finally {
      setUploadingModalPhoto(false);
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAch.title || !currentAch.studentName) return;

    const achToSave: Achievement = {
      id: currentAch.id || 'ach-' + Date.now(),
      title: currentAch.title,
      studentName: currentAch.studentName,
      category: (currentAch.category as any) || 'Akademik',
      level: (currentAch.level as any) || 'Kota',
      rank: currentAch.rank || 'Juara 1',
      year: Number(currentAch.year) || new Date().getFullYear(),
      description: currentAch.description || '',
      imageUrl: sanitizeImageUrlInput(currentAch.imageUrl || '')
    };

    setIsSaving(true);
    try {
      const ok = await saveAchievement(achToSave);
      if (ok) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = achievements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || a.category === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Prestasi Siswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arsip medali, juara lomba, dan capaian penghargaan siswa di berbagai ajang.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Prestasi Siswa</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari prestasi, siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Kategori</option>
            <option value="Akademik">Akademik</option>
            <option value="Non-Akademik">Non-Akademik</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nama Kejuaraan & Lomba</th>
                <th className="py-3 px-4">Siswa / Tim</th>
                <th className="py-3 px-4">Peringkat & Tahun</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Tidak ada data prestasi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <SchoolImage
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full text-[9px] p-1"
                            placeholderText="Belum ada foto"
                            showIcon={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white max-w-sm truncate">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <label
                              className={`text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 ${
                                uploadingId === item.id ? 'opacity-60 pointer-events-none' : ''
                              }`}
                            >
                              {uploadingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Upload className="w-3 h-3" />
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
                            {item.imageUrl && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const oldUrl = item.imageUrl;
                                  const ok = await saveAchievement({ ...item, imageUrl: '' });
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
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.studentName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {item.rank}
                      </span>{' '}
                      <span className="text-slate-400 font-mono">({item.year})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.category === 'Akademik'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ubah Prestasi"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Prestasi"
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

      {/* Modal Form Tambah/Ubah */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentAch.id?.startsWith('ach-') && !achievements.find((a) => a.id === currentAch.id)
                  ? 'Tambah Prestasi Siswa'
                  : 'Ubah Data Prestasi'}
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
                  Nama Perlombaan / Kejuaraan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Olimpiade Sains Nasional Pelajar"
                  value={currentAch.title}
                  onChange={(e) =>
                    setCurrentAch((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Siswa / Tim Peraih <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi (Kelas IX-A)"
                  value={currentAch.studentName}
                  onChange={(e) =>
                    setCurrentAch((prev) => ({ ...prev, studentName: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={currentAch.category}
                    onChange={(e) =>
                      setCurrentAch((prev) => ({
                        ...prev,
                        category: e.target.value as any
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat
                  </label>
                  <select
                    value={currentAch.level}
                    onChange={(e) =>
                      setCurrentAch((prev) => ({
                        ...prev,
                        level: e.target.value as any
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    value={currentAch.year}
                    onChange={(e) =>
                      setCurrentAch((prev) => ({ ...prev, year: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peringkat / Capaian Juara
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Juara 1 (Medali Emas)"
                  value={currentAch.rank}
                  onChange={(e) =>
                    setCurrentAch((prev) => ({ ...prev, rank: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Upload Foto Piagam */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto / Piagam Dokumentasi
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <SchoolImage
                      src={currentAch.imageUrl}
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
                      {currentAch.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentAch((prev) => ({ ...prev, imageUrl: '' }))
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
                      value={currentAch.imageUrl}
                      onChange={(e) =>
                        setCurrentAch((prev) => ({
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
                  Deskripsi Kejuaraan
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat penyelenggara atau rincian kejuaraan..."
                  value={currentAch.description}
                  onChange={(e) =>
                    setCurrentAch((prev) => ({ ...prev, description: e.target.value }))
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
                  {isSaving ? 'Menyimpan...' : 'Simpan Prestasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Prestasi"
        message="Apakah Anda yakin ingin menghapus data prestasi siswa ini?"
        itemName={deleteTarget?.title}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAchievement(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
