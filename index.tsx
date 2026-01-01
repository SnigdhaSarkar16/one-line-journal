
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Entry point: index.tsx loading...");

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React successfully mounted");
  } catch (error) {
    console.error("Critical error during React mount:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Failed to mount app. Check console for details.</div>`;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
