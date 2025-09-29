"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertTriangle } from "lucide-react"

// ===== helpers =====
const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

const pct = (n: number) => `${(n * 100).toFixed(2)}%`

// aceita "2,10", "1.000,50", etc.
const parseNum = (s: string): number => {
  if (typeof s !== "string") return Number(s ?? 0)
  const clean = s.trim().replace(/\./g, "").replace(",", ".")
  const v = Number(clean)
  return Number.isFinite(v) ? v : 0
}

export default function SurebetClassic() {
  // nomes das casas (campo livre, só pra visual)
  const [bookA, setBookA] = useState("Casa A")
  const [bookB, setBookB] = useState("Casa B")

  // odds e stakes como string p/ aceitar vírgula
  const [oddA, setOddA] = useState("4,90")
  const [oddB, setOddB] = useState("1,37")
  const [stakeA, setStakeA] = useState("3300,00")
  const [stakeB, setStakeB] = useState("11802,92")

  const oA = parseNum(oddA)
  const oB = parseNum(oddB)
  const sA = parseNum(stakeA)
  const sB = parseNum(stakeB)

  const calc = useMemo(() => {
    const inv = (1 / oA) + (1 / oB)
    const theoSurebet = inv < 1 && oA > 1 && oB > 1

    // lucros por cenário (lucro líquido da operação como um todo)
    const profitA = sA * (oA - 1) - sB
    const profitB = sB * (oB - 1) - sA

    const total = sA + sB
    const minProfit = Math.min(profitA, profitB)
    const roi = total > 0 ? minProfit / total : 0
    const opSurebet = profitA >= 0 && profitB >= 0

    // equalização (stake do outro lado p/ lucros iguais mantendo esta fixa)
    // condição: sA * oA = sB * oB
    const stakeBEqual = oB > 0 ? (sA * oA) / oB : 0
    const stakeAEqual = oA > 0 ? (sB * oB) / oA : 0

    return {
      inv,
      theoSurebet,
      profitA,
      profitB,
      total,
      minProfit,
      roi,
      opSurebet,
      stakeBEqual,
      stakeAEqual,
    }
  }, [oA, oB, sA, sB])

  const clearAll = () => {
    setBookA("Casa A"); setBookB("Casa B")
    setOddA(""); setOddB(""); setStakeA(""); setStakeB("")
  }

  const setStakeARounded = (v: number) => setStakeA((Math.round(v * 100) / 100).toString().replace(".", ","))
  const setStakeBRounded = (v: number) => setStakeB((Math.round(v * 100) / 100).toString().replace(".", ","))

  const invalid = !(oA > 1 && oB > 1 && sA >= 0 && sB >= 0 && Number.isFinite(oA) && Number.isFinite(oB))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Calculadora Surebet (clássica)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* status */}
        <div className="mb-4">
          {calc.theoSurebet ? (
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-600/30 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">
                Surebet pelas odds (1/A + 1/B = {calc.inv.toFixed(4)} &lt; 1)
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-amber-700 dark:text-amber-400 border-amber-700/30 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                1/A + 1/B = {calc.inv.toFixed(4)} (precisa &lt; 1 para arbitragem)
              </span>
            </div>
          )}
        </div>

        {/* linhas */}
        <div className="grid gap-2">
          {/* header da grid */}
          <div className="grid grid-cols-[1fr_120px_180px_180px] gap-2 text-xs text-muted-foreground px-1">
            <div>Casa</div>
            <div>Odds</div>
            <div>Stake (R$)</div>
            <div>Lucro se ganhar</div>
          </div>

          {/* row A */}
          <div className="grid grid-cols-[1fr_120px_180px_180px] gap-2 items-center">
            <Input value={bookA} onChange={(e) => setBookA(e.target.value)} />
            <Input
              value={oddA}
              inputMode="decimal"
              onChange={(e) => setOddA(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Input
                value={stakeA}
                inputMode="decimal"
                onChange={(e) => setStakeA(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                className="whitespace-nowrap"
                onClick={() => setStakeBRounded(calc.stakeBEqual)}
                title="Ajustar stake B para igualar lucros"
              >
                Equalizar B
              </Button>
            </div>
            <div className={`h-10 rounded-md border flex items-center justify-end px-3 font-medium
                            ${calc.profitA >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {money(calc.profitA)}
            </div>
          </div>

          {/* row B */}
          <div className="grid grid-cols-[1fr_120px_180px_180px] gap-2 items-center">
            <Input value={bookB} onChange={(e) => setBookB(e.target.value)} />
            <Input
              value={oddB}
              inputMode="decimal"
              onChange={(e) => setOddB(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Input
                value={stakeB}
                inputMode="decimal"
                onChange={(e) => setStakeB(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                className="whitespace-nowrap"
                onClick={() => setStakeARounded(calc.stakeAEqual)}
                title="Ajustar stake A para igualar lucros"
              >
                Equalizar A
              </Button>
            </div>
            <div className={`h-10 rounded-md border flex items-center justify-end px-3 font-medium
                            ${calc.profitB >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {money(calc.profitB)}
            </div>
          </div>
        </div>

        {/* footer: total e ROI */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">Total:</span>
            <span className="font-semibold">{money(calc.total)}</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-md text-sm font-semibold border
                       ${calc.minProfit >= 0
                         ? "bg-emerald-500/15 border-emerald-600/30 text-emerald-600 dark:text-emerald-400"
                         : "bg-red-500/10 border-red-600/30 text-red-600 dark:text-red-400"}`}
            title="Lucro mínimo / Total apostado"
          >
            {pct(calc.roi)}
          </div>
        </div>

        {/* ações */}
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={clearAll}>Limpar</Button>
          <Button
            variant={calc.opSurebet ? "default" : "secondary"}
            disabled={invalid}
            title={calc.opSurebet ? "Operação com lucro em ambos cenários" : "Há cenário com prejuízo"}
          >
            {calc.opSurebet ? "Surebet na operação" : "Operação não equilibrada"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
