'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Loader2, Sparkles, Check, X, RefreshCw } from 'lucide-react'
import { cn } from '@repo/core/lib/utils'

interface IAISuggestionPopoverProps {
  onGenerate: () => Promise<string>
  onAccept: (suggestion: string) => void
  trigger?: React.ReactNode
  disabled?: boolean
}

export function AISuggestionPopover({
  onGenerate,
  onAccept,
  trigger,
  disabled = false,
}: IAISuggestionPopoverProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await onGenerate()
      setSuggestion(result)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar sugestão')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion)
      setOpen(false)
      setSuggestion(null)
    }
  }

  const handleGenerateAnother = () => {
    setSuggestion(null)
    handleGenerate()
  }

  const handleClose = () => {
    setOpen(false)
    setSuggestion(null)
    setError(null)
  }

  const defaultTrigger = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      disabled={disabled}
    >
      <Sparkles className="h-4 w-4" />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Sugestão com IA</h4>
          </div>

          {!suggestion && !isGenerating && !error && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Clique em "Gerar" para obter uma sugestão da IA.
              </p>
              <Button
                onClick={handleGenerate}
                size="sm"
                className="w-full"
                disabled={disabled}
              >
                Gerar Sugestão
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando sugestão...</p>
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                onClick={handleGenerate}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Tentar Novamente
              </Button>
            </div>
          )}

          {suggestion && !isGenerating && (
            <div className="space-y-3">
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Usar
                </Button>
                <Button
                  onClick={handleGenerateAnother}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Outra
                </Button>
                <Button
                  onClick={handleClose}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

