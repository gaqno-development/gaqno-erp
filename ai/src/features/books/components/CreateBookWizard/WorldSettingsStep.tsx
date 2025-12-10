'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { AISuggestionButton } from '../AISuggestionButton'
import { MapPin, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useUIStore } from '@repo/core/store/uiStore'

interface ISetting {
  id: string
  name: string
  description: string
  timeline_summary?: string
}

interface IWorldSettingsStepProps {
  settings: ISetting[]
  onSettingsChange: (settings: ISetting[]) => void
  bookContext?: {
    title?: string
    genre?: string
    description?: string
  }
}

export function WorldSettingsStep({
  settings,
  onSettingsChange,
  bookContext,
}: IWorldSettingsStepProps) {
  const supabase = useSupabaseClient()
  const { addNotification } = useUIStore()
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  const handleAddSetting = () => {
    const newSetting: ISetting = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
    }
    onSettingsChange([...settings, newSetting])
  }

  const handleRemoveSetting = (id: string) => {
    onSettingsChange(settings.filter(s => s.id !== id))
  }

  const handleUpdateSetting = (id: string, field: keyof ISetting, value: string) => {
    onSettingsChange(
      settings.map(s => s.id === id ? { ...s, [field]: value } : s)
    )
  }

  const handleGenerateDescription = async (settingId: string, settingName: string): Promise<string> => {
    setGeneratingFor(settingId)
    try {
      const prompt = `Crie uma descrição detalhada para o cenário "${settingName}" no livro "${bookContext?.title || 'Novo Livro'}" do gênero ${bookContext?.genre || 'ficção'}. A descrição deve incluir características físicas, atmosfera, importância na história.`
      
      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || `Uma descrição detalhada do cenário ${settingName}`
      return typeof generated === 'string' ? generated : JSON.stringify(generated)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar descrição')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateAll = async () => {
    if (!bookContext?.title && !bookContext?.description) {
      addNotification({
        type: 'warning',
        title: 'Informações necessárias',
        message: 'Preencha pelo menos o título ou a premissa do livro antes de gerar cenários.',
        duration: 5000,
      })
      return
    }

    setIsGeneratingAll(true)
    try {
      const prompt = `Baseado no livro "${bookContext?.title || 'Novo Livro'}" ${bookContext?.genre ? `do gênero ${bookContext.genre}` : ''}, ${bookContext?.description ? `com a premissa: ${bookContext.description.substring(0, 200)}` : ''}. Gere 3 a 5 cenários principais onde a história se desenrola. Para cada cenário, forneça: nome, descrição detalhada (características físicas, atmosfera, importância na história) e opcionalmente uma linha do tempo ou contexto histórico.`

      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      // Tentar extrair cenários do blueprint
      const blueprint = data?.blueprint || data
      const context = blueprint?.context || {}
      
      // Verificar múltiplas possibilidades de estrutura
      let settingsArray: any[] = []
      
      // Tentar diferentes caminhos para encontrar os cenários
      if (context.setting && Array.isArray(context.setting)) {
        settingsArray = context.setting
      } else if (context.settings && Array.isArray(context.settings)) {
        settingsArray = context.settings
      } else if (context.locations && Array.isArray(context.locations)) {
        settingsArray = context.locations
      } else if (context.places && Array.isArray(context.places)) {
        settingsArray = context.places
      } else if (Array.isArray(context)) {
        // Se context for diretamente um array
        settingsArray = context
      }
      
      // Se houver cenários no contexto, usar eles
      if (Array.isArray(settingsArray) && settingsArray.length > 0) {
        const newSettings: ISetting[] = settingsArray.map((s: any, idx: number) => {
          // Construir descrição completa incluindo importance se disponível
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
        onSettingsChange(newSettings)
        
        addNotification({
          type: 'success',
          title: 'Cenários gerados!',
          message: `${newSettings.length} cenário(s) foram gerados com sucesso a partir do blueprint. Você pode editá-los conforme necessário.`,
          duration: 3000,
        })
      } else {
        // Fallback: Gerar cenários baseados no summary se não houver settings
        const summary = blueprint?.summary || data?.summary || ''
        if (summary) {
          // Criar 3 cenários genéricos baseados no contexto
          const newSettings: ISetting[] = [
            {
              id: `temp-${Date.now()}-1`,
              name: 'Cenário Principal',
              description: `O cenário principal onde a maior parte da história se desenrola. ${summary.substring(0, 200)}`,
            },
            {
              id: `temp-${Date.now()}-2`,
              name: 'Cenário Secundário',
              description: `Um cenário importante para o desenvolvimento da narrativa.`,
            },
            {
              id: `temp-${Date.now()}-3`,
              name: 'Cenário de Conflito',
              description: `O local onde os principais conflitos da história ocorrem.`,
            },
          ]
          onSettingsChange(newSettings)
          
          addNotification({
            type: 'success',
            title: 'Cenários gerados!',
            message: '3 cenários genéricos foram criados. Você pode editá-los conforme necessário.',
            duration: 3000,
          })
        } else {
          addNotification({
            type: 'warning',
            title: 'Nenhum cenário encontrado',
            message: 'O blueprint não retornou cenários específicos. Adicione cenários manualmente.',
            duration: 5000,
          })
        }
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar cenários',
        message: error.message || 'Não foi possível gerar os cenários automaticamente.',
        duration: 5000,
      })
    } finally {
      setIsGeneratingAll(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h3 className="text-lg font-semibold">Mundo e Ambientação</h3>
          <p className="text-sm text-muted-foreground">
            Defina os cenários principais onde sua história se desenrola
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button
            type="button"
            onClick={handleAddSetting}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cenário
          </Button>
        </div>
      </div>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhum cenário adicionado ainda. Clique em "Adicionar Cenário" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nome do cenário"
                        value={setting.name}
                        onChange={(e) => handleUpdateSetting(setting.id, 'name', e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSetting(setting.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Descrição</Label>
                    <AISuggestionButton
                      onGenerate={() => handleGenerateDescription(setting.id, setting.name || 'Cenário')}
                      onAccept={(suggestion) => handleUpdateSetting(setting.id, 'description', suggestion)}
                      disabled={generatingFor === setting.id || isGeneratingAll || !setting.name}
                    />
                  </div>
                  <Textarea
                    placeholder="Descreva o cenário, sua atmosfera, características físicas e importância na história..."
                    value={setting.description}
                    onChange={(e) => handleUpdateSetting(setting.id, 'description', e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Linha do Tempo (Opcional)</Label>
                  <Textarea
                    placeholder="Resumo histórico ou contexto temporal do cenário..."
                    value={setting.timeline_summary || ''}
                    onChange={(e) => handleUpdateSetting(setting.id, 'timeline_summary', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

