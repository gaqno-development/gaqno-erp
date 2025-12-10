'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { useBookCovers, useBookActiveCover } from '../hooks/useBookCover'
import { useBook } from '../hooks/useBooks'
import { Wand2 } from 'lucide-react'

interface ICoverDesignerProps {
  bookId: string
}

export function CoverDesigner({ bookId }: ICoverDesignerProps) {
  const { book } = useBook(bookId)
  const { cover } = useBookActiveCover(bookId)
  const { createCover, updateCover } = useBookCovers(bookId)
  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState('Autor')

  const handleGenerateAI = async () => {
    const result = await createCover({
      book_id: bookId,
      design_data: {
        title,
        author,
      },
      is_active: true,
    })

    if (result.success) {
      alert('Capa gerada com sucesso!')
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Templates disponíveis em breve</p>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Canvas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              {cover?.image_url ? (
                <img
                  src={cover.image_url}
                  alt={book?.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">Preview da Capa</p>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-sm">{author}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover-title">Título</Label>
              <Input
                id="cover-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover-author">Autor</Label>
              <Input
                id="cover-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerateAI} className="w-full">
              <Wand2 className="h-4 w-4 mr-2" />
              Gerar Capa com IA
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Paleta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Paleta de cores em breve</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

