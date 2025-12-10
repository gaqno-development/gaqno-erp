'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { CharacterList } from './CharacterList'
import { ConsistencyAlerts } from './ConsistencyAlerts'
import { useBook, useBooks } from '../hooks/useBooks'
import { useBookChapters } from '../hooks/useBookChapters'
import { formatPageInfo, calculatePages } from '../utils/pageCalculator'
import { BookOpen, FileText, Settings, Save } from 'lucide-react'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { useUIStore } from '@repo/core/store/uiStore'

interface IBlueprintContextPanelProps {
  bookId: string
}

export function BlueprintContextPanel({ bookId }: IBlueprintContextPanelProps) {
  const { book } = useBook(bookId)
  const { chapters } = useBookChapters(bookId)
  const { updateBook } = useBooks()
  const { addNotification } = useUIStore()
  
  const minPagesPerChapter = book?.metadata?.minPagesPerChapter || 5
  const [localMinPages, setLocalMinPages] = useState(5)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setLocalMinPages(book?.metadata?.minPagesPerChapter || 5)
  }, [book?.metadata?.minPagesPerChapter])

  const totalWords = useMemo(() => {
    return chapters.reduce((sum, chapter) => sum + chapter.word_count, 0)
  }, [chapters])

  const totalPages = useMemo(() => {
    return calculatePages(totalWords, book?.genre)
  }, [totalWords, book?.genre])

  const handleSaveMinPages = async () => {
    if (!book) return
    
    setIsSaving(true)
    try {
      const result = await updateBook(bookId, {
        metadata: {
          ...book.metadata,
          minPagesPerChapter: localMinPages,
        },
      })

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Configuração salva',
          message: `Páginas mínimas por capítulo atualizado para ${localMinPages}.`,
          duration: 3000,
        })
      } else {
        throw new Error(result.error || 'Erro ao salvar')
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: error.message || 'Não foi possível salvar a configuração.',
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Estatísticas do Livro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-3">
            <div>
              <span className="font-medium">Gênero:</span> {book?.genre || 'Não definido'}
            </div>
            <div>
              <span className="font-medium">Estilo:</span> {book?.style || 'Não definido'}
            </div>
            <div className="pt-2 border-t">
              <div className="font-medium mb-1">Progresso</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  {chapters.length} capítulos
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {totalWords.toLocaleString()} palavras
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {totalPages} páginas
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="font-medium mb-1">Análise de Páginas</div>
              <div className="text-xs text-muted-foreground">
                {formatPageInfo(totalWords, book?.genre)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações de Capítulos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-pages">Páginas Mínimas por Capítulo</Label>
            <div className="flex gap-2">
              <Input
                id="min-pages"
                type="number"
                min="1"
                max="50"
                value={localMinPages}
                onChange={(e) => setLocalMinPages(Number(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={handleSaveMinPages}
                disabled={isSaving || localMinPages === minPagesPerChapter}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cada capítulo gerado terá pelo menos {localMinPages} páginas (~{localMinPages * 250} palavras)
            </p>
          </div>
        </CardContent>
      </Card>

      <CharacterList bookId={bookId} />

      <ConsistencyAlerts bookId={bookId} />
    </div>
  )
}

