'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DateRangePicker } from '@/components/date-range-picker'
import { KpiCard } from '@/components/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatPercentage } from '@/lib/utils/lgpd'
import { Operation, House } from '@/lib/types'
import { DateRange } from 'react-day-picker'
import { Download, Filter } from 'lucide-react'

export default function OperationsPage() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedHouse, setSelectedHouse] = useState<string>('all')
  const [selectedResult, setSelectedResult] = useState<string>('all')
  
  const supabase = createClient()

  useEffect(() => {
    loadOperations()
    loadHouses()
  }, [dateRange, selectedHouse, selectedResult])

  const loadHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .order('nome')

      if (error) throw error
      setHouses(data || [])
    } catch (error) {
      console.error('Error loading houses:', error)
    }
  }

  const loadOperations = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('operations')
        .select(`
          *,
          houses(nome)
        `)
        .order('data_evento', { ascending: false })

      if (dateRange?.from) {
        query = query.gte('data_evento', dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        query = query.lte('data_evento', dateRange.to.toISOString())
      }
      if (selectedHouse !== 'all') {
        query = query.eq('house_id', selectedHouse)
      }
      if (selectedResult !== 'all') {
        query = query.eq('resultado', selectedResult)
      }

      const { data, error } = await query

      if (error) throw error
      setOperations(data || [])
    } catch (error) {
      console.error('Error loading operations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateKPIs = () => {
    const totalStake = operations.reduce((sum, op) => sum + (op.stake || 0), 0)
    const totalProfit = operations.reduce((sum, op) => sum + (op.lucro || 0), 0)
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0
    const greenCount = operations.filter(op => op.resultado === 'green').length
    const totalCount = operations.length
    const winRate = totalCount > 0 ? (greenCount / totalCount) * 100 : 0

    return { totalStake, totalProfit, roi, winRate }
  }

  const { totalStake, totalProfit, roi, winRate } = calculateKPIs()

  const getResultBadge = (resultado: string) => {
    switch (resultado) {
      case 'green':
        return <Badge className="bg-green-100 text-green-800">Green</Badge>
      case 'red':
        return <Badge className="bg-red-100 text-red-800">Red</Badge>
      case 'void':
        return <Badge className="bg-gray-100 text-gray-800">Void</Badge>
      default:
        return <Badge variant="outline">{resultado}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy-900">Operações</h1>
          <p className="text-navy-600">
            Gerencie e analise suas operações esportivas
          </p>
        </div>
        <Button className="bg-passos-600 hover:bg-passos-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Stake Total"
          value={formatCurrency(totalStake)}
          hint={`${operations.length} operações`}
        />
        <KpiCard
          title="Lucro Total"
          value={formatCurrency(totalProfit)}
          trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          title="ROI"
          value={formatPercentage(roi)}
          hint="Retorno sobre investimento"
        />
        <KpiCard
          title="Taxa de Acerto"
          value={formatPercentage(winRate)}
          hint="% de operações green"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-navy-800">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <DateRangePicker 
                date={dateRange} 
                onDateChange={setDateRange}
              />
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por casa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as casas</SelectItem>
                  {houses.map((house) => (
                    <SelectItem key={house.id} value={house.id}>
                      {house.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedResult} onValueChange={setSelectedResult}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Casa</TableHead>
                <TableHead>ID Externo</TableHead>
                <TableHead className="text-right">Stake</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : operations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma operação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>
                      {new Date(operation.data_evento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {operation.house?.nome || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {operation.id_externo}
                    </TableCell>
                    <TableCell className="text-right">
                      {operation.stake ? formatCurrency(operation.stake) : '-'}
                    </TableCell>
                    <TableCell className={`text-right ${
                      (operation.lucro || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {operation.lucro ? formatCurrency(operation.lucro) : '-'}
                    </TableCell>
                    <TableCell>
                      {getResultBadge(operation.resultado)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}