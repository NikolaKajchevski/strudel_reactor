import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Music, Activity } from 'lucide-react';
import PanelWrapper from "../../layout/PanelWrapper";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from '../audio/tunes';

// Hold StrudelMirror instance globally
let globalEditor = null;

// Token replacement function for <p1_Radio> (keeps previous behavior)
const ProcessText = (radioSelection) => (match, ...args) => {
  const replace = (radioSelection === 'HUSH') ? '_' : '';
  return replace;
};

/**
 * Proc: preprocesses the procText and sets code into the editor.
 *
 * Behavior:
 * - Always replaces the <p1_Radio> tokens according to radioSelection.
 * - If radioSelection === 'HUSH' -> do NOT apply any effects (effects bypassed).
 * - If radioSelection === 'ON' and effects.distortion === true -> inject .distort("3")
 *   BEFORE .postgain( and BEFORE .gain( occurrences (Option A).
 *
 * Note: uses simple heuristics for injection; extend if you need other anchor points.
 */
const Proc = (procText, radioSelection, effects = {}) => {
  if (!globalEditor) return;

  const replacementFunction = ProcessText(radioSelection);
  let proc_text_replaced = procText.replaceAll('<p1_Radio>', replacementFunction);

  // If HUSH: ensure no injected effects — we don't add anything.
  if (radioSelection === 'HUSH') {
    // Optionally: we can strip existing injected distort calls if present.
    // Remove previously-inserted distort("3") occurrences to be safe.
    proc_text_replaced = proc_text_replaced.replace(/\.distort\("3"\)/g, '');
    globalEditor.setCode(proc_text_replaced);
    return;
  }

  // radioSelection === 'ON': apply effects only if effects.distortion === true
  const distortionEnabled = (effects && effects.distortion === true);

  if (distortionEnabled) {
    try {
      // inject before .postgain( and .gain( (Option A)
      proc_text_replaced = proc_text_replaced
        .replace(/\.postgain\(/g, `.distort("3").postgain(`)
        .replace(/\.gain\(/g, `.distort("3").gain(`)
        // Attach distort after .sound(...) when it's not already followed by a dot (simple heuristic)
        .replace(/(\.sound\([^)]*\))(?!\.)/g, `$1.distort("3")`);
    } catch (err) {
      console.warn("Distortion injection failed during preprocessing:", err);
    }
  } else {
    // Ensure we remove any stray distort markers if user turned distortion off
    proc_text_replaced = proc_text_replaced.replace(/\.distort\("3"\)/g, '');
  }

  globalEditor.setCode(proc_text_replaced);
};

const ProcAndPlay = (procText, radioSelection, effects) => {
  if (globalEditor != null && globalEditor.repl.state.started === true) {
    Proc(procText, radioSelection, effects);
    globalEditor.evaluate();
  }
};

const PreprocessorEditor = forwardRef(({ radioSelection, effects }, ref) => {
  const [procText, setProcText] = useState(stranger_tune);
  const editorRootRef = useRef(null);
  const hasRun = useRef(false);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    if (!hasRun.current) {
      const canvas = document.getElementById('roll');
      if (!canvas) {
        console.error("Canvas with id='roll' not found. Visualization will not work.");
        return;
      }

      // HiDPI: double internal resolution (simple approach)
      canvas.width = canvas.width * 2;
      canvas.height = canvas.height * 2;
      const drawContext = canvas.getContext('2d');
      const drawTime = [-2, 2];

      globalEditor = new StrudelMirror({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
        transpiler,
        root: editorRootRef.current,
        drawTime,
        onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
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
      Proc(stranger_tune, radioSelection, effects);
      hasRun.current = true;
    }

    return () => {
      // no-op cleanup for now
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Re-run preprocessing when radioSelection, effects, or procText changes
  useEffect(() => {
    if (hasRun.current) {
      Proc(procText, radioSelection, effects);
    }
  }, [radioSelection, effects, procText]);

  const handleProcTextChange = useCallback((event) => {
    setProcText(event.target.value);
  }, []);

  useImperativeHandle(ref, () => ({
    evaluate: async () => {
      try {
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
    stop: () => globalEditor?.stop(),
    preprocess: () => Proc(procText, radioSelection, effects),
    procAndPlay: () => ProcAndPlay(procText, radioSelection, effects),
  }), [procText, radioSelection, effects]);

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
    </div>
  );
});

export default PreprocessorEditor;
