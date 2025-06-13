import React from 'react';
import ReactDOM from 'react-dom/client';    // ← Make sure this line is present
import { BrowserRouter } from 'react-router-dom'; // <-- Import the router
import './index.css';                        // ← This brings in Tailwind’s styles
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* The BrowserRouter component wraps our App, enabling routing */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
