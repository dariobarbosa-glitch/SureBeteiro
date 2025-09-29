'use client'

import HandicapExplorer from '@/components/handicap-explorer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Info, BookOpen, Sigma, CheckCircle2, XCircle, Minus } from 'lucide-react'

/** Seção de guia (texto explicativo) */
function GuideSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Guia de Handicap
        </h2>
        <p className="text-muted-foreground">
          Entenda exatamente como funcionam Handicap Asiático e Europeu, com exemplos práticos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ASIÁTICO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Handicap Asiático (AH)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <Sigma className="h-4 w-4" />
                Como é liquidado?
              </p>
              <p className="mt-1 text-muted-foreground">
                Ajusta-se o placar com a linha do handicap e compara novamente.
                Se (Time A + HA) &gt; Time B, a aposta no A vence; se (Time A + HA) = Time B, é
                <em> push</em>; se menor, perde. Para o Time B, usa-se (Time B + HB) &gt; Time A.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <strong>Margem</strong> = Placar A − Placar B (positivo se A venceu).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Tipos de linha</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Inteira</strong> (… -2, -1, 0, +1, +2 …) — pode ter <em>push</em>
                  (empate do handicap).
                </li>
                <li>
                  <strong>Meio</strong> (… -1.5, -0.5, +0.5, +1.5 …) — <u>nunca</u> tem push.
                </li>
                <li>
                  <strong>Quarto</strong> (… -1.25, -0.75, +0.75, +1.25 …) — divide a aposta
                  em duas linhas vizinhas: ex.: -1.25 = metade em -1 e metade em -1.5.
                </li>
              </ul>
            </div>

            {/* Exemplos práticos */}
            <div className="space-y-4">
              <h3 className="font-semibold">Exemplos práticos</h3>

              {/* Exemplo 1 */}
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  Exemplo 1 — A: <code>-11,5</code> &nbsp;vs&nbsp; B: <code>+11,5</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  (Meio ponto — sem push. Muito comum em basquete.)
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <b>A -11,5</b> vence se A ganhar por <b>12+</b>.
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <b>A -11,5</b> perde se A ganhar por <b>até 11</b> ou se B vencer.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <b>B +11,5</b> vence se B vencer <u>ou</u> perder por <b>até 11</b>.
                  </li>
                </ul>
              </div>

              {/* Exemplo 2 */}
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  Exemplo 2 — A: <code>-10,5</code> &nbsp;vs&nbsp; B: <code>+2,5</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  (Linhas em patamares diferentes; útil para entender as zonas de vitória/derrota.)
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <b>A -10,5</b> vence se A ganhar por <b>11+</b>.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <b>B +2,5</b> vence se B vencer <u>ou</u> se A ganhar por <b>até 2</b>.
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Entre <b>3 e 10</b> pontos de margem para A, <b>ambas</b> perdem (não é arbitragem).
                  </li>
                </ul>
              </div>

              {/* Exemplo 3 - quarto de linha */}
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  Exemplo 3 — A: <code>-1,25</code> (metade -1, metade -1,5)
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    A vence por <b>2+</b> → <b>win</b> integral.
                  </li>
                  <li className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-amber-600" />
                    A vence por <b>1</b> → metade <b>push</b> (-1), metade <b>loss</b> (-1,5) → <b>meia perda</b>.
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Empate ou derrota → <b>loss</b>.
                  </li>
                </ul>
              </div>

              {/* Exemplo 4 - outro quarto */}
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  Exemplo 4 — A: <code>-0,75</code> (metade -0,5, metade -1)
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    A vence por <b>2+</b> → <b>win</b>.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    A vence por <b>1</b> → metade <b>win</b> (-0,5) e metade <b>push</b> (-1) → <b>meia vitória</b>.
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Empate ou derrota → <b>loss</b>.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EUROPEU */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Handicap Europeu (EH / 3-way)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <Info className="h-4 w-4" />
                Conceito
              </p>
              <p className="mt-1 text-muted-foreground">
                Usa <strong>apenas linhas inteiras</strong> e mantém três resultados: vitória A, empate (com handicap) e vitória B.
                Ex.: <code>A -1 (europeu)</code>:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><b>A por 2+</b> → mercado “A -1” vence.</li>
                <li><b>A por 1</b> → cai no mercado “Empate (handicap)”.</li>
                <li><b>Empate/derrota de A</b> → vence “B +1”.</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Diferente do AH, aqui o <em>push</em> vira um <b>terceiro resultado</b> apostável.
              </p>
            </div>

            <div className="rounded-md border p-3">
              <p className="font-medium">Exemplo rápido — linha <code>-2 (europeu)</code></p>
              <ul className="mt-2 text-sm space-y-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />A vence por <b>3+</b> → “A -2” ganha.</li>
                <li className="flex items-center gap-2"><Minus className="h-4 w-4 text-amber-600" />A vence por <b>2</b> → “Empate (handicap)” ganha.</li>
                <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-600" />Qualquer outro placar → “B +2” ganha.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de bolso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li><b>AH inteiro</b>: pode devolver (push) quando a margem “bate” a linha.</li>
            <li><b>AH meio</b> (.5): nunca devolve; sempre win ou loss.</li>
            <li><b>AH quarto</b> (.25 / .75): divide a aposta em duas linhas vizinhas → <em>meia vitória</em> / <em>meia perda</em>.</li>
            <li><b>Europeu</b>: só inteiros e tem <b>três</b> mercados (win A, empate do handicap, win B).</li>
            <li>Para checar um caso: calcule a <b>margem</b> (A − B) e compare com a linha/linhas.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <div className="space-y-10">
      {/* 1) Explorador interativo */}
      <HandicapExplorer />

      {/* 2) Guia explicativo (mantém o conteúdo que você já tinha) */}
      <GuideSection />
    </div>
  )
}
