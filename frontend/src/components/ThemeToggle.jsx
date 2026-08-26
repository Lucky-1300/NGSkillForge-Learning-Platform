import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'is-dark' : 'is-light'} ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {isDark ? (
            <FiSun className="theme-icon sun-icon" />
          ) : (
            <FiMoon className="theme-icon moon-icon" />
          )}
        </span>
      </span>
      {showLabel && (
        <span className="theme-toggle-text">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      )}
    </button>
  )
}
