import React from "react";
import { Volume2 } from "lucide-react";

const SettingsControl = ({ sliders, handleSliderChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Volume2 className="w-5 h-5 text-purple-400" />
      Settings
    </h3>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Master Volume</span>
        <span className="text-purple-400 font-semibold">%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliders.volume}
        onChange={(e) => handleSliderChange("volume", e.target.value)}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Base</span>
        <span className="text-purple-400 font-semibold">%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliders.base}
        onChange={(e) => handleSliderChange("base", e.target.value)}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Treble</span>
        <span className="text-purple-400 font-semibold">%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliders.treble}
        onChange={(e) => handleSliderChange("treble", e.target.value)}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
    </div>
  </div>
);

export default SettingsControl;
