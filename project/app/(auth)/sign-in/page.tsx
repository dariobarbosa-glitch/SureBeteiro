'use client';
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { AlertCircle, Brain, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // ✅ Usa o domínio do .env ou, em dev, o origin atual (ex.: http://localhost:3000)
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      router.push('/dashboard'); // rota que EXISTE no app
    } catch (err: any) {
      setError(err?.message ?? 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      const emailClean = email.trim().toLowerCase();
      const passClean = password.trim();

      if (passClean.length < 6) {
        setError('A senha precisa ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailClean,
        password: passClean,
        options: {
          // ✅ tem que combinar com a rota real do app: /callback
          // (se você mover sua página para app/auth/callback/page.tsx, troque aqui para /auth/callback)
          emailRedirectTo: `${siteUrl}/callback`,
        },
      });

      if (error) throw error;

      // Com "Confirm email" ON, ainda NÃO existe sessão → mostrar tela de aviso
      if (!data.session) {
        router.push(`/verify-email?email=${encodeURIComponent(emailClean)}`);
        return;
      }

      // Se "Confirm email" estivesse OFF, já existiria sessão:
      router.push('/dashboard'); // ou '/onboarding' se você tiver essa rota
    } catch (err: any) {
      const msg = err?.message ?? 'Não foi possível criar sua conta.';
      if (/User already registered/i.test(msg)) setError('Este e-mail já possui conta.');
      else if (/weak password/i.test(msg)) setError('Senha fraca. Use 8+ caracteres.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-passos-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Brain className="h-16 w-16 text-passos-600" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-passos-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-navy-900">PASSOS</CardTitle>
            <p className="text-sm text-navy-600 font-medium tracking-wider">INTELIGÊNCIA ESPORTIVA</p>
          </div>
          <CardDescription>Faça login em sua conta ou crie uma nova</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSignUp}
                disabled={loading}
              >
                Criar Conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}