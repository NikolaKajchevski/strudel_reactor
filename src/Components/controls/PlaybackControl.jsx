import React from 'react';
import { Play, Pause, Square } from 'lucide-react';

const PlaybackControls = ({ isPlaying, onTogglePlay, onStop, onPreprocess }) => (
  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onTogglePlay}
        className="bg-white text-purple-600 hover:bg-gray-100 p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>
      <button 
        onClick={onStop} 
        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all transform hover:scale-105"
        aria-label="Stop"
      >
        <Square className="w-6 h-6" />
      </button>
    </div>
  </div>
);

export default PlaybackControls;
