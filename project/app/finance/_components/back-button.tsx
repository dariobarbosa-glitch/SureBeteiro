// components/back-button.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  /** Se quiser ir para um link específico ao clicar */
  href?: string
  /** Para onde ir se não houver histórico (default: "/") */
  fallback?: string
  /** Texto do botão (default: "Voltar") */
  children?: React.ReactNode
  /** Variants do seu Button (opcional) */
  variant?: React.ComponentProps<typeof Button>['variant']
  className?: string
}

export function BackButton({
  href,
  fallback = '/',
  children = 'Voltar',
  variant = 'ghost',
  className,
}: Props) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (href) {
      router.push(href)
      return
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      {children}
    </Button>
  )
}
