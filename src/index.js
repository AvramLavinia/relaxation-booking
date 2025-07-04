// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // (if you still have some global CSS)

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
