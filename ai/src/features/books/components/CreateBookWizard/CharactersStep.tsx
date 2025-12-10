'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { AISuggestionButton } from '../AISuggestionButton'
import { User, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useUIStore } from '@repo/core/store/uiStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui'

interface ICharacter {
  id: string
  name: string
  description?: string
  role?: string
}

interface ICharactersStepProps {
  characters: ICharacter[]
  onCharactersChange: (characters: ICharacter[]) => void
  bookContext?: {
    title?: string
    genre?: string
    description?: string
  }
}

const CHARACTER_ROLES = [
  { value: 'protagonist', label: 'Protagonista' },
  { value: 'antagonist', label: 'Antagonista' },
  { value: 'supporting', label: 'Coadjuvante' },
  { value: 'minor', label: 'Secundário' },
]

export function CharactersStep({
  characters,
  onCharactersChange,
  bookContext,
}: ICharactersStepProps) {
  const supabase = useSupabaseClient()
  const { addNotification } = useUIStore()
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  const handleAddCharacter = () => {
    const newCharacter: ICharacter = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      role: 'supporting',
    }
    onCharactersChange([...characters, newCharacter])
  }

  const handleRemoveCharacter = (id: string) => {
    onCharactersChange(characters.filter(c => c.id !== id))
  }

  const handleUpdateCharacter = (id: string, field: keyof ICharacter, value: string) => {
    onCharactersChange(
      characters.map(c => c.id === id ? { ...c, [field]: value } : c)
    )
  }

  const handleGenerateCharacterDetails = async (characterId: string, characterName: string): Promise<string> => {
    setGeneratingFor(characterId)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-character', {
        body: {
          name: characterName,
          description: characters.find(c => c.id === characterId)?.description || undefined,
          bookContext: {
            title: bookContext?.title || 'Novo Livro',
            genre: bookContext?.genre || undefined,
            style: undefined,
            summary: bookContext?.description || undefined,
          },
        },
      })

      if (error) throw error

      if (data?.characterDetails) {
        const details = data.characterDetails
        const description = [
          details.backstory ? `Backstory: ${details.backstory}` : '',
          details.traits?.physical?.length ? `Traits: ${details.traits.physical.join(', ')}` : '',
        ].filter(Boolean).join('\n\n')
        return description || characterName
      }

      return characterName
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao gerar detalhes do personagem')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateAll = async () => {
    if (!bookContext?.title && !bookContext?.description) {
      addNotification({
        type: 'warning',
        title: 'Informações necessárias',
        message: 'Preencha pelo menos o título ou a premissa do livro antes de gerar personagens.',
        duration: 5000,
      })
      return
    }

    setIsGeneratingAll(true)
    try {
      const prompt = `Baseado no livro "${bookContext?.title || 'Novo Livro'}" ${bookContext?.genre ? `do gênero ${bookContext.genre}` : ''}, ${bookContext?.description ? `com a premissa: ${bookContext.description.substring(0, 200)}` : ''}. Gere um elenco inicial de 3 a 5 personagens principais. Para cada personagem, forneça: nome, papel na história (protagonista, antagonista, coadjuvante, secundário), descrição física, personalidade, motivações e arco narrativo inicial.`

      const { data, error } = await supabase.functions.invoke('generate-book-blueprint', {
        body: {
          title: bookContext?.title || 'Novo Livro',
          genre: bookContext?.genre || 'fiction',
          description: prompt,
        },
      })

      if (error) throw error

      const blueprint = data?.blueprint || data
      const charactersData = blueprint?.characters || []
      
      if (Array.isArray(charactersData) && charactersData.length > 0) {
        const newCharacters: ICharacter[] = charactersData.map((char: any, idx: number) => {
          // Construir descrição completa com todas as informações disponíveis
          let description = char.description || char.backstory || char.summary || ''
          
          // Adicionar informações adicionais se disponíveis
          const parts: string[] = []
          if (char.personality) parts.push(`Personalidade: ${char.personality}`)
          if (char.motivations) parts.push(`Motivações: ${char.motivations}`)
          if (char.physical_description) parts.push(`Aparência: ${char.physical_description}`)
          if (char.arc) parts.push(`Arco narrativo: ${char.arc}`)
          
          if (parts.length > 0) {
            description = description ? `${description}\n\n${parts.join('\n')}` : parts.join('\n')
          }
          
          // Determinar papel baseado em role ou nome
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
        onCharactersChange(newCharacters)
      } else {
        // Criar personagens básicos se não houver no blueprint
        const newCharacters: ICharacter[] = [
          {
            id: `temp-${Date.now()}-1`,
            name: 'Protagonista',
            description: 'O personagem principal da história.',
            role: 'protagonist',
          },
          {
            id: `temp-${Date.now()}-2`,
            name: 'Antagonista',
            description: 'O personagem que se opõe ao protagonista.',
            role: 'antagonist',
          },
          {
            id: `temp-${Date.now()}-3`,
            name: 'Coadjuvante',
            description: 'Um personagem importante que apoia o protagonista.',
            role: 'supporting',
          },
        ]
        onCharactersChange(newCharacters)
      }

      addNotification({
        type: 'success',
        title: 'Personagens gerados!',
        message: 'O elenco inicial foi gerado com sucesso. Você pode editá-los conforme necessário.',
        duration: 3000,
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar personagens',
        message: error.message || 'Não foi possível gerar os personagens automaticamente.',
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
          <h3 className="text-lg font-semibold">Personagens</h3>
          <p className="text-sm text-muted-foreground">
            Defina os personagens principais da sua história
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
            onClick={handleAddCharacter}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Personagem
          </Button>
        </div>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhum personagem adicionado ainda. Clique em "Adicionar Personagem" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {characters.map((character) => (
            <Card key={character.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nome do personagem"
                        value={character.name}
                        onChange={(e) => handleUpdateCharacter(character.id, 'name', e.target.value)}
                        className="max-w-xs"
                      />
                      <Select
                        value={character.role || 'supporting'}
                        onValueChange={(value) => handleUpdateCharacter(character.id, 'role', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARACTER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCharacter(character.id)}
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
                      onGenerate={() => handleGenerateCharacterDetails(character.id, character.name || 'Personagem')}
                      onAccept={(suggestion) => handleUpdateCharacter(character.id, 'description', suggestion)}
                      disabled={generatingFor === character.id || isGeneratingAll || !character.name}
                    />
                  </div>
                  <Textarea
                    placeholder="Descreva o personagem, sua personalidade, aparência física e papel na história..."
                    value={character.description || ''}
                    onChange={(e) => handleUpdateCharacter(character.id, 'description', e.target.value)}
                    rows={4}
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

