import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Lightbox } from '../../components/common/Lightbox';
import { SchoolImage } from '../../components/common/SchoolImage';
import {
  Search,
  Calendar,
  Eye,
  User,
  ArrowRight,
  Sparkles,
  Maximize2,
  Tag,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { NewsCategory, GalleryItem, Article } from '../../types';

export const NewsAndGallery: React.FC = () => {
  const {
    articles,
    gallery,
    activeArticleId,
    openArticleDetail,
    closeArticleDetail,
    showToast
  } = useSchoolData();

  // Active top tab: 'berita' | 'galeri'
  const [activeTab, setActiveTab] = useState<'berita' | 'galeri'>('berita');

  // Search & Category for News
  const [newsSearch, setNewsSearch] = useState('');
  const [selectedNewsCat, setSelectedNewsCat] = useState<string>('all');

  const newsCategories = [
    'all',
    'Kegiatan',
    'Prestasi',
    'Pengumuman',
    'Akademik',
    'Ekstrakurikuler'
  ];

  // Gallery filter & lightbox
  const [galleryCat, setGalleryCat] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryCategories = [
    'all',
    'Upacara',
    'Akademik',
    'Kesiswaan',
    'Lingkungan',
    'Prestasi'
  ];

  const publishedArticles = articles.filter((a) => a.status === 'published');

  const filteredArticles = publishedArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(newsSearch.toLowerCase()) ||
      art.content.toLowerCase().includes(newsSearch.toLowerCase());
    const matchesCat = selectedNewsCat === 'all' || art.category === selectedNewsCat;
    return matchesSearch && matchesCat;
  });

  const filteredGallery = gallery.filter(
    (g) => galleryCat === 'all' || g.category === galleryCat
  );

  // If viewing an article detail
  const currentArticle = publishedArticles.find((a) => a.id === activeArticleId);

  const handleShareArticle = (art: Article) => {
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: art.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tautan berita berhasil disalin ke papan klip!', 'info');
    }
  };

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* If viewing a single article detail */}
        {currentArticle ? (
          <article className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl animate-fade-in">
            <button
              onClick={closeArticleDetail}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Berita & Galeri</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold uppercase tracking-wider">
                {currentArticle.category}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {currentArticle.publishedAt}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <User className="w-3.5 h-3.5" />
                {currentArticle.author}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                {currentArticle.views || 1} x dibaca
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              {currentArticle.title}
            </h1>

            <div className="rounded-3xl overflow-hidden mb-8 aspect-[16/9] shadow-lg bg-slate-100 dark:bg-slate-800">
              <SchoolImage
                src={currentArticle.imageUrl}
                alt={currentArticle.title}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                placeholderText="Foto berita belum diunggah"
              />
            </div>

            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line border-b border-slate-200 dark:border-slate-800 pb-8">
              {currentArticle.content}
            </div>

            <div className="pt-6 flex items-center justify-between">
              <button
                onClick={() => handleShareArticle(currentArticle)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan Warta Ini</span>
              </button>

              <button
                onClick={closeArticleDetail}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
              >
                Tutup & Kembali
              </button>
            </div>
          </article>
        ) : (
          <>
            {/* Header Breadcrumb & Title */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 inline-block mb-3">
                Pusat Informasi & Dokumentasi
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Berita dan Galeri Sekolah
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Liputan kegiatan belajar mengajar, pengumuman resmi agenda akademik, serta album dokumentasi peristiwa berkesan.
              </p>

              {/* Top Switcher: Berita / Galeri */}
              <div className="inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
                <button
                  onClick={() => setActiveTab('berita')}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'berita'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Warta & Berita ({publishedArticles.length})
                </button>
                <button
                  onClick={() => setActiveTab('galeri')}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'galeri'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Galeri Foto ({gallery.length})
                </button>
              </div>
            </div>

            {/* TAB 1: BERITA & PENGUMUMAN */}
            {activeTab === 'berita' && (
              <section>
                {/* Search & Category Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <div className="flex flex-wrap items-center gap-2">
                    {newsCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedNewsCat(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedNewsCat === cat
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                        }`}
                      >
                        {cat === 'all' ? 'Semua Kategori' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari judul berita..."
                      value={newsSearch}
                      onChange={(e) => setNewsSearch(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Tidak ada berita yang sesuai dengan kata kunci atau kategori yang dipilih.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.map((art) => (
                      <article
                        key={art.id}
                        onClick={() => openArticleDetail(art.id)}
                        className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer group"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <SchoolImage
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            containerClassName="w-full h-full"
                            placeholderText="Foto warta belum diunggah"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
                              {art.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1 justify-between">
                          <div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                {art.publishedAt}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                {art.views || 0}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                              {art.title}
                            </h3>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                              {art.excerpt}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                            <span>Baca Selengkapnya</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* TAB 2: GALERI FOTO DENGAN LIGHTBOX */}
            {activeTab === 'galeri' && (
              <section>
                {/* Category filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                  {galleryCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGalleryCat(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        galleryCat === cat
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                      }`}
                    >
                      {cat === 'all' ? 'Semua Album' : cat}
                    </button>
                  ))}
                </div>

                {filteredGallery.length === 0 ? (
                  <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Belum ada foto dalam kategori ini.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGallery.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => setLightboxIndex(index)}
                        className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer group"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <SchoolImage
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            containerClassName="w-full h-full"
                            placeholderText="Foto galeri belum diunggah"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
                              {item.category}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                              <Maximize2 className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mb-1">
                            {item.date}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {item.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* Lightbox for Gallery */}
      {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
        <Lightbox
          isOpen={lightboxIndex !== null}
          imageUrl={filteredGallery[lightboxIndex].imageUrl}
          title={filteredGallery[lightboxIndex].title}
          caption={filteredGallery[lightboxIndex].caption}
          date={filteredGallery[lightboxIndex].date}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : filteredGallery.length - 1
            )
          }
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev < filteredGallery.length - 1 ? prev + 1 : 0
            )
          }
          hasPrev={filteredGallery.length > 1}
          hasNext={filteredGallery.length > 1}
        />
      )}
    </div>
  );
};
