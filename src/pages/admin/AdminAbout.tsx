import React, { useState, useEffect } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { AboutData } from '../../types';
import {
  IMAGE_ACCEPT_ATTR,
  sanitizeImageUrlInput,
  storageService
} from '../../services/storageService';
import { SchoolImage } from '../../components/common/SchoolImage';
import {
  Save,
  BookOpen,
  Calendar,
  Compass,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const AdminAbout: React.FC = () => {
  const { about, updateAbout, uploadImage, isDataLoaded } = useSchoolData();

  const [formData, setFormData] = useState<AboutData>(() =>
    JSON.parse(JSON.stringify(about))
  );

  const [activeSubTab, setActiveSubTab] = useState<'visi' | 'sambutan' | 'sejarah' | 'akreditasi'>('visi');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(about)));
  }, [about, isDataLoaded]);

  // Headmaster photo upload to permanent server storage
  const handleHeadmasterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const oldPhoto = formData.headmasterWelcome.photoUrl;
      const uploadedUrl = await uploadImage(file, 'headmaster');
      if (uploadedUrl) {
        const updatedAbout: AboutData = {
          ...formData,
          headmasterWelcome: {
            ...formData.headmasterWelcome,
            photoUrl: uploadedUrl
          }
        };
        setFormData(updatedAbout);
        const ok = await updateAbout(
          updatedAbout,
          'Foto Kepala Sekolah berhasil diunggah & disimpan ke server!'
        );
        if (ok && oldPhoto && oldPhoto !== uploadedUrl) {
          storageService.deleteUploadedImage(oldPhoto);
        }
      }
    } finally {
      setUploadingPhoto(false);
      input.value = '';
    }
  };

  // Mission handlers
  const handleAddMission = () => {
    setFormData((prev) => ({
      ...prev,
      missions: [...prev.missions, 'Butir misi baru...']
    }));
  };

  const handleUpdateMission = (index: number, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.missions];
      updated[index] = val;
      return { ...prev, missions: updated };
    });
  };

  const handleDeleteMission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      missions: prev.missions.filter((_, i) => i !== index)
    }));
  };

  // Timeline handlers
  const handleAddTimeline = () => {
    setFormData((prev) => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        {
          year: `${new Date().getFullYear()}`,
          title: 'Peristiwa Penting',
          description: 'Keterangan peristiwa sejarah sekolah...'
        }
      ]
    }));
  };

  const handleUpdateTimeline = (
    index: number,
    field: 'year' | 'title' | 'description',
    val: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.timeline];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, timeline: updated };
    });
  };

  const handleDeleteTimeline = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanAbout: AboutData = {
        ...formData,
        headmasterWelcome: {
          ...formData.headmasterWelcome,
          photoUrl: sanitizeImageUrlInput(formData.headmasterWelcome.photoUrl)
        }
      };
      await updateAbout(cleanAbout);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Halaman Tentang Sekolah
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sunting visi misi, sambutan kepala sekolah, timeline sejarah, dan akreditasi resmi.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Profil</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {[
          { id: 'visi', label: 'Visi & Misi' },
          { id: 'sambutan', label: 'Sambutan Kepala Sekolah' },
          { id: 'sejarah', label: 'Sejarah & Timeline' },
          { id: 'akreditasi', label: 'Akreditasi Sekolah' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. VISI & MISI */}
          {activeSubTab === 'visi' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Visi Sekolah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.vision}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, vision: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Butir-butir Misi Sekolah
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMission}
                    className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Misi</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.missions.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => handleUpdateMission(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMission(idx)}
                        className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus Misi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. SAMBUTAN KEPALA SEKOLAH */}
          {activeSubTab === 'sambutan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kepala Sekolah & Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterWelcome.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        headmasterWelcome: {
                          ...prev.headmasterWelcome,
                          name: e.target.value
                        }
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterWelcome.nip}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        headmasterWelcome: {
                          ...prev.headmasterWelcome,
                          nip: e.target.value
                        }
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Foto Kepala Sekolah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Resmi Kepala Sekolah
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <SchoolImage
                      src={formData.headmasterWelcome.photoUrl}
                      alt="Kepala Sekolah"
                      className="w-full h-full object-cover object-top"
                      containerClassName="w-full h-full"
                      placeholderText="Foto belum diunggah"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm ${
                          uploadingPhoto ? 'opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingPhoto ? 'Mengunggah...' : 'Ganti Foto'}</span>
                        <input
                          type="file"
                          accept={IMAGE_ACCEPT_ATTR}
                          onChange={handleHeadmasterPhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      {formData.headmasterWelcome.photoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const oldPhoto = formData.headmasterWelcome.photoUrl;
                            const updatedAbout: AboutData = {
                              ...formData,
                              headmasterWelcome: {
                                ...formData.headmasterWelcome,
                                photoUrl: ''
                              }
                            };
                            setFormData(updatedAbout);
                            const ok = await updateAbout(
                              updatedAbout,
                              'Foto Kepala Sekolah berhasil dihapus.'
                            );
                            if (ok && oldPhoto) {
                              storageService.deleteUploadedImage(oldPhoto);
                            }
                          }}
                          className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                          title="Hapus foto kepala sekolah"
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
                      value={formData.headmasterWelcome.photoUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          headmasterWelcome: {
                            ...prev.headmasterWelcome,
                            photoUrl: sanitizeImageUrlInput(e.target.value)
                          }
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Teks Sambutan
                </label>
                <textarea
                  rows={8}
                  value={formData.headmasterWelcome.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      headmasterWelcome: {
                        ...prev.headmasterWelcome,
                        message: e.target.value
                      }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed resize-y"
                />
              </div>
            </div>
          )}

          {/* 3. SEJARAH & TIMELINE */}
          {activeSubTab === 'sejarah' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pengantar Narasi Sejarah
                </label>
                <textarea
                  rows={3}
                  value={formData.history}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, history: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Milestone / Peristiwa Penting (Timeline)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTimeline}
                    className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Peristiwa</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Tahun (Contoh: 1985)"
                          value={item.year}
                          onChange={(e) => handleUpdateTimeline(idx, 'year', e.target.value)}
                          className="w-36 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteTimeline(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Hapus Milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Judul Peristiwa (Contoh: Awal Pendirian Gedung)"
                        value={item.title}
                        onChange={(e) => handleUpdateTimeline(idx, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      />

                      <textarea
                        rows={2}
                        placeholder="Deskripsi singkat peristiwa..."
                        value={item.description}
                        onChange={(e) => handleUpdateTimeline(idx, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. AKREDITASI */}
          {activeSubTab === 'akreditasi' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Predikat Akreditasi
                </label>
                <input
                  type="text"
                  value={formData.accreditation.grade}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accreditation: { ...prev.accreditation, grade: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai Skor (0 - 100)
                </label>
                <input
                  type="number"
                  value={formData.accreditation.score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accreditation: {
                        ...prev.accreditation,
                        score: parseInt(e.target.value) || 0
                      }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor SK Akreditasi
                </label>
                <input
                  type="text"
                  value={formData.accreditation.skNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accreditation: { ...prev.accreditation, skNumber: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Masa Berlaku Sampai
                </label>
                <input
                  type="text"
                  value={formData.accreditation.validUntil}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accreditation: { ...prev.accreditation, validUntil: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || uploadingPhoto}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
