'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Shield, ListChecks, CheckCircle2, AlertTriangle, Pencil, Trash2, Users, Filter } from 'lucide-react'

/* ===== Catálogo: casa -> grupo (clone) ===== */
type CloneGroup = 'Unica' | 'Jon' | 'Estrela' | 'V' | 'Sporting'
const CLONE_GROUPS: CloneGroup[] = ['Unica','Jon','Estrela','V','Sporting']

const HOUSE_CATALOG: Record<string, CloneGroup> = {
  SuperBet: 'Unica',
  Bet365: 'Unica',
  Betano: 'Unica',
  Jonbet: 'Jon',
  Betvip: 'Jon',
  Blaze: 'Jon',
  Flabet: 'Jon',
  Estrelabet: 'Estrela',
  Mcgames: 'Estrela',
  Vbet: 'V',
  SportingBet: 'Sporting',
  NoviBet: 'Unica',
  Betboo: 'Sporting',
  '7games': 'V',
  Bravobet: 'V',
  esportivabet: 'Estrela',
  Afun: 'Jon',
  Betnacional: 'Unica',
}
const HOUSE_OPTIONS = Object.keys(HOUSE_CATALOG)

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const HOUSE_LOOKUP: Record<string, { name: string; group: CloneGroup }> = Object.fromEntries(
  HOUSE_OPTIONS.map((n) => [normalize(n), { name: n, group: HOUSE_CATALOG[n] }]),
)

const badgeClass = (g: CloneGroup) => {
  const base = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium'
  switch (g) {
    case 'Unica':    return `${base} bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400`
    case 'Jon':      return `${base} bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400`
    case 'Estrela':  return `${base} bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400`
    case 'V':        return `${base} bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400`
    case 'Sporting': return `${base} bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400`
  }
}

const applyHouseSelection = (raw: string, setForm: any) => {
  const key = normalize(raw)
  const found = HOUSE_LOOKUP[key]
  if (found) {
    setForm((f: any) => ({ ...f, name: found.name, clone_group: found.group }))
  } else {
    setForm((f: any) => ({ ...f, name: raw }))
  }
}

/* ===== Tipos ===== */
type House = {
  id: string
  name: string
  status: 'a_criar' | 'ativa' | 'limitada'
  person_id: string | null
  notes: string | null
  clone_group: CloneGroup
  created_at: string
}

type Person = {
  id: string
  name: string
  cpf: string
}

const supabase = createClient()
const maskCPF = (v: string) => {
  const s = (v || '').replace(/\D/g, '')
  if (s.length !== 11) return s
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-**`
}

export default function HousesPage() {
  const [items, setItems] = useState<House[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  // filtros topo
  const [personFilter, setPersonFilter] = useState<string>('')        // pessoa
  const [cloneFilter, setCloneFilter]   = useState<CloneGroup | ''>('') // clone
  const [houseFilter, setHouseFilter]   = useState<string>('')        // casa

  // dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState<House | null>(null)
  const [form, setForm] = useState<{
    name: string
    status: House['status']
    notes: string
    clone_group: CloneGroup
    person_id: string | ''
  }>({
    name: '',
    status: 'a_criar',
    notes: '',
    clone_group: 'Unica',
    person_id: '',
  })

  /** Load houses + people */
  const load = async () => {
    setLoading(true)
    const [{ data: houses }, { data: peopleData }] = await Promise.all([
      supabase.from('houses').select('*').order('created_at', { ascending: false }),
      supabase.from('people').select('id,name,cpf').order('name', { ascending: true }),
    ])
    if (houses) setItems(houses as House[])
    if (peopleData) setPeople(peopleData as Person[])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  /** aplica filtros */
  const filteredItems = useMemo(() => {
    return items.filter(i =>
      (!personFilter || i.person_id === personFilter) &&
      (!cloneFilter  || i.clone_group === cloneFilter) &&
      (!houseFilter  || normalize(i.name) === normalize(houseFilter))
    )
  }, [items, personFilter, cloneFilter, houseFilter])

  const counts = useMemo(() => ({
    a_criar:  filteredItems.filter(i => i.status === 'a_criar').length,
    ativa:    filteredItems.filter(i => i.status === 'ativa').length,
    limitada: filteredItems.filter(i => i.status === 'limitada').length,
  }), [filteredItems])

  const onNew = () => {
    setEditing(null)
    setForm({
      name: houseFilter || '',
      status: 'a_criar',
      notes: '',
      clone_group: houseFilter && HOUSE_LOOKUP[normalize(houseFilter)]
        ? HOUSE_LOOKUP[normalize(houseFilter)].group
        : 'Unica',
      person_id: personFilter || '',
    })
    setOpenDialog(true)
  }

  const onEdit = (h: House) => {
    setEditing(h)
    setForm({
      name: h.name,
      status: h.status,
      notes: h.notes || '',
      clone_group: h.clone_group || 'Unica',
      person_id: h.person_id || '',
    })
    setOpenDialog(true)
  }

  const explainSaveError = (err: any) => {
    const msg = (err?.message || '').toLowerCase()
    const details = (err?.details || '').toLowerCase()
    const code = err?.code
    if (code === '23505' || msg.includes('duplicate key value') || details.includes('duplicate key value')) {
      if (details.includes('uniq_person_house_byname')) {
        return 'Essa pessoa já possui uma casa com esse MESMO nome. Edite a existente ou use outro nome.'
      }
      return 'Registro duplicado.'
    }
    return err?.message || 'Erro ao salvar'
  }

  const save = async () => {
    if (!form.name.trim()) { alert('Informe o nome da casa'); return }

    if (editing) {
      const { data, error } = await supabase
        .from('houses')
        .update({
          name: form.name.trim(),
          status: form.status,
          notes: form.notes || null,
          clone_group: form.clone_group,
          person_id: form.person_id || null,
        })
        .eq('id', editing.id)
        .select()
        .single()
      if (error) { alert(explainSaveError(error)); return }
      setItems(list => list.map(x => x.id === editing.id ? (data as House) : x))
    } else {
      const { data, error } = await supabase
        .from('houses')
        .insert({
          name: form.name.trim(),
          status: form.status,
          notes: form.notes || null,
          clone_group: form.clone_group,
          person_id: form.person_id || null,
        })
        .select()
        .single()
      if (error) { alert(explainSaveError(error)); return }
      setItems(list => [data as House, ...list])
    }

    setOpenDialog(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir esta casa?')) return
    const { error } = await supabase.from('houses').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setItems(list => list.filter(i => i.id !== id))
  }

  const moveTo = async (h: House, status: House['status']) => {
    if (h.status === status) return
    const prev = h.status
    setItems(list => list.map(x => x.id === h.id ? { ...x, status } : x))
    const { error } = await supabase.from('houses').update({ status }).eq('id', h.id)
    if (error) {
      setItems(list => list.map(x => x.id === h.id ? { ...x, status: prev } : x))
      alert(error.message)
    }
  }

  const findPerson = (id?: string | null) => people.find(p => p.id === id)

  const Column = ({
    title, status, icon,
  }: { title: string; status: House['status']; icon: React.ReactNode }) => {
    const list = filteredItems.filter(i => i.status === status)
    return (
      <div className="flex-1 min-w-[260px]">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          {icon}{title} <span className="ml-1 text-xs text-muted-foreground/70">({list.length})</span>
        </div>
        <div className="rounded-lg border bg-card">
          <ul className="p-2 space-y-2">
            {loading && list.length === 0 && (
              <li className="text-xs text-muted-foreground px-2 py-6 text-center">Carregando…</li>
            )}
            {!loading && list.length === 0 && (
              <li className="text-xs text-muted-foreground px-2 py-6 text-center">Nenhuma casa aqui</li>
            )}
            {list.map(h => {
              const p = findPerson(h.person_id)
              return (
                <li key={h.id} className="rounded-md border bg-background px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{h.name}</div>
                      <span className={badgeClass(h.clone_group)}>{h.clone_group}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => onEdit(h)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-500/10" onClick={() => remove(h.id)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {p ? `${p.name} — ${maskCPF(p.cpf)}` : 'Sem vínculo'}
                  </div>
                  {h.notes && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{h.notes}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Mover para:</Label>
                    <select
                      value={h.status}
                      onChange={(e) => moveTo(h, e.target.value as House['status'])}
                      className="text-xs rounded-md border bg-background px-2 py-1"
                    >
                      <option value="a_criar">A Criar</option>
                      <option value="ativa">Ativa</option>
                      <option value="limitada">Limitada</option>
                    </select>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Casas de Apostas</h1>
          <p className="text-muted-foreground">Gerencie o status das suas casas de apostas</p>
        </div>

        {/* ===== Filtros ===== */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {/* Pessoa */}
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm min-w-[220px]"
            title="Filtrar por pessoa"
          >
            <option value="">(Todas as pessoas)</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {maskCPF(p.cpf)}
              </option>
            ))}
          </select>

          {/* Clone */}
          <select
            value={cloneFilter}
            onChange={(e) => setCloneFilter(e.target.value as CloneGroup | '')}
            className="rounded-md border bg-background px-3 py-2 text-sm"
            title="Filtrar por tipo de clone"
          >
            <option value="">(Todos os clones)</option>
            {CLONE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Casa */}
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm min-w-[180px]"
            title="Filtrar por casa"
          >
            <option value="">(Todas as casas)</option>
            {HOUSE_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>

          { (personFilter || cloneFilter || houseFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setPersonFilter(''); setCloneFilter(''); setHouseFilter('') }}>
              Limpar
            </Button>
          )}

          <Button onClick={onNew}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Casa
          </Button>
        </div>
      </div>

      {/* Contadores (filtrados) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">A Criar</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{counts.a_criar}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{counts.ativa}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Limitadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{counts.limitada}</div></CardContent>
        </Card>
      </div>

      {/* Kanban */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Kanban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto">
            <Column title="A Criar"   status="a_criar"  icon={<ListChecks className="h-4 w-4" />} />
            <Column title="Ativa"     status="ativa"    icon={<CheckCircle2 className="h-4 w-4" />} />
            <Column title="Limitada"  status="limitada" icon={<AlertTriangle className="h-4 w-4" />} />
          </div>
        </CardContent>
      </Card>

      {/* Dialog Novo/Editar */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Editar Casa' : 'Adicionar Casa'}</DialogTitle></DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Casa de Aposta</Label>
              <Input
                list="house-options"
                value={form.name}
                onChange={(e) => applyHouseSelection(e.target.value, setForm)}
                placeholder="Selecione ou digite…"
              />
              <datalist id="house-options">
                {HOUSE_OPTIONS.map(h => <option key={h} value={h} />)}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Se escolher uma casa do catálogo, o <b>Tipo do Clone</b> é preenchido automaticamente.
              </p>
            </div>

            <div className="space-y-1">
              <Label>Pessoa vinculada</Label>
              <select
                value={form.person_id}
                onChange={(e) => setForm(f => ({ ...f, person_id: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="">(Sem vínculo)</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {maskCPF(p.cpf)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value as House['status'] }))}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="a_criar">A Criar</option>
                <option value="ativa">Ativa</option>
                <option value="limitada">Limitada</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label>Tipo do Clone</Label>
              <select
                value={form.clone_group}
                onChange={(e) => setForm(f => ({ ...f, clone_group: e.target.value as CloneGroup }))}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                {CLONE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Notas (opcional)</Label>
              <textarea
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="Login criado, limite atual, observações…"
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={save}>{editing ? 'Salvar alterações' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
