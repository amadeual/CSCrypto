import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error boundary and better error handling
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #ef4444;">
      <h1>Application Error</h1>
      <p>Failed to load the application. Please refresh the page.</p>
      <pre style="background: #1e293b; color: #f1f5f9; padding: 10px; border-radius: 8px; margin-top: 20px;">${error}</pre>
    </div>
  `;
}
