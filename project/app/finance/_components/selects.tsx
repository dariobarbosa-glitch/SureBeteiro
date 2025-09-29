'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export type PersonOption  = { id: string; name: string; cpf: string | null }
export type HouseOption   = { id: string; name: string }
export type WalletOption  = { id: string; name: string }
export type PaymentTypeOption = { id: string; name: string }

export function usePeople(): PersonOption[] {
  const supabase = createClient()
  const [people, setPeople] = useState<PersonOption[]>([])
  useEffect(() => {
    supabase.from('people').select('id,name,cpf').order('name')
      .then(({ data }) => setPeople((data as PersonOption[]) || []))
  }, [])
  return people
}

export function useWallets(): WalletOption[] {
  const supabase = createClient()
  const [wallets, setWallets] = useState<WalletOption[]>([])
  useEffect(() => {
    supabase.from('finance_wallets').select('id,name').order('name')
      .then(({ data }) => setWallets((data as WalletOption[]) || []))
  }, [])
  return wallets
}

export function useHouses(personId?: string): HouseOption[] {
  const supabase = createClient()
  const [houses, setHouses] = useState<HouseOption[]>([])
  useEffect(() => {
    if (!personId) { setHouses([]); return }
    supabase.from('houses').select('id,name').eq('person_id', personId).order('name')
      .then(({ data }) => setHouses((data as HouseOption[]) || []))
  }, [personId])
  return houses
}

export function usePaymentTypes(): PaymentTypeOption[] {
  const supabase = createClient()
  const [types, setTypes] = useState<PaymentTypeOption[]>([])
  useEffect(() => {
    supabase.from('finance_payment_types').select('id,name').order('name')
      .then(({ data }) => setTypes((data as PaymentTypeOption[]) || []))
  }, [])
  return types
}

export const maskCPF = (s: string | null) => {
  if (!s) return ''
  const v = s.replace(/\D/g, '')
  if (v.length < 9) return s
  return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-**`
}
