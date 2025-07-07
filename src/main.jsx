import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css';

window.onerror = function(message, source, lineno, colno, error) {
  alert(`Global error caught: ${message} at ${source}:${lineno}:${colno}`);
  console.error('Global error caught:', message, source, lineno, colno, error);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
