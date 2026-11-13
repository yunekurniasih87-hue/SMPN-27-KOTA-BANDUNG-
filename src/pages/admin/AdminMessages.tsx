import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { ContactMessage } from '../../types';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import {
  Mail,
  MailOpen,
  Trash2,
  CheckCircle,
  Phone,
  Calendar,
  User,
  Search,
  MessageSquare,
  X
} from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const { messages, markMessageRead, deleteMessage } = useSchoolData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRead =
      filterRead === 'all'
        ? true
        : filterRead === 'unread'
        ? !m.isRead
        : m.isRead;
    return matchSearch && matchRead;
  });

  const handleOpenDetail = (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (!msg.isRead) {
      markMessageRead(msg.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Pesan Masuk Kontak
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pesan dan permohonan informasi yang dikirimkan oleh pengunjung melalui formulir kontak.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pesan pengirim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(
            [
              { id: 'all', label: `Semua (${messages.length})` },
              {
                id: 'unread',
                label: `Belum Dibaca (${messages.filter((m) => !m.isRead).length})`
              },
              {
                id: 'read',
                label: `Sudah Dibaca (${messages.filter((m) => m.isRead).length})`
              }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterRead(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterRead === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Messages */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            Tidak ada pesan yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors cursor-pointer ${
                  !msg.isRead
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                onClick={() => handleOpenDetail(msg)}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      !msg.isRead
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {!msg.isRead ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <MailOpen className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {msg.name}
                      </span>
                      {!msg.isRead && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                          Baru
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {msg.email}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate mb-1">
                      {msg.subject}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(msg);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Pesan */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full">
                  Pesan Masuk
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {activeMessage.subject}
                </h3>
              </div>
              <button
                onClick={() => setActiveMessage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold">Pengirim:</span> {activeMessage.name}
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold">Email:</span> {activeMessage.email}
              </div>
              {activeMessage.phone && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold">Telepon/WA:</span> {activeMessage.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Waktu Kirim:{' '}
                  {new Date(activeMessage.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Isi Pesan:
              </h4>
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line border border-slate-200/60 dark:border-slate-700">
                {activeMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`mailto:${activeMessage.email}?subject=Balasan: ${encodeURIComponent(
                  activeMessage.subject
                )}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Balas via Email</span>
              </a>

              <button
                onClick={() => setActiveMessage(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Pesan Masuk"
        message="Apakah Anda yakin ingin menghapus pesan ini?"
        itemName={deleteTarget?.subject}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMessage(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
