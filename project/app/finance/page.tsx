'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/lgpd'
import { Plus, Banknote, ArrowDownToLine, ArrowUpFromLine, Receipt } from 'lucide-react'

type Wallet = { id: string; name: string; balance: number }
type Deposit = { id: string; date: string; amount: number; person: string; house: string }
type Withdrawal = { id: string; date: string; amount: number; person: string; house: string }
type Payment = { id: string; date: string; amount: number; expense_type: string; description: string | null }
type CPFBuy = { id: string; date: string; amount: number; person: string }

const supabase = createClient()

export default function FinancePage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [latest, setLatest] = useState<
    Array<{ id: string; date: string; type: string; label: string; amount: number }>
  >([])

  const load = async () => {
    // saldos
    const { data: w } = await supabase.from('finance_wallet_balances').select('*').order('name')
    if (w) setWallets(w as any)

    // últimas transações (pega 5 de cada e junta)
    const [d, s, p, c] = await Promise.all([
      supabase
        .from('finance_deposits')
        .select('id,date,amount,people(name),houses(name)')
        .order('date', { ascending: false })
        .limit(5),
      supabase
        .from('finance_withdrawals')
        .select('id,date,amount,people(name),houses(name)')
        .order('date', { ascending: false })
        .limit(5),
      supabase
        .from('finance_payments')
        .select('id,date,amount,expense_type,description')
        .order('date', { ascending: false })
        .limit(5),
      supabase
        .from('finance_cpf_purchases')
        .select('id,date,amount,people(name)')
        .order('date', { ascending: false })
        .limit(5),
    ])

    const map = [
      ...(d.data || []).map((x: any) => ({
        id: x.id,
        date: x.date,
        type: 'Depósito',
        label: `${x.people?.name ?? ''} · ${x.houses?.name ?? ''}`,
        amount: x.amount,
      })),
      ...(s.data || []).map((x: any) => ({
        id: x.id,
        date: x.date,
        type: 'Saque',
        label: `${x.people?.name ?? ''} · ${x.houses?.name ?? ''}`,
        amount: x.amount,
      })),
      ...(p.data || []).map((x: any) => ({
        id: x.id,
        date: x.date,
        type: 'Pagamento',
        label: `${x.expense_type}${x.description ? ' · ' + x.description : ''}`,
        amount: x.amount,
      })),
      ...(c.data || []).map((x: any) => ({
        id: x.id,
        date: x.date,
        type: 'Compra CPF',
        label: `${x.people?.name ?? ''}`,
        amount: x.amount,
      })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10)

    setLatest(map)
  }

  useEffect(() => { load() }, [])

  const saldoTotal = useMemo(() => wallets.reduce((acc, w) => acc + (w.balance || 0), 0), [wallets])

  return (
    <div className="space-y-6">
      {/* Header + ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas finanças e controle de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button asChild><Link href="/finance/deposit/new"><ArrowDownToLine className="h-4 w-4 mr-2" />Novo Depósito</Link></Button>
          <Button asChild variant="outline"><Link href="/finance/withdraw/new"><ArrowUpFromLine className="h-4 w-4 mr-2" />Novo Saque</Link></Button>
          <Button asChild variant="outline"><Link href="/finance/payment/new"><Receipt className="h-4 w-4 mr-2" />Novo Pagamento</Link></Button>
          <Button asChild variant="outline"><Link href="/finance/cpf/new"><Banknote className="h-4 w-4 mr-2" />Nova Compra CPF</Link></Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Saldo Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(saldoTotal || 0)}</div></CardContent></Card>

        <Card><CardHeader><CardTitle className="text-sm font-medium">Wallets Ativas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{wallets.length}</div></CardContent></Card>

        <Card><CardHeader><CardTitle className="text-sm font-medium">Transações (Últimas)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{latest.length}</div></CardContent></Card>
      </div>

      {/* Saldos por wallet */}
      <Card>
        <CardHeader><CardTitle>Saldos por Wallet</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {wallets.map(w => (
            <div key={w.id} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
              <div className="font-medium">{w.name}</div>
              <div className={w.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                {formatCurrency(w.balance || 0)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Últimas transações */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Últimas Transações</CardTitle>
          <div className="text-sm text-muted-foreground flex gap-3">
            <Link className="underline" href="/finance/deposits">Depósitos</Link>
            <Link className="underline" href="/finance/withdrawals">Saques</Link>
            <Link className="underline" href="/finance/payments">Pagamentos</Link>
            <Link className="underline" href="/finance/cpf-purchases">Compras CPF</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="py-2">Data</th><th>Tipo</th><th>Detalhe</th><th className="text-right">Valor</th></tr>
              </thead>
              <tbody>
                {latest.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td>{t.type}</td>
                    <td className="truncate">{t.label}</td>
                    <td className="text-right">{formatCurrency(t.amount)}</td>
                  </tr>
                ))}
                {latest.length === 0 && (
                  <tr><td className="py-8 text-center text-muted-foreground" colSpan={4}>Sem transações</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
