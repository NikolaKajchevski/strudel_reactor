import React from 'react';
import { Play, StopCircle, Zap } from 'lucide-react';
import PanelWrapper from "../../layout/PanelWrapper";

// This component receives the handler functions as props from App.jsx
const PlaybackControls = ({ onPlay, onStop, onPreprocess }) => {
    
    return (

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    
                    {/* --- Preprocess Button --- */}
                    <button 
                        onClick={onPreprocess} 
                        className="bg-white text-purple-600 hover:bg-gray-300 p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        title="Preprocesses the code in the text area and updates the editor."
                        aria-label="Preprocess"
                    >
                        <Zap className="w-6 h-6" />
                    </button>
                    
                    {/* --- Play Button --- */}
                    <button 
                        onClick={onPlay} 
                        className="bg-white text-green-600 hover:bg-gray-300 p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        title="Starts playback of the code currently in the editor."
                        aria-label="Play"
                    >
                        <Play className="w-6 h-6" />
                    </button>
                    
                    {/* --- Stop Button --- */}
                    <button 
                        onClick={onStop} 
                        className="bg-white text-red-600 hover:bg-gray-300 p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        title="Stops all currently running Strudel audio."
                        aria-label="Stop"
                    >
                        <StopCircle className="w-6 h-6" />
                    </button>
                </div>
            </div>

    );
};

export default PlaybackControls;