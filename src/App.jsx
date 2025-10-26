import React from 'react';
import PreprocessorEditor from './Components/audio/PreprocessorEditor';

const App = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8 lg:p-12 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        Strudel Reactor
      </h1>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <PreprocessorEditor />
      </div>
    </div>
  );
};

export default App;