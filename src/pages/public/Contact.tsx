import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Instagram,
  Youtube,
  MessageCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const Contact: React.FC = () => {
  const { settings, sendContactMessage } = useSchoolData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    const ok = await sendContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });
    setIsSubmitting(false);

    if (ok) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 inline-block mb-3">
            Layanan Informasi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Hubungi SMP Negeri 27 Bandung
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Sampaikan pertanyaan, masukan, atau permohonan informasi resmi seputar program sekolah. Tim tata usaha kami siap melayani Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Kolom Kiri: Informasi Kontak & Peta */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-l-4 border-blue-600 pl-3">
                Informasi Kantor & Pelayanan
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Alamat Sekolah
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed block mt-0.5">
                      {settings.address}, {settings.city} {settings.postalCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Telepon / Fax
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                      {settings.phone}
                    </span>
                    {settings.whatsapp && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium block text-xs mt-0.5">
                        WhatsApp: {settings.whatsapp}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Surat Elektronik (Email)
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                      {settings.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Jam Pelayanan Kantor
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                      {settings.operatingHours}
                    </span>
                    <span className="text-slate-400 block text-[11px] mt-0.5">
                      Sabtu, Minggu & Hari Libur Nasional: Tutup
                    </span>
                  </div>
                </div>
              </div>

              {/* Media Sosial */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                  Kanal Media Sosial Resmi:
                </span>
                <div className="flex items-center gap-3">
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 hover:bg-pink-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {settings.whatsappUrl && (
                    <a
                      href={settings.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Embed Peta Google Map */}
            <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 p-2">
              <iframe
                title="Peta Lokasi SMP Negeri 27 Kota Bandung"
                src={settings.googleMapsEmbedUrl}
                width="100%"
                height="260"
                style={{ border: 0, borderRadius: '1rem' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Kolom Kanan: Formulir Kontak (Pesan Masuk Disimpan ke Database) */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                  Kirim Pesan
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Formulir Kontak Terbuka
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Pesan Anda akan otomatis tersimpan ke sistem database dan langsung dapat ditinjau oleh staf admin sekolah.
                </p>
              </div>

              {submitted && (
                <div className="p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold">Terima kasih, pesan Anda berhasil dikirim!</p>
                    <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">
                      Pihak tata usaha kami akan meninjau pesan ini dan membalas melalui kontak yang Anda cantumkan.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Perihal / Subjek <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Konsultasi Ekstrakurikuler"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Isi Pesan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan pesan, pertanyaan, atau tanggapan Anda secara jelas..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white leading-relaxed resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
