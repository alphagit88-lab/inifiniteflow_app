'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    const signupSuccess = searchParams.get('signup')
    if (signupSuccess === 'success') {
      setMessage({
        type: 'success',
        text: 'Account created successfully! Please sign in.',
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setMessage({
          type: 'error',
          text: authError.message || 'Invalid email or password',
        })
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setMessage({
          type: 'error',
          text: 'Authentication failed: User data missing',
        })
        setIsLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Profile Retrieval Error:', profileError.message)
        await supabase.auth.signOut()
        setMessage({
          type: 'error',
          text: 'Authorization check failed. Access denied.',
        })
        setIsLoading(false)
        return
      }

      if (!profile || profile.user_type !== 'S') {
        await supabase.auth.signOut()
        setMessage({
          type: 'error',
          text: 'This account is not authorized to access this area',
        })
        setIsLoading(false)
        return
      }

      setMessage({
        type: 'success',
        text: 'Sign in successful! Redirecting...',
      })
      setEmail('')
      setPassword('')

      setTimeout(() => {
        window.location.href = '/users/dashboard'
      }, 1000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred during sign-in.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background Image Section - Replace with actual image */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-amber-50 via-amber-100 to-gray-800"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px) brightness(0.9)',
        }}
      />
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Section with Logo and Branding */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-8">
          {/* Logo - Infinity Symbol */}
          <div className="mb-4">
            <svg 
              width="60" 
              height="30" 
              viewBox="0 0 60 30" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M15 15C15 8.37258 20.3726 3 27 3C33.6274 3 39 8.37258 39 15C39 21.6274 33.6274 27 27 27C20.3726 27 15 21.6274 15 15Z"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M45 15C45 8.37258 50.3726 3 57 3C63.6274 3 69 8.37258 69 15C69 21.6274 63.6274 27 57 27C50.3726 27 45 21.6274 45 15Z"
                stroke="white"
                strokeWidth="2"
                fill="none"
                transform="translate(-30, 0)"
              />
              {/* Dots inside loops */}
              <circle cx="24" cy="15" r="2" fill="white" />
              <circle cx="36" cy="15" r="2" fill="white" />
            </svg>
          </div>

          {/* App Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
            Infinite Flow
          </h1>

          {/* Creator Name */}
          <p className="text-sm md:text-base text-white/90 mb-8">
            by Martyna Kondratowicz
          </p>

          {/* Log In Heading */}
          <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mt-8">
            Log In
          </h2>
        </div>

        {/* Bottom Form Section - Dark Gray */}
        <div className="bg-gray-800 px-6 py-8 rounded-t-3xl">
          {/* Error/Success Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'error'
                ? 'bg-red-900/50 text-red-200 border border-red-700'
                : 'bg-green-900/50 text-green-200 border border-green-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Your Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="clara@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 rounded-lg h-12 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 rounded-lg h-12 pr-12 focus:border-blue-400 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Log In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-lg text-base transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-left">
            <p className="text-sm text-white">
              Don't have an account yet?{' '}
              <Link 
                href="/users/sign-up" 
                className="text-white underline hover:text-blue-400 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
