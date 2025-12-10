'use client'

import { use } from 'react'
import { BookBlueprintPanel } from '@/features/books/components/BookBlueprintPanel'
import { useBook } from '@/features/books/hooks/useBooks'
import { LoadingSkeleton } from '@repo/ui/components/ui'
import { EmptyState } from '@repo/ui/components/ui'
import { BookX } from 'lucide-react'

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { book, isLoading } = useBook(id)

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={1} />
  }

  if (!book) {
    return (
      <EmptyState
        icon={BookX}
        title="Livro não encontrado"
        description="O livro que você está procurando não existe ou foi removido."
        action={{
          label: 'Voltar para Meus Livros',
          onClick: () => window.location.href = '/dashboard/books',
        }}
      />
    )
  }

  return <BookBlueprintPanel bookId={id} />
}

