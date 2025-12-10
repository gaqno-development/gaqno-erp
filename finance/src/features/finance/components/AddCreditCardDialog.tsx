'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/ui'
import { DialogFormFooter } from '@repo/ui/components/ui'
import { handleMutationError, handleFormError } from '@repo/core/utils/error-handler'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui'
import { useCreditCards } from '../hooks/useCreditCards'
import { ICreditCard } from '../types/finance'

const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  last_four_digits: z.string().regex(/^\d{4}$/, 'Deve ter exatamente 4 dígitos'),
  card_type: z.string().min(1, 'Tipo do cartão é obrigatório'),
  bank_name: z.string().optional(),
  credit_limit: z.number().min(0, 'Limite deve ser maior ou igual a zero'),
  closing_day: z.number().min(1).max(31, 'Dia deve estar entre 1 e 31'),
  due_day: z.number().min(1).max(31, 'Dia deve estar entre 1 e 31'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido'),
  icon: z.string().optional(),
})

type CreditCardFormValues = z.infer<typeof creditCardSchema>

interface IAddCreditCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card?: ICreditCard | null
  onClose?: () => void
}

const CARD_COLORS = [
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Laranja', value: '#F59E0B' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Rosa', value: '#EC4899' },
]

const CARD_TYPES = ['Visa', 'MasterCard', 'Elo', 'American Express', 'Hipercard']

export function AddCreditCardDialog({
  open,
  onOpenChange,
  card,
  onClose,
}: IAddCreditCardDialogProps) {
  const { createCreditCard, updateCreditCard } = useCreditCards()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      last_four_digits: '',
      card_type: '',
      bank_name: '',
      credit_limit: 0,
      closing_day: 1,
      due_day: 1,
      color: '#3B82F6',
      icon: '',
    },
  })

  useEffect(() => {
    if (card) {
      reset({
        name: card.name,
        last_four_digits: card.last_four_digits,
        card_type: card.card_type,
        bank_name: card.bank_name || '',
        credit_limit: card.credit_limit,
        closing_day: card.closing_day,
        due_day: card.due_day,
        color: card.color,
        icon: card.icon || '',
      })
    } else {
      reset({
        name: '',
        last_four_digits: '',
        card_type: '',
        bank_name: '',
        credit_limit: 0,
        closing_day: 1,
        due_day: 1,
        color: '#3B82F6',
        icon: '',
      })
    }
  }, [card, reset, open])

  const onSubmit = async (data: CreditCardFormValues) => {
    try {
      let result
      if (card) {
        result = await updateCreditCard({
          id: card.id,
          ...data,
        })
      } else {
        result = await createCreditCard(data)
      }

      if (!result?.success) {
        handleMutationError(result?.error, 'cartão')
        return
      }

      onClose?.()
      onOpenChange(false)
    } catch (error) {
      handleMutationError(error, 'cartão')
    }
  }

  const onError = (errors: any) => {
    handleFormError(errors)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
          </DialogTitle>
          <DialogDescription>
            {card ? 'Edite os dados do cartão' : 'Adicione um novo cartão de crédito para acompanhar seus gastos'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Ultravioleta, Aeternum..."
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_four_digits">Últimos 4 dígitos *</Label>
              <Input
                id="last_four_digits"
                {...register('last_four_digits')}
                placeholder="5587"
                maxLength={4}
              />
              {errors.last_four_digits && (
                <p className="text-xs text-red-500">{errors.last_four_digits.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_type">Tipo *</Label>
              <Select
                value={watch('card_type')}
                onValueChange={(value) => setValue('card_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.card_type && (
                <p className="text-xs text-red-500">{errors.card_type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Banco</Label>
            <Input
              id="bank_name"
              {...register('bank_name')}
              placeholder="Ex: Nubank, Itaú..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Limite de Crédito *</Label>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              {...register('credit_limit', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.credit_limit && (
              <p className="text-xs text-red-500">{errors.credit_limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closing_day">Dia de Fechamento *</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                {...register('closing_day', { valueAsNumber: true })}
              />
              {errors.closing_day && (
                <p className="text-xs text-red-500">{errors.closing_day.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_day">Dia de Vencimento *</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                {...register('due_day', { valueAsNumber: true })}
              />
              {errors.due_day && (
                <p className="text-xs text-red-500">{errors.due_day.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-10 h-10 rounded-md border-2 transition-all ${
                    watch('color') === color.value
                      ? 'border-primary scale-110'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setValue('color', color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <Input
              id="color"
              type="text"
              {...register('color')}
              placeholder="#3B82F6"
              className="mt-2"
            />
            {errors.color && (
              <p className="text-xs text-red-500">{errors.color.message}</p>
            )}
          </div>

          <DialogFormFooter
            onCancel={() => {
              onClose?.()
              onOpenChange(false)
            }}
            isSubmitting={isSubmitting}
            isEdit={!!card}
            submitLabel={card ? 'Atualizar' : 'Criar'}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

