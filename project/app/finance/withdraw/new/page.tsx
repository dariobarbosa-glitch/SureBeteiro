// app/finance/withdraw/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BackButton } from '@/app/finance/_components/back-button'

// Se seus hooks estão em "app/finance/_components/selects", mantenha assim.
// Se estiverem em "components/selects", ajuste o import abaixo.
import { usePeople, useHouses, useWallets, maskCPF } from '../../_components/selects'

const supabase = createClient()

export default function NewWithdrawPage() {
  const router = useRouter()

  const people  = usePeople()
  const houses  = useHouses()
  const wallets = useWallets() // carteira de destino (ex.: "Banca")

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [personId, setPersonId] = useState('')
  const [houseId, setHouseId]   = useState('')
  const [walletId, setWalletId] = useState('')
  const [amount, setAmount]     = useState('')

  async function submit() {
    if (!date || !personId || !houseId || !walletId || !amount) {
      alert('Preencha data, pessoa, casa, destino e valor.')
      return
    }

    const value = Number(String(amount).replace(',', '.'))
    if (Number.isNaN(value) || value <= 0) {
      alert('Valor inválido.')
      return
    }

    const { error } = await supabase
      .from('finance_withdrawals')
      .insert({
        date,                 // date
        person_id: personId,  // uuid -> people.id
        house_id: houseId,    // uuid -> houses.id
        wallet_id: walletId,  // uuid -> finance_wallets.id
        amount: value,        // numeric
      })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/finance/withdrawals') // volta para o extrato de saques
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Novo Saque</h1>
        <div className="flex gap-2">
          <BackButton fallback="/finance/withdrawals" />
          <Button onClick={submit}>Salvar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Data Movimentação</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Nome Origem (Pessoa)</Label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.cpf ? ` — ${maskCPF(p.cpf)}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Origem Saque (Casa)</Label>
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Destino Saque (Wallet)</Label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Valor Transação</Label>
            <Input
              inputMode="decimal"
              placeholder="Ex.: 150,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
