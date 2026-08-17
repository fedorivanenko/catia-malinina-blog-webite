'use client'

import { type FormEvent, useState } from 'react'
import { Button } from 'app/components/ui/button'
import { Input } from 'app/components/ui/input'
import { sanitizeEmail } from 'app/lib/email'
import { cn } from 'app/lib/utils'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sanitizeEmail(email),
          website: formData.get('website'),
        }),
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(result.message || 'Could not submit your email.')
      }

      form.reset()
      setEmail('')
      setStatus('success')
      setMessage('Thanks — you’re on the list.')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not submit your email. Please try again.'
      )
    }
  }

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="signup-email">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby="signup-status"
          disabled={status === 'submitting'}
        />
        <Button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Joining…' : 'Join the list'}
        </Button>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="signup-website">Website</label>
        <input
          id="signup-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p
        id="signup-status"
        className={cn(
          'mt-2 min-h-5 text-sm text-neutral-600 dark:text-neutral-400',
          status === 'error' && 'text-red-600 dark:text-red-400'
        )}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  )
}
