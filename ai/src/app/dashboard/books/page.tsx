'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { CreateBookWizard } from '@/features/books/components/CreateBookWizard'
import { useBooks } from '@/features/books/hooks/useBooks'
import { BookOpen, Plus } from 'lucide-react'
import { EmptyState } from '@repo/ui/components/ui'
import { LoadingSkeleton } from '@repo/ui/components/ui'

export default function BooksPage() {
  const router = useRouter()
  const { books, isLoading } = useBooks()
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (showCreateForm) {
    return <CreateBookWizard />
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Meus Livros</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie e crie seus livros
          </p>
        </div>
        {books.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            aria-label="Criar novo livro"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Livro
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum livro criado ainda"
          description="Comece sua jornada criativa criando seu primeiro livro. Você pode adicionar capítulos, personagens e muito mais."
          action={{
            label: 'Criar Primeiro Livro',
            onClick: () => setShowCreateForm(true),
            icon: Plus,
          }}
          size="lg"
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200"
              onClick={() => router.push(`/dashboard/books/${book.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(`/dashboard/books/${book.id}`)
                }
              }}
              aria-label={`Abrir livro ${book.title}`}
            >
              <CardHeader>
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-2 mt-2">
                  {book.genre && (
                    <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md">
                      {book.genre}
                    </span>
                  )}
                  {book.status && (
                    <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md">
                      {book.status}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {book.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

