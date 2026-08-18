'use client'

import { useTheme } from 'next-themes'
import { cn } from 'app/lib/utils'

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <fieldset className="inline-flex rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800">
      <legend className="sr-only">Color theme</legend>
      {themes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={cn(
            'rounded px-2 py-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-600',
            theme === value &&
              'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          )}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
        >
          {label}
        </button>
      ))}
    </fieldset>
  )
}
