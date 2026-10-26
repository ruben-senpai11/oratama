import React from 'react';

export const PermanentBanner: React.FC = () => {
  return (
    <aside
      aria-label="Avertissement légal et contexte du projet"
      className="w-full bg-[#1E2958] text-[#FBF8F3] text-[11px] sm:text-xs py-2 px-3 text-center font-medium leading-tight shadow-sm border-b border-[#141C3E]"
    >
      <div className="max-w-md mx-auto">
        OraTama · concept non officiel inspiré de Tama · créé par Alban Honfovou · Bibliothèque orale africaine
      </div>
    </aside>
  );
};
