import { Sliders, AudioLines, Music, Settings } from 'lucide-react';
import React, { useState, useCallback, useRef } from 'react';
import PreprocessorEditor from './Components/audio/PreprocessorEditor';
import PlaybackControls from './Components/controls/PlaybackControl';
import TabNavigation from './Components/controls/TabNavigation';
import EffectsControl from './Components/controls/panels/EffectsControl';
import PanelWrapper from './layout/PanelWrapper';
import SettingsControl from './Components/controls/panels/SettingsControl';

const App = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('effects');

  // Preprocess radio: 'ON' or 'HUSH'
  const [radioSelection, setRadioSelection] = useState('ON');

  // Effects toggles
  const [effects, setEffects] = useState({
    reverb: false,
    demonic: false,
    distortion: false,
  });

  const [sliders, setSliders] = useState({
    volume: 50,
  });

  // Ref to access editor methods
  const editorRef = useRef(null);

  // --- HANDLERS ---
  // Handle radio selection changes.
  // If switching to HUSH => clear all effects (Option A).
  const handleRadioChange = useCallback((event) => {
    const newSelection = event.target.value;
    setRadioSelection(newSelection);

    if (newSelection === 'HUSH') {
      // Clear all effect toggles in the UI
      setEffects(prev => {
        const cleared = Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {});
        return cleared;
      });

      // Reprocess so HUSH takes effect immediately (no effects applied).
      try {
        editorRef.current?.preprocess();
      } catch (e) {
        // swallow
      }
    } else {
      // When switching back to ON, reprocess with the (possibly empty) effects state.
      try {
        editorRef.current?.preprocess();
      } catch (e) {
        // swallow
      }
    }

    // preserve previous UX: if editor running, attempt immediate proc+play
    try {
      editorRef.current?.procAndPlay();
    } catch (e) {
      // ignore
    }
  }, []);

  // Toggle a specific effect on/off.
  const toggleEffect = useCallback((key) => {
    setEffects(prev => {
      // If currently HUSH, enabling effects should have no effect until radio set to ON.
      // We still update the toggle state visually; HUSH will always clear toggles immediately.
      const next = { ...prev, [key]: !prev[key] };

      // If user turned an effect ON while radio is 'ON', provide immediate audible feedback:
      if ((key === 'distortion' || key === 'reverb') && next[key] && radioSelection === 'ON') {
        try {
          // best-effort immediate feedback
          editorRef.current?.procAndPlay();
        } catch (e) {
          // ignore
        }
      }

      return next;
    });
  }, [radioSelection]);

  const handleSliderChange = useCallback((key, value) => {
    setSliders(prev => ({ ...prev, [key]: parseInt(value) }));
  }, []);

  // Playback control handlers
  const handlePlay = useCallback(() => {
    editorRef.current?.evaluate();
  }, []);

  const handleStop = useCallback(() => {
    editorRef.current?.stop();
  }, []);

  const handlePreprocess = useCallback(() => {
    editorRef.current?.preprocess();
  }, []);

  const handleProcAndPlay = useCallback(() => {
    editorRef.current?.preprocess();
    editorRef.current?.evaluate();
  }, []);

  // --- RENDER CONTROL PANEL CONTENT ---
  const renderControlPanelContent = () => {
    switch (activeTab) {
      case 'effects':
        return <EffectsControl effects={effects} toggleEffect={toggleEffect} />;
      case 'settings':
        return <SettingsControl sliders={sliders} handleSliderChange={handleSliderChange} />;
      default:
        return <div className="p-4 text-gray-500">Select a panel to start controlling parameters.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8 lg:p-12 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        Modular Audio Synthesizer Interface
      </h1>

      {/* Main Grid: Left (2/3) and Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <PreprocessorEditor
            ref={editorRef}
            radioSelection={radioSelection}
            effects={effects}
            volume={sliders.volume}
          />

          <PlaybackControls
            onPlay={handlePlay}
            onStop={handleStop}
            onPreprocess={handlePreprocess}
            onProcAndPlay={handleProcAndPlay}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <PanelWrapper title="Parameter Control" icon={Sliders} className="min-h-[400px]">
            <div className="p-6">
              {renderControlPanelContent()}
            </div>
          </PanelWrapper>

          <PanelWrapper title="Preprocess Mode" icon={Settings}>
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-3">
                <input type="radio" value="ON" checked={radioSelection === 'ON'} onChange={handleRadioChange} />
                <span className="ml-2">ON</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" value="HUSH" checked={radioSelection === 'HUSH'} onChange={handleRadioChange} />
                <span className="ml-2">HUSH (effects off)</span>
              </label>
            </div>
          </PanelWrapper>

          
        </div>
      </div>
    </div>
  );
};

export default App;