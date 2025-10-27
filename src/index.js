import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/index.css';  // ← This line is critical!
import App from './App';  // Or wherever your App.jsx is


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);