import React from 'react';
import { Music } from 'lucide-react';
import PanelWrapper from "../../layout/PanelWrapper";


const PreprocessorEditor = () => (
  <PanelWrapper title="Preprocessor Editor" icon={Music}>
    <div className="p-4">
      <textarea
        className="w-full h-64 bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-green-600 border border-slate-700/30 focus:border-purple-500 focus:outline-none resize-none"
      />
    </div>
  </PanelWrapper>
);

export default PreprocessorEditor;