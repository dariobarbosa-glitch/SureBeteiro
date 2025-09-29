'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border bg-background p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold">Verifique seu e-mail</h1>
        <p className="text-muted-foreground">
          Enviamos um link de confirmação para o seu e-mail. Abra a mensagem e
          clique no botão para completar o cadastro.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Não recebeu? Verifique a caixa de spam ou tente novamente mais tarde.
        </p>

        <div className="mt-6">
          <Link href="/sign-in" className="underline text-sm">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}