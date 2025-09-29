import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headersList = headers()
    const signature = headersList.get('x-webhook-signature')

    // Validar webhook secret
    const expectedSignature = process.env.PAYMENT_WEBHOOK_SECRET
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { tenant_id, subscription_id, status, plan, gateway_id } = body

    // Atualizar ou criar subscription
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        tenant_id,
        plano: plan,
        status: status,
        gateway_id: gateway_id,
        atualizado_em: new Date().toISOString()
      }, {
        onConflict: 'tenant_id'
      })

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Log da ação para auditoria
    await supabase
      .from('audit_logs')
      .insert({
        tenant_id,
        acao: 'subscription_updated',
        alvo: 'subscription',
        detalhes: { status, plan, gateway_id }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}