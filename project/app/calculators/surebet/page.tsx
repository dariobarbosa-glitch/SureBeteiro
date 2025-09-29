'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercentage } from '@/lib/utils/lgpd'
import { Calculator, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react'

type Results = {
  profitA: number
  profitB: number
  minProfit: number
  roiPercentage: number
  isSurebetByOdds: boolean
  isSurebetOperation: boolean
  invSum: number
  stakeAEqual: number
  stakeBEqual: number
}

export default function SurebetCalculator() {
  const [oddsA, setOddsA] = useState('')
  const [oddsB, setOddsB] = useState('')
  const [stakeA, setStakeA] = useState('')
  const [stakeB, setStakeB] = useState('')

  const [results, setResults] = useState<Results | null>(null)

  const equalizeA = () => {
    // ajustar A para igualar lucros mantendo B
    const oA = parseFloat(oddsA)
    const oB = parseFloat(oddsB)
    const sB = parseFloat(stakeB)
    if (!oA || !oB || !sB) return
    const sAeq = (sB * oB) / oA
    setStakeA((Math.round(sAeq * 100) / 100).toString())
  }

  const equalizeB = () => {
    // ajustar B para igualar lucros mantendo A
    const oA = parseFloat(oddsA)
    const oB = parseFloat(oddsB)
    const sA = parseFloat(stakeA)
    if (!oA || !oB || !sA) return
    const sBeq = (sA * oA) / oB
    setStakeB((Math.round(sBeq * 100) / 100).toString())
  }

  const calculate = () => {
    const oA = parseFloat(oddsA)
    const oB = parseFloat(oddsB)
    const sA = parseFloat(stakeA)
    const sB = parseFloat(stakeB)

    if (!oA || !oB || oA <= 1 || oB <= 1) {
      alert('Insira odds válidas (maiores que 1).')
      return
    }
    if (sA < 0 || sB < 0 || isNaN(sA) || isNaN(sB)) {
      alert('Insira stakes válidas (0 ou mais) para as duas casas.')
      return
    }

    const total = sA + sB
    const invSum = 1 / oA + 1 / oB
    const isSurebetByOdds = invSum < 1

    // Lucro líquido de toda a operação em cada cenário:
    // Se A ganhar: sA*(oA-1) - sB
    // Se B ganhar: sB*(oB-1) - sA
    const profitA = sA * (oA - 1) - sB
    const profitB = sB * (oB - 1) - sA

    const minProfit = Math.min(profitA, profitB)
    const roiPercentage = total > 0 ? (minProfit / total) * 100 : 0
    const isSurebetOperation = profitA >= 0 && profitB >= 0

    // stakes para equalizar lucros mantendo a outra fixa:
    // condição: sA*oA = sB*oB
    const stakeBEqual = (sA * oA) / oB
    const stakeAEqual = (sB * oB) / oA

    setResults({
      profitA,
      profitB,
      minProfit,
      roiPercentage,
      isSurebetByOdds,
      isSurebetOperation,
      invSum,
      stakeAEqual,
      stakeBEqual,
    })
  }

  const clearAll = () => {
    setOddsA('')
    setOddsB('')
    setStakeA('')
    setStakeB('')
    setResults(null)
  }

  const totalStake =
    (parseFloat(stakeA) || 0) + (parseFloat(stakeB) || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Calculadora Surebet
        </h1>
        <p className="text-muted-foreground">
          Informe as odds e quanto foi apostado em cada casa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PARÂMETROS */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="oddsA">Odds Casa A</Label>
                <Input
                  id="oddsA"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 4.90"
                  value={oddsA}
                  onChange={(e) => setOddsA(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="oddsB">Odds Casa B</Label>
                <Input
                  id="oddsB"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1.37"
                  value={oddsB}
                  onChange={(e) => setOddsB(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stakeA">Stake Casa A (R$)</Label>
                <div className="flex gap-2">
                  <Input
                    id="stakeA"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 3300.00"
                    value={stakeA}
                    onChange={(e) => setStakeA(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={equalizeB} title="Ajustar B para lucros iguais">
                    Equalizar B
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="stakeB">Stake Casa B (R$)</Label>
                <div className="flex gap-2">
                  <Input
                    id="stakeB"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 11802.92"
                    value={stakeB}
                    onChange={(e) => setStakeB(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={equalizeA} title="Ajustar A para lucros iguais">
                    Equalizar A
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <div className="mr-auto text-sm text-muted-foreground">
                Total apostado: <span className="font-medium">{formatCurrency(totalStake || 0)}</span>
              </div>
              <Button type="button" variant="ghost" onClick={clearAll}>
                Limpar
              </Button>
              <Button type="button" onClick={calculate} size="lg" className="min-w-[200px] font-semibold">
                Calcular
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RESULTADOS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                {/* Banner odds */}
                {results.isSurebetByOdds ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Surebet pelas odds!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                      1/oddsA + 1/oddsB = {results.invSum.toFixed(4)} &lt; 1
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Não é surebet pelas odds.
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Soma das probabilidades: {formatPercentage(results.invSum * 100)}
                    </p>
                  </div>
                )}

                {/* Lucros por cenário */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground">Se A ganhar</p>
                    <p className={`text-lg font-bold ${results.profitA >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(results.profitA)}
                    </p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground">Se B ganhar</p>
                    <p className={`text-lg font-bold ${results.profitB >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(results.profitB)}
                    </p>
                  </div>
                </div>

                {/* Mínimo garantido e ROI */}
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    results.minProfit >= 0
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border-emerald-500'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border-red-500'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro Mínimo (garantido)</p>
                      <p className={`text-xl font-bold ${results.minProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(results.minProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margem sobre o total</p>
                      <p className={`text-xl font-bold ${results.minProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatPercentage(results.roiPercentage)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estado da operação + sugestões */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Operação é surebet?{' '}
                    <span className={`font-medium ${results.isSurebetOperation ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {results.isSurebetOperation ? 'Sim, lucro em ambos os cenários.' : 'Não, há cenário com prejuízo.'}
                    </span>
                  </p>
                  <p className="text-xs">
                    Dica: para equalizar os lucros agora, ajuste para aproximadamente{' '}
                    <b>Stake A = {formatCurrency(results.stakeAEqual)}</b> ou{' '}
                    <b>Stake B = {formatCurrency(results.stakeBEqual)}</b>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Informe as odds e as stakes das duas casas para calcular.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Surebet ocorre quando <strong>1/Odds₁ + 1/Odds₂ &lt; 1</strong>. Aqui você informa quanto já
            apostou em cada lado; calculamos o lucro em cada cenário e o lucro mínimo sobre o total apostado.
          </p>
          <p>
            Lucro se A ganhar: <code>StakeA × (OddsA − 1) − StakeB</code> — e vice-versa para B.
          </p>
          <p>
            Para <strong>equalizar</strong> os lucros: use a relação <code>StakeA × OddsA = StakeB × OddsB</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
