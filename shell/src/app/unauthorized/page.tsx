'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '@repo/core/lib/constants'

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Entre em contato com o administrador do sistema se você acredita que isto é um erro.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleGoBack}>
            Voltar ao Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

