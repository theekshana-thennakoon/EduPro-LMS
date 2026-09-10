import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { LmsProvider } from './context/LmsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LmsProvider>
        <App />
      </LmsProvider>
    </AuthProvider>
  </React.StrictMode>
);
