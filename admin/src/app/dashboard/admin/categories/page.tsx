'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { useCategoriesManagement } from './hooks/useCategoriesManagement'
import { Button } from '@repo/ui/components/ui'
import { Plus } from 'lucide-react'
import { DataTable } from '@repo/ui/components/ui'
import { columns } from '@/features/admin/TenantTable/columns' // Temporary reuse or need new columns
// import { CategoryManagementDialog } from '@/features/finance/components/CategoryManagementDialog'
// import { CategoryBadge } from '@/features/finance/components/CategoryBadge'

export default function CategoriesPage() {
  const {
    isLoading,
    allCategories,
    handleCreate,
    handleEdit,
    // selectedCategory,
    // isDialogOpen,
    // handleDialogClose,
  } = useCategoriesManagement()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorias Financeiras</h2>
          <p className="text-muted-foreground">
            Gerencie as categorias de receitas e despesas do sistema.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for categories list */}
        {allCategories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(category)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {category.name}
                    </CardTitle>
                    {/* <CategoryBadge type={category.type} /> */}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold" style={{ color: category.color }}>
                        {category.icon || '📁'}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* <CategoryManagementDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
      /> */}
    </div>
  )
}
