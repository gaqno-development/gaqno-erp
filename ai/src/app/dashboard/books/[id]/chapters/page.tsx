'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChapterList } from '@/features/books/components/ChapterList'
import { ChapterEditor } from '@/features/books/components/ChapterEditor'
import { useBookChapters } from '@/features/books/hooks/useBookChapters'
import { LoadingSkeleton } from '@repo/ui/components/ui'

function ChaptersContent({ bookId }: { bookId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { chapters, isLoading } = useBookChapters(bookId)

  const chapterParam = searchParams.get('chapter')
  const selectedChapterId = chapterParam && chapters.some(c => c.id === chapterParam)
    ? chapterParam
    : chapters.length > 0
    ? chapters[0].id
    : undefined

  useEffect(() => {
    if (chapters.length > 0 && !chapterParam) {
      const firstChapterId = chapters[0].id
      router.replace(`/dashboard/books/${bookId}/chapters?chapter=${firstChapterId}`)
    } else if (chapterParam && !chapters.some(c => c.id === chapterParam) && chapters.length > 0) {
      const firstChapterId = chapters[0].id
      router.replace(`/dashboard/books/${bookId}/chapters?chapter=${firstChapterId}`)
    }
  }, [chapters, chapterParam, bookId, router])

  const handleChapterSelect = (chapterId: string) => {
    router.push(`/dashboard/books/${bookId}/chapters?chapter=${chapterId}`)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <LoadingSkeleton variant="list" count={5} />
        </div>
        <div className="col-span-9">
          <LoadingSkeleton variant="card" count={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
        <div className="md:col-span-3 border-r overflow-y-auto">
          <ChapterList
            bookId={bookId}
            chapters={chapters}
            selectedChapterId={selectedChapterId}
            onChapterSelect={handleChapterSelect}
          />
        </div>
        <div className="md:col-span-9 overflow-y-auto">
          <ChapterEditor bookId={bookId} chapterId={selectedChapterId} />
        </div>
      </div>
    </div>
  )
}

export default function ChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <LoadingSkeleton variant="list" count={5} />
          </div>
          <div className="col-span-9">
            <LoadingSkeleton variant="card" count={1} />
          </div>
        </div>
      }
    >
      <ChaptersContent bookId={id} />
    </Suspense>
  )
}

