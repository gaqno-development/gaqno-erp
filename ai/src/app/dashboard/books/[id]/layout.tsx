'use client'

import { use } from 'react'
import { usePathname } from 'next/navigation'
import { BookNavigationHeader } from '@/features/books/components/BookNavigationHeader'
import { Breadcrumbs } from '@repo/ui/components/ui'
import { useBook } from '@/features/books/hooks/useBooks'

type TabType = 'blueprint' | 'chapters' | 'cover' | 'export'

const getCurrentTab = (pathname: string): TabType => {
  if (pathname.endsWith('/chapters')) return 'chapters'
  if (pathname.endsWith('/cover')) return 'cover'
  if (pathname.endsWith('/export')) return 'export'
  return 'blueprint'
}

const getTabLabel = (tab: TabType): string => {
  const labels: Record<TabType, string> = {
    blueprint: 'Blueprint',
    chapters: 'Capítulos',
    cover: 'Capa',
    export: 'Exportar',
  }
  return labels[tab]
}

export default function BookDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const pathname = usePathname()
  const currentTab = getCurrentTab(pathname)
  const { book } = useBook(id)

  const breadcrumbItems = [
    { label: 'Meus Livros', href: '/dashboard/books' },
    {
      label: book?.title || 'Carregando...',
      href: `/dashboard/books/${id}`,
    },
    { label: getTabLabel(currentTab) },
  ]

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden max-h-[calc(100vh-8rem)]">
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 space-y-4 flex-shrink-0">
        <Breadcrumbs items={breadcrumbItems} className="hidden sm:flex" />
        <BookNavigationHeader bookId={id} currentTab={currentTab} />
      </div>
      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6 h-0">
        {children}
      </div>
    </div>
  )
}

