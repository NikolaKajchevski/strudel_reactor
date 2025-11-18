import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Music, Activity } from 'lucide-react';
import PanelWrapper from "../../layout/PanelWrapper";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from '../audio/tunes';
import D3Pianoroll from './D3Pianoroll';

// Hold StrudelMirror instance globally
let globalEditor = null;

// Token replacement function for <p1_Radio> (keeps previous behavior)
const ProcessText = (radioSelection) => (match, ...args) => {
  const replace = (radioSelection === 'HUSH') ? '_' : '';
  return replace;
};

const Proc = (procText, radioSelection, effects = {}, volume = 50) => {
  if (!globalEditor) return;
  const replacementFunction = ProcessText(radioSelection);
  let proc_text_replaced = procText.replaceAll('<p1_Radio>', replacementFunction);

  // If HUSH ensure no injected effects — we don't add anything.
  if (radioSelection === 'HUSH') {
    // Remove previously-inserted effect markers to be safe.
    proc_text_replaced = proc_text_replaced
      .replace(/\.distort\("3"\)/g, '')
      .replace(/\.room\("0.9"\)/g, '')
      .replace(/\.speed\("1\.5"\)\.unit\("c"\)/g, '');
    globalEditor.setCode(proc_text_replaced);
    return;
  }

  // Apply volume preprocessing first

  // radioSelection === 'ON': apply effects only if toggled on
  const distortionEnabled = (effects && effects.distortion === true);
  const reverbEnabled = (effects && effects.reverb === true);
  const demonicEnabled = (effects && effects.demonic === true);

  //  remove all effect markers first to prevent stacking
  proc_text_replaced = proc_text_replaced
    .replace(/\.speed\("1\.5"\)\.unit\("c"\)/g, '')
    .replace(/\.distort\("3"\)/g, '')
    .replace(/\.room\("0\.9"\)/g, '');

  // Demonic effect - pitch up by 1.5x while keeping tempo
  if (demonicEnabled) {
    try {
      proc_text_replaced = proc_text_replaced
        .replace(/\.postgain\(/g, `.speed("1.5").unit("c").postgain(`)
        .replace(/\.gain\(/g, `.speed("1.5").unit("c").gain(`)
        .replace(/(\.sound\([^)]*\))(?!\.)/g, `$1.speed("1.5").unit("c")`);
    } catch (err) {
      console.warn("Demonic injection failed during preprocessing:", err);
    }
  }

  // Distortion injection
  if (distortionEnabled) {
    try {
      proc_text_replaced = proc_text_replaced
        .replace(/\.postgain\(/g, `.distort("3").postgain(`)
        .replace(/\.gain\(/g, `.distort("3").gain(`)
        .replace(/(\.sound\([^)]*\))(?!\.)/g, `$1.distort("3")`);
    } catch (err) {
      console.warn("Distortion injection failed during preprocessing:", err);
    }
  }

  // Reverb injection
  if (reverbEnabled) {
    try {
      proc_text_replaced = proc_text_replaced
        .replace(/\.postgain\(/g, `.room("0.9").postgain(`)
        .replace(/\.gain\(/g, `.room("0.9").gain(`)
        .replace(/(\.sound\([^)]*\))(?!\.)/g, `$1.room("0.9")`);
    } catch (err) {
      console.warn("Reverb injection failed during preprocessing:", err);
    }
  }

  globalEditor.setCode(proc_text_replaced);
};

const ProcAndPlay = (procText, radioSelection, effects, volume) => {
  if (globalEditor != null && globalEditor.repl.state.started === true) {
    Proc(procText, radioSelection, effects, volume);
    globalEditor.evaluate();
  }
};

const PreprocessorEditor = forwardRef(({ radioSelection, effects, volume }, ref) => {
  const [procText, setProcText] = useState(stranger_tune);
  const editorRootRef = useRef(null);
  const hasRun = useRef(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [drawData, setDrawData] = useState({ haps: [], time: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!hasRun.current) {
      const drawTime = [-2, 2];

      globalEditor = new StrudelMirror({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
        transpiler,
        root: editorRootRef.current,
        drawTime,
        onDraw: (haps, time) => {
          setDrawData({ haps, time });
        },
        prebake: async () => {
          initAudioOnFirstClick();
          const loadModules = evalScope(
            import('@strudel/core'),
            import('@strudel/draw'),
            import('@strudel/mini'),
            import('@strudel/tonal'),
            import('@strudel/webaudio'),
          );
          await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
        },
      });

      setProcText(stranger_tune);
      // initial processing with current props
      Proc(stranger_tune, radioSelection, effects, volume);
      hasRun.current = true;
    }

    return () => {
    };
  }, []);

  // Add useEffect for volume changes - handles real-time volume updates
  useEffect(() => {
    if (hasRun.current && isPlaying) {
      Proc(procText, radioSelection, effects, volume);
      globalEditor.evaluate();
    }
  }, [volume]);

  useEffect(() => {
    if (hasRun.current) {
      Proc(procText, radioSelection, effects, volume);
    }
  }, [radioSelection, effects, procText]);

  const handleProcTextChange = useCallback((event) => {
    setProcText(event.target.value);
  }, []);

  useImperativeHandle(ref, () => ({
    evaluate: async () => {
      try {
        setIsPlaying(true);
        await globalEditor?.evaluate();
      } catch (error) {
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('no code to evaluate')) {
          setAlertMessage('Please process your code before playing');
        } else {
          console.error('Evaluation error:', error);
          setAlertMessage(`Error: ${errorMsg}`);
        }
      }
    },
    stop: () => {
      setIsPlaying(false);
      globalEditor?.stop();
    },
    preprocess: () => Proc(procText, radioSelection, effects, volume),
    procAndPlay: () => {
      setIsPlaying(true);
      ProcAndPlay(procText, radioSelection, effects, volume);
    },
  }), [procText, radioSelection, effects, volume]);

  return (
    <div>
      {/* Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAlertMessage(null)}
          ></div>
          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-1 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-[scale-in_0.2s_ease-out]">
            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-cyan-400">Alert</h3>
                <button
                  onClick={() => setAlertMessage(null)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-300 mb-6">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold py-3 px-6 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-400/50"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <PanelWrapper title="Preprocessor Editor" icon={Music}>
        <div className="p-6 space-y-4">
          <div>
            <textarea
              id="proc-textarea"
              className="w-full h-40 bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-blue-400 border border-slate-700/30 focus:border-purple-500 focus:outline-none resize-y"
              value={procText}
              onChange={handleProcTextChange}
            />
          </div>
        </div>
      </PanelWrapper>

      <br />

      <PanelWrapper title="REPL Output" icon={Activity}>
        <div className="p-8">
          <div className="w-full h-64 bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-blue-400 border border-slate-700/30 overflow-auto">
            <div className="text-gray-500">
              <div className="mt-5">
                {/* StrudelMirror will render here */}
                <div
                  ref={editorRootRef}
                  id="editor"
                  className="h-64 border border-purple-500 rounded-lg overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </PanelWrapper>

      <br />

      <PanelWrapper title="Pianoroll Visualization" icon={Activity}>
        <D3Pianoroll
          haps={drawData.haps}
          time={drawData.time}
          drawTime={[-2, 2]}
          height={300}
        />
      </PanelWrapper>
    </div>
  );
});

export default PreprocessorEditor;