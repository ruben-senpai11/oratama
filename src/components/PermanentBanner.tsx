import React from 'react';

export const PermanentBanner: React.FC = () => {
  return (
    <aside
      aria-label="Avertissement légal et contexte du projet"
      className="w-full bg-[#933B40] text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium leading-tight shadow-sm border-b border-[#752A2E]"
    >
      <div className="max-w-md mx-auto">
        OraTama · concept non officiel inspiré de Tama · créé par Alban Honfovou · livres, auteurs et textes fictifs
      </div>
    </aside>
  );
};
