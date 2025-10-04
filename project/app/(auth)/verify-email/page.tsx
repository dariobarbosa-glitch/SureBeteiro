'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const supabase = createClient();

  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '');

  const handleResend = async () => {
    if (!email) {
      setError('Não há e-mail na URL para reenviar.');
      return;
    }
    setSending(true);
    setInfo(null);
    setError(null);

    // eslint-disable-next-line no-console
    console.log('[RESEND] emailRedirectTo =>', `${siteUrl}/callback`);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${siteUrl}/callback` },
    });

    if (error) setError(error.message);
    else setInfo('Enviamos outro e-mail de confirmação. Confira sua caixa de entrada/spam.');
    setSending(false);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
        <p>
          Enviamos um link de confirmação para {email ? <strong>{email}</strong> : 'seu e-mail'}.
          Abra a mensagem e clique no botão para concluir o cadastro.
        </p>

        {info && <p className="text-emerald-500 text-sm">{info}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button asChild><Link href="/sign-in">Voltar para o login</Link></Button>
          <Button variant="outline" onClick={handleResend} disabled={sending || !email}>
            {sending ? 'Reenviando…' : 'Reenviar e-mail'}
          </Button>
        </div>
      </div>
    </main>
  );
}
