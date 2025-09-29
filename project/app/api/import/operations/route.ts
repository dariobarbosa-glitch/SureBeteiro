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

    const operations = await request.json()

    if (!Array.isArray(operations)) {
      return NextResponse.json({ error: 'Expected array of operations' }, { status: 400 })
    }

    const results = []

    for (const operation of operations) {
      const {
        tenant_id,
        id_externo,
        data_evento,
        house_id,
        stake,
        lucro,
        resultado,
        raw_payload
      } = operation

      // Validar campos obrigatórios
      if (!tenant_id || !id_externo || !data_evento || !resultado) {
        results.push({
          id_externo,
          success: false,
          error: 'Missing required fields'
        })
        continue
      }

      try {
        const { data, error } = await supabase
          .from('operations')
          .upsert({
            tenant_id,
            id_externo,
            data_evento,
            house_id: house_id || null,
            stake: stake || null,
            lucro: lucro || null,
            resultado,
            raw_payload: raw_payload || null
          }, {
            onConflict: 'tenant_id,id_externo'
          })
          .select()

        if (error) {
          results.push({
            id_externo,
            success: false,
            error: error.message
          })
        } else {
          results.push({
            id_externo,
            success: true,
            data
          })
        }
      } catch (error: any) {
        results.push({
          id_externo,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return NextResponse.json({
      processed: operations.length,
      success: successCount,
      errors: errorCount,
      results
    })
  } catch (error: any) {
    console.error('Import operations error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}