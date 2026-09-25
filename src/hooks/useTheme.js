import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved)
        return saved
      }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = prefersDark ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', initial)
      return initial
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const changeTheme = (newTheme) => {
    const val = typeof newTheme === 'function' ? newTheme(theme) : newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', val)
      localStorage.setItem('theme', val)
    }
    setTheme(val)
  }

  const toggle = () => changeTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle, setTheme: changeTheme }
}
