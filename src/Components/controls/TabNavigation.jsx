import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
    <div className="grid grid-cols-2 gap-2">
      {['effects', 'settings'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 border rounded-lg font-medium text-sm transition-all ${
            activeTab === tab
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  </div>
);

export default TabNavigation;