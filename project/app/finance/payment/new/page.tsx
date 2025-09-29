'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/lgpd'
import { BackButton } from '../../_components/back-button'
import { useWallets, usePaymentTypes } from '../..//_components/selects'


const supabase = createClient()

// Visão normalizada para a tabela
type RowView = {
  id: string
  date: string
  amount: number
  description: string | null
  typeName: string
  walletName: string
}

function first<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null)
}

export default function PaymentsList() {
  const [rows, setRows] = useState<RowView[]>([])

  useEffect(() => {
    supabase
      .from('finance_payments')
      .select('id,date,amount,description,finance_payment_types(name),finance_wallets(name)')
      .order('date', { ascending: false })
      .then(({ data }) => {
        const normalized: RowView[] = (data ?? []).map((r: any) => {
          const t = first<any>(r.finance_payment_types)
          const w = first<any>(r.finance_wallets)
          return {
            id: String(r.id),
            date: String(r.date),
            amount: Number(r.amount ?? 0),
            description: r.description ?? null,
            typeName: t?.name ?? '—',
            walletName: w?.name ?? '—',
          }
        })
        setRows(normalized)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/finance/payment/new">Novo Pagamento</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/finance">Voltar</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Extrato</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Carteira</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Descrição</th>
                <th className="py-2 pr-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Sem registros</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 pr-4">{r.walletName}</td>
                  <td className="py-2 pr-4">{r.typeName}</td>
                  <td className="py-2 pr-4">{r.description ?? '—'}</td>
                  <td className="py-2 pl-4 text-right font-medium">{formatCurrency(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
