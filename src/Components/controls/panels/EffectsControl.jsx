import React from 'react';
import { Sliders } from 'lucide-react';

// EffectsControl with radio buttons - only one effect can be active at a time
const EffectsControl = ({ effects, toggleEffect }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Sliders className="w-5 h-5 text-pink-400" />
      Effects
    </h3>


    {Object.entries(effects).map(([key, value]) => 
    
    (
      <div key={key} className=" space-y-6 flex items-center justify-between ">
        <span className="capitalize font-medium">{key}</span>
        <input
          type="radio"
          name="effects"
          checked={value}
          onChange={() => toggleEffect(key)}
          className="w-5 h-5 accent-purple-500"
          aria-label={`Toggle ${key} effect`}
        />
      </div>
    ))}
  </div>
);

export default EffectsControl;