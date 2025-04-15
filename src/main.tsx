import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure this points to our App component
import './styles/main.css'; // Import our global styles
import 'reactflow/dist/style.css';
import 'react-resizable/css/styles.css'; // Import react-resizable CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
