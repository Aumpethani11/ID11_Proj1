import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', icon: 'fa-home', label: 'LEARN' },
    { id: 'practice', icon: 'fa-dumbbell', label: 'PRACTICE' },
    { id: 'signs', icon: 'fa-hands-asl-interpreting', label: 'SIGNS' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r-2 border-gray-200 h-screen sticky top-0 p-4 pt-8">
        <div className="flex items-center gap-2 mb-10 px-4">
          <div className="w-10 h-10 bg-[#58cc02] rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-hand text-xl"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-[#58cc02] tracking-tighter uppercase">SignLingo</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-black text-sm tracking-widest ${
                activeTab === item.id
                  ? 'bg-[#ddf4ff] text-[#1cb0f6] border-2 border-[#1cb0f6]'
                  : 'text-[#777] hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xl w-6`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 flex justify-around p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === item.id ? 'text-[#1cb0f6]' : 'text-[#777]'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-xl`}></i>
            <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;
