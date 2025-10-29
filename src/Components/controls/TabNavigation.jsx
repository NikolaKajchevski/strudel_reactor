import React from 'react';

const TabNavigation = () => (
  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
    <div className="grid grid-cols-2 gap-2">
      {['effects', 'settings'].map(tab => (
        <button
          key={tab}
          className="px-4 py-2 border rounded-lg font-medium text-sm transition-all">
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  </div>
);

export default TabNavigation;