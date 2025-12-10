'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Plus } from 'lucide-react'
import { CreditCardDisplayCard } from './CreditCardDisplayCard'
import { AddCreditCardDialog } from './AddCreditCardDialog'
import { useCreditCards } from '../hooks/useCreditCards'
import { ICreditCard } from '../types/finance'

interface ICreditCardOverviewProps {
  onCardSelect?: (cardId: string) => void
  selectedCardId?: string | null
}

export function CreditCardOverview({
  onCardSelect,
  selectedCardId,
}: ICreditCardOverviewProps) {
  const { creditCards, isLoading, deleteCreditCard } = useCreditCards()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<ICreditCard | null>(null)
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = async (cardId: string) => {
    setDeleteCardId(cardId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteCardId) return

    const result = await deleteCreditCard(deleteCardId)
    setIsDeleteDialogOpen(false)
    setDeleteCardId(null)

    if (!result.success) {
      alert(`Erro ao deletar: ${result.error}`)
    }
  }

  const handleEdit = (card: ICreditCard) => {
    setEditingCard(card)
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingCard(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Carregando cartões...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cartões de Crédito</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cartão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {creditCards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum cartão cadastrado
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {creditCards.map((card) => (
                <CreditCardDisplayCard
                  key={card.id}
                  card={card}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onClick={(cardId) => {
                    if (onCardSelect) {
                      onCardSelect(cardId)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCreditCardDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        card={editingCard}
        onClose={handleClose}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cartão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

