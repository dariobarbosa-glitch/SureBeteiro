import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import { KpiCard } from '@/components/kpi-card';
import { ProfitChart } from '@/components/profit-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { formatCurrency, formatPercentage } from '@/lib/utils/lgpd';

type ChartPoint = { data: string; lucro_acumulado: number };
type HouseRow = { nome: string; lucro: number; stake: number; ops: number };
type DashboardData = {
  todayProfit: number;
  monthProfit: number;
  monthROI: number;
  chartData: ChartPoint[];
  topHouses: HouseRow[];
};

async function getDashboardData(tenantId: string): Promise<DashboardData> {
  const supabase = createClient();

  // ---- Datas de recorte
  const now = new Date();
  const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(); // início do dia local
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // ---- Métricas de hoje
  const { data: todayMetrics } = await supabase
    .from('operations')
    .select('lucro, stake')
    .eq('tenant_id', tenantId)
    .gte('data_evento', todayISO);

  // ---- Métricas do mês
  const { data: monthMetrics } = await supabase
    .from('operations')
    .select('lucro, stake')
    .eq('tenant_id', tenantId)
    .gte('data_evento', startOfMonth);

  // ---- Série para o gráfico (últimos 30 dias)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: chartRaw } = await supabase
    .from('metrics_daily')
    .select('data, lucro_total')
    .eq('tenant_id', tenantId)
    .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
    .order('data', { ascending: true });

  // ---- Top casas do mês (inner join garante que só vem se existir house)
  type OpRow = { lucro: number | null; stake: number | null; houses: { nome: string } | null };
  const { data: topOps } = (await supabase
    .from('operations')
    .select('lucro, stake, houses!inner(nome)')
    .eq('tenant_id', tenantId)
    .gte('data_evento', startOfMonth)) as unknown as { data: OpRow[] | null };

  // ---- Agregações
  const todayProfit = (todayMetrics ?? []).reduce((sum, op) => sum + (op.lucro ?? 0), 0);
  const monthProfit = (monthMetrics ?? []).reduce((sum, op) => sum + (op.lucro ?? 0), 0);
  const monthStake = (monthMetrics ?? []).reduce((sum, op) => sum + (op.stake ?? 0), 0);
  const monthROI = monthStake > 0 ? (monthProfit / monthStake) * 100 : 0;

  let acc = 0;
  const chartData: ChartPoint[] =
    (chartRaw ?? []).map((item: any) => {
      acc += Number(item.lucro_total) || 0;
      return { data: item.data, lucro_acumulado: acc };
    }) ?? [];

  const houseStats: Record<string, { lucro: number; stake: number; ops: number }> = {};
  for (const op of topOps ?? []) {
    const nomeCasa = op.houses?.nome;
    if (!nomeCasa) continue;
    if (!houseStats[nomeCasa]) houseStats[nomeCasa] = { lucro: 0, stake: 0, ops: 0 };
    houseStats[nomeCasa].lucro += op.lucro ?? 0;
    houseStats[nomeCasa].stake += op.stake ?? 0;
    houseStats[nomeCasa].ops += 1;
  }

  const entries = Object.entries(houseStats) as [string, { lucro: number; stake: number; ops: number }][];
  const topHouses: HouseRow[] = entries
    .map(([nome, stats]) => ({ nome, ...stats }))
    .sort((a, b) => b.lucro - a.lucro)
    .slice(0, 10);

  return {
    todayProfit,
    monthProfit,
    monthROI,
    chartData,
    topHouses,
  };
}

export default async function DashboardPage() {
  const supabase = createClient();

  // usuário logado?
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // profile / tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) redirect('/onboarding');

  const dashboardData = await getDashboardData(profile.tenant_id);

  const daysInMonth = new Date().getDate();
  const avgDaily = daysInMonth > 0 ? dashboardData.monthProfit / daysInMonth : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua performance esportiva</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Lucro Hoje"
          value={formatCurrency(dashboardData.todayProfit)}
          trend={dashboardData.todayProfit > 0 ? 'up' : dashboardData.todayProfit < 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          title="Lucro no Mês"
          value={formatCurrency(dashboardData.monthProfit)}
          trend={dashboardData.monthProfit > 0 ? 'up' : dashboardData.monthProfit < 0 ? 'down' : 'neutral'}
        />
        <KpiCard title="ROI do Mês" value={formatPercentage(dashboardData.monthROI)} hint="Retorno sobre investimento" />
        <KpiCard title="Média Diária" value={formatCurrency(avgDaily)} hint={`Baseado em ${daysInMonth} dias`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Lucro Acumulado (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-background/40 p-2">
              <ProfitChart data={dashboardData.chartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Top Casas por Lucro (Este Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-background/40">
              <Table>
                <TableHeader className="text-muted-foreground">
                  <TableRow>
                    <TableHead>Casa</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Ops</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.topHouses.map((house, idx) => (
                    <TableRow key={`${house.nome}-${idx}`}>
                      <TableCell className="font-medium">{house.nome}</TableCell>
                      <TableCell className={`text-right ${house.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(house.lucro)}
                      </TableCell>
                      <TableCell className="text-right">{house.ops}</TableCell>
                      <TableCell className="text-right">
                        {house.stake > 0 ? formatPercentage((house.lucro / house.stake) * 100) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}