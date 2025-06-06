import React from 'react';
import ReactDOM from 'react-dom/client';    // ← Make sure this line is present
import './index.css';                        // ← This brings in Tailwind’s styles
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
