import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SchoolImage } from './SchoolImage';

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  caption?: string;
  date?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  imageUrl,
  title,
  caption,
  date,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
        title="Tutup (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-10"
          title="Foto Sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-10"
          title="Foto Selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-5xl w-full flex flex-col items-center max-h-[90vh]">
        <div className="w-full max-w-3xl flex items-center justify-center">
          <SchoolImage
            src={imageUrl}
            alt={title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl mx-auto"
            containerClassName="w-full h-72 sm:h-96 rounded-2xl"
            placeholderText="Foto belum diunggah"
          />
        </div>
        <div className="mt-4 text-center text-white max-w-2xl px-4">
          <h3 className="text-lg font-bold">{title}</h3>
          {date && <p className="text-xs text-slate-300 mt-1">{date}</p>}
          {caption && <p className="text-sm text-slate-200 mt-1.5">{caption}</p>}
        </div>
      </div>
    </div>
  );
};
