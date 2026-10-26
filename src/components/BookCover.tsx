import React from 'react';
import { Book } from '../types';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ book, size = 'md', className = '' }) => {
  // Initiales de l'auteur et du titre
  const titleInitials = book.titre
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const sizeClasses = {
    sm: 'w-[120px] h-[120px] p-2.5',
    md: 'w-32 h-44 p-3',
    lg: 'w-48 h-64 p-4',
  }[size];

  return (
    <div
      className={`relative rounded-xl shadow-md overflow-hidden flex flex-col justify-between select-none border border-black/10 transition-transform ${sizeClasses} ${className}`}
      style={{
        backgroundColor: book.couleurBg,
        color: book.couleurAccent,
      }}
      aria-label={`Couverture générée en CSS pour ${book.titre} par ${book.auteur}`}
    >
      {/* Motif décoratif géométrique CSS */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${book.couleurAccent} 10%, transparent 20%), radial-gradient(circle at 0% 100%, ${book.couleurAccent} 15%, transparent 25%)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* En-tête de couverture : Tag genre */}
      <div className="relative z-10 flex justify-start items-center">
        <span
          className="uppercase tracking-wider font-bold rounded backdrop-blur-sm truncate max-w-[90px]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.32)',
            color: '#FFFFFF',
            fontSize: size === 'sm' ? '7.5px' : '9px',
            padding: size === 'sm' ? '1.5px 4px' : '2px 6px',
            lineHeight: 1.1,
          }}
        >
          {book.genre}
        </span>
      </div>

      {/* Monogramme central */}
      <div className="relative z-10 my-0.5 text-center flex justify-center items-center">
        <div
          className="inline-flex items-center justify-center rounded-full border-2 border-current/30 font-black tracking-widest shadow-inner"
          style={{
            width: size === 'sm' ? '24px' : size === 'md' ? '46px' : '64px',
            height: size === 'sm' ? '24px' : size === 'md' ? '46px' : '64px',
            fontSize: size === 'sm' ? '9.5px' : size === 'md' ? '18px' : '24px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {titleInitials || 'OT'}
        </div>
      </div>

      {/* Bas de couverture : Titre et Auteur */}
      <div className="relative z-10">
        <p
          className="font-bold leading-tight line-clamp-2 drop-shadow-sm text-white"
          style={{
            fontSize: size === 'sm' ? '9.5px' : size === 'md' ? '13px' : '15px',
            lineHeight: size === 'sm' ? 1.15 : 1.25,
          }}
        >
          {book.titre}
        </p>
        <p
          className="opacity-90 font-medium text-white/95 line-clamp-2 mt-0.5"
          style={{
            fontSize: size === 'sm' ? '7.5px' : size === 'md' ? '11px' : '12px',
            lineHeight: size === 'sm' ? 1.15 : 1.2,
          }}
        >
          {book.auteur}
        </p>
      </div>

      {/* Tranche de livre 3D discrète à gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
    </div>
  );
};
