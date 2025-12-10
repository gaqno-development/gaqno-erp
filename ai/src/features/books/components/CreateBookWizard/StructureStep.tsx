'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { AISuggestionButton } from '../AISuggestionButton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/components/ui'
import { ChevronDown, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useUIStore } from '@repo/core/store/uiStore'

interface IStructureStepProps {
  bookContext?: {
    title?: string
    genre?: string
    description?: string
  }
  onStructureChange?: (structure: {
    plotSummary?: string
    initialChapters?: string
    mainConflict?: string
  }) => void
}

export function StructureStep({ bookContext, onStructureChange }: IStructureStepProps) {
  const supabase = useSupabaseClient()
  const { addNotification } = useUIStore()
  const [isOpen, setIsOpen] = useState(false)
  const [plotSummary, setPlotSummary] = useState('')
  const [initialChapters, setInitialChapters] = useState('')
  const [mainConflict, setMainConflict] = useState('')
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  const handleUpdateStructure = () => {
    onStructureChange?.({
      plotSummary,
      initialChapters,
      mainConflict,
    })
  }

  const handleGeneratePlotSummary = async (): Promise<string> => {
    setGeneratingFor('plot')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: bookContext?.description || 'Um livro interessante',
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || 'Um resumo do enredo em 3 atos'
      const summary = typeof generated === 'string' ? generated : JSON.stringify(generated)
      setPlotSummary(summary)
      handleUpdateStructure()
      return summary
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar resumo do enredo')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateChapters = async (): Promise<string> => {
    setGeneratingFor('chapters')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: bookContext?.description || 'Um livro interessante',
        },
      })

      if (error) throw error

      const structure = data?.blueprint?.structure
      if (structure?.chapters) {
        const chaptersText = structure.chapters
          .map((ch: any, idx: number) => `${idx + 1}. ${ch.title || `Capítulo ${ch.number || idx + 1}`}: ${ch.summary || ''}`)
          .join('\n')
        setInitialChapters(chaptersText)
        handleUpdateStructure()
        return chaptersText
      }

      const generated = 'Capítulos iniciais sugeridos'
      setInitialChapters(generated)
      handleUpdateStructure()
      return generated
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar capítulos')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateConflict = async (): Promise<string> => {
    setGeneratingFor('conflict')
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: `Descreva o conflito principal para: ${bookContext?.description || 'um livro'}`,
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || 'O conflito principal da história'
      const conflict = typeof generated === 'string' ? generated : JSON.stringify(generated)
      setMainConflict(conflict)
      handleUpdateStructure()
      return conflict
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar conflito')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateAll = async () => {
    if (!bookContext?.title && !bookContext?.description) {
      addNotification({
        type: 'warning',
        title: 'Informações necessárias',
        message: 'Preencha pelo menos o título ou a premissa do livro antes de gerar a estrutura.',
        duration: 5000,
      })
      return
    }

    setIsGeneratingAll(true)
    try {
      const prompt = `Baseado no livro "${bookContext?.title || 'Novo Livro'}" ${bookContext?.genre ? `do gênero ${bookContext.genre}` : ''}, ${bookContext?.description ? `com a premissa: ${bookContext.description.substring(0, 200)}` : ''}. Gere uma estrutura completa da história incluindo: resumo do enredo em 3 atos (introdução, desenvolvimento, conclusão), lista de capítulos iniciais sugeridos com títulos e resumos, e o conflito principal que impulsiona a narrativa.`

      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      const blueprint = data?.blueprint || data
      const structure = blueprint?.structure || {}
      
      // Preencher resumo do enredo (plot_summary)
      if (structure.plot_summary) {
        setPlotSummary(structure.plot_summary)
      } else {
        const summary = blueprint?.summary || data?.summary || ''
        if (summary) {
          setPlotSummary(summary)
        }
      }

      // Preencher capítulos iniciais
      if (structure.initial_chapters) {
        setInitialChapters(structure.initial_chapters)
      } else if (structure.chapters && Array.isArray(structure.chapters)) {
        const chaptersText = structure.chapters
          .map((ch: any, idx: number) => `${idx + 1}. ${ch.title || `Capítulo ${ch.number || idx + 1}`}: ${ch.summary || ''}`)
          .join('\n')
        setInitialChapters(chaptersText)
      }

      // Preencher conflito principal
      if (structure.main_conflict) {
        setMainConflict(structure.main_conflict)
      } else if (structure.conflict) {
        setMainConflict(structure.conflict)
      } else {
        const summary = blueprint?.summary || data?.summary || ''
        if (summary) {
          setMainConflict(summary.substring(0, 200))
        }
      }

      handleUpdateStructure()

      addNotification({
        type: 'success',
        title: 'Estrutura gerada!',
        message: 'Todos os campos da estrutura foram preenchidos com sucesso.',
        duration: 3000,
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar estrutura',
        message: error.message || 'Não foi possível gerar a estrutura automaticamente.',
        duration: 5000,
      })
    } finally {
      setIsGeneratingAll(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-base">Estrutura Inicial da História (Opcional)</CardTitle>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-end pb-2 border-b">
              <Button
                type="button"
                onClick={handleGenerateAll}
                disabled={isGeneratingAll || generatingFor !== null}
                variant="outline"
                className="gap-2"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar Tudo com IA
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="plot_summary">Resumo do Enredo em 3 Atos</Label>
                <AISuggestionButton
                  onGenerate={handleGeneratePlotSummary}
                  onAccept={(suggestion) => {
                    setPlotSummary(suggestion)
                    handleUpdateStructure()
                  }}
                  disabled={generatingFor === 'plot' || isGeneratingAll}
                />
              </div>
              <Textarea
                id="plot_summary"
                placeholder="Descreva o enredo em três atos: introdução, desenvolvimento e conclusão..."
                value={plotSummary}
                onChange={(e) => {
                  setPlotSummary(e.target.value)
                  handleUpdateStructure()
                }}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="initial_chapters">Capítulos Iniciais Sugeridos</Label>
                <AISuggestionButton
                  onGenerate={handleGenerateChapters}
                  onAccept={(suggestion) => {
                    setInitialChapters(suggestion)
                    handleUpdateStructure()
                  }}
                  disabled={generatingFor === 'chapters' || isGeneratingAll}
                />
              </div>
              <Textarea
                id="initial_chapters"
                placeholder="Lista de capítulos iniciais com títulos e resumos..."
                value={initialChapters}
                onChange={(e) => {
                  setInitialChapters(e.target.value)
                  handleUpdateStructure()
                }}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="main_conflict">Conflito Principal</Label>
                <AISuggestionButton
                  onGenerate={handleGenerateConflict}
                  onAccept={(suggestion) => {
                    setMainConflict(suggestion)
                    handleUpdateStructure()
                  }}
                  disabled={generatingFor === 'conflict' || isGeneratingAll}
                />
              </div>
              <Textarea
                id="main_conflict"
                placeholder="Qual é o conflito central que impulsiona a história?"
                value={mainConflict}
                onChange={(e) => {
                  setMainConflict(e.target.value)
                  handleUpdateStructure()
                }}
                rows={3}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

