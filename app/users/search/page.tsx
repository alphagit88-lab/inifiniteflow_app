'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
  }

  const handleQuickTag = (value: string) => {
    setQuery(value)
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center gap-2">
        <button type="button" className="text-[#7B5A2F]">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-[#333]">Search</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-16 space-y-4">
        {/* Search bar */}
        <form onSubmit={handleSearch}>
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-full border-[#E0CFB7] bg-white pl-9 text-sm"
            />
            <SearchIcon className="w-4 h-4 text-[#C9A26A] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button
            type="submit"
            className="mt-6 w-full h-10 rounded-lg bg-[#4A90E2] hover:bg-[#3A7BC8] text-white text-sm font-medium"
          >
            Search
          </Button>
        </form>

        {!showResults ? (
          <section className="mt-4 space-y-2">
            <p className="text-xs text-[#999]">Recent</p>
            <div className="flex flex-wrap gap-2">
              <QuickTag onClick={() => handleQuickTag('Breath work Class')}>Breath work Class</QuickTag>
              <QuickTag onClick={() => handleQuickTag('Stability')}>Stability</QuickTag>
              <QuickTag onClick={() => handleQuickTag('Abs')}>Abs</QuickTag>
            </div>
          </section>
        ) : (
          <section className="mt-4 space-y-4">
            <p className="text-xs text-[#999]">
              3 Results for <span className="font-semibold text-[#7B5A2F]">"{query || 'Breath'}"</span>
            </p>
            <div className="space-y-3">
              <SearchResultCard
                title="Slow Breathing"
                subtitle="Breath work Class"
              />
              <SearchResultCard
                title="Slow and Fast Breathing"
                subtitle="Stability Class"
              />
              <SearchResultCard
                title="Breathing for manage Anxiety"
                subtitle="Healthy mind"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function QuickTag({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded-full bg-white border border-[#E0CFB7] text-xs text-[#7B5A2F]"
    >
      {children}
    </button>
  )
}

function SearchResultCard({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <Card className="rounded-xl overflow-hidden border-none bg-white shadow-sm flex gap-3">
      <div
        className="w-20 h-16 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80)',
        }}
      />
      <div className="flex-1 py-2 pr-3 flex flex-col justify-center">
        <p className="text-sm font-semibold text-[#333] leading-snug line-clamp-2">
          {title}
        </p>
        <p className="text-[11px] text-[#999] mt-1">{subtitle}</p>
      </div>
    </Card>
  )
}


