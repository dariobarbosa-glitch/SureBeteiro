"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Info } from "lucide-react"

// ---------- helpers ----------
type Status = "win" | "half-win" | "push" | "half-loss" | "loss" | "mixed"

const parseNum = (s: string): number => {
  const clean = (s ?? "").trim().replace(/\s+/g, "").replace(",", ".")
  if (clean === "" || clean === "+" || clean === "-") return NaN
  return Number(clean)
}

// divide linhas .25/.75 em duas metades vizinhas (ex.: -1.25 => [-1, -1.5])
function splitQuarter(line: number): number[] {
  const sign = Math.sign(line) || 1
  const abs = Math.abs(line)
  const frac = Math.round((abs - Math.floor(abs)) * 100) / 100 // 2 casas
  const base = Math.floor(abs)
  if (Math.abs(frac - 0.25) < 1e-6) return [sign * base, sign * (base + 0.5)]
  if (Math.abs(frac - 0.75) < 1e-6) return [sign * (base + 0.5), sign * (base + 1)]
  return [line]
}

function unitOutcome(val: number, isIntegerLine: boolean): "win" | "loss" | "push" {
  if (val > 0) return "win"
  if (val < 0) return "loss"
  return isIntegerLine ? "push" : "loss" // val==0 só “push” em linhas inteiras
}

function evalAH(margin: number, side: "A" | "B", line: number): Status {
  const parts = splitQuarter(line)
  const res: ("win" | "loss" | "push")[] = parts.map((p) => {
    const test = side === "A" ? margin + p : -margin + p // (A-B)+L  ou  (B-A)+L
    const isInt = Math.abs(p % 1) < 1e-6
    return unitOutcome(test, isInt)
  })

  const wins = res.filter((r) => r === "win").length
  const losses = res.filter((r) => r === "loss").length
  const pushes = res.filter((r) => r === "push").length

  if (wins === res.length) return "win"
  if (losses === res.length) return "loss"
  if (wins && pushes) return "half-win"
  if (losses && pushes) return "half-loss"
  if (pushes === res.length) return "push"
  // win + loss (raro em margens inteiras, mas cobrimos)
  return "mixed"
}

function statusPill(s: Status) {
  const map: Record<Status, { label: string; cls: string }> = {
    "win":       { label: "Vitória",          cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-600/30" },
    "half-win":  { label: "Meia vitória",     cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-600/30" },
    "push":      { label: "Push (devolve)",    cls: "bg-muted text-muted-foreground border-border" },
    "half-loss": { label: "Meia perda",       cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-600/30" },
    "loss":      { label: "Derrota",          cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-600/30" },
    "mixed":     { label: "Win/Loss (mista)", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-600/30" },
  }
  const { label, cls } = map[s]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>{label}</span>
}

type Row = { margin: number; a: Status; b: Status }
type Segment = { from: number; to: number; a: Status; b: Status }

// ---------- componente ----------
export default function HandicapExplorer() {
  const [teamA, setTeamA] = useState("Time A")
  const [teamB, setTeamB] = useState("Time B")
  const [lineA, setLineA] = useState("-11,5")
  const [lineB, setLineB] = useState("+11,5")
  const [padding, setPadding] = useState(4) // margens extras além dos limiares

  const lA = parseNum(lineA)
  const lB = parseNum(lineB)

  const { rows, segments, range } = useMemo(() => {
    if (!Number.isFinite(lA) || !Number.isFinite(lB)) {
      return { rows: [] as Row[], segments: [] as Segment[], range: { min: -15, max: 15 } }
    }
    // limiares onde o resultado muda:
    const bounds = [
      ...splitQuarter(lA).map((p) => -p), // A muda quando (A-B)+L = 0  => M = -L
      ...splitQuarter(lB).map((p) =>  p), // B muda quando (B-A)+L = 0  => M =  L
      0,
    ]
    const base = Math.ceil(Math.max(...bounds.map((x) => Math.abs(x))) + padding)
    const min = -base
    const max =  base

    const rows: Row[] = []
    for (let m = min; m <= max; m++) {
      rows.push({ margin: m, a: evalAH(m, "A", lA), b: evalAH(m, "B", lB) })
    }

    // agrupar margens consecutivas com mesmo par de resultados
    const segs: Segment[] = []
    let start = min
    for (let m = min; m <= max; m++) {
      const cur = rows.find((r) => r.margin === m)!
      const nxt = rows.find((r) => r.margin === m + 1)
      if (!nxt || nxt.a !== cur.a || nxt.b !== cur.b) {
        segs.push({ from: start, to: m, a: cur.a, b: cur.b })
        start = m + 1
      }
    }

    return { rows, segments: segs, range: { min, max } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lA, lB, padding])

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Explorer de Handicap Asiático
        </h1>
        <p className="text-muted-foreground">
          Selecione as linhas para cada lado e veja, por margem de placar (A − B), quem vence, perde ou devolve.
        </p>
      </div>

      {/* Parâmetros */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome do lado A</Label>
              <Input value={teamA} onChange={(e) => setTeamA(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nome do lado B</Label>
              <Input value={teamB} onChange={(e) => setTeamB(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Handicap do {teamA} (ex.: -11,5 · -1,25 · +0,75)</Label>
              <Input value={lineA} onChange={(e) => setLineA(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Handicap do {teamB} (ex.: +11,5 · +2,5 · -0,75)</Label>
              <Input value={lineB} onChange={(e) => setLineB(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <Label>Alcance das margens (±)</Label>
              <Input
                type="number"
                step="1"
                min={0}
                className="w-28"
                value={padding}
                onChange={(e) => setPadding(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Margem é <b>placar de {teamA} − {teamB}</b>. Ex.: margem 12 = {teamA} venceu por 12.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regras de bolso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como interpretar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Para o lado A com linha <code>L</code>, avaliamos <code>(A − B) + L</code>. Se &gt; 0, vitória; se = 0 e
            a linha é inteira, <em>push</em>; se &lt; 0, derrota. Para o lado B com linha <code>LB</code>, avaliamos{" "}
            <code>(B − A) + LB</code>.
          </p>
          <p>
            Linhas <b>.25 / .75</b> dividem a aposta em duas metades vizinhas (ex.: -1.25 =&gt; metade -1 e metade -1.5),
            permitindo <em>meia vitória</em> ou <em>meia perda</em>.
          </p>
        </CardContent>
      </Card>

      {/* Tabela resumida por intervalos */}
      <Card>
        <CardHeader>
          <CardTitle>Intervalos por margem (A − B)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {segments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Preencha linhas válidas (ex.: -11,5 e +11,5).</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                    <th>Margem</th>
                    <th>{teamA}</th>
                    <th>{teamB}</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)]:border-b">
                  {segments.map((s, idx) => (
                    <tr key={idx} className="[&>td]:px-3 [&>td]:py-2">
                      <td className="whitespace-nowrap">
                        {s.from === s.to ? s.from : `${s.from} … ${s.to}`}
                      </td>
                      <td>{statusPill(s.a)}</td>
                      <td>{statusPill(s.b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Intervalos agrupam margens consecutivas com o mesmo resultado para {teamA} e {teamB}.
          </p>
        </CardContent>
      </Card>

      {/* Tabela detalhada por margem inteira */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhe por margem inteira ({range.min} a {range.max})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Insira linhas válidas para ver o detalhamento.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-muted/50">
                  <tr className="[&>th]:px-2 sm:[&>th]:px-3 [&>th]:py-2 text-left">
                    <th>Margem</th>
                    <th>{teamA}</th>
                    <th>{teamB}</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)]:border-b">
                  {rows.map((r) => (
                    <tr key={r.margin} className="[&>td]:px-2 sm:[&>td]:px-3 [&>td]:py-1.5">
                      <td>{r.margin}</td>
                      <td>{statusPill(r.a)}</td>
                      <td>{statusPill(r.b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
