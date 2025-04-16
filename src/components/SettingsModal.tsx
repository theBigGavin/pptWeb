import React, { useState } from "react"; // Import useState
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme; // Add prop for current theme
  onThemeChange: (theme: Theme) => void; // Add prop for theme change handler
}

// Define types for settings state
type Theme = 'light' | 'dark' | 'system';
type Language = 'zh-CN' | 'en' | 'ja' | 'ko' | 'fr';
type LLMProvider = 'deepseek' | 'openai' | 'gemini' | 'claude';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme, // Destructure new props
  onThemeChange, // Destructure new props
}) => {
  // State for other settings (language, LLM) - theme state is now managed by parent
  // const [theme, setTheme] = useState<Theme>('system'); // Remove local theme state
  const [language, setLanguage] = useState<Language>('zh-CN'); // Default to Chinese
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('deepseek'); // Default to DeepSeek

  // Read version from Vite environment variable injected during build
  const appVersion = import.meta.env.VITE_APP_VERSION || "N/A"; // Fallback if variable is not set

  if (!isOpen) {
    return null;
  }

  // --- Event Handlers ---
  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as Theme;
    // setTheme(newTheme); // Remove local state update
    onThemeChange(newTheme); // Call the handler passed via props
    // console.log("Theme changed to:", newTheme); // Logging can be done in parent if needed
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as Language);
    // TODO: Add logic for i18n integration (e.g., load translations, save preference)
    console.log("Language changed to:", event.target.value);
  };

  const handleLlmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLlmProvider(event.target.value as LLMProvider);
    // TODO: Add logic to update LLM configuration (e.g., save preference, maybe prompt for API key)
    console.log("LLM Provider changed to:", event.target.value);
  };
  // --- End Event Handlers ---

  return (
    // Add the 'open' class conditionally based on the isOpen prop
    <div
      className={`settings-modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className="settings-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {/* Prevent content click from closing */}
        <div className="settings-modal-header">
          <h3>设置</h3>
          <button onClick={onClose} className="settings-modal-close-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="settings-modal-body">
          {/* Theme Selection */}
          <div className="setting-group">
            <h4>颜色主题</h4>
            <div className="setting-options-radio">
              <label>
                <input type="radio" name="theme" value="light" checked={currentTheme === 'light'} onChange={handleThemeChange} /> 明亮
              </label>
              <label>
                <input type="radio" name="theme" value="dark" checked={currentTheme === 'dark'} onChange={handleThemeChange} /> 黑暗
              </label>
              <label>
                <input type="radio" name="theme" value="system" checked={currentTheme === 'system'} onChange={handleThemeChange} /> 跟随系统
              </label>
            </div>
          </div>

          {/* Language Selection */}
          <div className="setting-group">
            {/* Use label and associate it with select using htmlFor and id */}
            <label htmlFor="language-select">界面语言</label>
            <select id="language-select" value={language} onChange={handleLanguageChange} className="setting-select">
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* LLM Configuration */}
          <div className="setting-group">
            {/* Do the same for LLM select */}
            <label htmlFor="llm-select">大模型接口</label>
            <select id="llm-select" value={llmProvider} onChange={handleLlmChange} className="setting-select">
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="claude">Claude</option>
              {/* Add other providers as needed */}
            </select>
            {/* TODO: Add inputs for API keys/endpoints if needed */}
          </div>

          {/* Version Display */}
          <div className="setting-group version-info">
            <p>版本: {appVersion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
