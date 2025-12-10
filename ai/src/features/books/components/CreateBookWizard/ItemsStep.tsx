'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { AISuggestionButton } from '../AISuggestionButton'
import { Package, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useUIStore } from '@repo/core/store/uiStore'

interface IItem {
  id: string
  name: string
  function?: string
  origin?: string
  relevance?: string
}

interface IItemsStepProps {
  items: IItem[]
  onItemsChange: (items: IItem[]) => void
  bookContext?: {
    title?: string
    genre?: string
    description?: string
  }
}

export function ItemsStep({
  items,
  onItemsChange,
  bookContext,
}: IItemsStepProps) {
  const supabase = useSupabaseClient()
  const { addNotification } = useUIStore()
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  const handleAddItem = () => {
    const newItem: IItem = {
      id: `temp-${Date.now()}`,
      name: '',
      function: '',
      origin: '',
      relevance: '',
    }
    onItemsChange([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter(i => i.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof IItem, value: string) => {
    onItemsChange(
      items.map(i => i.id === id ? { ...i, [field]: value } : i)
    )
  }

  const handleGenerateItemDetails = async (itemId: string, field: 'function' | 'origin' | 'relevance', itemName: string): Promise<string> => {
    setGeneratingFor(`${itemId}-${field}`)
    try {
      const prompts: Record<string, string> = {
        function: `Descreva a função narrativa do objeto "${itemName}" no livro "${bookContext?.title || 'Novo Livro'}"`,
        origin: `Descreva a origem do objeto "${itemName}" no livro "${bookContext?.title || 'Novo Livro'}"`,
        relevance: `Explique a relevância do objeto "${itemName}" para a história do livro "${bookContext?.title || 'Novo Livro'}"`,
      }

      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompts[field],
        },
      })

      if (error) throw error

      const generated = data?.blueprint?.summary || data?.summary || `Detalhes sobre ${field} do objeto ${itemName}`
      return typeof generated === 'string' ? generated : JSON.stringify(generated)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar detalhes')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateAll = async () => {
    if (!bookContext?.title && !bookContext?.description) {
      addNotification({
        type: 'warning',
        title: 'Informações necessárias',
        message: 'Preencha pelo menos o título ou a premissa do livro antes de gerar itens.',
        duration: 5000,
      })
      return
    }

    setIsGeneratingAll(true)
    try {
      const prompt = `Baseado no livro "${bookContext?.title || 'Novo Livro'}" ${bookContext?.genre ? `do gênero ${bookContext.genre}` : ''}, ${bookContext?.description ? `com a premissa: ${bookContext.description.substring(0, 200)}` : ''}. Gere 2 a 4 itens, objetos ou artefatos importantes para a história. Para cada item, forneça: nome, função narrativa, origem e relevância para a história.`

      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      const blueprint = data?.blueprint || data
      const context = blueprint?.context || {}
      
      // Tentar extrair itens do contexto (verificar tanto 'item' singular quanto 'items' plural)
      const itemsArray = context.item || context.items || []
      
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        const newItems: IItem[] = itemsArray.map((item: any, idx: number) => ({
          id: `temp-${Date.now()}-${idx}`,
          name: item.name || `Item ${idx + 1}`,
          function: item.function || item.narrative_function || item.role || '',
          origin: item.origin || item.source || '',
          relevance: item.relevance || item.importance || item.significance || '',
        }))
        onItemsChange(newItems)
      } else {
        // Criar itens básicos se não houver no blueprint
        const newItems: IItem[] = [
          {
            id: `temp-${Date.now()}-1`,
            name: 'Artefato Principal',
            function: 'Elemento central da narrativa',
            origin: 'Origem misteriosa ou importante',
            relevance: 'Crucial para o desenvolvimento da história',
          },
          {
            id: `temp-${Date.now()}-2`,
            name: 'Objeto de Poder',
            function: 'Concede habilidades ou poderes especiais',
            origin: 'Criado ou descoberto pelos personagens',
            relevance: 'Importante para resolver conflitos',
          },
        ]
        onItemsChange(newItems)
      }

      addNotification({
        type: 'success',
        title: 'Itens gerados!',
        message: 'Os itens importantes foram gerados com sucesso. Você pode editá-los conforme necessário.',
        duration: 3000,
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar itens',
        message: error.message || 'Não foi possível gerar os itens automaticamente.',
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
          <h3 className="text-lg font-semibold">Itens Importantes</h3>
          <p className="text-sm text-muted-foreground">
            Objetos, artefatos ou elementos importantes na história
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
            onClick={handleAddItem}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhum item adicionado ainda. Clique em "Adicionar Item" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nome do item"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Função Narrativa</Label>
                    <AISuggestionButton
                      onGenerate={() => handleGenerateItemDetails(item.id, 'function', item.name || 'Item')}
                      onAccept={(suggestion) => handleUpdateItem(item.id, 'function', suggestion)}
                      disabled={generatingFor === `${item.id}-function` || isGeneratingAll || !item.name}
                    />
                  </div>
                  <Textarea
                    placeholder="Qual a função deste item na narrativa?"
                    value={item.function || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'function', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Origem</Label>
                    <AISuggestionButton
                      onGenerate={() => handleGenerateItemDetails(item.id, 'origin', item.name || 'Item')}
                      onAccept={(suggestion) => handleUpdateItem(item.id, 'origin', suggestion)}
                      disabled={generatingFor === `${item.id}-origin` || isGeneratingAll || !item.name}
                    />
                  </div>
                  <Textarea
                    placeholder="De onde vem este item? Como foi criado ou obtido?"
                    value={item.origin || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'origin', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Relevância</Label>
                    <AISuggestionButton
                      onGenerate={() => handleGenerateItemDetails(item.id, 'relevance', item.name || 'Item')}
                      onAccept={(suggestion) => handleUpdateItem(item.id, 'relevance', suggestion)}
                      disabled={generatingFor === `${item.id}-relevance` || isGeneratingAll || !item.name}
                    />
                  </div>
                  <Textarea
                    placeholder="Por que este item é importante para a história?"
                    value={item.relevance || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'relevance', e.target.value)}
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

