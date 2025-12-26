'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { getCurrentUser, updateUserProfile } from '@/lib/supabase/auth'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

export default function ProfileOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [uid, setUid] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])

  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        if (!userData) {
          router.push('/users/login')
          return
        }
        setUid(userData.uid)
        setDisplayName(userData.display_name || '')
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/users/login')
      } finally {
        setIsLoadingUser(false)
      }
    }
    loadUser()
  }, [router])

  const handleToggleAllergy = (value: string) => {
    setAllergies((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    )
  }

  const handleNext = async () => {
    // Last real step - save data to API
    if (step === 5) {
      if (!uid) {
        setError('User not authenticated')
        return
      }

      setStep(6)
      setIsUpdating(true)
      setError(null)

      try {
        const result = await updateUserProfile(uid, {
          display_name: displayName,
          gender,
          date_of_birth: birthDate || null,
          height: parseFloat(height) || null,
          height_unit: 'cm',
          weight: parseFloat(weight) || null,
          weight_unit: 'kg',
          activity_level: activityLevel,
          dietary_preference: dietaryPreference,
          allergies: allergies.length > 0 ? JSON.stringify(allergies) : null,
        })

        if (!result.success) {
          throw new Error(result.error || 'Failed to update profile')
        }

        setIsUpdating(false)
        setIsUpdated(true)
        setStep(7)
      } catch (error) {
        console.error('Error updating profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to update profile')
        setIsUpdating(false)
        setStep(5)
      }
      return
    }
    setStep((prev) => (Math.min(prev + 1, 7) as Step))
  }

  const handleBack = () => {
    if (step === 1) {
      router.back()
      return
    }
    setStep((prev) => (Math.max(prev - 1, 1) as Step))
  }

  // Redirect after success
  useEffect(() => {
    if (step === 7 && isUpdated) {
      const t = setTimeout(() => {
        router.push('/users/home')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [step, isUpdated, router])

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7EA]">
        <p className="text-[#666]">Loading...</p>
      </div>
    )
  }

  // Simple progress label
  const stepLabelMap: Record<Step, string> = {
    1: 'Complete your Profile',
    2: 'Your Details',
    3: 'Activity Level',
    4: 'Dietary Preference',
    5: 'Allergies',
    6: 'Updating your Profile',
    7: 'Successfully Updated',
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7EA]">
      {/* Header */}
      <header className="px-4 pt-10 pb-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="text-xs text-[#666] underline decoration-[#FF6B35]/60"
        >
          Back
        </button>
        <p className="text-xs text-[#999]">
          Step {Math.min(step, 5)} / 5
        </p>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md bg-[#FFF9ED] border border-[#F1E4CF] rounded-2xl shadow-sm px-6 py-8 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A26A]">
              Onboarding
            </p>
            <h1 className="text-xl font-semibold text-[#7B5A2F]">
              {stepLabelMap[step]}
            </h1>
          </div>

          {step === 1 && (
            <StepProfile displayName={displayName} onChangeDisplayName={setDisplayName} />
          )}

          {step === 2 && (
            <StepDetails
              gender={gender}
              birthDate={birthDate}
              height={height}
              weight={weight}
              onGenderChange={setGender}
              onBirthDateChange={setBirthDate}
              onHeightChange={setHeight}
              onWeightChange={setWeight}
            />
          )}

          {step === 3 && (
            <StepActivityLevel
              activityLevel={activityLevel}
              onChange={setActivityLevel}
            />
          )}

          {step === 4 && (
            <StepDietaryPreference
              dietaryPreference={dietaryPreference}
              onChange={setDietaryPreference}
            />
          )}

          {step === 5 && (
            <StepAllergies
              selectedAllergies={allergies}
              onToggle={handleToggleAllergy}
            />
          )}

          {step === 6 && (
            <UpdatingState isUpdating={isUpdating} />
          )}

          {step === 7 && (
            <UpdatedState isUpdated={isUpdated} />
          )}

          {/* Navigation – hide on loading/success screens */}
          {step <= 5 && (
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleNext}
                className="w-full h-11 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold rounded-full"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StepProfile(props: {
  displayName: string
  onChangeDisplayName: (value: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Avatar placeholder */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-full bg-[#F4E6D6] border border-[#E0CFB7] flex items-center justify-center text-[#C9A26A] text-sm">
          Profile Picture
        </div>
        <button className="text-xs text-[#4A90E2] underline">
          Upload photo (UI only)
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-xs text-[#7B5A2F]">
          What should we call you?
        </Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Enter your name"
          value={props.displayName}
          onChange={(e) => props.onChangeDisplayName(e.target.value)}
          className="h-10 rounded-lg border-[#E0CFB7] bg-white text-sm"
        />
      </div>
    </div>
  )
}

function StepDetails(props: {
  gender: string
  birthDate: string
  height: string
  weight: string
  onGenderChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onHeightChange: (value: string) => void
  onWeightChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gender" className="text-xs text-[#7B5A2F]">
          Your Gender
        </Label>
        <Select value={props.gender} onValueChange={props.onGenderChange}>
          <SelectTrigger id="gender" className="h-10 rounded-lg border-[#E0CFB7] bg-white text-sm">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="na">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-xs text-[#7B5A2F]">
          Your Birthday
        </Label>
        <Input
          id="birthDate"
          type="date"
          value={props.birthDate}
          onChange={(e) => props.onBirthDateChange(e.target.value)}
          className="h-10 rounded-lg border-[#E0CFB7] bg-white text-sm"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="grid grid-cols-[2fr,1fr] gap-3">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-xs text-[#7B5A2F]">
            Height
          </Label>
          <Input
            id="height"
            type="number"
            placeholder="170"
            value={props.height}
            onChange={(e) => props.onHeightChange(e.target.value)}
            className="h-10 rounded-lg border-[#E0CFB7] bg-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-[#7B5A2F]">Unit</Label>
          <div className="h-10 flex items-center rounded-lg border border-[#E0CFB7] bg-white text-xs px-3">
            cm
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr,1fr] gap-3">
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-xs text-[#7B5A2F]">
            Weight
          </Label>
          <Input
            id="weight"
            type="number"
            placeholder="60"
            value={props.weight}
            onChange={(e) => props.onWeightChange(e.target.value)}
            className="h-10 rounded-lg border-[#E0CFB7] bg-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-[#7B5A2F]">Unit</Label>
          <div className="h-10 flex items-center rounded-lg border border-[#E0CFB7] bg-white text-xs px-3">
            kg
          </div>
        </div>
      </div>
    </div>
  )
}

const ACTIVITY_OPTIONS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
] as const

function StepActivityLevel(props: {
  activityLevel: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#7B5A2F]">
        Choose your most accurate activity level
      </p>
      <div className="space-y-2">
        {ACTIVITY_OPTIONS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => props.onChange(label)}
            className={`w-full h-10 rounded-lg border text-sm transition ${
              props.activityLevel === label
                ? 'bg-[#4A90E2] border-[#4A90E2] text-white'
                : 'bg-white border-[#E0CFB7] text-[#7B5A2F]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

const DIET_OPTIONS = [
  'None',
  'Gluten Free',
  'Dairy Free',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
] as const

function StepDietaryPreference(props: {
  dietaryPreference: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#7B5A2F]">
        What type of diet best describes you?
      </p>
      <div className="space-y-2">
        {DIET_OPTIONS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => props.onChange(label)}
            className={`w-full h-10 rounded-lg border text-sm transition ${
              props.dietaryPreference === label
                ? 'bg-[#4A90E2] border-[#4A90E2] text-white'
                : 'bg-white border-[#E0CFB7] text-[#7B5A2F]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

const ALLERGY_OPTIONS = [
  'Peanuts',
  'Eggs',
  'Fish',
  'Seafood',
  'Soy',
  'Milk',
] as const

function StepAllergies(props: {
  selectedAllergies: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#7B5A2F]">
        Any allergies we should know about?
      </p>
      <div className="space-y-3">
        {ALLERGY_OPTIONS.map((label) => (
          <label
            key={label}
            className="flex items-center justify-between rounded-lg border border-[#E0CFB7] bg-white px-3 py-2 text-xs text-[#7B5A2F]"
          >
            <span>{label}</span>
            <Checkbox
              checked={props.selectedAllergies.includes(label)}
              onCheckedChange={() => props.onToggle(label)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function UpdatingState({ isUpdating }: { isUpdating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#4A90E2]/20 border-t-[#4A90E2] animate-spin" />
      <p className="text-sm text-[#7B5A2F]">
        {isUpdating ? 'Updating your profile…' : 'Finishing up…'}
      </p>
    </div>
  )
}

function UpdatedState({ isUpdated }: { isUpdated: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#4A90E2]/20 flex items-center justify-center">
        <span className="text-[#4A90E2] text-xl">✓</span>
      </div>
      <p className="text-sm text-[#7B5A2F]">
        {isUpdated ? 'Profile successfully updated!' : 'Almost done…'}
      </p>
    </div>
  )
}


