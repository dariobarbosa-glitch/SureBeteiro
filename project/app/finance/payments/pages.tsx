'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const supabase = createClient()

type Row = {
  id: string
  date: string
  amount: number
  description: string | null
  type: { name: string } | null
  wallet: { name: string } | null
}

export default function PaymentsList() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    supabase
      .from('finance_payments')
      .select('id,date,amount,description, type:finance_payment_types(name), wallet:finance_wallets(name)')
      .order('date', { ascending: false })
      .then(({ data }) => setRows((data as any[]) || []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <div className="flex gap-2">
          <Link href="/finance/payment/new">
            <Button>Novo Pagamento</Button>
          </Link>
          <Link href="/finance">
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extrato</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Carteira</th>
                <th className="py-2 pr-4">Descrição</th>
                <th className="py-2 pr-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td className="py-8 text-center text-muted-foreground" colSpan={5}>Sem registros</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 pr-4">{r.type?.name ?? '-'}</td>
                  <td className="py-2 pr-4">{r.wallet?.name ?? '-'}</td>
                  <td className="py-2 pr-4">{r.description ?? '-'}</td>
                  <td className="py-2 pr-4 text-right">
                    {r.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
