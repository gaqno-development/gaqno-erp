'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Save, X } from 'lucide-react'

interface IBlueprintCardProps {
  content: string
  isEditing: boolean
  onSave: (content: string) => void
}

export function BlueprintCard({ content, isEditing, onSave }: IBlueprintCardProps) {
  const [editedContent, setEditedContent] = useState(content)

  useEffect(() => {
    setEditedContent(content)
  }, [content])

  if (!isEditing) {
    return (
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        rows={10}
        className="font-mono text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSave(editedContent)}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditedContent(content)}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}

