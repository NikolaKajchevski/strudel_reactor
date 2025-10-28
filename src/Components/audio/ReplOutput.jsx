import React from "react";
import { Activity } from "lucide-react";
import PanelWrapper from "../../layout/PanelWrapper";


const ReplOutput = ({}) => (
    <PanelWrapper title="REPL Output" icon={Activity}>
        <div className="p-4">
            <div className="w-full h-64 bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-blue-400 border border-slate-700/30 overflow-auto">
                <div className="text-gray-500">
                    <div className="mt-2">

                    </div>
                </div>
            </div>
        </div>
    </PanelWrapper>
);

export default ReplOutput;