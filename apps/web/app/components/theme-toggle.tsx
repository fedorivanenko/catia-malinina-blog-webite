'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from 'app/lib/utils'

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Auto', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <fieldset className="inline-flex rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800">
      <legend className="sr-only">Color theme</legend>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={cn(
            'inline-flex size-7 items-center justify-center rounded text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-600',
            theme === value &&
              'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          )}
          aria-label={`${label} theme`}
          aria-pressed={theme === value}
          title={`${label} theme`}
          onClick={() => setTheme(value)}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </fieldset>
  )
}
