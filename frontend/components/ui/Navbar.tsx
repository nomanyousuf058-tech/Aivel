'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Menu, X, Rocket } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()

  const isOwner = user?.publicMetadata?.role === 'owner'

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Store', href: '/store' },
    { name: 'Content Studio', href: '/dashboard/content' },
  ]

  if (isOwner) {
    navigation.push({ name: 'Admin', href: '/admin' })
  }

  const linkClass = (href: string) =>
    `text-sm md:text-base font-medium transition-colors duration-200 ${
      pathname === href ? 'text-white' : 'text-gray-300 hover:text-white'
    }`

  return (
    <nav className="glass border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Rocket className="h-8 w-8 text-blue-400" />
              </motion.div>
              <span className="text-xl font-bold text-white">
                AIVEL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={linkClass(item.href)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-300 hover:text-white transition-colors duration-200" suppressHydrationWarning>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200" suppressHydrationWarning>
                    Get Started
                  </button>
                </SignUpButton>
              </>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              suppressHydrationWarning
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={linkClass(item.href)}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isSignedIn ? (
                <div className="flex items-center space-x-3 pt-4">
                  <SignInButton mode="modal">
                    <button className="text-gray-300 hover:text-white" suppressHydrationWarning>
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" suppressHydrationWarning>
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="pt-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar