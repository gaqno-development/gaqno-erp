'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { GenreSelector } from './GenreSelector'
import { StyleSelector } from './StyleSelector'
import { Button } from '@repo/ui/components/ui'
import { useState } from 'react'

const bookFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  genre: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface IBookFormProps {
  onSubmit: (data: BookFormValues) => void | Promise<void>
  defaultValues?: Partial<BookFormValues>
  isLoading?: boolean
}

export function BookForm({ onSubmit, defaultValues, isLoading }: IBookFormProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(defaultValues?.genre || null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(defaultValues?.style || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      genre: defaultValues?.genre || null,
      description: defaultValues?.description || null,
      style: defaultValues?.style || null,
    },
  })

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre)
    setValue('genre', genre)
  }

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style)
    setValue('style', style)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Livro</Label>
        <Input
          id="title"
          placeholder="Não tem título? Nós criamos para você"
          {...register('title')}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <GenreSelector
        selectedGenre={selectedGenre}
        onGenreSelect={handleGenreSelect}
      />

      <div className="space-y-2">
        <Label htmlFor="description">Descrição ou Prompt Inicial</Label>
        <Textarea
          id="description"
          placeholder="Descreva sua ideia, personagens, enredo ou qualquer informação que ajude a criar o livro..."
          rows={6}
          {...register('description')}
        />
      </div>

      <StyleSelector
        selectedStyle={selectedStyle}
        onStyleSelect={handleStyleSelect}
      />

      <div className="pt-2">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full" 
          disabled={isLoading}
          aria-label={isLoading ? 'Gerando estrutura do livro' : 'Criar livro e gerar estrutura'}
        >
          {isLoading ? (
            <>
              <span className="mr-2">⏳</span>
              Gerando Estrutura...
            </>
          ) : (
            'Gerar Estrutura'
          )}
        </Button>
        {isLoading && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Isso pode levar alguns segundos...
          </p>
        )}
      </div>
    </form>
  )
}

