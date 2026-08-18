# Catia Malinina Blog Monorepo

This is a Turbo-powered monorepo containing Catia Malinina's blog applications.

## Structure

```
├── apps/
│   └── web/          # Next.js blog application
├── packages/         # Shared packages (when needed)
└── turbo.json        # Turbo configuration
```

## Getting Started

Install dependencies:
```bash
pnpm install
```

## Development

Run all apps in development mode:
```bash
pnpm dev
```

Run only the web app:
```bash
pnpm --filter @catia-blog/web dev
```

## Building

Build all apps:
```bash
pnpm build
```

## Other Commands

- `pnpm lint` - Run linting across all apps
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier

## Apps

### Web (`@catia-blog/web`)
Next.js blog application with MDX support for blog posts.

## Email subscriptions

Create a Resend Segment named `Catia Malinina Blog Subscribers`, then configure:

```bash
RESEND_API_KEY=          # Full-access key; sending-only keys cannot manage contacts
RESEND_SEGMENT_ID=       # Segment ID used to label subscribers for Broadcasts
```

Email signups create Resend Contacts and add them to this Segment.