import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface SchoolLogoSlotProps {
  logoUrl?: string | null;
  className?: string;
  size?: number; // default 80
  showLabel?: boolean;
}

export const SchoolLogoSlot: React.FC<SchoolLogoSlotProps> = ({
  logoUrl,
  className = '',
  size = 80,
  showLabel = false
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  const hasValidLogo = Boolean(logoUrl && logoUrl.trim() !== '' && !hasError);

  if (hasValidLogo) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
        title="Logo Resmi SMP Negeri 27 Kota Bandung"
      >
        <img
          src={logoUrl!}
          alt="Logo Resmi SMP Negeri 27 Kota Bandung"
          onError={() => setHasError(true)}
          style={{
            maxHeight: `${size}px`,
            maxWidth: `${Math.round(size * 1.5)}px`
          }}
          className="w-auto h-auto object-contain block mx-auto drop-shadow-md"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-2xl transition-all duration-200 select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title="Logo Resmi SMP Negeri 27 Kota Bandung"
    >
      <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 p-1.5 flex flex-col items-center justify-center text-center shadow-inner">
        <div className="w-6 h-6 rounded-lg bg-slate-300/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-0.5">
          <ImageOff className="w-3.5 h-3.5" />
        </div>
        <span className="text-[8px] font-bold tracking-tight text-slate-700 dark:text-slate-200 leading-tight">
          {hasError ? 'Logo gagal dimuat' : 'Foto belum diunggah'}
        </span>
        {showLabel && (
          <span className="sr-only">Logo SMP Negeri 27 Kota Bandung</span>
        )}
      </div>
    </div>
  );
};
