import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaMoon, FaSun, FaAdjust } from 'react-icons/fa';
import './index.css';

const ThemeToggle = ({ showLabel = false, className = '' }) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className={`theme-toggle-container ${className}`}>
      {showLabel && <span className="theme-toggle-label">Theme:</span>}
      <div className="theme-toggle-buttons">
        <button
          className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => handleThemeChange('dark')}
          title="Dark Theme"
        >
          <FaMoon />
          {showLabel && <span>Dark</span>}
        </button>
        <button
          className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
          onClick={() => handleThemeChange('light')}
          title="Light Theme"
        >
          <FaSun />
          {showLabel && <span>Light</span>}
        </button>
        <button
          className={`theme-toggle-btn ${theme === 'auto' ? 'active' : ''}`}
          onClick={() => handleThemeChange('auto')}
          title="Auto Theme"
        >
          <FaAdjust />
          {showLabel && <span>Auto</span>}
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;

