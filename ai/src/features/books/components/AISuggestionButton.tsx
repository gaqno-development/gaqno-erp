'use client'

import { AISuggestionPopover } from './AISuggestionPopover'
import { Button } from '@repo/ui/components/ui'
import { Sparkles } from 'lucide-react'

interface IAISuggestionButtonProps {
  onGenerate: () => Promise<string>
  onAccept: (suggestion: string) => void
  disabled?: boolean
  size?: 'sm' | 'lg' | 'default' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
}

export function AISuggestionButton({
  onGenerate,
  onAccept,
  disabled = false,
  size = 'sm',
  variant = 'ghost',
}: IAISuggestionButtonProps) {
  return (
    <AISuggestionPopover
      onGenerate={onGenerate}
      onAccept={onAccept}
      disabled={disabled}
      trigger={
        <Button
          type="button"
          variant={variant}
          size={size}
          className="h-8 w-8 p-0"
          disabled={disabled}
          aria-label="Gerar sugestão com IA"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      }
    />
  )
}

