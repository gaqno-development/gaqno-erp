'use client'

import { IBookChapter } from '../types/books'
import { Card, CardContent } from '@repo/ui/components/ui'
import { cn } from '@repo/core/lib/utils'
import { useBook } from '../hooks/useBooks'
import { calculatePages } from '../utils/pageCalculator'

interface IChapterListProps {
  bookId: string
  chapters: IBookChapter[]
  selectedChapterId?: string
  onChapterSelect: (chapterId: string) => void
}

export function ChapterList({ bookId, chapters, selectedChapterId, onChapterSelect }: IChapterListProps) {
  const { book } = useBook(bookId)

  return (
    <div className="p-4 space-y-2">
      {chapters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum capítulo ainda</p>
          </CardContent>
        </Card>
      ) : (
        chapters.map((chapter) => {
          const chapterPages = calculatePages(chapter.word_count, book?.genre)
          return (
            <Card
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={cn(
                'cursor-pointer hover:border-primary transition-colors',
                'p-3',
                selectedChapterId === chapter.id && 'border-primary bg-primary/5'
              )}
            >
              <div className="text-sm font-medium">
                {chapter.chapter_number}. {chapter.title || 'Sem título'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {chapter.word_count} palavras • {chapterPages} páginas • {chapter.status}
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}

