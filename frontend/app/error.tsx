'use client'

import Button from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Something went wrong</h1>
            <p className="text-gray-300">{error?.message || 'An unexpected error occurred.'}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => reset()}>Try Again</Button>
              <a href="/" className="inline-block">
                <Button variant="secondary">Go Home</Button>
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}





