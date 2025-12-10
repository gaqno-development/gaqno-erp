'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { BlueprintCard } from './BlueprintCard'
import { BlueprintStructure } from './BlueprintStructure'
import { useBookBlueprint } from '../hooks/useBookBlueprint'
import { useBook } from '../hooks/useBooks'
import { IBookBlueprint } from '../types/books'
import { RefreshCw, Edit } from 'lucide-react'

interface IBlueprintContentProps {
  bookId: string
  blueprint: IBookBlueprint | null
}

export function BlueprintContent({ bookId, blueprint }: IBlueprintContentProps) {
  const { updateBlueprint, createBlueprint, isUpdating, isCreating } = useBookBlueprint(bookId)
  const [isEditing, setIsEditing] = useState(false)
  const { book } = useBook(bookId)

  const handleGenerateBlueprint = async () => {
    const result = await createBlueprint({
      book_id: bookId,
      summary: `Resumo do livro "${book?.title || ''}". ${book?.description || ''}`,
      structure: {
        sections: {
          introdução: {
            name: 'Introdução',
            chapters: [
              { number: 1, title: 'O Início', summary: 'Abertura da história e apresentação dos personagens principais' },
              { number: 2, title: 'O Mundo', summary: 'Estabelecimento do cenário e contexto' },
            ],
          },
          desenvolvimento: {
            name: 'Desenvolvimento',
            chapters: [
              { number: 3, title: 'O Desafio', summary: 'Primeiros obstáculos e desenvolvimento da trama' },
              { number: 4, title: 'As Consequências', summary: 'Desenvolvimento dos conflitos' },
              { number: 5, title: 'A Escalada', summary: 'Intensificação dos problemas' },
            ],
          },
          clímax: {
            name: 'Clímax',
            chapters: [
              { number: 6, title: 'O Confronto', summary: 'Ponto alto da história e resolução dos conflitos principais' },
              { number: 7, title: 'A Revelação', summary: 'Descobertas importantes' },
            ],
          },
          conclusão: {
            name: 'Conclusão',
            chapters: [
              { number: 8, title: 'O Desfecho', summary: 'Resolução final e conclusão da história' },
            ],
          },
        },
        chapters: [
          { number: 1, title: 'O Início', summary: 'Abertura da história e apresentação dos personagens principais' },
          { number: 2, title: 'O Mundo', summary: 'Estabelecimento do cenário e contexto' },
          { number: 3, title: 'O Desafio', summary: 'Primeiros obstáculos e desenvolvimento da trama' },
          { number: 4, title: 'As Consequências', summary: 'Desenvolvimento dos conflitos' },
          { number: 5, title: 'A Escalada', summary: 'Intensificação dos problemas' },
          { number: 6, title: 'O Confronto', summary: 'Ponto alto da história e resolução dos conflitos principais' },
          { number: 7, title: 'A Revelação', summary: 'Descobertas importantes' },
          { number: 8, title: 'O Desfecho', summary: 'Resolução final e conclusão da história' },
        ],
      },
      characters: [],
      context: {
        genre: book?.genre || '',
        style: book?.style || '',
      },
    })

    if (!result.success) {
      alert(`Erro ao gerar blueprint: ${result.error}`)
    }
  }

  if (!blueprint) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Blueprint</CardTitle>
            <CardDescription>Gere a estrutura inicial do seu livro</CardDescription>
          </CardHeader>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">
              O blueprint ainda não foi gerado. Clique no botão abaixo para criar a estrutura inicial do livro.
            </p>
            <Button
              onClick={handleGenerateBlueprint}
              disabled={isCreating}
              size="lg"
            >
              {isCreating ? 'Gerando...' : 'Gerar Blueprint'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 space-y-2 sm:space-y-4 h-full flex flex-col min-h-0 overflow-hidden">
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumo</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BlueprintCard
            content={blueprint.summary || ''}
            isEditing={isEditing}
            onSave={(content) => {
              updateBlueprint(bookId, { summary: content })
              setIsEditing(false)
            }}
          />
        </CardContent>
      </Card>

      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden h-0">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle>Estrutura</CardTitle>
          <CardDescription>Capítulos e organização do livro</CardDescription>
        </CardHeader>
        <CardContent 
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          <BlueprintStructure bookId={bookId} structure={blueprint.structure} />
        </CardContent>
      </Card>
    </div>
  )
}

