'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Progress } from '@repo/ui/components/ui'
import { useBooks } from '../hooks/useBooks'
import { useCreateBookWizard } from '../hooks/useCreateBookWizard'
import { BookStatus } from '../types/books'
import { useUIStore } from '@repo/core/store/uiStore'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useAuth } from '@repo/core/contexts/AuthContext'
import { BasicInfoStep } from './CreateBookWizard/BasicInfoStep'
import { WorldSettingsStep } from './CreateBookWizard/WorldSettingsStep'
import { CharactersStep } from './CreateBookWizard/CharactersStep'
import { ItemsStep } from './CreateBookWizard/ItemsStep'
import { ToneStyleStep } from './CreateBookWizard/ToneStyleStep'
import { StructureStep } from './CreateBookWizard/StructureStep'
import { BookSettingsService } from '../services/bookSettingsService'
import { BookItemsService } from '../services/bookItemsService'
import { BookToneStyleService } from '../services/bookToneStyleService'
import { BookService } from '../services/bookService'
import { Save, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const STEP_TITLES = [
  'Informações Básicas',
  'Mundo e Ambientação',
  'Personagens',
  'Itens Importantes',
  'Tom e Estilo',
  'Estrutura Inicial',
]

export function CreateBookWizard() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { user } = useAuth()
  const { createBook, isCreating } = useBooks()
  const { addNotification } = useUIStore()
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingBook, setIsCreatingBook] = useState(false)

  const {
    form,
    currentStep,
    totalSteps,
    settings,
    setSettings,
    characters,
    setCharacters,
    items,
    setItems,
    structure,
    setStructure,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    getProgress,
    saveDraft,
    loadDraft,
    clearDraft,
  } = useCreateBookWizard()

  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  const formValues = form.watch()
  const bookContext = {
    title: formValues.title || undefined,
    genre: selectedGenre || formValues.genre || undefined,
    description: formValues.description || undefined,
  }

  const handleGenerateCompleteBlueprint = async () => {
    if (!formValues.title?.trim() && !formValues.description?.trim()) {
      addNotification({
        type: 'warning',
        title: 'Informações necessárias',
        message: 'Preencha pelo menos o título ou a premissa antes de gerar o blueprint completo.',
        duration: 5000,
      })
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: formValues.title || 'Novo Livro',
          genre: selectedGenre || formValues.genre || 'fiction',
          description: formValues.description || 'Uma história envolvente',
        },
      })

      if (error) throw error

      const blueprint = data?.blueprint || data
      const context = blueprint?.context || {}

      // Preencher Step 1: Informações Básicas
      if (blueprint?.title) {
        form.setValue('title', blueprint.title)
      }
      if (blueprint?.genre) {
        setSelectedGenre(blueprint.genre)
      }
      if (blueprint?.summary || blueprint?.description) {
        form.setValue('description', blueprint.summary || blueprint.description || '')
      }

      // Preencher Step 2: Cenários
      const settingsArray = context.setting || context.settings || []
      if (Array.isArray(settingsArray) && settingsArray.length > 0) {
        const newSettings = settingsArray.map((s: any, idx: number) => {
          let description = s.description || s.summary || ''
          if (s.importance && !description.includes(s.importance)) {
            description += description ? `\n\nImportância: ${s.importance}` : s.importance
          }
          return {
            id: `temp-${Date.now()}-${idx}`,
            name: s.name || `Cenário ${idx + 1}`,
            description: description.trim(),
            timeline_summary: s.timeline_summary || s.timeline || s.historical_context || '',
          }
        })
        setSettings(newSettings)
      }

      // Preencher Step 3: Personagens
      const charactersData = blueprint?.characters || []
      if (Array.isArray(charactersData) && charactersData.length > 0) {
        const newCharacters = charactersData.map((char: any, idx: number) => {
          let description = char.description || char.backstory || char.summary || ''
          const parts: string[] = []
          if (char.personality) parts.push(`Personalidade: ${char.personality}`)
          if (char.motivations) parts.push(`Motivações: ${char.motivations}`)
          if (char.physical_description) parts.push(`Aparência: ${char.physical_description}`)
          if (char.arc) parts.push(`Arco narrativo: ${char.arc}`)
          if (parts.length > 0) {
            description = description ? `${description}\n\n${parts.join('\n')}` : parts.join('\n')
          }
          let role = char.role
          if (!role) {
            const nameLower = (char.name || '').toLowerCase()
            if (nameLower.includes('protagonist') || nameLower.includes('protagonista') || idx === 0) {
              role = 'protagonist'
            } else if (nameLower.includes('antagonist') || nameLower.includes('antagonista') || idx === 1) {
              role = 'antagonist'
            } else {
              role = 'supporting'
            }
          }
          return {
            id: `temp-${Date.now()}-${idx}`,
            name: char.name || `Personagem ${idx + 1}`,
            description: description.trim(),
            role: role,
          }
        })
        setCharacters(newCharacters)
      }

      // Preencher Step 4: Itens
      const itemsArray = context.item || context.items || []
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        const newItems = itemsArray.map((item: any, idx: number) => ({
          id: `temp-${Date.now()}-${idx}`,
          name: item.name || `Item ${idx + 1}`,
          function: item.function || item.narrative_function || item.role || '',
          origin: item.origin || item.source || '',
          relevance: item.relevance || item.importance || item.significance || '',
        }))
        setItems(newItems)
      }

      // Preencher Step 5: Tom e Estilo
      if (context.tone) {
        form.setValue('narrative_tone', context.tone)
      }
      if (context.pacing) {
        form.setValue('pacing', context.pacing)
      }
      if (context.target_audience) {
        form.setValue('target_audience', context.target_audience)
      }
      if (context.central_themes) {
        form.setValue('central_themes', context.central_themes)
      } else if (context.themes && Array.isArray(context.themes)) {
        form.setValue('central_themes', context.themes.join(', '))
      }

      // Preencher Step 6: Estrutura
      const structureData = blueprint?.structure || {}
      if (structureData.plot_summary || structureData.main_conflict || structureData.initial_chapters) {
        setStructure({
          plotSummary: structureData.plot_summary || '',
          initialChapters: structureData.initial_chapters || '',
          mainConflict: structureData.main_conflict || '',
        })
      }

      addNotification({
        type: 'success',
        title: 'Blueprint completo gerado!',
        message: 'Todos os steps foram preenchidos com os dados do blueprint. Você pode navegar entre os steps para revisar e editar.',
        duration: 5000,
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar blueprint',
        message: error.message || 'Não foi possível gerar o blueprint completo.',
        duration: 5000,
      })
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      saveDraft()
      addNotification({
        type: 'success',
        title: 'Rascunho salvo',
        message: 'Seu progresso foi salvo localmente.',
        duration: 3000,
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar rascunho',
        message: error.message || 'Não foi possível salvar o rascunho.',
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateBook = async () => {
    if (!formValues.title?.trim()) {
      addNotification({
        type: 'error',
        title: 'Título obrigatório',
        message: 'O título do livro é obrigatório para criar o livro.',
        duration: 5000,
      })
      return
    }

    setIsCreatingBook(true)

    try {
      if (!user) throw new Error('Usuário não autenticado')

      const bookService = new BookService(supabase)
      const settingsService = new BookSettingsService(supabase)
      const itemsService = new BookItemsService(supabase)
      const toneStyleService = new BookToneStyleService(supabase)

      const bookResult = await bookService.createBook(tenantId, user.id, {
        title: formValues.title,
        genre: selectedGenre || formValues.genre || null,
        description: formValues.description || null,
        style: formValues.narrative_tone || null,
        status: BookStatus.DRAFT,
      })

      const bookId = bookResult.id

      await Promise.all([
        ...settings.map(setting =>
          settingsService.createSetting({
            book_id: bookId,
            name: setting.name,
            description: setting.description || null,
            timeline_summary: setting.timeline_summary || null,
          })
        ),
        ...items.map(item =>
          itemsService.createItem({
            book_id: bookId,
            name: item.name,
            function: item.function || null,
            origin: item.origin || null,
            relevance: item.relevance || null,
          })
        ),
        toneStyleService.createToneStyle({
          book_id: bookId,
          narrative_tone: formValues.narrative_tone || null,
          pacing: formValues.pacing || null,
          target_audience: formValues.target_audience || null,
          central_themes: formValues.central_themes || null,
        }),
        ...characters.map(character =>
          bookService.createCharacter({
            book_id: bookId,
            name: character.name,
            description: character.description || null,
            metadata: character.role ? { role: character.role } : {},
          })
        ),
      ])

      clearDraft()

      addNotification({
        type: 'success',
        title: 'Livro criado com sucesso!',
        message: 'Redirecionando para a página do livro...',
        duration: 3000,
      })

      setTimeout(() => {
        router.push(`/dashboard/books/${bookId}`)
      }, 500)
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao criar livro',
        message: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        duration: 5000,
      })
      setIsCreatingBook(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            onGenreSelect={setSelectedGenre}
            selectedGenre={selectedGenre}
            onGenerateCompleteBlueprint={handleGenerateCompleteBlueprint}
          />
        )
      case 2:
        return (
          <WorldSettingsStep
            settings={settings}
            onSettingsChange={setSettings}
            bookContext={bookContext}
          />
        )
      case 3:
        return (
          <CharactersStep
            characters={characters}
            onCharactersChange={setCharacters}
            bookContext={bookContext}
          />
        )
      case 4:
        return (
          <ItemsStep
            items={items}
            onItemsChange={setItems}
            bookContext={bookContext}
          />
        )
      case 5:
        return (
          <ToneStyleStep
            bookContext={bookContext}
          />
        )
      case 6:
        return (
          <StructureStep
            bookContext={bookContext}
            onStructureChange={setStructure}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Criar Novo Livro</CardTitle>
          <CardDescription>
            Defina os elementos essenciais da sua história. Você pode escrever manualmente ou pedir sugestões da IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Passo {currentStep} de {totalSteps}: {STEP_TITLES[currentStep - 1]}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(getProgress())}%
                </span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>

            <FormProvider {...form}>
              <div className="min-h-[400px]">
                {renderStep()}
              </div>
            </FormProvider>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Rascunho
                    </>
                  )}
                </Button>
                {canGoPrevious && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={previousStep}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canGoNext}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreateBook}
                    disabled={isCreating || isCreatingBook || !canGoNext}
                  >
                    {isCreating || isCreatingBook ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Livro'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
