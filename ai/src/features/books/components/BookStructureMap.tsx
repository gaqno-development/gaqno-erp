'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookChapters } from '../hooks/useBookChapters'
import { useBookCharacters } from '../hooks/useBookCharacters'
import { ChapterStatus } from '../types/books'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { ScrollArea } from '@repo/ui/components/ui'
import { BookOpen, Users, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'

interface IBookStructureMapProps {
  bookId: string
}

export function BookStructureMap({ bookId }: IBookStructureMapProps) {
  const router = useRouter()
  const { chapters, isLoading: chaptersLoading, createChapter } = useBookChapters(bookId)
  const { characters, isLoading: charactersLoading, createCharacter } = useBookCharacters(bookId)
  const [showChapterDialog, setShowChapterDialog] = useState(false)
  const [showCharacterDialog, setShowCharacterDialog] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [characterDescription, setCharacterDescription] = useState('')

  const handleChapterClick = (chapterId: string) => {
    router.push(`/dashboard/books/${bookId}/chapters?chapter=${chapterId}`)
  }

  const handleCreateChapter = async () => {
    const nextChapterNumber = chapters.length > 0 
      ? Math.max(...chapters.map(c => c.chapter_number)) + 1
      : 1

    const result = await createChapter({
      book_id: bookId,
      chapter_number: nextChapterNumber,
      title: chapterTitle || null,
      content: null,
      status: ChapterStatus.DRAFT,
    })

    if (result.success) {
      setShowChapterDialog(false)
      setChapterTitle('')
    } else {
      alert(`Erro ao criar capítulo: ${result.error}`)
    }
  }

  const handleCreateCharacter = async () => {
    const result = await createCharacter({
      book_id: bookId,
      name: characterName,
      description: characterDescription || null,
    })

    if (result.success) {
      setShowCharacterDialog(false)
      setCharacterName('')
      setCharacterDescription('')
    } else {
      alert(`Erro ao criar personagem: ${result.error}`)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Capítulos
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowChapterDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-20rem)] max-h-[400px]">
            <div className="p-4">
              {chaptersLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : chapters.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nenhum capítulo ainda</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = `/dashboard/books/${bookId}/chapters`}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Ir para Editor
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id)}
                    className="p-2 rounded border hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="text-sm font-medium">
                      {chapter.chapter_number}. {chapter.title || 'Sem título'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {chapter.word_count} palavras
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personagens
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCharacterDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px]">
            <div className="p-4">
              {charactersLoading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : characters.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum personagem ainda</p>
              ) : (
                <div className="space-y-2">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className="p-2 rounded border hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="text-sm font-medium">{character.name}</div>
                      {character.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {character.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showChapterDialog} onOpenChange={setShowChapterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Capítulo</DialogTitle>
            <DialogDescription>
              Adicione um novo capítulo ao seu livro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Título do Capítulo</Label>
              <Input
                id="chapter-title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Ex: A Jornada Começa"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChapterDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateChapter}>
                Criar Capítulo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCharacterDialog} onOpenChange={setShowCharacterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Personagem</DialogTitle>
            <DialogDescription>
              Adicione um novo personagem ao seu livro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="character-name">Nome do Personagem</Label>
              <Input
                id="character-name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="character-description">Descrição</Label>
              <Textarea
                id="character-description"
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                placeholder="Descreva o personagem..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCharacterDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateCharacter}
                disabled={!characterName.trim()}
              >
                Criar Personagem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

