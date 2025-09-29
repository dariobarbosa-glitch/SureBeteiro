'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePeople, maskCPF } from '../../_components/selects'

const supabase = createClient()

export default function NewCPFPurchase() {
  const router = useRouter()
  const people = usePeople()

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [personId, setPersonId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  const save = async () => {
    const a = parseFloat(amount.replace(',', '.'))
    if (!personId || !a || a <= 0) { alert('Preencha os campos'); return }
    const { error } = await supabase.from('finance_cpf_purchases').insert({
      date, amount: a, person_id: personId,
    })
    if (error) { alert(error.message); return }
    router.push('/finance/cpf-purchases')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Nova Compra CPF</h1>
        <Link href="/finance/cpf-purchases"><Button variant="ghost">Voltar</Button></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Dados</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Pessoa</Label>
              <select className="w-full rounded-md border bg-background px-3 py-2"
                value={personId} onChange={e => setPersonId(e.target.value)}>
                <option value="">Selecione…</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {maskCPF(p.cpf)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input placeholder="Ex.: 100,00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link href="/finance/cpf-purchases"><Button variant="ghost">Cancelar</Button></Link>
            <Button onClick={save}>Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
