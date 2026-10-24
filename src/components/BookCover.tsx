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
    sm: 'w-20 h-28 text-xs p-2',
    md: 'w-32 h-44 text-sm p-3',
    lg: 'w-48 h-64 text-base p-4',
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

      {/* En-tête de couverture : Tag genre et pastille */}
      <div className="relative z-10 flex justify-between items-start gap-1">
        <span
          className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', color: '#FFFFFF' }}
        >
          {book.genre}
        </span>
        <span
          className="text-[8px] font-semibold px-1 py-0.5 rounded bg-black/40 text-amber-200"
          title="Exemple fictif"
        >
          Fictif
        </span>
      </div>

      {/* Monogramme central */}
      <div className="relative z-10 my-auto text-center">
        <div
          className="inline-flex items-center justify-center rounded-full border-2 border-current/30 font-black tracking-widest"
          style={{
            width: size === 'sm' ? '32px' : size === 'md' ? '46px' : '64px',
            height: size === 'sm' ? '32px' : size === 'md' ? '46px' : '64px',
            fontSize: size === 'sm' ? '12px' : size === 'md' ? '18px' : '24px',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          {titleInitials || 'OT'}
        </div>
      </div>

      {/* Bas de couverture : Titre et Auteur */}
      <div className="relative z-10">
        <p className="font-bold leading-tight line-clamp-2 drop-shadow-sm text-white">
          {book.titre}
        </p>
        <p className="text-[10px] sm:text-xs opacity-90 truncate mt-0.5 font-medium">
          {book.auteur}
        </p>
      </div>

      {/* Tranche de livre 3D discrète à gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
    </div>
  );
};
