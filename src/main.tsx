import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

createRoot(app).render(
  <StrictMode>
    <App />
  </StrictMode>
);
