import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { sanitizeEmail } from 'app/lib/email'

const requestSchema = z
  .object({
    email: z.string().max(300),
    website: z.string().max(200).nullable().optional(),
  })
  .strict()

const emailSchema = z.string().email().max(254)

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Invalid request.' },
      { status: 400 }
    )
  }

  const requestResult = requestSchema.safeParse(body)

  if (!requestResult.success) {
    return NextResponse.json(
      { message: 'Enter a valid email address.' },
      { status: 400 }
    )
  }

  if (requestResult.data.website) {
    return NextResponse.json({ message: 'Thanks — you’re on the list.' })
  }

  const emailResult = emailSchema.safeParse(
    sanitizeEmail(requestResult.data.email)
  )

  if (!emailResult.success) {
    return NextResponse.json(
      { message: 'Enter a valid email address.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const to = process.env.CONTACT_TO_EMAIL || 'hello@catiamalinina.com'

  if (!apiKey || !from) {
    console.error('Missing RESEND_API_KEY or CONTACT_FROM_EMAIL')
    return NextResponse.json(
      { message: 'Email signup is unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: emailResult.data,
    subject: 'New email signup',
    text: `New email signup: ${emailResult.data}`,
  })

  if (error) {
    console.error('Resend email failed', error)
    return NextResponse.json(
      { message: 'Could not submit your email. Please try again.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ message: 'Thanks — you’re on the list.' })
}
