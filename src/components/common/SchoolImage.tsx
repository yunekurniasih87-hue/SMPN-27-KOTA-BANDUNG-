import React, { useState, useEffect } from 'react';
import { ImageOff, Image as ImageIcon } from 'lucide-react';

interface SchoolImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderText?: string;
  showIcon?: boolean;
}

export const SchoolImage: React.FC<SchoolImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  placeholderText = 'Foto belum diunggah',
  showIcon = true,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const hasValidImage = Boolean(src && src.trim() !== '' && !hasError);
  const displayPlaceholder = hasError ? 'Foto gagal dimuat' : placeholderText;

  if (!hasValidImage) {
    return (
      <div
        className={`w-full h-full ${showIcon ? 'min-h-[120px]' : ''} flex flex-col items-center justify-center p-3 text-center bg-slate-200/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 select-none transition-colors ${containerClassName}`}
        title={displayPlaceholder}
      >
        {showIcon && (
          <div className="w-9 h-9 rounded-xl bg-slate-300/70 dark:bg-slate-700/70 flex items-center justify-center mb-1.5 text-slate-600 dark:text-slate-300">
            <ImageOff className="w-4 h-4 opacity-75" />
          </div>
        )}
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight">
          {displayPlaceholder}
        </span>
        {showIcon && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Dapat diunggah lewat Panel Admin
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src || undefined}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
};
