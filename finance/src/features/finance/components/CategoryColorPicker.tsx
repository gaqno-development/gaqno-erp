'use client'

import { cn } from '@repo/core/lib/utils'

interface ICategoryColorPickerProps {
  selectedColor?: string
  onSelect: (color: string) => void
}

const AVAILABLE_COLORS = [
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Rosa Claro', value: '#F472B6' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Laranja', value: '#F59E0B' },
  { name: 'Amarelo', value: '#EAB308' },
  { name: 'Verde Claro', value: '#84CC16' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Verde Escuro', value: '#059669' },
  { name: 'Azul Claro', value: '#06B6D4' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Azul Escuro', value: '#2563EB' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Roxo Escuro', value: '#7C3AED' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Cinza', value: '#6B7280' },
  { name: 'Preto', value: '#1F2937' },
]

export function CategoryColorPicker({
  selectedColor,
  onSelect,
}: ICategoryColorPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {AVAILABLE_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onSelect(color.value)}
          className={cn(
            'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
            selectedColor === color.value
              ? 'border-primary scale-110'
              : 'border-border hover:border-primary/50'
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  )
}

