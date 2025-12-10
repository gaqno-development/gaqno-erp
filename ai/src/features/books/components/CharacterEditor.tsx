'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui'
import { Badge } from '@repo/ui/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui'
import { useBookCharacters } from '../hooks/useBookCharacters'
import { useBook } from '../hooks/useBooks'
import { useBookBlueprint } from '../hooks/useBookBlueprint'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useUIStore } from '@repo/core/store/uiStore'
import { IBookCharacter } from '../types/books'
import { ICharacterDetails, CharacterRole } from '../types/character'
import { Wand2, Loader2, Image as ImageIcon, Save, User } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui'

interface ICharacterEditorProps {
  bookId: string
  characterId?: string
}

export function CharacterEditor({ bookId, characterId }: ICharacterEditorProps) {
  const supabase = useSupabaseClient()
  const { characters, updateCharacter, isLoading } = useBookCharacters(bookId)
  const { book } = useBook(bookId)
  const { blueprint } = useBookBlueprint(bookId)
  const { addNotification } = useUIStore()

  const character = characterId ? characters.find(c => c.id === characterId) : null

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [characterDetails, setCharacterDetails] = useState<ICharacterDetails | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (character) {
      setName(character.name)
      setDescription(character.description || '')
      setAvatarUrl(character.avatar_url || null)
      const details = character.metadata?.characterDetails
      if (details) {
        setCharacterDetails(details)
      }
    }
  }, [character])

  const handleAnalyzeCharacter = async () => {
    if (!name.trim()) {
      addNotification({
        type: 'error',
        title: 'Nome obrigatório',
        message: 'O personagem precisa ter um nome para ser analisado.',
        duration: 3000,
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Você precisa estar autenticado')
      }

      const { data, error } = await supabase.functions.invoke('analyze-character', {
        body: {
          name,
          description: description || undefined,
          bookContext: {
            title: book?.title || '',
            genre: book?.genre || undefined,
            style: book?.style || undefined,
            summary: blueprint?.summary || book?.description || undefined,
          },
          existingDetails: characterDetails,
        },
      })

      if (error) throw error

      if (data?.characterDetails) {
        setCharacterDetails(data.characterDetails)
        addNotification({
          type: 'success',
          title: 'Personagem analisado!',
          message: 'Os detalhes do personagem foram gerados com sucesso.',
          duration: 3000,
        })
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao analisar personagem',
        message: error.message || 'Não foi possível analisar o personagem.',
        duration: 5000,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateAvatar = async () => {
    if (!characterDetails?.avatarPrompt && !name) {
      addNotification({
        type: 'error',
        title: 'Análise necessária',
        message: 'Analise o personagem primeiro para gerar o avatar.',
        duration: 3000,
      })
      return
    }

    setIsGeneratingAvatar(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Você precisa estar autenticado')
      }

      const { data, error } = await supabase.functions.invoke('generate-character-avatar', {
        body: {
          character: {
            name,
            description: description || undefined,
            metadata: {
              characterDetails,
            },
          },
          bookContext: {
            title: book?.title || undefined,
            genre: book?.genre || undefined,
            style: book?.style || undefined,
          },
          generateImage: true,
        },
      })

      if (error) throw error

      if (data?.imageUrl) {
        setAvatarUrl(data.imageUrl)
        addNotification({
          type: 'success',
          title: 'Avatar gerado!',
          message: 'O avatar do personagem foi gerado com sucesso.',
          duration: 3000,
        })
      } else if (data?.avatarPrompt) {
        addNotification({
          type: 'info',
          title: 'Prompt gerado',
          message: 'O prompt foi gerado. Use-o para criar o avatar manualmente.',
          duration: 3000,
        })
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro ao gerar avatar',
        message: error.message || 'Não foi possível gerar o avatar.',
        duration: 5000,
      })
    } finally {
      setIsGeneratingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!characterId) return

    const metadata = {
      ...character?.metadata,
      characterDetails: characterDetails || undefined,
    }

    const result = await updateCharacter(characterId, {
      name,
      description: description || null,
      avatar_url: avatarUrl || null,
      metadata,
    })

    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Personagem salvo!',
        message: 'As alterações foram salvas com sucesso.',
        duration: 3000,
      })
    } else {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: result.error || 'Não foi possível salvar as alterações.',
        duration: 5000,
      })
    }
  }

  if (!characterId || !character) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Selecione um personagem para editar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{character.name}</CardTitle>
                <CardDescription>Editar detalhes do personagem</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeCharacter}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Analisar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAvatar}
                disabled={isGeneratingAvatar || !characterDetails}
              >
                {isGeneratingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Gerar Avatar
                  </>
                )}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="traits">Características</TabsTrigger>
              <TabsTrigger value="relationships">Relacionamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Descrição básica do personagem..."
                />
              </div>
              {characterDetails?.role && (
                <div className="space-y-2">
                  <Label>Papel na História</Label>
                  <Select
                    value={characterDetails.role}
                    onValueChange={(value: CharacterRole) =>
                      setCharacterDetails({ ...characterDetails, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protagonist">Protagonista</SelectItem>
                      <SelectItem value="antagonist">Antagonista</SelectItem>
                      <SelectItem value="supporting">Coadjuvante</SelectItem>
                      <SelectItem value="minor">Secundário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              {characterDetails?.backstory ? (
                <div className="space-y-2">
                  <Label>História (Backstory)</Label>
                  <Textarea
                    value={characterDetails.backstory}
                    onChange={(e) =>
                      setCharacterDetails({ ...characterDetails, backstory: e.target.value })
                    }
                    rows={6}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Analise o personagem para gerar a história</p>
                </div>
              )}
              {characterDetails?.avatarPrompt && (
                <div className="space-y-2">
                  <Label>Prompt para Avatar</Label>
                  <Textarea
                    value={characterDetails.avatarPrompt}
                    onChange={(e) =>
                      setCharacterDetails({ ...characterDetails, avatarPrompt: e.target.value })
                    }
                    rows={3}
                    readOnly
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="traits" className="space-y-4 mt-4">
              {characterDetails?.traits ? (
                <>
                  <div className="space-y-2">
                    <Label>Características Físicas</Label>
                    <div className="flex flex-wrap gap-2">
                      {characterDetails.traits.physical.map((trait, idx) => (
                        <Badge key={idx} variant="secondary">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Características Psicológicas</Label>
                    <div className="flex flex-wrap gap-2">
                      {characterDetails.traits.psychological.map((trait, idx) => (
                        <Badge key={idx} variant="secondary">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Características Sociais</Label>
                    <div className="flex flex-wrap gap-2">
                      {characterDetails.traits.social.map((trait, idx) => (
                        <Badge key={idx} variant="secondary">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Analise o personagem para gerar as características</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="relationships" className="space-y-4 mt-4">
              {characterDetails?.relationships && characterDetails.relationships.length > 0 ? (
                <div className="space-y-3">
                  {characterDetails.relationships.map((rel, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="font-medium">{rel.characterName || 'Personagem'}</div>
                          <Badge variant="outline">{rel.relationshipType}</Badge>
                          <p className="text-sm text-muted-foreground">{rel.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum relacionamento definido ainda</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

