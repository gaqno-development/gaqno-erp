import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const basicInfoSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  genre: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

const toneStyleSchema = z.object({
  narrative_tone: z.string().optional().nullable(),
  pacing: z.string().optional().nullable(),
  target_audience: z.string().optional().nullable(),
  central_themes: z.string().optional().nullable(),
})

const wizardSchema = basicInfoSchema.merge(toneStyleSchema)

type WizardFormValues = z.infer<typeof wizardSchema>

interface ISetting {
  id: string
  name: string
  description: string
  timeline_summary?: string
}

interface ICharacter {
  id: string
  name: string
  description?: string
  role?: string
}

interface IItem {
  id: string
  name: string
  function?: string
  origin?: string
  relevance?: string
}

interface IStructure {
  plotSummary?: string
  initialChapters?: string
  mainConflict?: string
}

export function useCreateBookWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [settings, setSettings] = useState<ISetting[]>([])
  const [characters, setCharacters] = useState<ICharacter[]>([])
  const [items, setItems] = useState<IItem[]>([])
  const [structure, setStructure] = useState<IStructure>({})

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: '',
      genre: null,
      description: null,
      narrative_tone: null,
      pacing: null,
      target_audience: null,
      central_themes: null,
    },
    mode: 'onChange',
  })

  const totalSteps = 6

  const canGoNext = useCallback(() => {
    if (currentStep === 1) {
      return form.getValues('title')?.trim().length > 0
    }
    return true
  }, [currentStep, form])

  const canGoPrevious = currentStep > 1

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canGoNext()) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps, canGoNext])

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  const getProgress = () => {
    return (currentStep / totalSteps) * 100
  }

  const saveDraft = useCallback(() => {
    const draft = {
      formData: form.getValues(),
      settings,
      characters,
      items,
      structure,
      currentStep,
    }
    localStorage.setItem('book-creation-draft', JSON.stringify(draft))
    return draft
  }, [form, settings, characters, items, structure, currentStep])

  const loadDraft = useCallback(() => {
    const draftStr = localStorage.getItem('book-creation-draft')
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr)
        form.reset(draft.formData || {})
        setSettings(draft.settings || [])
        setCharacters(draft.characters || [])
        setItems(draft.items || [])
        setStructure(draft.structure || {})
        setCurrentStep(draft.currentStep || 1)
        return true
      } catch (e) {
        console.error('Error loading draft:', e)
        return false
      }
    }
    return false
  }, [form])

  const clearDraft = useCallback(() => {
    localStorage.removeItem('book-creation-draft')
    form.reset()
    setSettings([])
    setCharacters([])
    setItems([])
    setStructure({})
    setCurrentStep(1)
  }, [form])

  return {
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
    goToStep,
    canGoNext: canGoNext(),
    canGoPrevious,
    getProgress,
    saveDraft,
    loadDraft,
    clearDraft,
  }
}

