'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/lgpd'

const supabase = createClient()

export default function DepositsList() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('finance_deposits')
      .select('id,date,amount,people(name),houses(name)')
      .order('date', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Depósitos</h1>
        <div className="flex gap-2">
          <Link href="/finance/deposit/new"><Button variant="outline">Novo Depósito</Button></Link>
          <Link href="/finance"><Button variant="ghost">Voltar</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Extrato</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Data</th>
                <th>Nome Pessoa Destino</th>
                <th>Destino Depósito (Casa)</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td>{r.people?.name ?? '-'}</td>
                  <td>{r.houses?.name ?? '-'}</td>
                  <td className="text-right">{formatCurrency(r.amount)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Sem registros</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
