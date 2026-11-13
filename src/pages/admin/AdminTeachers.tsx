import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Teacher, StaffCategory } from '../../types';
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
  User,
  X,
  Loader2
} from 'lucide-react';

export const AdminTeachers: React.FC = () => {
  const { teachers, saveTeacher, deleteTeacher, uploadImage } = useSchoolData();

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingModalPhoto, setUploadingModalPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher>>({
    id: '',
    name: '',
    nip: '',
    role: '',
    subject: '',
    education: '',
    imageUrl: '',
    category: 'guru',
    order: 0
  });

  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const handleOpenAdd = () => {
    setCurrentTeacher({
      id: 't-' + Date.now(),
      name: '',
      nip: '',
      role: 'Guru Mata Pelajaran',
      subject: '',
      education: 'S1 Pendidikan',
      imageUrl: '',
      category: 'guru',
      order: teachers.length + 1
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setCurrentTeacher({ ...t });
    setIsEditing(true);
  };

  const handleQuickChangePhoto = async (teacher: Teacher, file: File) => {
    setUploadingId(teacher.id);
    try {
      const oldUrl = teacher.imageUrl;
      const uploadedUrl = await uploadImage(file, 'teachers');
      if (uploadedUrl) {
        const ok = await saveTeacher({ ...teacher, imageUrl: uploadedUrl });
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
      const uploadedUrl = await uploadImage(file, 'teachers');
      if (uploadedUrl) {
        setCurrentTeacher((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } finally {
      setUploadingModalPhoto(false);
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher.name || !currentTeacher.role) return;

    const teacherToSave: Teacher = {
      id: currentTeacher.id || 't-' + Date.now(),
      name: currentTeacher.name,
      nip: currentTeacher.nip || '-',
      role: currentTeacher.role,
      subject: currentTeacher.subject || '-',
      education: currentTeacher.education || '-',
      imageUrl: sanitizeImageUrlInput(currentTeacher.imageUrl || ''),
      category: (currentTeacher.category as StaffCategory) || 'guru',
      order: currentTeacher.order || teachers.length + 1
    };

    setIsSaving(true);
    try {
      const ok = await saveTeacher(teacherToSave);
      if (ok) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = teachers.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === 'all' || t.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Guru & Tenaga Kependidikan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen data pendidik, pimpinan sekolah, serta staf tata usaha dan kependidikan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pendidik / Tendik</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIP, mapel..."
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
            <option value="all">Semua Kategori</option>
            <option value="pimpinan">Pimpinan Sekolah</option>
            <option value="guru">Guru Mapel</option>
            <option value="tendik">Tenaga Kependidikan</option>
          </select>
        </div>
      </div>

      {/* Grid Cards of Teachers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <SchoolImage
                  src={teacher.imageUrl}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full text-[10px]"
                  placeholderText="Foto belum diunggah"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                  {teacher.category}
                </span>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {teacher.name}
                </h4>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  {teacher.role}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  NIP. {teacher.nip}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <div>Mapel: {teacher.subject}</div>
                  <div>Pendidikan: {teacher.education}</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
              <label
                className={`px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm ${
                  uploadingId === teacher.id ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {uploadingId === teacher.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingId === teacher.id ? 'Mengunggah...' : 'Ganti Foto'}</span>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT_ATTR}
                  disabled={uploadingId === teacher.id}
                  onChange={(e) => {
                    const input = e.target;
                    const file = input.files?.[0];
                    if (file) handleQuickChangePhoto(teacher, file);
                    input.value = '';
                  }}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(teacher)}
                  className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold"
                  title="Ubah Data Lengkap"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(teacher)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                  title="Hapus Guru"
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
                {currentTeacher.id?.startsWith('t-') && !teachers.find((t) => t.id === currentTeacher.id)
                  ? 'Tambah Pendidik / Tendik'
                  : 'Ubah Data Pendidik'}
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
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Hj. Siti Fatimah, M.Pd."
                  value={currentTeacher.name}
                  onChange={(e) =>
                    setCurrentTeacher((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIP / Identitas Pegawai
                  </label>
                  <input
                    type="text"
                    placeholder="19780820 200312 1 004"
                    value={currentTeacher.nip}
                    onChange={(e) =>
                      setCurrentTeacher((prev) => ({ ...prev, nip: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Personil
                  </label>
                  <select
                    value={currentTeacher.category}
                    onChange={(e) =>
                      setCurrentTeacher((prev) => ({
                        ...prev,
                        category: e.target.value as StaffCategory
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="guru">Guru Mata Pelajaran</option>
                    <option value="pimpinan">Pimpinan Sekolah</option>
                    <option value="tendik">Tenaga Kependidikan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan / Peran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Guru Matematika / Wakasek"
                    value={currentTeacher.role}
                    onChange={(e) =>
                      setCurrentTeacher((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran Diampu
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: IPA / Matematika"
                    value={currentTeacher.subject}
                    onChange={(e) =>
                      setCurrentTeacher((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pendidikan Terakhir & Universitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: S1 Pendidikan Biologi UPI"
                  value={currentTeacher.education}
                  onChange={(e) =>
                    setCurrentTeacher((prev) => ({ ...prev, education: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Foto Guru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Profil
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <SchoolImage
                      src={currentTeacher.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full text-[9px] p-1"
                      placeholderText="Belum ada foto"
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
                      {currentTeacher.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentTeacher((prev) => ({ ...prev, imageUrl: '' }))
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
                      value={currentTeacher.imageUrl}
                      onChange={(e) =>
                        setCurrentTeacher((prev) => ({
                          ...prev,
                          imageUrl: sanitizeImageUrlInput(e.target.value)
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
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
                  {isSaving ? 'Menyimpan...' : 'Simpan Data Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Data Guru / Tendik"
        message="Apakah Anda yakin ingin menghapus data pendidik ini?"
        itemName={deleteTarget?.name}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTeacher(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
