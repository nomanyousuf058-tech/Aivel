import { render, screen } from '@testing-library/react'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/ui/Navbar'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: false,
    user: null,
  }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  UserButton: () => <div>User Button</div>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Navbar', () => {
  it('renders the logo and navigation links', () => {
    render(
      <ClerkProvider>
        <Navbar />
      </ClerkProvider>
    )

    expect(screen.getByText('AIVEL')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Store')).toBeInTheDocument()
    expect(screen.getByText('Content Studio')).toBeInTheDocument()
  })

  it('shows authentication buttons when not signed in', () => {
    render(
      <ClerkProvider>
        <Navbar />
      </ClerkProvider>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })
})