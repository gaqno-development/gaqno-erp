'use client'

import { BookStructureMap } from './BookStructureMap'
import { BlueprintContent } from './BlueprintContent'
import { BlueprintContextPanel } from './BlueprintContextPanel'
import { useBookBlueprint } from '../hooks/useBookBlueprint'
import { useBook } from '../hooks/useBooks'
import { LoadingSkeleton } from '@repo/ui/components/ui'

interface IBookBlueprintPanelProps {
  bookId: string
}

export function BookBlueprintPanel({ bookId }: IBookBlueprintPanelProps) {
  const { book, isLoading: bookLoading } = useBook(bookId)
  const { blueprint, isLoading: blueprintLoading } = useBookBlueprint(bookId)

  if (bookLoading || blueprintLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-0 overflow-hidden max-w-full">
        <div className="md:col-span-3">
          <LoadingSkeleton variant="list" count={3} />
        </div>
        <div className="md:col-span-6">
          <LoadingSkeleton variant="card" count={2} />
        </div>
        <div className="md:col-span-3">
          <LoadingSkeleton variant="card" count={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-0 overflow-hidden max-w-full">
      <div className="md:col-span-3 border-r overflow-y-auto overflow-x-hidden min-h-0 max-h-full hidden md:block">
        <BookStructureMap bookId={bookId} />
      </div>
      <div className="md:col-span-6 col-span-1 overflow-hidden min-h-0 h-full flex flex-col">
        <BlueprintContent bookId={bookId} blueprint={blueprint || null} />
      </div>
      <div className="md:col-span-3 border-l overflow-y-auto overflow-x-hidden min-h-0 max-h-full hidden md:block">
        <BlueprintContextPanel bookId={bookId} />
      </div>
    </div>
  )
}

