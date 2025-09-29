'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Plus, Shield, Trash2, UploadCloud, Pencil, FileText } from 'lucide-react'
import { format } from 'date-fns'

// ----- helpers -----
type Person = {
  id: string
  tenant_id?: string | null
  name: string
  cpf: string
  bank?: string | null
  pix?: string | null
  birthdate?: string | null
  email?: string | null
  phone?: string | null
  cep?: string | null
  open: boolean
  doc_url?: string | null
  consent: boolean
  consent_at?: string | null
  created_at: string
}

const maskCPF = (v: string) => {
  const s = (v || '').replace(/\D/g, '').slice(0, 11)
  return s
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

const maskCPFHidden = (v: string) => {
  const s = (v || '').replace(/\D/g, '')
  if (s.length !== 11) return maskCPF(s)
  return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-**`
}

const supabase = createClient()
const BANKS = ['nubank','c6','inter','santander','bradesco','bb','caixa','picpay','mercado pago','itau','nu bank']

// ----- main page -----
export default function PeoplePage() {
  const [rows, setRows] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)
  const [file, setFile] = useState<File | null>(null)

  // form state
  const [form, setForm] = useState<Partial<Person>>({
    name: '',
    cpf: '',
    bank: '',
    pix: '',
    birthdate: '',
    email: '',
    phone: '',
    cep: '',
    open: true,
    consent: true,
  })

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setRows(data as Person[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(r =>
      [r.name, r.email, r.cpf, r.pix, r.bank, r.phone, r.cep]
        .join(' ')
        .toLowerCase()
        .includes(s)
    )
  }, [rows, q])

  const resetForm = () => {
    setForm({ name: '', cpf: '', bank: '', pix: '', birthdate: '', email: '', phone: '', cep: '', open: true, consent: true })
    setFile(null)
  }

  const onNew = () => {
    resetForm()
    setEditing(null)
    setOpenDialog(true)
  }

  const onEdit = (p: Person) => {
    setEditing(p)
    setForm({
      ...p,
      birthdate: p.birthdate ?? '',
    })
    setFile(null)
    setOpenDialog(true)
  }

  const uploadDocIfAny = async (personId: string) => {
    if (!file) return undefined
    const ext = file.name.split('.').pop() || 'bin'
    const path = `people/${personId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('people-docs').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: pub } = supabase.storage.from('people-docs').getPublicUrl(data.path)
    return pub.publicUrl
  }

  const save = async () => {
    // sanitize/normalize cpf (apenas dígitos)
    const payload = { ...form, cpf: (form.cpf || '').replace(/\D/g, '') }

    if (!payload.name || (payload.cpf || '').length !== 11) {
      alert('Nome e CPF (11 dígitos) são obrigatórios.')
      return
    }

    if (editing) {
      // update
      const { data, error } = await supabase.from('people').update({
        name: payload.name,
        cpf: payload.cpf,
        bank: payload.bank,
        pix: payload.pix,
        birthdate: payload.birthdate || null,
        email: payload.email,
        phone: payload.phone,
        cep: payload.cep,
        open: payload.open ?? true,
        consent: payload.consent ?? true,
      }).eq('id', editing.id).select().single()

      if (error) { alert(error.message); return }
      let doc_url = editing.doc_url || null
      try {
        const url = await uploadDocIfAny(editing.id)
        if (url) {
          const { data: d2, error: e2 } = await supabase.from('people').update({ doc_url: url }).eq('id', editing.id).select().single()
          if (!e2 && d2) doc_url = d2.doc_url
        }
      } catch(e: any) {
        alert(`Erro no upload: ${e.message}`)
      }
      setRows(rs => rs.map(r => r.id === editing.id ? { ...(data as Person), doc_url } : r))
    } else {
      // insert
      const { data, error } = await supabase.from('people').insert({
        name: payload.name,
        cpf: payload.cpf,
        bank: payload.bank,
        pix: payload.pix,
        birthdate: payload.birthdate || null,
        email: payload.email,
        phone: payload.phone,
        cep: payload.cep,
        open: payload.open ?? true,
        consent: payload.consent ?? true,
      }).select().single()
      if (error) { alert(error.message); return }
      let doc_url = null
      try {
        const url = await uploadDocIfAny((data as Person).id)
        if (url) {
          const { data: d2 } = await supabase.from('people').update({ doc_url: url }).eq('id', (data as Person).id).select().single()
          if (d2) doc_url = d2.doc_url
        }
      } catch {}
      setRows(rs => [{ ...(data as Person), doc_url }, ...rs])
    }

    setOpenDialog(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir este cadastro?')) return
    const { error } = await supabase.from('people').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setRows(rs => rs.filter(r => r.id !== id))
  }

  const toggleOpen = async (p: Person) => {
    const { data, error } = await supabase.from('people').update({ open: !p.open }).eq('id', p.id).select().single()
    if (!error && data) setRows(rs => rs.map(r => r.id === p.id ? (data as Person) : r))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pessoas</h1>
        <p className="text-muted-foreground">Gerencie pessoas com compliance LGPD</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Pessoas Cadastradas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome, CPF, e-mail, banco…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-[320px]"
            />
            <Button onClick={onNew}><Plus className="h-4 w-4 mr-2" /> Nova Pessoa</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                  <th>Nome</th>
                  <th>CPF (Mascarado)</th>
                  <th>Banco</th>
                  <th>Pix</th>
                  <th>Nascimento</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>CEP</th>
                  <th>Open</th>
                  <th>Documento</th>
                  <th>Data de Cadastro</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="[&>tr:not(:last-child)]:border-b">
                {loading && (
                  <tr><td colSpan={12} className="px-3 py-6 text-center text-muted-foreground">Carregando…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={12} className="px-3 py-6 text-center text-muted-foreground">Nenhuma pessoa cadastrada</td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id} className="[&>td]:px-3 [&>td]:py-2 align-middle">
                    <td className="font-medium">{p.name}</td>
                    <td className="tabular-nums">{maskCPFHidden(p.cpf)}</td>
                    <td className="capitalize">{p.bank || '-'}</td>
                    <td className="truncate max-w-[160px]">{p.pix || '-'}</td>
                    <td>{p.birthdate ? format(new Date(p.birthdate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="truncate max-w-[200px]">{p.email || '-'}</td>
                    <td className="truncate max-w-[140px]">{p.phone || '-'}</td>
                    <td className="truncate max-w-[100px]">{p.cep || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={p.open} onCheckedChange={() => toggleOpen(p)} />
                        <span className="text-xs text-muted-foreground">{p.open ? 'Open' : 'Fechado'}</span>
                      </div>
                    </td>
                    <td>
                      {p.doc_url
                        ? <a href={p.doc_url} target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline"><FileText className="h-4 w-4" /> ver</a>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="whitespace-nowrap">{format(new Date(p.created_at), 'dd/MM/yyyy')}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => onEdit(p)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-500/10" onClick={() => remove(p.id)} title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Novo/Editar */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
          </DialogHeader>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={maskCPF(form.cpf || '')} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>

            <div className="space-y-2">
              <Label>Banco</Label>
              <Input list="banks" value={form.bank || ''} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} placeholder="nubank, inter, c6…" />
              <datalist id="banks">{BANKS.map(b => <option key={b} value={b} />)}</datalist>
            </div>

            <div className="space-y-2">
              <Label>Pix</Label>
              <Input value={form.pix || ''} onChange={e => setForm(f => ({ ...f, pix: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Nascimento</Label>
              <Input type="date" value={form.birthdate || ''} onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="ex.: 11 99999-9999" />
            </div>

            <div className="space-y-2">
              <Label>CEP</Label>
              <Input value={form.cep || ''} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Documento (RG/CNH)</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
                <UploadCloud className="h-4 w-4 opacity-70" />
              </div>
              {editing?.doc_url && !file && (
                <a href={editing.doc_url} target="_blank" className="text-xs text-primary hover:underline">ver arquivo atual</a>
              )}
            </div>

            <div className="space-y-2">
              <Label className="mb-1">Status</Label>
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.open} onCheckedChange={(v) => setForm(f => ({ ...f, open: !!v }))} />
                <span>Open?</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Consentimento LGPD</Label>
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.consent} onCheckedChange={(v) => setForm(f => ({ ...f, consent: !!v }))} />
                <span>Consentimento obtido</span>
              </div>
            </div>
          </div>

          <Separator className="my-2" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={save}>{editing ? 'Salvar alterações' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
