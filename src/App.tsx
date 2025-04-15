import React, { useState, useEffect, useCallback } from "react"; // Import hooks
import { ReactFlowProvider } from "reactflow";

import FlowCanvas from "./components/FlowCanvas";
import "./styles/main.css";

// Define Theme type (can be moved to a types file later)
type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'pptweb-theme';

function App() {
  // --- Theme State Management ---
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage or default to 'system'
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (storedTheme as Theme) || 'system';
  });

  // Function to apply the theme to the body
  const applyTheme = useCallback((selectedTheme: Theme) => {
    let effectiveTheme: 'light' | 'dark';
    if (selectedTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = selectedTheme;
    }
    document.body.dataset.theme = effectiveTheme; // Set data-theme attribute
    console.log(`Applied theme: ${effectiveTheme} (Selected: ${selectedTheme})`);
  }, []);

  // Effect to apply theme on initial load and when theme state changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme); // Save preference
  }, [theme, applyTheme]);

  // Effect to listen for system theme changes when 'system' is selected
  useEffect(() => {
    if (theme !== 'system') {
      return; // Only listen if 'system' theme is active
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      console.log("System theme changed, reapplying...");
      applyTheme('system'); // Re-apply to get the new system value
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on component unmount or when theme changes away from 'system'
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, applyTheme]); // Re-run if theme changes

  // Handler to update theme state (passed down to SettingsModal)
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  // --- End Theme State Management ---

  return (
    <ReactFlowProvider>
      {/* Pass theme state and handler down.
          NOTE: This assumes FlowCanvas will eventually render/manage
                the SettingsButton and SettingsModal. You might need
                to adjust prop drilling or use Context API later. */}
      <div className="app-container">
        <FlowCanvas currentTheme={theme} onThemeChange={handleThemeChange} />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
