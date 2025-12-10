'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { IFinanceCategory, TransactionType, ICreateCategoryInput, IUpdateCategoryInput, ICreateSubcategoryInput, IUpdateSubcategoryInput } from '../types/finance'
import { useCategories } from '../hooks/useCategories'
import { useSubcategories } from '../hooks/useSubcategories'
import { handleMutationError } from '@repo/core/utils/error-handler'
import { Trash2, Plus, Edit2 } from 'lucide-react'
import { getTransactionIcon } from './TransactionIconPicker'
import { cn } from '@repo/core/lib/utils'
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

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1, 'Cor é obrigatória'),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface ICategoryManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: IFinanceCategory | null
}

export function CategoryManagementDialog({
  open,
  onOpenChange,
  category,
}: ICategoryManagementDialogProps) {
  const isEditing = !!category
  const { createCategory, updateCategory, deleteCategory, isCreating, isUpdating, isDeleting } = useCategories()
  const { subcategories, createSubcategory, updateSubcategory, deleteSubcategory, isCreating: isCreatingSub, isUpdating: isUpdatingSub, isDeleting: isDeletingSub, refetch: refetchSubcategories } = useSubcategories(category?.id || null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#3B82F6',
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        color: category.color,
      })
    } else {
      reset({
        name: '',
        type: 'expense',
        color: '#3B82F6',
      })
    }
  }, [category, reset])

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditing && category) {
        const updateData: IUpdateCategoryInput = {
          id: category.id,
          name: data.name,
          type: data.type,
          color: data.color,
        }
        const result = await updateCategory(updateData)
        if (result.success) {
          onOpenChange(false)
          reset()
        } else {
          handleMutationError(result.error || 'Erro ao atualizar categoria', 'categoria')
        }
      } else {
        const createData: ICreateCategoryInput = {
          name: data.name,
          type: data.type,
          color: data.color,
        }
        const result = await createCategory(createData)
        if (result.success) {
          onOpenChange(false)
          reset()
        } else {
          handleMutationError(result.error || 'Erro ao criar categoria', 'categoria')
        }
      }
    } catch (error) {
      handleMutationError(error, 'categoria')
    }
  }

  const handleDelete = async () => {
    if (!category) return

    try {
      const result = await deleteCategory(category.id)
      if (result.success) {
        setShowDeleteDialog(false)
        onOpenChange(false)
        reset()
      } else {
        handleMutationError(result.error || 'Erro ao deletar categoria', 'categoria')
      }
    } catch (error) {
      handleMutationError(error, 'categoria')
    }
  }

  const handleCreateSubcategory = async () => {
    if (!category || !newSubcategoryName.trim()) return

    try {
      const result = await createSubcategory({
        parent_category_id: category.id,
        name: newSubcategoryName.trim(),
      })
      if (result.success) {
        setNewSubcategoryName('')
        setEditingSubcategoryId(null)
        await refetchSubcategories()
      } else {
        handleMutationError(result.error || 'Erro ao criar subcategoria', 'subcategoria')
      }
    } catch (error) {
      handleMutationError(error, 'subcategoria')
    }
  }

  const handleUpdateSubcategory = async (subcategoryId: string, newName: string) => {
    if (!newName.trim()) return

    try {
      const result = await updateSubcategory({
        id: subcategoryId,
        name: newName.trim(),
      })
      if (result.success) {
        setEditingSubcategoryId(null)
        await refetchSubcategories()
      } else {
        handleMutationError(result.error || 'Erro ao atualizar subcategoria', 'subcategoria')
      }
    } catch (error) {
      handleMutationError(error, 'subcategoria')
    }
  }

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const result = await deleteSubcategory(subcategoryId)
      if (result.success) {
        await refetchSubcategories()
      } else {
        handleMutationError(result.error || 'Erro ao deletar subcategoria', 'subcategoria')
      }
    } catch (error) {
      handleMutationError(error, 'subcategoria')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Atualize as informações da categoria'
                : 'Crie uma nova categoria para organizar suas transações'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Alimentação"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: TransactionType) => setValue('type', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  {...register('color')}
                  className="w-20 h-10 cursor-pointer"
                  disabled={isSubmitting}
                />
                <Input
                  type="text"
                  {...register('color')}
                  placeholder="#3B82F6"
                  disabled={isSubmitting}
                  className="flex-1"
                />
              </div>
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>

            {isEditing && category && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Subcategorias</Label>
                  {!editingSubcategoryId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSubcategoryId('new')}
                      disabled={isCreatingSub}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </div>

                {editingSubcategoryId === 'new' && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome da subcategoria"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSubcategoryName.trim()) {
                          handleCreateSubcategory()
                        } else if (e.key === 'Escape') {
                          setEditingSubcategoryId(null)
                          setNewSubcategoryName('')
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateSubcategory}
                      disabled={!newSubcategoryName.trim() || isCreatingSub}
                    >
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSubcategoryId(null)
                        setNewSubcategoryName('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {subcategories.length === 0 && editingSubcategoryId !== 'new' && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma subcategoria cadastrada
                    </p>
                  )}
                  {subcategories.map((subcat) => {
                    const isEditing = editingSubcategoryId === subcat.id
                    const IconComponent = getTransactionIcon(subcat.icon || category.icon)

                    return (
                      <div
                        key={subcat.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border',
                          isEditing && 'border-primary bg-primary/5'
                        )}
                      >
                        {isEditing ? (
                          <>
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: category.color }}
                            >
                              {IconComponent ? (
                                <IconComponent className="w-5 h-5" />
                              ) : (
                                <span>📁</span>
                              )}
                            </div>
                            <Input
                              defaultValue={subcat.name}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement
                                  handleUpdateSubcategory(subcat.id, input.value)
                                } else if (e.key === 'Escape') {
                                  setEditingSubcategoryId(null)
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSubcategoryId(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: category.color }}
                            >
                              {IconComponent ? (
                                <IconComponent className="w-5 h-5" />
                              ) : (
                                <span>📁</span>
                              )}
                            </div>
                            <span className="flex-1 font-medium">{subcat.name}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSubcategoryId(subcat.id)}
                              disabled={isUpdatingSub}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSubcategory(subcat.id)}
                              disabled={isDeletingSub}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              )}
              <DialogFormFooter
                onCancel={() => {
                  onOpenChange(false)
                  reset()
                }}
                isSubmitting={isSubmitting || isCreating || isUpdating}
                submitLabel={isEditing ? 'Salvar' : 'Criar'}
                isEdit={isEditing}
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a categoria "{category?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
