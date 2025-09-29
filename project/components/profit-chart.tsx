'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/lgpd'

interface ProfitChartProps {
  data: Array<{
    data: string
    lucro_acumulado: number
  }>
}

export function ProfitChart({ data }: ProfitChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="data" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          stroke="#64748b"
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
          stroke="#64748b"
        />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
          formatter={(value: number) => [formatCurrency(value), 'Lucro Acumulado']}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="lucro_acumulado" 
          stroke="#0c4a6e" 
          strokeWidth={3}
          dot={{ fill: '#0c4a6e', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, fill: '#0ea5e9' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}