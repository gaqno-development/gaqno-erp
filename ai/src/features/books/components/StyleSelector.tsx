'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { cn } from '@repo/core/lib/utils'
import { Button } from '@repo/ui/components/ui'

const STYLES = [
  {
    id: 'narrative',
    label: 'Narrativo',
    description: 'Estilo tradicional de narrativa',
    preview: 'Uma história contada em terceira pessoa...',
  },
  {
    id: 'first-person',
    label: 'Primeira Pessoa',
    description: 'Narrativa em primeira pessoa',
    preview: 'Eu me lembro daquele dia como se fosse ontem...',
  },
  {
    id: 'dialogue-heavy',
    label: 'Diálogo Intenso',
    description: 'Foco em diálogos e conversas',
    preview: '"Você não entende", disse ela. "É mais complexo do que parece."',
  },
  {
    id: 'descriptive',
    label: 'Descritivo',
    description: 'Rico em descrições e detalhes',
    preview: 'O sol se punha sobre as montanhas, pintando o céu de tons dourados...',
  },
  {
    id: 'minimalist',
    label: 'Minimalista',
    description: 'Estilo direto e conciso',
    preview: 'Ele caminhou. Ela seguiu. O destino os aguardava.',
  },
]

interface IStyleSelectorProps {
  selectedStyle?: string | null
  onStyleSelect: (style: string) => void
}

export function StyleSelector({ selectedStyle, onStyleSelect }: IStyleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Estilo de Escrita</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {STYLES.map((style) => (
          <Card
            key={style.id}
            className={cn(
              'cursor-pointer transition-all hover:border-primary',
              selectedStyle === style.id && 'border-primary ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => onStyleSelect(style.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{style.label}</CardTitle>
              <CardDescription className="text-xs">{style.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground italic">{style.preview}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

