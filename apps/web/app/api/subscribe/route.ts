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

async function sendWelcomeEmail({
  resend,
  email,
  contactId,
  from,
  templateId,
}: {
  resend: Resend
  email: string
  contactId: string
  from: string
  templateId: string
}) {
  const { error } = await resend.emails.send(
    {
      from,
      to: email,
      template: { id: templateId },
    },
    { idempotencyKey: `newsletter-welcome-${contactId}` }
  )

  if (error) {
    console.error('Resend welcome email failed', error)
  }
}

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
  const segmentId = process.env.RESEND_SEGMENT_ID
  const from = process.env.CONTACT_FROM_EMAIL
  const welcomeTemplateId = process.env.RESEND_WELCOME_TEMPLATE_ID

  if (!apiKey || !segmentId || !from || !welcomeTemplateId) {
    console.error(
      'Missing RESEND_API_KEY, RESEND_SEGMENT_ID, CONTACT_FROM_EMAIL, or RESEND_WELCOME_TEMPLATE_ID'
    )
    return NextResponse.json(
      { message: 'Email signup is unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  const resend = new Resend(apiKey)
  const { data: createdContact, error: createError } =
    await resend.contacts.create({
      email: emailResult.data,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    })

  if (createError?.statusCode === 409) {
    const [contactResult, segmentsResult] = await Promise.all([
      resend.contacts.get({ email: emailResult.data }),
      resend.contacts.segments.list({ email: emailResult.data }),
    ])

    if (contactResult.error || segmentsResult.error) {
      console.error(
        'Resend subscription lookup failed',
        contactResult.error || segmentsResult.error
      )
      return NextResponse.json(
        { message: 'Could not submit your email. Please try again.' },
        { status: 502 }
      )
    }

    const isInSegment = segmentsResult.data.data.some(
      (segment) => segment.id === segmentId
    )

    if (isInSegment && !contactResult.data.unsubscribed) {
      return NextResponse.json({ message: 'Thanks — you’re on the list.' })
    }

    const { error: updateError } = await resend.contacts.update({
      email: emailResult.data,
      unsubscribed: false,
    })

    if (updateError) {
      console.error('Resend contact resubscription failed', updateError)
      return NextResponse.json(
        { message: 'Could not submit your email. Please try again.' },
        { status: 502 }
      )
    }

    if (!isInSegment) {
      const { error: segmentError } = await resend.contacts.segments.add({
        email: emailResult.data,
        segmentId,
      })

      if (segmentError && segmentError.statusCode !== 409) {
        console.error('Resend segment subscription failed', segmentError)
        return NextResponse.json(
          { message: 'Could not submit your email. Please try again.' },
          { status: 502 }
        )
      }
    }

    await sendWelcomeEmail({
      resend,
      email: emailResult.data,
      contactId: contactResult.data.id,
      from,
      templateId: welcomeTemplateId,
    })

    return NextResponse.json({ message: 'Thanks — you’re on the list.' })
  }

  if (createError) {
    console.error('Resend contact subscription failed', createError)
    return NextResponse.json(
      { message: 'Could not submit your email. Please try again.' },
      { status: 502 }
    )
  }

  await sendWelcomeEmail({
    resend,
    email: emailResult.data,
    contactId: createdContact.id,
    from,
    templateId: welcomeTemplateId,
  })

  return NextResponse.json({ message: 'Thanks — you’re on the list.' })
}
