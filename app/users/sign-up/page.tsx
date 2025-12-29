'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUpUser, type SignupData } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    nickname: '',
    date_of_birth: '',
    gender: '',
    height: 0,
    height_unit: 'cm',
    weight: 0,
    weight_unit: 'kg',
    activity_level: '',
    dietary_preference: '',
    allergies: [],
  })

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!acceptedTerms) {
      setError('Please accept the Privacy Policy and Terms of Use')
      return
    }
    setError(null)
    setCurrentStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!formData.nickname || !formData.date_of_birth || !formData.gender) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    if (formData.height <= 0 || formData.weight <= 0) {
      setError('Height and weight must be greater than 0')
      setIsLoading(false)
      return
    }

    if (!formData.activity_level || !formData.dietary_preference) {
      setError('Activity level and dietary preference are required')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUpUser(formData)

      if (result.success) {
        router.push('/users/login?signup=success')
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header with back button */}
      <div className="px-4 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="text-[#FF6B35] mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <p className="text-sm text-[#FF6B35] mb-1">Step {currentStep}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
            Create your Account
          </h1>
          {currentStep === 1 && formData.email && (
            <p className="text-sm text-[#FF6B35] mt-2">{formData.email}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 px-4 pb-8">
        {currentStep === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-[#333] text-sm font-medium">
                First Name
              </Label>
              <Input
                id="first_name"
                type="text"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#FF6B35] focus:ring-[#FF6B35]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-[#333] text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#FF6B35] focus:ring-[#FF6B35]"
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#FF6B35] focus:ring-[#FF6B35]"
              />
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#FF6B35] focus:ring-[#FF6B35] pr-12"
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
                <Link href="#" className="text-[#4A90E2] underline">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="#" className="text-[#4A90E2] underline">Term of Use</Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium rounded-lg mt-6"
            >
              Next
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-[#333] text-sm font-medium">
                Nickname *
              </Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Enter your nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white border-gray-300 rounded-lg h-12 text-[#333] placeholder:text-gray-400 focus:border-[#FF6B35] focus:ring-[#FF6B35]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-[#333] text-sm font-medium">
                  Date of Birth *
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                  disabled={isLoading}
                  max={new Date().toISOString().split('T')[0]}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#333] text-sm font-medium">
                  Gender *
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger id="gender" className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-[#333] text-sm font-medium">
                  Height *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={isLoading}
                    min="0"
                    step="0.1"
                    className="flex-1 bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <Select
                    value={formData.height_unit}
                    onValueChange={(value) => setFormData({ ...formData, height_unit: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-20 bg-white border-gray-300 rounded-lg h-12 text-[#333]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-[#333] text-sm font-medium">
                  Weight *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={isLoading}
                    min="0"
                    step="0.1"
                    className="flex-1 bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <Select
                    value={formData.weight_unit}
                    onValueChange={(value) => setFormData({ ...formData, weight_unit: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-20 bg-white border-gray-300 rounded-lg h-12 text-[#333]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_level" className="text-[#333] text-sm font-medium">
                  Activity Level *
                </Label>
                <Select
                  value={formData.activity_level}
                  onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger id="activity_level" className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                    <SelectItem value="Very Active">Very Active</SelectItem>
                    <SelectItem value="Extremely Active">Extremely Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary_preference" className="text-[#333] text-sm font-medium">
                  Dietary Preference *
                </Label>
                <Select
                  value={formData.dietary_preference}
                  onValueChange={(value) => setFormData({ ...formData, dietary_preference: value })}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger id="dietary_preference" className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Omnivore">Omnivore</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                    <SelectItem value="Keto">Keto</SelectItem>
                    <SelectItem value="Paleo">Paleo</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1 h-12 border-gray-300 text-[#333] rounded-lg"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium rounded-lg"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}

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
  )
}
