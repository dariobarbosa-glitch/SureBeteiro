'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [msg, setMsg] = useState('Validando login…');

  useEffect(() => {
    (async () => {
      // 1) Erro do provedor? Volta pro login.
      const errorDesc = params.get('error_description');
      if (errorDesc) {
        setMsg(decodeURIComponent(errorDesc));
        setTimeout(() => router.replace('/sign-in'), 1200);
        return;
      }

      // 2) Fluxo “novo” (PKCE / confirm e-mail / magic link) -> vem com ?code=
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg('Falha ao concluir o login.');
          setTimeout(() => router.replace('/sign-in'), 1500);
          return;
        }
      }

      // 3) Depois da troca, garante que a sessão existe e decide o destino.
      const { data: { session } } = await supabase.auth.getSession();
      router.replace(session ? '/dashboard' : '/sign-in');
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
      {msg}
    </div>
  );
}