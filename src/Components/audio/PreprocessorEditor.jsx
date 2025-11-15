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

// We will use a mutable variable to hold the StrudelMirror instance,
// and expose functions to interact with it via the ref.
let globalEditor = null;

// The core logic for processing the text. It uses the current radioSelection.
const ProcessText = (radioSelection) => (match, ...args) => {
    const replace = (radioSelection === 'HUSH') ? '_' : '';
    return replace;
};

// Function to perform the text preprocessing and update the StrudelMirror code
const Proc = (procText, radioSelection) => {
    if (!globalEditor) return;
    const replacementFunction = ProcessText(radioSelection);
    const proc_text_replaced = procText.replaceAll('<p1_Radio>', replacementFunction);
    globalEditor.setCode(proc_text_replaced);
};

// Function to process and then play the code
const ProcAndPlay = (procText, radioSelection) => {
    if (globalEditor != null && globalEditor.repl.state.started === true) {
        Proc(procText, radioSelection);
        globalEditor.evaluate();
    }
};

// component to use forwardRef to expose Strudel controls to the parent
const PreprocessorEditor = forwardRef(({ radioSelection }, ref) => {
    const [procText, setProcText] = useState(stranger_tune);
    const editorRootRef = useRef(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!hasRun.current) {
            const canvas = document.getElementById('roll');
            if (!canvas) {
                console.error("Canvas with id='roll' not found. Visualization will not work.");
                return;
            }

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
            Proc(stranger_tune, radioSelection);
            hasRun.current = true;
        }

        return () => {
        };
    }, []);

    useEffect(() => {
        if (hasRun.current) {
            Proc(procText, radioSelection);
        }
    }, [radioSelection]);

    const handleProcTextChange = useCallback((event) => {
        setProcText(event.target.value);
    }, []);

    useImperativeHandle(ref, () => ({
        evaluate: () => globalEditor?.evaluate(),
        stop: () => globalEditor?.stop(),
        preprocess: () => Proc(procText, radioSelection),
        procAndPlay: () => ProcAndPlay(procText, radioSelection),
    }));
    
    return (
        <div>
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

            <br></br>


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
                                >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PanelWrapper>
        </div>
    );
});

export default PreprocessorEditor;
