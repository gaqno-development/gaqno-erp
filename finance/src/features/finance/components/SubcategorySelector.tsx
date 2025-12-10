'use client'

import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { cn } from '@repo/core/lib/utils'
import { IFinanceSubcategory, IFinanceCategory } from '../types/finance'
import { getTransactionIcon } from './TransactionIconPicker'
import { Search, Check } from 'lucide-react'

interface ISubcategorySelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: IFinanceCategory | null
  subcategories: IFinanceSubcategory[]
  selectedSubcategoryId: string | null
  onSelect: (subcategoryId: string | null) => void
}

export function SubcategorySelector({
  open,
  onOpenChange,
  category,
  subcategories,
  selectedSubcategoryId,
  onSelect,
}: ISubcategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return subcategories

    const query = searchQuery.toLowerCase().trim()
    return subcategories.filter((subcat) =>
      subcat.name.toLowerCase().includes(query)
    )
  }, [subcategories, searchQuery])

  const handleSelect = (subcategoryId: string | null) => {
    onSelect(subcategoryId)
    onOpenChange(false)
    setSearchQuery('')
  }

  if (!category) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] max-h-[600px]">
        <SheetHeader>
          <SheetTitle>Selecionar Subcategoria</SheetTitle>
          <SheetDescription>
            Escolha uma subcategoria de {category.name}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar subcategoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50 hover:border-primary/30',
                selectedSubcategoryId === null
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon ? (
                    (() => {
                      const IconComponent = getTransactionIcon(category.icon)
                      return IconComponent ? (
                        <IconComponent className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-xl">📁</span>
                      )
                    })()
                  ) : (
                    <span className="text-xl">📁</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-base">Sem subcategoria</span>
                  <p className="text-sm text-muted-foreground">Usar apenas a categoria</p>
                </div>
                {selectedSubcategoryId === null && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </button>

            {filteredSubcategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery.trim()
                  ? `Nenhuma subcategoria encontrada para "${searchQuery}"`
                  : 'Nenhuma subcategoria disponível'}
              </div>
            ) : (
              filteredSubcategories.map((subcategory) => {
                const isSelected = subcategory.id === selectedSubcategoryId
                const IconComponent = getTransactionIcon(subcategory.icon || category.icon)

                return (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() => handleSelect(subcategory.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50 hover:border-primary/30',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {IconComponent ? (
                          <IconComponent className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-xl">📁</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-base">{subcategory.name}</span>
                        <p className="text-sm text-muted-foreground">{category.name}</p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

