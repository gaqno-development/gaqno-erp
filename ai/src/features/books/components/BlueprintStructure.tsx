'use client'

import { useMemo, useState } from 'react'
import { useBookChapters } from '../hooks/useBookChapters'
import { useBook } from '../hooks/useBooks'
import { useBookBlueprint } from '../hooks/useBookBlueprint'
import { useBookCharacters } from '../hooks/useBookCharacters'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { ChapterStatus } from '../types/books'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { BookOpen, CheckCircle2, Circle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@repo/core/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/components/ui'
import { calculatePages } from '../utils/pageCalculator'
import { useUIStore } from '@repo/core/store/uiStore'

interface IBlueprintStructureProps {
  bookId: string
  structure: any
}

const SECTION_NAMES: Record<string, string> = {
  'introdução': 'Introdução',
  'introduction': 'Introdução',
  'desenvolvimento': 'Desenvolvimento',
  'development': 'Desenvolvimento',
  'clímax': 'Clímax',
  'climax': 'Clímax',
  'conclusão': 'Conclusão',
  'conclusion': 'Conclusão',
}

export function BlueprintStructure({ bookId, structure }: IBlueprintStructureProps) {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { chapters, createChapter, updateChapter, isCreating } = useBookChapters(bookId)
  const { book } = useBook(bookId)
  const { blueprint } = useBookBlueprint(bookId)
  const { characters } = useBookCharacters(bookId)
  const { addNotification } = useUIStore()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['introdução', 'desenvolvimento', 'clímax', 'conclusão']))
  const [creatingChapterNumber, setCreatingChapterNumber] = useState<number | null>(null)
  const [generatingContent, setGeneratingContent] = useState<number | null>(null)

  const blueprintChapters = structure?.chapters || []
  const blueprintSections = structure?.sections
  const chaptersMap = new Map(chapters.map(c => [c.chapter_number, c]))

  const groupedBySection = useMemo(() => {
    const groups: Record<string, Array<{ chapter: any; index: number; existingChapter?: any }>> = {}

    if (blueprintSections) {
      Object.entries(blueprintSections).forEach(([sectionKey, sectionData]: [string, any]) => {
        const sectionChapters = sectionData.chapters || []
        sectionChapters.forEach((chapter: any, index: number) => {
          const chapterNumber = chapter.number || chapter.chapter_number
          const existingChapter = chaptersMap.get(chapterNumber)
          
          if (!existingChapter) {
            if (!groups[sectionKey]) {
              groups[sectionKey] = []
            }
            groups[sectionKey].push({ chapter, index, existingChapter })
          }
        })
      })
    } else {
      blueprintChapters.forEach((chapter: any, index: number) => {
        const chapterNumber = chapter.number || chapter.chapter_number || index + 1
        const existingChapter = chaptersMap.get(chapterNumber)
        
        if (!existingChapter) {
          let sectionKey = 'outros'
          const titleLower = (chapter.title || '').toLowerCase()
          
          if (titleLower.includes('introdução') || titleLower.includes('introduction') || chapterNumber === 1) {
            sectionKey = 'introdução'
          } else if (titleLower.includes('desenvolvimento') || titleLower.includes('development')) {
            sectionKey = 'desenvolvimento'
          } else if (titleLower.includes('clímax') || titleLower.includes('climax')) {
            sectionKey = 'clímax'
          } else if (titleLower.includes('conclusão') || titleLower.includes('conclusion')) {
            sectionKey = 'conclusão'
          }

          if (!groups[sectionKey]) {
            groups[sectionKey] = []
          }
          groups[sectionKey].push({ chapter, index, existingChapter })
        }
      })
    }

    return groups
  }, [blueprintChapters, blueprintSections, chaptersMap])

  const handleChapterClick = async (chapterNumber: number, chapterData: any) => {
    const existingChapter = chapters.find(c => c.chapter_number === chapterNumber)
    
    if (existingChapter) {
      router.push(`/dashboard/books/${bookId}/chapters?chapter=${existingChapter.id}`)
      return
    }

    setCreatingChapterNumber(chapterNumber)
    
    const result = await createChapter({
      book_id: bookId,
      chapter_number: chapterNumber,
      title: chapterData.title || null,
      content: null,
      status: ChapterStatus.DRAFT,
      notes: chapterData.summary || null,
    })

    setCreatingChapterNumber(null)

    if (!result.success || !result.data) {
      addNotification({
        type: 'error',
        title: 'Erro ao criar capítulo',
        message: result.error || 'Não foi possível criar o capítulo. Tente novamente.',
        duration: 5000,
      })
      return
    }

    const newChapter = result.data

    addNotification({
      type: 'success',
      title: 'Capítulo criado!',
      message: `Capítulo ${chapterNumber} foi criado. Redirecionando para edição...`,
      duration: 2000,
    })

    router.push(`/dashboard/books/${bookId}/chapters?chapter=${newChapter.id}&generate=true`)
  }

  const toggleSection = (section: string) => {
    const newOpen = new Set(openSections)
    if (newOpen.has(section)) {
      newOpen.delete(section)
    } else {
      newOpen.add(section)
    }
    setOpenSections(newOpen)
  }

  if (blueprintChapters.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Nenhum capítulo definido na estrutura
      </div>
    )
  }

  const sectionOrder = ['introdução', 'desenvolvimento', 'clímax', 'conclusão', 'outros']

  return (
    <div className="space-y-3">
      {sectionOrder.map((sectionKey) => {
        const sectionChapters = groupedBySection[sectionKey]
        if (!sectionChapters || sectionChapters.length === 0) return null

        const sectionName = blueprintSections?.[sectionKey]?.name || SECTION_NAMES[sectionKey] || sectionKey
        const isOpen = openSections.has(sectionKey)
        const totalChapters = sectionChapters.length

        return (
          <Collapsible key={sectionKey} open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <CardTitle className="text-sm font-semibold">{sectionName}</CardTitle>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {totalChapters} {totalChapters === 1 ? 'sugestão' : 'sugestões'}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  {sectionChapters.map(({ chapter, index }) => {
                    const chapterNumber = chapter.number || chapter.chapter_number || index + 1
                    const isCreating = creatingChapterNumber === chapterNumber
                    const isGenerating = generatingContent === chapterNumber
                    const isProcessing = isCreating || isGenerating

                    return (
                      <Card
                        key={index}
                        className={cn(
                          'cursor-pointer hover:border-primary transition-colors',
                          isProcessing && 'opacity-50 cursor-wait'
                        )}
                        onClick={() => !isProcessing && handleChapterClick(chapterNumber, chapter)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault()
                            handleChapterClick(chapterNumber, chapter)
                          }
                        }}
                        aria-label={`Criar capítulo ${chapterNumber}: ${chapter.title || 'Sem título'}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {isProcessing ? (
                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  Capítulo {chapterNumber}
                                </span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  Sugestão
                                </span>
                              </div>
                              <div className="text-sm font-medium mt-1">
                                {chapter.title || 'Sem título'}
                              </div>
                              {chapter.summary && !isGenerating && (
                                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {chapter.summary}
                                </div>
                              )}
                              {isGenerating && (
                                <div className="text-xs text-primary mt-1">
                                  Gerando conteúdo considerando capítulo anterior...
                                </div>
                              )}
                            </div>
                            {!isProcessing && (
                              <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}
    </div>
  )
}

