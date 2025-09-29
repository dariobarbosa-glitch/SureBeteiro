'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { AlertCircle, Brain, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function OnboardingPage() {
  const [tenantName, setTenantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Criar tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ nome: tenantName })
        .select()
        .single()

      if (tenantError) throw tenantError

      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tenant_id: tenant.id })
        .eq('id', (await supabase.auth.getUser()).data.user?.id)

      if (profileError) throw profileError

      // Criar wallet padrão
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          tenant_id: tenant.id,
          nome: 'Principal',
          ativo: true
        })

      if (walletError) throw walletError

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-passos-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Brain className="h-12 w-12 text-passos-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-passos-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-navy-900">Bem-vindo à Passos!</CardTitle>
          <CardDescription>
            Vamos configurar sua conta para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTenant} className="space-y-4">
            <div>
              <Label htmlFor="tenantName">Nome da sua organização</Label>
              <Input
                id="tenantName"
                type="text"
                placeholder="Ex: Minha Banca"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !tenantName.trim()}
            >
              {loading ? 'Criando...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}