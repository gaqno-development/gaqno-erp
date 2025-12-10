'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { GenreSelector } from '../GenreSelector'
import { AISuggestionButton } from '../AISuggestionButton'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useUIStore } from '@repo/core/store/uiStore'

interface IBasicInfoStepProps {
  onGenreSelect: (genre: string) => void
  selectedGenre?: string | null
  onGenerateCompleteBlueprint?: () => Promise<void>
}

export function BasicInfoStep({ onGenreSelect, selectedGenre, onGenerateCompleteBlueprint }: IBasicInfoStepProps) {
  const supabase = useSupabaseClient()
  const { addNotification } = useUIStore()
  const { register, setValue, watch, formState: { errors } } = useFormContext()
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [isGeneratingPremise, setIsGeneratingPremise] = useState(false)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  const title = watch('title')
  const description = watch('description')

  const handleGenerateTitle = async (): Promise<string> => {
    setIsGeneratingTitle(true)
    try {
      const genre = selectedGenre || undefined
      const premise = description?.trim() || undefined
      
      // Construir prompt contextual baseado no que o usuário já preencheu
      let prompt = 'Gere um título criativo e atraente para um livro'
      
      if (genre) {
        const genreLabels: Record<string, string> = {
          'fiction': 'de ficção',
          'fantasy': 'de fantasia',
          'sci-fi': 'de ficção científica',
          'romance': 'de romance',
          'mystery': 'de mistério',
          'thriller': 'de suspense',
          'non-fiction': 'de não ficção',
          'biography': 'biográfico',
          'history': 'histórico',
          'self-help': 'de autoajuda',
        }
        prompt += ` ${genreLabels[genre] || `do gênero ${genre}`}`
      }
      
      if (premise) {
        prompt += `. A premissa do livro é: ${premise.substring(0, 300)}`
      }
      
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: prompt,
          genre: genre || 'fiction',
          description: premise || 'Uma história envolvente',
        },
      })

      if (error) throw error

      const generatedTitle = data?.blueprint?.title || data?.title || 'Título Sugerido'
      return typeof generatedTitle === 'string' ? generatedTitle : JSON.stringify(generatedTitle)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar título')
    } finally {
      setIsGeneratingTitle(false)
    }
  }

  const handleGeneratePremise = async (): Promise<string> => {
    setIsGeneratingPremise(true)
    try {
      const bookTitle = title?.trim() || undefined
      const genre = selectedGenre || undefined
      
      // Construir prompt contextual baseado no que o usuário já preencheu
      let prompt = 'Gere uma premissa ou sinopse curta e envolvente para um livro'
      
      if (bookTitle) {
        prompt += ` intitulado "${bookTitle}"`
      }
      
      if (genre) {
        const genreLabels: Record<string, string> = {
          'fiction': 'de ficção',
          'fantasy': 'de fantasia',
          'sci-fi': 'de ficção científica',
          'romance': 'de romance',
          'mystery': 'de mistério',
          'thriller': 'de suspense',
          'non-fiction': 'de não ficção',
          'biography': 'biográfico',
          'history': 'histórico',
          'self-help': 'de autoajuda',
        }
        prompt += ` ${genreLabels[genre] || `do gênero ${genre}`}`
      }
      
      prompt += '. A premissa deve incluir os elementos principais da história, personagens principais e o conflito central.'
      
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookTitle || 'Novo Livro',
          genre: genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      const generatedPremise = data?.blueprint?.summary || data?.summary || description || 'Uma premissa interessante para o livro'
      return typeof generatedPremise === 'string' ? generatedPremise : JSON.stringify(generatedPremise)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar premissa')
    } finally {
      setIsGeneratingPremise(false)
    }
  }

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true)
    try {
      // Se houver função para gerar blueprint completo, usar ela
      if (onGenerateCompleteBlueprint) {
        await onGenerateCompleteBlueprint()
        addNotification({
          type: 'success',
          title: 'Blueprint completo gerado!',
          message: 'Todos os steps foram preenchidos com sucesso. Navegue pelos steps para revisar.',
          duration: 5000,
        })
      } else {
        // Fallback: gerar apenas informações básicas
        const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
          body: {
            title: 'Gere um livro completo com título, gênero e premissa envolvente',
            genre: 'fiction',
            description: 'Crie uma ideia original e criativa para um livro, incluindo título atraente, gênero apropriado e uma premissa detalhada.',
          },
        })

        if (error) throw error

        const blueprint = data?.blueprint || data
        
        if (blueprint?.title) {
          const generatedTitle = typeof blueprint.title === 'string' ? blueprint.title : JSON.stringify(blueprint.title)
          setValue('title', generatedTitle)
        }

        if (blueprint?.genre || data?.genre) {
          const genre = blueprint?.genre || data?.genre
          if (typeof genre === 'string') {
            onGenreSelect(genre)
          }
        }

        if (blueprint?.summary || blueprint?.description || data?.summary) {
          const generatedPremise = blueprint?.summary || blueprint?.description || data?.summary
          const premise = typeof generatedPremise === 'string' ? generatedPremise : JSON.stringify(generatedPremise)
          setValue('description', premise)
        }

        addNotification({
          type: 'success',
          title: 'Campos preenchidos!',
          message: 'Título, gênero e premissa foram gerados com sucesso.',
          duration: 3000,
        })
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar',
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
          disabled={isGeneratingAll || isGeneratingTitle || isGeneratingPremise}
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
          <Label htmlFor="title">Título do Livro</Label>
          <AISuggestionButton
            onGenerate={handleGenerateTitle}
            onAccept={(suggestion) => setValue('title', suggestion)}
            disabled={isGeneratingTitle || isGeneratingAll}
          />
        </div>
        <Input
          id="title"
          placeholder="Ex: A Jornada do Herói"
          {...register('title', { required: 'Título é obrigatório' })}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message as string}</p>
        )}
      </div>

      <GenreSelector
        selectedGenre={selectedGenre}
        onGenreSelect={onGenreSelect}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Premissa / Sinopse Curta</Label>
          <AISuggestionButton
            onGenerate={handleGeneratePremise}
            onAccept={(suggestion) => setValue('description', suggestion)}
            disabled={isGeneratingPremise || isGeneratingAll}
          />
        </div>
        <Textarea
          id="description"
          placeholder="Descreva a ideia central do seu livro, os personagens principais, o conflito ou qualquer informação que ajude a criar o livro..."
          rows={6}
          {...register('description')}
        />
      </div>
    </div>
  )
}

