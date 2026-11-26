import { useMemo } from 'react'
import { useSettings } from './useSettings'
import { resolveTheme, themeStyle, themeClasses } from '../utils/themes'

// The class names and inline style that give the storefront its chosen look.
// Put them on one wrapper around the whole store (see PublicLayout).
export function useStoreTheme() {
  const { settings } = useSettings()

  return useMemo(() => {
    const theme = resolveTheme(settings.theme)
    return { theme, layout: theme.layout, words: theme.words, className: themeClasses(theme), style: themeStyle(theme) }
  }, [settings.theme])
}