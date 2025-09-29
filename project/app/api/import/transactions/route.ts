import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }

    const transactions = await request.json()

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Expected array of transactions' }, { status: 400 })
    }

    const results = []

    for (const transaction of transactions) {
      const {
        tenant_id,
        data,
        tipo,
        valor,
        wallet_origem_id,
        wallet_destino_id,
        house_id,
        person_id,
        descricao
      } = transaction

      // Validar campos obrigatórios
      if (!tenant_id || !data || !tipo || !valor) {
        results.push({
          success: false,
          error: 'Missing required fields',
          transaction
        })
        continue
      }

      // Validar tipo
      const validTypes = ['deposito', 'saque', 'transfer', 'aporte', 'despesa', 'pagamento_cpf']
      if (!validTypes.includes(tipo)) {
        results.push({
          success: false,
          error: 'Invalid transaction type',
          transaction
        })
        continue
      }

      try {
        const { data: result, error } = await supabase
          .from('transactions')
          .insert({
            tenant_id,
            data,
            tipo,
            valor: parseFloat(valor),
            wallet_origem_id: wallet_origem_id || null,
            wallet_destino_id: wallet_destino_id || null,
            house_id: house_id || null,
            person_id: person_id || null,
            descricao: descricao || null
          })
          .select()

        if (error) {
          results.push({
            success: false,
            error: error.message,
            transaction
          })
        } else {
          results.push({
            success: true,
            data: result,
            transaction
          })
        }
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          transaction
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return NextResponse.json({
      processed: transactions.length,
      success: successCount,
      errors: errorCount,
      results
    })
  } catch (error: any) {
    console.error('Import transactions error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}