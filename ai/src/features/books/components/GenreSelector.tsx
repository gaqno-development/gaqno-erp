'use client'

import { cn } from '@repo/core/lib/utils'
import { Button } from '@repo/ui/components/ui'

const GENRES = [
  { id: 'fiction', label: 'Ficção', color: 'bg-blue-500' },
  { id: 'fantasy', label: 'Fantasia', color: 'bg-purple-500' },
  { id: 'sci-fi', label: 'Ficção Científica', color: 'bg-cyan-500' },
  { id: 'romance', label: 'Romance', color: 'bg-pink-500' },
  { id: 'mystery', label: 'Mistério', color: 'bg-gray-700' },
  { id: 'thriller', label: 'Suspense', color: 'bg-red-600' },
  { id: 'non-fiction', label: 'Não Ficção', color: 'bg-green-600' },
  { id: 'biography', label: 'Biografia', color: 'bg-amber-600' },
  { id: 'history', label: 'História', color: 'bg-orange-600' },
  { id: 'self-help', label: 'Autoajuda', color: 'bg-teal-600' },
]

interface IGenreSelectorProps {
  selectedGenre?: string | null
  onGenreSelect: (genre: string) => void
}

export function GenreSelector({ selectedGenre, onGenreSelect }: IGenreSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Gênero</label>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <Button
            key={genre.id}
            type="button"
            variant={selectedGenre === genre.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGenreSelect(genre.id)}
            className={cn(
              'transition-all',
              selectedGenre === genre.id && 'ring-2 ring-offset-2'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full mr-2', genre.color)} />
            {genre.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

