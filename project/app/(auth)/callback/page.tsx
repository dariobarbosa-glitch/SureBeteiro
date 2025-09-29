'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [msg, setMsg] = useState('Processando login…');

  useEffect(() => {
    (async () => {
      try {
        // 1) Se veio erro do provedor, mostre e volte pro login
        const errorDesc = params.get('error_description');
        if (errorDesc) {
          setMsg(decodeURIComponent(errorDesc));
          setTimeout(() => router.replace('/sign-in'), 2000);
          return;
        }

        // 2) Tente a forma "nova": trocar o ?code= pela sessão
        const code = params.get('code');
        const canExchange =
          typeof (supabase.auth as any).exchangeCodeForSession === 'function';

        if (code && canExchange) {
          const { error } = await (supabase.auth as any).exchangeCodeForSession();
          if (error) {
            setMsg(error.message || 'Falha ao concluir o login.');
            setTimeout(() => router.replace('/sign-in'), 2000);
            return;
          }
        }

        // 3) Fallback p/ versões antigas:
        // Muitos links do Supabase chegam como hash: #access_token=...&refresh_token=...
        if (!canExchange) {
          const hash = typeof window !== 'undefined' ? window.location.hash : '';
          if (hash?.includes('access_token') && hash?.includes('refresh_token')) {
            const h = new URLSearchParams(hash.replace(/^#/, '?'));
            const access_token = h.get('access_token') ?? '';
            const refresh_token = h.get('refresh_token') ?? '';
            if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (error) {
                setMsg(error.message || 'Falha ao finalizar o login.');
                setTimeout(() => router.replace('/sign-in'), 2000);
                return;
              }
            }
          }
        }

        // 4) Verifica se a sessão existe e decide o destino
        const { data: { session } } = await supabase.auth.getSession();
        router.replace(session ? '/dashboard' : '/sign-in');
      } catch (err: any) {
        setMsg(err?.message ?? 'Não foi possível completar o login.');
        setTimeout(() => router.replace('/sign-in'), 2000);
      }
    })();

    // não incluímos "supabase" nos deps para não recriar em loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, params]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="rounded-lg border bg-background/60 p-6">
        <p className="text-sm text-muted-foreground">{msg}</p>
      </div>
    </div>
  );
}