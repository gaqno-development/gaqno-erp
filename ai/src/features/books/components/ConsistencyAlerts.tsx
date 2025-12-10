'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Alert, AlertDescription } from '@repo/ui/components/ui'
import { AlertTriangle } from 'lucide-react'

interface IConsistencyAlertsProps {
  bookId: string
}

export function ConsistencyAlerts({ bookId }: IConsistencyAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Alertas de Consistência</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Nenhum problema de consistência detectado
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}

