import { Sliders, AudioLines, Music, Settings, Play, StopCircle, Zap } from 'lucide-react'
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

  // 1. New state to track the selected radio button: 'ON' (default) or 'HUSH'
  const [radioSelection, setRadioSelection] = useState('ON'); 

  const [effects, setEffects] = useState({
    reverb: false,
    chipmunk: false,
    distortion: false
  });

  const [sliders, setSliders] = useState({
    value: 50,
    bass: 50,
    treble: 50,
  })

  // 2. Ref to access the methods exposed by PreprocessorEditor (evaluate, stop, etc.)
  const editorRef = useRef(null); 


  // --- HANDLERS ---

  // New handler for the radio button change
  const handleRadioChange = useCallback((event) => {
    const newSelection = event.target.value;
    setRadioSelection(newSelection); 
    
    // In the old code, ProcAndPlay ran after a radio button change if audio was started.
    // We call the exposed function via the ref.
    if (editorRef.current) {
        // We only want to ProcAndPlay if the editor is currently running.
        editorRef.current.procAndPlay();
    }
  }, []);

  const toggleEffect = useCallback((key) => {
    setEffects(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSliderChange = useCallback((key, value) => {
    setSliders(prev => ({ ...prev, [key]: parseInt(value) }));
  }, []);

  // 4. Handlers for PlaybackControls to interact with StrudelMirror
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
    // This button press ensures preprocessing always happens, then plays.
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

        {/* Left Column (Editor, Output, Controls) - span 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3. Pass state and ref to the PreprocessorEditor */}
          <PreprocessorEditor 
            ref={editorRef} 
            radioSelection={radioSelection} 
          />
          
          
          {/* Pass handlers to PlaybackControls */}
          <PlaybackControls 
            onPlay={handlePlay}
            onStop={handleStop}
            onPreprocess={handlePreprocess}
            onProcAndPlay={handleProcAndPlay}
          />
        </div>

        {/* Right Column (Control Panel, Radio Buttons, Visualization) - span 1 */}
        <div className="space-y-6">
          
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Control Panel Content */}
          <PanelWrapper title="Parameter Control" icon={Sliders} className="min-h-[400px]">
            <div className="p-6">
              {renderControlPanelContent()}
            </div>
          </PanelWrapper>

          {/* New Radio Button Panel */}

          
          {/* Visualization Placeholder */}
          <PanelWrapper title="Pianoroll Visualization" icon={AudioLines}>
             <div className="p-4">
                <canvas id="roll" className="w-full h-40 bg-black/50 rounded-lg"></canvas>
             </div>
          </PanelWrapper>

        </div>
      </div>
    </div>
  );
};

export default App;