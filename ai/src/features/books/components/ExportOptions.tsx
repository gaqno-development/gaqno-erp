'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { useBookExports } from '../hooks/useBookExport'
import { ExportFormat, ExportStatus } from '../types/books'
import { FileText, Download } from 'lucide-react'

interface IExportOptionsProps {
  bookId: string
}

const EXPORT_FORMATS = [
  { format: ExportFormat.PDF, label: 'PDF', description: 'Formato padrão para leitura' },
  { format: ExportFormat.EPUB, label: 'EPUB', description: 'Formato para e-readers' },
  { format: ExportFormat.DOCX, label: 'DOCX', description: 'Documento Word editável' },
  { format: ExportFormat.MARKDOWN, label: 'Markdown', description: 'Formato texto simples' },
  { format: ExportFormat.KDP, label: 'KDP', description: 'Formato Amazon KDP' },
]

export function ExportOptions({ bookId }: IExportOptionsProps) {
  const { createExport, isCreating } = useBookExports(bookId)

  const handleExport = async (format: ExportFormat) => {
    const result = await createExport({
      book_id: bookId,
      format,
      status: ExportStatus.PENDING,
    })

    if (result.success) {
      alert(`Exportação ${format.toUpperCase()} iniciada!`)
    } else {
      alert(`Erro ao exportar: ${result.error}`)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Exportar Livro</h2>
        <p className="text-muted-foreground">
          Escolha o formato para exportar seu livro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORT_FORMATS.map((option) => (
          <Card key={option.format} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {option.label}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleExport(option.format)}
                disabled={isCreating}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar {option.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

