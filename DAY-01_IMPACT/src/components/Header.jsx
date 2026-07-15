import React from 'react';

function Header({ stats }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200 sticky top-0 z-40 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
          Signed in as Guest
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs font-bold text-[#1cb0f6] uppercase tracking-tighter">
          Total XP: {stats.xp}
        </div>
      </div>
    </header>
  );
}

export default Header;
