'use client'

import { motion } from 'framer-motion'
import { useUser, SignUpButton } from '@clerk/nextjs'
import { 
  Rocket, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  Brain, 
  Sparkles, 
  Globe,
  Code,
  BarChart3,
  Star,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Home() {
  const { isSignedIn } = useUser() || { isSignedIn: false }

  const features = [
    {
      icon: <Brain className="h-12 w-12 text-blue-400" />,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI models that understand context, generate content, and provide intelligent insights for your projects.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: <Shield className="h-12 w-12 text-green-400" />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with end-to-end encryption, secure authentication, and compliance with industry standards.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: <Users className="h-12 w-12 text-purple-400" />,
      title: 'Collaborative Ecosystem',
      description: 'Connect with creators, developers, and businesses in our thriving community of digital innovators.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: <Code className="h-12 w-12 text-orange-400" />,
      title: 'Smart Development',
      description: 'AI-assisted coding, automated testing, and intelligent code review to accelerate your development process.',
      gradient: 'from-orange-500/20 to-red-500/20'
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-indigo-400" />,
      title: 'Analytics & Insights',
      description: 'Comprehensive analytics dashboard with real-time metrics, performance tracking, and growth insights.',
      gradient: 'from-indigo-500/20 to-blue-500/20'
    },
    {
      icon: <Globe className="h-12 w-12 text-teal-400" />,
      title: 'Global Scale',
      description: 'Deploy anywhere in the world with our global infrastructure and CDN for optimal performance.',
      gradient: 'from-teal-500/20 to-cyan-500/20'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Projects Created', value: '50K+', icon: Code },
    { label: 'AI Interactions', value: '1M+', icon: Brain },
    { label: 'Success Rate', value: '99.9%', icon: CheckCircle }
  ]

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Floating AI Icon */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <Rocket className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Welcome to{' '}
              <span className="gradient-text animate-pulse-slow">
                AIVEL
              </span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              The next-generation AI ecosystem for creators and businesses to build, 
              manage, and grow digital projects with unprecedented intelligence and efficiency.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="glass-card-hover">
                  <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button 
                  variant="gradient" 
                  size="xl" 
                  rightIcon={<ArrowRight className="h-6 w-6" />}
                  glow
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button 
                  variant="gradient" 
                  size="xl" 
                  rightIcon={<ArrowRight className="h-6 w-6" />}
                  glow
                >
                  Start Free Trial
                </Button>
              </SignUpButton>
            )}
            <Button variant="glass" size="xl">
              <Star className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Powerful Features for{' '}
              <span className="gradient-text">
                Modern Creators
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to bring your digital vision to life, powered by cutting-edge AI technology 
              and designed for the future of work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`glass-card-hover group relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center glass-card-hover gradient-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="relative z-10 p-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <Rocket className="h-8 w-8 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your{' '}
              <span className="gradient-text">Digital Presence?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators and businesses already building the future with AIVEL. 
              Start your journey today and experience the power of AI-driven development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {!isSignedIn && (
                <SignUpButton mode="modal">
                  <Button variant="gradient" size="xl" glow>
                    <Sparkles className="h-6 w-6 mr-2" />
                    Get Started Free
                  </Button>
                </SignUpButton>
              )}
              <Button variant="glass" size="xl">
                <Globe className="h-5 w-5 mr-2" />
                Explore Features
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}