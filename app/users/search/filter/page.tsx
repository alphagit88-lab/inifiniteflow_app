'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function SearchFilterPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <button type="button" className="flex items-center text-[#7B5A2F] text-sm gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-sm font-semibold text-[#333]">Filter</h1>
        <button type="button" className="text-xs text-[#4A90E2] font-medium">
          Apply
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-16 space-y-6">
        {/* Level */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-[#7B5A2F]">Level</h2>
          <FilterCheckbox label="Beginner" checked={false} />
          <FilterCheckbox label="Intermediate" checked={false} />
          <FilterCheckbox label="Experienced" checked />
        </section>

        {/* Class type */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-[#7B5A2F]">Class Type</h2>
          <FilterCheckbox label="Step by Step" checked />
          <FilterCheckbox label="Dopamine boost" checked={false} />
          <FilterCheckbox label="Slow to hard" checked={false} />
        </section>

        {/* Equipment */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-[#7B5A2F]">Equipment</h2>
          <FilterCheckbox label="Yoga Mat" checked />
          <FilterCheckbox label="Foam Roller" checked={false} />
          <FilterCheckbox label="Resistance bands" checked={false} />
        </section>
      </main>

      <footer className="px-4 pb-6">
        <Button className="w-full h-10 rounded-lg bg-[#4A90E2] hover:bg-[#3A7BC8] text-white text-sm font-medium">
          Apply Filter
        </Button>
      </footer>
    </div>
  )
}

function FilterCheckbox({ label, checked }: { label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-3 text-xs text-[#7B5A2F]">
      <Checkbox checked={checked} className="border-[#D9C8B4]" />
      <Label className="text-xs text-[#7B5A2F]">{label}</Label>
    </label>
  )
}


