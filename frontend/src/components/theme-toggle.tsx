import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

// Shows the icon of the theme you will switch to: sun in dark, moon in light.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} strokeWidth={2} />
    </Button>
  )
}
