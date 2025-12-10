'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { IFinanceCategory, TransactionType } from '../types/finance'
import { cn } from '@repo/core/lib/utils'
import { getDefaultColorForCategory } from '../utils/iconToCategory'
import { getTransactionIcon } from './TransactionIconPicker'
import { useCategories } from '../hooks/useCategories'
import { useSubcategories } from '../hooks/useSubcategories'
import { SubcategorySelector } from './SubcategorySelector'
import { Plus, Check, Search } from 'lucide-react'

interface ICategorySelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: IFinanceCategory[]
  selectedCategoryId: string | null
  selectedSubcategoryId?: string | null
  onSelect: (categoryId: string | null, subcategoryId?: string | null) => void
  transactionType?: TransactionType
}

export function CategorySelectorDialog({
  open,
  onOpenChange,
  categories,
  selectedCategoryId,
  selectedSubcategoryId = null,
  onSelect,
  transactionType = 'expense',
}: ICategorySelectorDialogProps) {
  const { createCategory, refetch } = useCategories(transactionType)
  const [creatingCategory, setCreatingCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)
  
  const selectedCategory = useMemo(
    () => categories.find(cat => cat.id === selectedCategoryId),
    [categories, selectedCategoryId]
  )
  
  const pendingSubcategories = useSubcategories(pendingCategoryId)
  const selectedSubcategories = useSubcategories(selectedCategoryId)
  const subcategories = pendingCategoryId ? pendingSubcategories.subcategories : selectedSubcategories.subcategories

  useEffect(() => {
    if (pendingCategoryId && !pendingSubcategories.isLoading) {
      if (pendingSubcategories.subcategories.length > 0) {
        setIsSubcategoryDialogOpen(true)
      } else {
        onSelect(pendingCategoryId, null)
        setPendingCategoryId(null)
        onOpenChange(false)
      }
    }
  }, [pendingCategoryId, pendingSubcategories.isLoading, pendingSubcategories.subcategories.length, onSelect, onOpenChange])

  const categoryGroups = useMemo(() => {
    const categoryMap = new Map<string, { name: string; icons: string[]; color: string; existingCategory?: IFinanceCategory }>()

    categories.forEach((category) => {
      if (category.type !== transactionType) return

      if (!categoryMap.has(category.name)) {
        categoryMap.set(category.name, {
          name: category.name,
          icons: [],
          color: category.color || getDefaultColorForCategory(category.name, categories),
          existingCategory: category,
        })
      }

      const group = categoryMap.get(category.name)!
      if (category.icon && !group.icons.includes(category.icon)) {
        group.icons.push(category.icon)
      }
    })

    let result = Array.from(categoryMap.values()).sort((a, b) => {
      return a.name.localeCompare(b.name)
    })

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((group) =>
        group.name.toLowerCase().includes(query)
      )
    }

    return result
  }, [categories, transactionType, searchQuery])

  const handleSelect = (categoryId: string | null) => {
    if (categoryId) {
      setPendingCategoryId(categoryId)
    } else {
      onSelect(categoryId, null)
      onOpenChange(false)
    }
  }

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    onSelect(pendingCategoryId || selectedCategoryId, subcategoryId)
    setPendingCategoryId(null)
    setIsSubcategoryDialogOpen(false)
    onOpenChange(false)
  }

  const handleCreateCategory = async (categoryName: string, iconValue: string) => {
    setCreatingCategory(categoryName)
    try {
      const result = await createCategory({
        name: categoryName,
        type: transactionType,
        color: getDefaultColorForCategory(categoryName, categories),
        icon: iconValue,
      })

      if (result.success) {
        const updatedCategories = await refetch()
        if (updatedCategories?.data) {
          const newCategory = updatedCategories.data.find(
            (cat) => cat.name === categoryName && cat.type === transactionType
          )
          if (newCategory) {
            handleSelect(newCategory.id)
          }
        }
      }
    } finally {
      setCreatingCategory(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Categoria</DialogTitle>
          <DialogDescription>
            Escolha uma categoria existente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50 hover:border-primary/30',
              selectedCategoryId === null
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <span className="text-xl">—</span>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-base">Sem categoria</span>
              </div>
              {selectedCategoryId === null && (
                <Check className="h-5 w-5 text-primary shrink-0" />
              )}
            </div>
          </button>

          {categoryGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria encontrada para "{searchQuery}"
            </div>
          ) : (
            categoryGroups.map((group) => {
              const isSelected = group.existingCategory?.id === selectedCategoryId
              const IconComponent = getTransactionIcon(group.icons[0])

              return (
                <div
                  key={group.name}
                  className={cn(
                    'rounded-xl border-2 transition-all hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: group.color }}
                      >
                        {IconComponent ? (
                          <IconComponent className="w-7 h-7" />
                        ) : (
                          <span className="text-xl">📁</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base mb-1">{group.name}</div>
                        {!group.existingCategory && (
                          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full inline-block">
                            Nova categoria
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-6 w-6 text-primary shrink-0" />
                      )}
                    </div>

                    {group.existingCategory ? (
                      <Button
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleSelect(group.existingCategory!.id)}
                      >
                        {isSelected ? 'Selecionada' : 'Selecionar'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })
          )}
          </div>
        </div>
        {pendingCategoryId && (
          <SubcategorySelector
            open={isSubcategoryDialogOpen}
            onOpenChange={(open) => {
              setIsSubcategoryDialogOpen(open)
              if (!open && pendingCategoryId) {
                onSelect(pendingCategoryId, null)
                setPendingCategoryId(null)
                onOpenChange(false)
              }
            }}
            category={categories.find(cat => cat.id === pendingCategoryId) || null}
            subcategories={subcategories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelect={handleSubcategorySelect}
          />
        )}
        {selectedCategory && !pendingCategoryId && (
          <SubcategorySelector
            open={isSubcategoryDialogOpen}
            onOpenChange={setIsSubcategoryDialogOpen}
            category={selectedCategory}
            subcategories={subcategories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelect={(subcategoryId) => {
              onSelect(selectedCategoryId, subcategoryId)
              setIsSubcategoryDialogOpen(false)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
