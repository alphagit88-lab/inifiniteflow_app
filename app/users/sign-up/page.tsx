'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabaseClient'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Check email availability with debounce
  useEffect(() => {
    if (!email) {
      setEmailAvailable(null)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingEmail(true)
      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
        const data = await response.json()
        setEmailAvailable(data.is_available)
      } catch (err) {
        console.error('Error checking email:', err)
        setEmailAvailable(null)
      } finally {
        setIsCheckingEmail(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!email || !password || !confirmPassword || !displayName) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the Privacy Policy and Terms of Use')
      setIsLoading(false)
      return
    }

    if (emailAvailable === false) {
      setError('This email is already registered')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          display_name: displayName.trim(),
          provider: 'email',
          provider_type: 'local',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Sign in the user after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        // Account created but sign-in failed, redirect to login
        router.push('/users/login?signup=success')
        return
      }

      // Success - redirect to dashboard or next step
      router.push('/users/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/users/dashboard`,
        },
      })

      if (error) {
        setError(error.message || 'Failed to sign up with Google')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Background Image with Overlay */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-linear-to-b from-[#F5F5F0] via-[#F5F5F0]/95 to-[#F5F5F0] z-0" />
        <div className="relative z-10 w-full max-w-md">
          {/* Form Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#333] mb-2">Sign Up</h1>
              <p className="text-sm text-gray-600">Create your account to get started</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Email Availability Indicator */}
            {email && emailAvailable !== null && !isCheckingEmail && (
              <div
                className={`p-2 rounded-lg text-sm ${
                  emailAvailable
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {emailAvailable ? '✓ Email is available' : '✗ Email is already registered'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-[#333] text-sm font-medium">
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#4A90E2] focus:ring-[#4A90E2]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#333] text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#4A90E2] focus:ring-[#4A90E2]"
                />
                {isCheckingEmail && (
                  <p className="text-xs text-gray-500">Checking email availability...</p>
                )}
              </div>

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
                    minLength={6}
                    className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#4A90E2] focus:ring-[#4A90E2] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-[#333] text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#4A90E2] focus:ring-[#4A90E2] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                />
                <Label htmlFor="terms" className="text-xs text-[#666] leading-relaxed cursor-pointer">
                  By continuing you accept our{' '}
                  <Link href="#" className="text-[#4A90E2] underline">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-[#4A90E2] underline">
                    Terms of Use
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || emailAvailable === false}
                className="w-full h-12 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/90 text-gray-500">Or</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 border-gray-300 text-[#333] rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#666]">
                Already have an account?{' '}
                <Link href="/users/login" className="text-[#4A90E2] font-medium underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
