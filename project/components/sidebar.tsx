'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Building,
  Users,
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Operações', href: '/operations', icon: TrendingUp },
  { name: 'Financeiro', href: '/finance', icon: CreditCard },
  { name: 'Casas', href: '/houses', icon: Building },
  { name: 'Pessoas', href: '/people', icon: Users },
  {
    name: 'Calculadoras',
    icon: Calculator,
    children: [
      { name: 'Surebet', href: '/calculators/surebet' },
      { name: 'Handicap', href: '/calculators/handicap' }
    ]
  }
]

/** Toggle de tema clean (ícone sutil, sem emoji) */
function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = (theme ?? resolvedTheme) === 'dark'
  const nextTheme: 'light' | 'dark' = isDark ? 'light' : 'dark'

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label="Alternar tema"
      aria-pressed={isDark}
      onClick={() => setTheme(nextTheme)}
      className="rounded-2xl border border-border/60 bg-background/60
                 hover:bg-accent/40 text-muted-foreground shadow-sm"
      title={`Mudar para ${nextTheme === 'dark' ? 'escuro' : 'claro'}`}
    >
      {isDark ? <Moon className="h-4 w-4 opacity-80" /> : <Sun className="h-4 w-4 opacity-80" />}
    </Button>
  )
}

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/sign-in'
  }

  const SidebarContent = () => (
    <>
      {/* Cabeçalho da sidebar */}
      <div className="flex items-center justify-between px-6 py-6 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="h-10 w-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold leading-none tracking-tight">PASSOS</div>
            <div className="text-xs font-medium tracking-wider text-slate-700 dark:text-slate-300">
              INTELIGÊNCIA ESPORTIVA
            </div>
          </div>
        </div>

        {/* Botão de Dark Mode minimalista */}
        <ThemeToggle />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2 bg-background">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-foreground/80">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                <div className="ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-2 text-sm rounded-md transition-colors',
                        pathname === child.href
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground/80 hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="border-t p-4 space-y-2 bg-background">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/settings">
            <Settings className="mr-3 h-4 w-4" />
            Configurações
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Botão mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar mobile */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex flex-col w-80 h-full bg-background">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:border-r lg:bg-background lg:shadow-sm">
        <SidebarContent />
      </div>
    </>
  )
}
