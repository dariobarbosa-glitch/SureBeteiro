export interface Tenant {
  id: string
  nome: string
  created_at: string
}

export interface User {
  id: string
  email: string
  tenant_id: string | null
}

export interface Wallet {
  id: string
  tenant_id: string
  nome: string
  ativo: boolean
}

export interface Transaction {
  id: string
  tenant_id: string
  data: string
  tipo: 'deposito' | 'saque' | 'transfer' | 'aporte' | 'despesa' | 'pagamento_cpf'
  valor: number
  wallet_origem_id?: string
  wallet_destino_id?: string
  house_id?: string
  person_id?: string
  descricao?: string
}

export interface Operation {
  id: string
  tenant_id: string
  id_externo: string
  data_evento: string
  house_id?: string
  stake?: number
  lucro?: number
  resultado: 'green' | 'red' | 'void'
  raw_payload?: any
  house?: House
}

export interface House {
  id: string
  tenant_id: string
  nome: string
  status: 'a_criar' | 'ativa' | 'limitada' | 'banida'
  grupo_clone?: string
  url?: string
  observacoes?: string
}

export interface Person {
  id: string
  tenant_id: string
  nome: string
  documento_hash: string
  consentimento_at?: string
  created_at: string
}

export interface Subscription {
  id: string
  tenant_id: string
  plano: 'starter' | 'pro' | 'agencia'
  status: 'active' | 'past_due' | 'canceled'
  gateway_id?: string
  atualizado_em: string
}

export interface DailyMetrics {
  data: string
  lucro_total: number
  stake_total: number
  qtd_ops: number
  roi_dia: number
}