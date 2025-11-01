import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css'; // We'll keep this for a few base styles

// --- New Imports for Phase 1 ---
import { ThemeProvider, Global } from '@emotion/react';
import { theme } from './theme.js';
import { SessionProvider } from './contexts/SessionContext.jsx';

/**
 * Global Styles
 * We use Emotion's <Global> component to inject styles 
 * that are not component-specific, replacing the old 
 * index.css or App.css heavy-lifting.
 */
const GlobalStyles = () => (
  <Global
    styles={`
      /* We've already set the base styles in index.html,
        but this is a good place for any other global resets
        or overrides if we need them.
      */
      
      /* For example, let's make sure our primary font is
         applied everywhere by default */
      body {
        font-family: ${theme.fonts.primary};
      }
    `}
  />
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* We wrap the *entire* app in the ThemeProvider
      so all styled-components downstream can access our theme.
    */}
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <SessionProvider>
        <App />
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>
);

