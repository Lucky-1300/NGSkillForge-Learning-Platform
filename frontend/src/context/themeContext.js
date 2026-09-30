import { createContext, useContext } from 'react'

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
})

export const useTheme = () => useContext(ThemeContext)
