'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { AISuggestionButton } from '../AISuggestionButton'
import { Button } from '@repo/ui/components/ui'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useUIStore } from '@repo/core/store/uiStore'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface IToneStyleStepProps {
  bookContext?: {
    title?: string
    genre?: string
    description?: string
  }
}

const TONE_OPTIONS = [
  'leve', 'sombrio', 'épico', 'intimista', 'humorístico', 'dramático', 'misterioso', 'romântico'
]

const PACING_OPTIONS = [
  'rápido', 'contemplativo', 'equilibrado', 'lento', 'intenso', 'meditativo'
]

export function ToneStyleStep({ bookContext }: IToneStyleStepProps) {
  const supabase = useSupabaseClient()
  const { addNotification } = useUIStore()
  const { register, setValue, watch } = useFormContext()
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  const narrativeTone = watch('narrative_tone')
  const pacing = watch('pacing')
  const targetAudience = watch('target_audience')
  const centralThemes = watch('central_themes')

  const handleGenerateTone = async (): Promise<string> => {
    setGeneratingFor('tone')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: `Sugira um tom narrativo apropriado para: ${bookContext?.description || 'um livro'}`,
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || 'equilibrado'
      const tone = typeof generated === 'string' ? generated.substring(0, 50) : 'equilibrado'
      return tone
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar tom')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGeneratePacing = async (): Promise<string> => {
    setGeneratingFor('pacing')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: `Sugira um ritmo narrativo apropriado para: ${bookContext?.description || 'um livro'}`,
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || 'equilibrado'
      const pacing = typeof generated === 'string' ? generated.substring(0, 50) : 'equilibrado'
      return pacing
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar ritmo')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateAudience = async (): Promise<string> => {
    setGeneratingFor('audience')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: `Sugira um público-alvo para: ${bookContext?.description || 'um livro'}`,
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || 'Adultos jovens e adultos'
      return typeof generated === 'string' ? generated.substring(0, 100) : 'Adultos jovens e adultos'
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar público-alvo')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateThemes = async (): Promise<string> => {
    setGeneratingFor('themes')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: `Sugira temas centrais e mensagens para: ${bookContext?.description || 'um livro'}`,
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || 'Temas universais de crescimento e descoberta'
      return typeof generated === 'string' ? generated : JSON.stringify(generated)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar temas')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateAll = async () => {
    if (!bookContext?.title && !bookContext?.description) {
      addNotification({
        type: 'warning',
        title: 'Informações necessárias',
        message: 'Preencha pelo menos o título ou a premissa do livro antes de gerar tom e estilo.',
        duration: 5000,
      })
      return
    }

    setIsGeneratingAll(true)
    try {
      const prompt = `Baseado no livro "${bookContext?.title || 'Novo Livro'}" ${bookContext?.genre ? `do gênero ${bookContext.genre}` : ''}, ${bookContext?.description ? `com a premissa: ${bookContext.description.substring(0, 200)}` : ''}. Gere uma análise completa de tom e estilo narrativo incluindo: tom narrativo (leve, sombrio, épico, etc.), ritmo (rápido, contemplativo, equilibrado, etc.), público-alvo apropriado e temas centrais/mensagens que o livro explora.`

      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      const blueprint = data?.blueprint || data
      const summary = blueprint?.summary || data?.summary || ''
      
      // Extrair informações do summary ou usar valores padrão
      const tone = summary.includes('sombrio') ? 'sombrio' : summary.includes('leve') ? 'leve' : summary.includes('épico') ? 'épico' : 'equilibrado'
      const pacing = summary.includes('rápido') ? 'rápido' : summary.includes('contemplativo') ? 'contemplativo' : 'equilibrado'
      const audience = summary.includes('jovem') ? 'Jovens adultos' : summary.includes('adulto') ? 'Adultos' : 'Público geral'
      const themes = summary || 'Temas universais de crescimento e descoberta'

      setValue('narrative_tone', tone)
      setValue('pacing', pacing)
      setValue('target_audience', audience)
      setValue('central_themes', themes)

      addNotification({
        type: 'success',
        title: 'Tom e estilo gerados!',
        message: 'Todos os campos de tom e estilo foram preenchidos com sucesso.',
        duration: 3000,
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar tom e estilo',
        message: error.message || 'Não foi possível gerar os campos automaticamente.',
        duration: 5000,
      })
    } finally {
      setIsGeneratingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end pb-2 border-b">
        <Button
          type="button"
          onClick={handleGenerateAll}
          disabled={isGeneratingAll || generatingFor !== null}
          variant="outline"
          className="gap-2"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar Tudo com IA
            </>
          )}
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="narrative_tone">Tom Narrativo</Label>
          <AISuggestionButton
            onGenerate={handleGenerateTone}
            onAccept={(suggestion) => setValue('narrative_tone', suggestion)}
            disabled={generatingFor === 'tone' || isGeneratingAll}
          />
        </div>
        <Input
          id="narrative_tone"
          placeholder="Ex: leve, sombrio, épico, intimista..."
          list="tone-options"
          {...register('narrative_tone')}
        />
        <datalist id="tone-options">
          {TONE_OPTIONS.map((tone) => (
            <option key={tone} value={tone} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pacing">Ritmo</Label>
          <AISuggestionButton
            onGenerate={handleGeneratePacing}
            onAccept={(suggestion) => setValue('pacing', suggestion)}
            disabled={generatingFor === 'pacing' || isGeneratingAll}
          />
        </div>
        <Input
          id="pacing"
          placeholder="Ex: rápido, contemplativo, equilibrado..."
          list="pacing-options"
          {...register('pacing')}
        />
        <datalist id="pacing-options">
          {PACING_OPTIONS.map((pace) => (
            <option key={pace} value={pace} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="target_audience">Público Alvo</Label>
          <AISuggestionButton
            onGenerate={handleGenerateAudience}
            onAccept={(suggestion) => setValue('target_audience', suggestion)}
            disabled={generatingFor === 'audience' || isGeneratingAll}
          />
        </div>
        <Input
          id="target_audience"
          placeholder="Ex: Jovens adultos, Adultos, Público geral..."
          {...register('target_audience')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="central_themes">Mensagem / Temas Centrais</Label>
          <AISuggestionButton
            onGenerate={handleGenerateThemes}
            onAccept={(suggestion) => setValue('central_themes', suggestion)}
            disabled={generatingFor === 'themes' || isGeneratingAll}
          />
        </div>
        <Textarea
          id="central_themes"
          placeholder="Quais são os temas centrais, mensagens ou questões que o livro explora?"
          rows={4}
          {...register('central_themes')}
        />
      </div>
    </div>
  )
}

