import React from 'react';

const PanelWrapper = ({ 
  title, 
  icon: Icon, 
  children, 
  isPlaying, 
  showWindowControls = false, 
  className = '' 
}) => (
  <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}>
    <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon 
            className={`w-4 h-4 ${
              Icon.displayName === 'Music' 
                ? 'text-purple-400' 
                : Icon.displayName === 'Activity' 
                ? 'text-pink-400' 
                : 'text-green-400'
            }`} 
          />
        )}
        <span className="font-semibold text-sm">{title}</span>
      </div>

    </div>
    {children}
  </div>
);

export default PanelWrapper;