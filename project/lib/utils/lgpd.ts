import { createHash } from 'crypto'

export function maskCPF(cpf: string): string {
  if (!cpf || cpf.length < 11) return '***.***.***-**'
  
  const cleaned = cpf.replace(/\D/g, '')
  return `${cleaned.slice(0, 3)}.***.**${cleaned.slice(-2)}`
}

export function hashDocument(document: string): string {
  const cleaned = document.replace(/\D/g, '')
  return createHash('sha256').update(cleaned).digest('hex')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100)
}