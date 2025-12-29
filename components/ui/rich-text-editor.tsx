'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter instructions...',
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command)
  }

  return (
    <div className={cn('border rounded-md', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          disabled={disabled}
          className={cn('h-8 w-8 p-0', isCommandActive('bold') && 'bg-muted')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          disabled={disabled}
          className={cn('h-8 w-8 p-0', isCommandActive('italic') && 'bg-muted')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          disabled={disabled}
          className={cn('h-8 w-8 p-0', isCommandActive('underline') && 'bg-muted')}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          'min-h-[200px] p-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'prose prose-sm max-w-none',
          disabled && 'cursor-not-allowed opacity-50',
          isFocused && 'ring-2 ring-ring ring-offset-2',
          '[&:empty:before]:content-[attr(placeholder)] [&:empty:before]:text-muted-foreground [&:empty:before]:pointer-events-none'
        )}
        style={{ whiteSpace: 'pre-wrap' }}
        suppressContentEditableWarning
      />
    </div>
  )
}

