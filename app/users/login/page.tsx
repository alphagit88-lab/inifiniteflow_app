'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabaseClient'

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Invalid email or password',
        })
        setIsLoading(false)
        return
      }

      // Set the session in Supabase client
      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
        }
      }

      setMessage({
        type: 'success',
        text: 'Sign in successful! Redirecting...',
      })
      setEmail('')
      setPassword('')

      setTimeout(() => {
        router.push('/users/dashboard')
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
      {/* Header with Sign Up button */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-end p-4 md:p-6">
        <Link href="/users/sign-up">
          <Button
            variant="ghost"
            className="text-white hover:text-white/80 hover:bg-white/10 font-medium"
          >
            Sign Up
          </Button>
        </Link>
      </div>

      {/* Background Image Section */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80)',
        }}
      />

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Section with Logo and Branding */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-8">
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
          <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mt-8 mb-6">
            Log In
          </h2>
        </div>

        {/* Bottom Form Section */}
        <div className="bg-white/95 backdrop-blur-sm px-6 py-8 rounded-t-3xl shadow-2xl">
          {/* Error/Success Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333] text-sm font-medium">
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
                className="bg-white border-gray-300 text-[#333] placeholder:text-gray-400 rounded-lg h-12 focus:border-[#4A90E2] focus:ring-[#4A90E2]"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#333] text-sm font-medium">
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
                  className="bg-white border-gray-300 text-[#333] placeholder:text-gray-400 rounded-lg h-12 pr-12 focus:border-[#4A90E2] focus:ring-[#4A90E2]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Log In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-bold rounded-lg text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#666]">
              Don't have an account yet?{' '}
              <Link href="/users/sign-up" className="text-[#4A90E2] underline hover:text-[#3A7BC8] transition-colors">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
