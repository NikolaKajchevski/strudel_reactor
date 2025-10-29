import {Sliders} from 'lucide-react'
import React, { useState, useCallback } from 'react';
import PreprocessorEditor from './Components/audio/PreprocessorEditor';
import ReplOutput from './Components/audio/ReplOutput';
import PlaybackControls from './Components/controls/PlaybackControl';
import TabNavigation from './Components/controls/TabNavigation';
import EffectsControl from './Components/controls/panels/SettingsControl';
import SettingsControl from './Components/controls/panels/EffectsControl';
import PanelWrapper from './layout/PanelWrapper';

const App = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8 lg:p-12 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        Modular Audio Synthesizer Interface
      </h1>

      {/* Main Grid: Left (2/3) and Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Editor, Output, Controls) - span 2 */}
        <div className="lg:col-span-2 space-y-6">
          <PreprocessorEditor />
          <ReplOutput  />
          <PlaybackControls />
        </div>

        {/* Right Column (Control Panel, Visualization) - span 1 */}
        <div className="space-y-6">
          
          {/* Tab Navigation */}
          <TabNavigation/>
          
          {/* Control Panel Content */}

          {/* Visualization */}

        </div>
      </div>
    </div>
  );
};

export default App;