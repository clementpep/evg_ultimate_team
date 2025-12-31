import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { backgrounds } from './assets/futCards';

// Inject PSG wallpaper background via JavaScript (for Vite bundling)
const style = document.createElement('style');
style.textContent = `
  body::before {
    background-image: url(${backgrounds.psgWallpaper}) !important;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
