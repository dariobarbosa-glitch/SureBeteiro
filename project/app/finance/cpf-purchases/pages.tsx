'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/lgpd'
import { maskCPF } from '../../_components/selects' // ajuste se necessário

const supabase = createClient()

// Visão normalizada para a tabela
type RowView = {
  id: string
  date: string
  amount: number
  personName: string
  personCPF: string | null
}

// helper: pega o primeiro elemento se vier array, senão devolve o próprio objeto
function first<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null)
}

export default function CPFBuyList() {
  const [rows, setRows] = useState<RowView[]>([])

  useEffect(() => {
    supabase
      .from('finance_cpf_purchases')
      .select('id,date,amount,people(name,cpf)')
      .order('date', { ascending: false })
      .then(({ data }) => {
        const normalized: RowView[] = (data ?? []).map((r: any) => {
          const p = first<any>(r.people)
          return {
            id: String(r.id),
            date: String(r.date),
            amount: Number(r.amount ?? 0),
            personName: p?.name ?? '—',
            personCPF: p?.cpf ?? null,
          }
        })
        setRows(normalized)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compras de CPF</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/finance/cpf/new">Nova Compra CPF</Link>
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
                <th className="py-2 pr-4">Pessoa</th>
                <th className="py-2 pr-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Sem registros</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 pr-4">
                    {r.personName} {r.personCPF ? `— ${maskCPF(r.personCPF)}` : ''}
                  </td>
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
