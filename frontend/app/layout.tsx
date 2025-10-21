// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIVEL - AI-Powered Digital Ecosystem',
  description: 'Create, manage, and grow your digital projects with AI assistance',
  keywords: 'AI, digital ecosystem, creators, businesses, content management',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: '#3B82F6'
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} focus-visible:outline-none focus-visible:ring-0`}>
          <ThemeProvider>
            <main className="flex-1">
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}