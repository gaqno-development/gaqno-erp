'use client'

import { useRouter } from 'next/navigation'
import { useBook } from '../hooks/useBooks'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/ui'
import { BookOpen, FileText, Image, Download } from 'lucide-react'

interface IBookNavigationHeaderProps {
  bookId: string
  currentTab: 'blueprint' | 'chapters' | 'cover' | 'export'
}

export function BookNavigationHeader({ bookId, currentTab }: IBookNavigationHeaderProps) {
  const router = useRouter()
  const { book } = useBook(bookId)

  const handleTabChange = (value: string) => {
    const routes: Record<string, string> = {
      blueprint: `/dashboard/books/${bookId}`,
      chapters: `/dashboard/books/${bookId}/chapters`,
      cover: `/dashboard/books/${bookId}/cover`,
      export: `/dashboard/books/${bookId}/export`,
    }

    const route = routes[value]
    if (route) {
      router.push(route)
    }
  }

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{book?.title || 'Carregando...'}</h1>
            {book?.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {book.description}
              </p>
            )}
          </div>
        </div>
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="blueprint">
              <BookOpen className="h-4 w-4 mr-2" />
              Blueprint
            </TabsTrigger>
            <TabsTrigger value="chapters">
              <FileText className="h-4 w-4 mr-2" />
              Capítulos
            </TabsTrigger>
            <TabsTrigger value="cover">
              <Image className="h-4 w-4 mr-2" />
              Capa
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

