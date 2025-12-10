'use client'

import { useEffect, useState, useMemo } from 'react'
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
import { useTransactions } from '../hooks/useTransactions'
import { useCreditCards } from '../hooks/useCreditCards'
import { useCategories } from '../hooks/useCategories'
import { useSubcategories } from '../hooks/useSubcategories'
import { CategorySelectorDialog } from './CategorySelectorDialog'
import { CategoryBadge } from './CategoryBadge'
import { getTransactionIcon } from './TransactionIconPicker'
import { IFinanceTransaction, TransactionType, TransactionStatus } from '../types/finance'
import { Button } from '@repo/ui/components/ui'
import { X } from 'lucide-react'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  transaction_date: z.string().min(1, 'Data é obrigatória'),
  due_date: z.string().optional().nullable(),
  credit_card_id: z.string().optional().nullable(),
  status: z.enum([TransactionStatus.PAGO, TransactionStatus.A_PAGAR, TransactionStatus.EM_ATRASO]).optional(),
  notes: z.string().optional().nullable(),
  installment_count: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val) ? 1 : val),
    z.number().min(1).optional()
  ),
  installment_current: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val) ? 1 : val),
    z.number().min(1).optional()
  ),
  is_recurring: z.boolean().optional(),
  recurring_type: z.string().optional().nullable(),
  recurring_day: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val) ? null : val),
    z.number().min(1).max(31).nullable().optional()
  ),
  recurring_months: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val) ? null : val),
    z.number().min(1).nullable().optional()
  ),
  category_id: z.string().optional().nullable(),
  subcategory_id: z.string().optional().nullable(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface IAddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: IFinanceTransaction | null
  defaultType?: TransactionType
  onClose?: () => void
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  transaction,
  defaultType = 'expense',
  onClose,
}: IAddTransactionDialogProps) {
  const { createTransaction, updateTransaction } = useTransactions()
  const { creditCards } = useCreditCards()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      transaction_date: new Date().toISOString().split('T')[0],
      due_date: null,
      credit_card_id: null,
      status: TransactionStatus.A_PAGAR,
      notes: null,
      installment_count: 1,
      installment_current: 1,
      is_recurring: false,
      recurring_type: null,
      recurring_day: null,
      recurring_months: null,
      category_id: null,
      subcategory_id: null,
    },
  })

  const selectedType = watch('type')
  const selectedCategoryId = watch('category_id') ?? null
  const selectedSubcategoryId = watch('subcategory_id') ?? null
  const isExpense = selectedType === 'expense'
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  
  const { categories: allCategories } = useCategories()
  const filteredCategories = useMemo(
    () => allCategories?.filter(cat => cat.type === selectedType) || [],
    [allCategories, selectedType]
  )
  const selectedCategory = useMemo(
    () => filteredCategories.find(cat => cat.id === selectedCategoryId),
    [filteredCategories, selectedCategoryId]
  )
  
  const { subcategories } = useSubcategories(selectedCategoryId)
  const selectedSubcategory = useMemo(
    () => subcategories.find(sub => sub.id === selectedSubcategoryId),
    [subcategories, selectedSubcategoryId]
  )

  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        transaction_date: transaction.transaction_date,
        due_date: transaction.due_date || null,
        credit_card_id: transaction.credit_card_id || null,
        status: transaction.status || TransactionStatus.A_PAGAR,
        notes: transaction.notes || null,
        installment_count: transaction.installment_count || 1,
        installment_current: transaction.installment_current || 1,
        is_recurring: transaction.is_recurring || false,
        recurring_type: transaction.recurring_type || null,
        recurring_day: transaction.recurring_day || null,
        recurring_months: transaction.recurring_months || null,
        category_id: transaction.category_id || null,
        subcategory_id: transaction.subcategory_id || null,
      })
    } else {
      reset({
        description: '',
        amount: 0,
        type: defaultType,
        transaction_date: new Date().toISOString().split('T')[0],
        due_date: null,
        credit_card_id: null,
        status: TransactionStatus.A_PAGAR,
        notes: null,
        installment_count: 1,
        installment_current: 1,
        is_recurring: false,
        recurring_type: null,
        recurring_day: null,
        recurring_months: null,
        category_id: null,
        subcategory_id: null,
      })
    }
  }, [transaction, defaultType, reset, open])

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      let result
      if (transaction) {
        result = await updateTransaction({
          id: transaction.id,
          ...data,
        })
      } else {
        result = await createTransaction(data)
      }

      if (!result.success) {
        handleMutationError(result.error, 'transação')
        return
      }

      onClose?.()
      onOpenChange(false)
    } catch (error) {
      handleMutationError(error, 'transação')
    }
  }

  const onError = (errors: any) => {
    handleFormError(errors)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {transaction ? 'Edite os dados da transação' : 'Preencha os dados para criar uma nova transação'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setValue('type', value as TransactionType)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Ex: Salário, Alimentação..."
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            {selectedCategory ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  {selectedCategory.icon ? (
                    (() => {
                      const IconComponent = getTransactionIcon(selectedCategory.icon)
                      return IconComponent ? <IconComponent className="w-5 h-5" /> : null
                    })()
                  ) : null}
                </div>
                <div className="flex-1">
                  <CategoryBadge 
                    category={selectedCategory} 
                    subcategory={selectedSubcategory}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue('category_id', null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsCategoryDialogOpen(true)}
              >
                Selecionar Categoria
              </Button>
            )}
            <CategorySelectorDialog
              open={isCategoryDialogOpen}
              onOpenChange={setIsCategoryDialogOpen}
              categories={filteredCategories}
              selectedCategoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              onSelect={(categoryId, subcategoryId) => {
                setValue('category_id', categoryId)
                setValue('subcategory_id', subcategoryId || null)
              }}
              transactionType={selectedType}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data da Transação *</Label>
              <Input
                id="transaction_date"
                type="date"
                {...register('transaction_date')}
              />
              {errors.transaction_date && (
                <p className="text-xs text-red-500">{errors.transaction_date.message}</p>
              )}
            </div>

            {isExpense && (
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                />
              </div>
            )}
          </div>

          {isExpense && (
            <>
              <div className="space-y-2">
                <Label htmlFor="credit_card_id">Cartão de Crédito</Label>
                <Select
                  value={watch('credit_card_id') || 'none'}
                  onValueChange={(value) => setValue('credit_card_id', value === 'none' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem cartão</SelectItem>
                    {creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} - Final {card.last_four_digits}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status') || TransactionStatus.A_PAGAR}
                  onValueChange={(value) => setValue('status', value as TransactionStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransactionStatus.A_PAGAR}>A pagar</SelectItem>
                    <SelectItem value={TransactionStatus.PAGO}>Pago</SelectItem>
                    <SelectItem value={TransactionStatus.EM_ATRASO}>Em atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installment_count">Total de Parcelas</Label>
                  <Input
                    id="installment_count"
                    type="number"
                    min="1"
                    {...register('installment_count', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installment_current">Parcela Atual</Label>
                  <Input
                    id="installment_current"
                    type="number"
                    min="1"
                    {...register('installment_current', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Anotações</Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre esta transação..."
            />
          </div>

          <div className="space-y-4 p-4 border rounded-md bg-muted/20">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_recurring"
                {...register('is_recurring')}
                className="h-4 w-4 rounded border-gray-300"
                onChange={(e) => {
                  setValue('is_recurring', e.target.checked)
                  if (!e.target.checked) {
                    setValue('recurring_type', null)
                    setValue('recurring_day', null)
                  }
                }}
              />
              <Label htmlFor="is_recurring" className="cursor-pointer">
                Transação recorrente (todo mês)
              </Label>
            </div>

            {watch('is_recurring') && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="recurring_type">Tipo de recorrência</Label>
                  <Select
                    value={watch('recurring_type') || 'none'}
                    onValueChange={(value) => {
                      setValue('recurring_type', value === 'none' ? null : value)
                      if (value === 'day_15') {
                        setValue('recurring_day', 15)
                      } else if (value === 'last_day') {
                        setValue('recurring_day', 31)
                      } else if (value === 'fifth_business_day') {
                        setValue('recurring_day', 5)
                      } else if (value !== 'custom') {
                        setValue('recurring_day', null)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifth_business_day">Quinto dia útil do mês</SelectItem>
                      <SelectItem value="day_15">Dia 15</SelectItem>
                      <SelectItem value="last_day">Final do mês</SelectItem>
                      <SelectItem value="custom">Dia personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watch('recurring_type') === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="recurring_day">Dia do mês</Label>
                    <Input
                      id="recurring_day"
                      type="number"
                      min="1"
                      max="31"
                      {...register('recurring_day', { valueAsNumber: true })}
                      placeholder="Ex: 5 (todo dia 5 do mês)"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="recurring_months">Por quantos meses?</Label>
                  <Input
                    id="recurring_months"
                    type="number"
                    min="1"
                    {...register('recurring_months', { valueAsNumber: true })}
                    placeholder="Deixe vazio para infinito"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para que a transação seja recorrente indefinidamente
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Esta transação será criada automaticamente todo mês
                </p>
              </div>
            )}
          </div>

          <DialogFormFooter
            onCancel={() => {
              onClose?.()
              onOpenChange(false)
            }}
            isSubmitting={isSubmitting}
            isEdit={!!transaction}
            submitLabel={transaction ? 'Atualizar' : 'Criar'}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

