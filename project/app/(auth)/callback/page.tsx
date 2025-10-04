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
      const errorDesc = params.get('error_description');
      if (errorDesc) {
        setMsg(decodeURIComponent(errorDesc));
        setTimeout(() => router.replace('/sign-in'), 1200);
        return;
      }

      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg('Falha ao concluir o login.');
          setTimeout(() => router.replace('/sign-in'), 1500);
          return;
        }
      }

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
