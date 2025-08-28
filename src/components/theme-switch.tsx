import * as React from "react"

interface ThemeToggleProps {
  theme: "light" | "dark"
  onToggle: () => void
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <div className="theme-switch-container">
      <button
        onClick={onToggle}
        className="theme-switch"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        role="switch"
        aria-checked={theme === "dark"}
      >
        <div className="theme-switch-track">
          <div className="theme-switch-thumb" />
        </div>
        <span className="theme-switch-icon">
          {theme === "light" ? "🌙" : "☀️"}
        </span>
      </button>
    </div>
  )
}

export default ThemeToggle
