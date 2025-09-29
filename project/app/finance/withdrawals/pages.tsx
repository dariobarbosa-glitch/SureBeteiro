'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BackButton } from '@/components/back-button'

// ajuste
import { usePeople, useHouses, useWallets, maskCPF } from '../../_components/selects'

const supabase = createClient()

export default function NewWithdrawPage() {
  const router = useRouter()
  const people = usePeople()
  const wallets = useWallets()

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [personId, setPersonId] = useState('')
  const [houseId, setHouseId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [amount, setAmount] = useState('')

  const houses = useHouses(personId)

  useEffect(() => { setHouseId('') }, [personId])

  async function submit() {
    if (!date || !personId || !houseId || !walletId || !amount) {
      alert('Preencha data, pessoa, casa, carteira e valor.')
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
        date,
        person_id: personId,
        house_id: houseId,     // origem: casa
        wallet_id: walletId,   // destino: carteira
        amount: value,
      })

    if (error) { alert(error.message); return }
    router.push('/finance/withdrawals')
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
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Pessoa (Dona da Casa)</Label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {maskCPF(p.cpf)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Casa (Origem)</Label>
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled={!personId}
            >
              <option value="">{personId ? 'Selecione' : 'Escolha a pessoa primeiro'}</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Carteira (Destino)</Label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Valor</Label>
            <Input
              inputMode="decimal"
              placeholder="Ex.: 1.500,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
