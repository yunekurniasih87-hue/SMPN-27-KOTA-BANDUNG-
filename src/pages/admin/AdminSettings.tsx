import React, { useState, useEffect } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolSettings } from '../../types';
import {
  IMAGE_ACCEPT_ATTR,
  sanitizeImageUrlInput,
  storageService
} from '../../services/storageService';
import { SchoolLogoSlot } from '../../components/common/SchoolLogoSlot';
import { SchoolImage } from '../../components/common/SchoolImage';
import {
  Save,
  Upload,
  Image,
  Plus,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Info,
  Loader2
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, uploadImage, isDataLoaded } = useSchoolData();

  const [formData, setFormData] = useState<SchoolSettings>(() =>
    JSON.parse(JSON.stringify(settings))
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(settings)));
  }, [settings, isDataLoaded]);

  // Logo upload to permanent server storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const oldLogo = formData.logoUrl;
      const uploadedUrl = await uploadImage(file, 'logo');
      if (uploadedUrl) {
        const updatedSettings: SchoolSettings = { ...formData, logoUrl: uploadedUrl };
        setFormData(updatedSettings);
        const ok = await updateSettings(
          updatedSettings,
          'Logo sekolah berhasil diunggah & disimpan ke server!'
        );
        if (ok && oldLogo && oldLogo !== uploadedUrl) {
          storageService.deleteUploadedImage(oldLogo);
        }
      }
    } finally {
      setUploadingLogo(false);
      input.value = '';
    }
  };

  const handleClearLogo = async () => {
    const oldLogo = formData.logoUrl;
    const updatedSettings: SchoolSettings = { ...formData, logoUrl: '' };
    setFormData(updatedSettings);
    const ok = await updateSettings(updatedSettings, 'Logo sekolah berhasil dihapus.');
    if (ok && oldLogo) {
      storageService.deleteUploadedImage(oldLogo);
    }
  };

  // Slide upload to permanent server storage
  const handleSlideImageUpload = async (index: number, file: File) => {
    setUploadingSlideIdx(index);
    try {
      const oldUrl = formData.heroSlides[index]?.imageUrl;
      const uploadedUrl = await uploadImage(file, 'slides');
      if (uploadedUrl) {
        const updatedSlides = formData.heroSlides.map((s, idx) =>
          idx === index ? { ...s, imageUrl: uploadedUrl } : s
        );
        const updatedSettings: SchoolSettings = { ...formData, heroSlides: updatedSlides };
        setFormData(updatedSettings);
        const ok = await updateSettings(
          updatedSettings,
          'Foto slide berhasil diunggah & disimpan ke server!'
        );
        if (ok && oldUrl && oldUrl !== uploadedUrl) {
          storageService.deleteUploadedImage(oldUrl);
        }
      }
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const handleAddSlide = () => {
    setFormData((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        {
          id: 'slide-' + Date.now(),
          title: 'Judul Slide Kegiatan Baru',
          subtitle: 'Keterangan ringkas kegiatan beranda...',
          imageUrl: ''
        }
      ]
    }));
  };

  const handleDeleteSlide = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanData: SchoolSettings = {
        ...formData,
        logoUrl: sanitizeImageUrlInput(formData.logoUrl),
        heroSlides: formData.heroSlides.map((s) => ({
          ...s,
          imageUrl: sanitizeImageUrlInput(s.imageUrl)
        }))
      };
      await updateSettings(cleanData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Pengaturan Umum Sekolah
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola identitas, logo sekolah, kontak pelayanan, dan banner slide beranda.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Seluruh Pengaturan</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ======================================================== */}
        {/* LOGO RESMI SEKOLAH                                       */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Logo Resmi Sekolah
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 mb-6 flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
              <strong className="block font-bold mb-0.5">
                Petunjuk Pengaturan Logo:
              </strong>
              Unggah file logo resmi sekolah (PNG/JPG/WEBP/SVG transparan) langsung di sini tanpa coding. Logo akan tampil dengan proporsi asli di seluruh halaman website.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Pratinjau Logo */}
            <div className="flex flex-col items-center justify-center">
              <SchoolLogoSlot logoUrl={formData.logoUrl} size={80} />
              <span className="text-[10px] text-slate-400 mt-1.5 font-medium">
                Pratinjau Logo
              </span>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-blue-600/30 ${
                    uploadingLogo ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingLogo ? 'Mengunggah...' : 'Ganti Foto Logo'}</span>
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT_ATTR}
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    disabled={uploadingLogo}
                    className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                  >
                    Hapus Foto Logo
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Format: PNG, JPG, WEBP, atau SVG • Ukuran maksimal 2 MB. Disimpan permanen di server.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Atau Tempel URL Gambar Logo:
                </label>
                <input
                  type="text"
                  placeholder="https://... atau /uploads/..."
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoUrl: sanitizeImageUrlInput(e.target.value)
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* IDENTITAS SEKOLAH                                        */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Identitas & Slogan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Resmi Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, schoolName: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Wilayah & Kota
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Slogan / Moto Sekolah
            </label>
            <input
              type="text"
              required
              value={formData.slogan}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slogan: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KONTAK & ALAMAT                                          */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Kontak, Alamat & Jam Pelayanan
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telepon Kantor
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Pelayanan
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Resmi Sekolah
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Layanan Operasional
              </label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, operatingHours: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="text"
                value={formData.googleMapsEmbedUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, googleMapsEmbedUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tautan Instagram
              </label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, instagramUrl: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tautan YouTube
              </label>
              <input
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tautan WhatsApp
              </label>
              <input
                type="text"
                placeholder="https://wa.me/6281234567890"
                value={formData.whatsappUrl || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, whatsappUrl: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BANNER SLIDER BERANDA                                    */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Banner Slider Foto Beranda
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.heroSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row items-start gap-4"
              >
                <div className="w-full md:w-48 aspect-[16/9] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                  <SchoolImage
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                    placeholderText="Foto belum diunggah"
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Slide {idx + 1}
                    </span>
                    {formData.heroSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                        title="Hapus Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Judul Slide"
                    value={slide.title}
                    onChange={(e) => {
                      const updated = [...formData.heroSlides];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, heroSlides: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />

                  <input
                    type="text"
                    placeholder="Subjudul / Deskripsi"
                    value={slide.subtitle}
                    onChange={(e) => {
                      const updated = [...formData.heroSlides];
                      updated[idx].subtitle = e.target.value;
                      setFormData({ ...formData, heroSlides: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="URL Gambar Slide"
                      value={slide.imageUrl}
                      onChange={(e) => {
                        const updated = formData.heroSlides.map((s, sIdx) =>
                          sIdx === idx
                            ? { ...s, imageUrl: sanitizeImageUrlInput(e.target.value) }
                            : s
                        );
                        setFormData({ ...formData, heroSlides: updated });
                      }}
                      className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <label
                      className={`px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm transition-colors ${
                        uploadingSlideIdx === idx ? 'opacity-60 pointer-events-none' : ''
                      }`}
                    >
                      {uploadingSlideIdx === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingSlideIdx === idx ? 'Mengunggah...' : 'Ganti Foto'}</span>
                      <input
                        type="file"
                        accept={IMAGE_ACCEPT_ATTR}
                        disabled={uploadingSlideIdx === idx}
                        onChange={(e) => {
                          const input = e.target;
                          const file = input.files?.[0];
                          if (file) {
                            handleSlideImageUpload(idx, file);
                          }
                          input.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                    {slide.imageUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          const oldUrl = slide.imageUrl;
                          const updatedSlides = formData.heroSlides.map((s, sIdx) =>
                            sIdx === idx ? { ...s, imageUrl: '' } : s
                          );
                          const updatedSettings: SchoolSettings = {
                            ...formData,
                            heroSlides: updatedSlides
                          };
                          setFormData(updatedSettings);
                          const ok = await updateSettings(
                            updatedSettings,
                            'Foto slide berhasil dihapus.'
                          );
                          if (ok && oldUrl) {
                            storageService.deleteUploadedImage(oldUrl);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                        title="Setel ke Foto belum diunggah"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
