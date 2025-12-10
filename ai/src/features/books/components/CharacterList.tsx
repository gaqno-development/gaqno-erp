'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Textarea } from '@repo/ui/components/ui'
import { useBookCharacters } from '../hooks/useBookCharacters'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/ui'
import { Plus } from 'lucide-react'

interface ICharacterListProps {
  bookId: string
}

export function CharacterList({ bookId }: ICharacterListProps) {
  const { characters, isLoading, createCharacter } = useBookCharacters(bookId)
  const [showDialog, setShowDialog] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = async () => {
    const result = await createCharacter({
      book_id: bookId,
      name,
      description: description || null,
    })

    if (result.success) {
      setShowDialog(false)
      setName('')
      setDescription('')
    } else {
      alert(`Erro ao criar personagem: ${result.error}`)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Personagens</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : characters.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum personagem ainda</p>
        ) : (
          <div className="space-y-3">
            {characters.map((character) => {
              const details = character.metadata?.characterDetails;
              const role = details?.role;
              return (
                <div key={character.id} className="flex items-start gap-3">
                  <Avatar>
                    {character.avatar_url && (
                      <AvatarImage src={character.avatar_url} alt={character.name} />
                    )}
                    <AvatarFallback>
                      {character.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{character.name}</div>
                      {role && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {role === 'protagonist' ? 'Protagonista' : 
                           role === 'antagonist' ? 'Antagonista' : 
                           role === 'supporting' ? 'Coadjuvante' : 'Secundário'}
                        </span>
                      )}
                    </div>
                    {character.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {character.description}
                      </div>
                    )}
                    {details?.backstory && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {details.backstory.substring(0, 60)}...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Personagem</DialogTitle>
          <DialogDescription>
            Adicione um novo personagem ao seu livro
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="character-name">Nome do Personagem</Label>
            <Input
              id="character-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="character-description">Descrição</Label>
            <Textarea
              id="character-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o personagem..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Criar Personagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

