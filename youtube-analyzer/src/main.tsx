// ========== SECAO: ENTRY POINT ==========

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Renderiza a aplicacao no elemento root
 * StrictMode habilitado para detectar problemas em desenvolvimento
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
