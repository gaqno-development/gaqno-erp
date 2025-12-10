'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { useBook } from '../hooks/useBooks'
import { useBookActiveCover } from '../hooks/useBookCover'
import { BookOpen } from 'lucide-react'

interface IExportPreviewProps {
  bookId: string
}

export function ExportPreview({ bookId }: IExportPreviewProps) {
  const { book } = useBook(bookId)
  const { cover } = useBookActiveCover(bookId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview do Livro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
            {cover?.image_url ? (
              <img
                src={cover.image_url}
                alt={book?.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{book?.title}</h3>
            {book?.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

