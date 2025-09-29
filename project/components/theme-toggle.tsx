"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
// se você tiver o Tooltip do shadcn:
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = (theme ?? resolvedTheme) === "dark"

  const Btn = (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label="Alternar tema"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-2xl border border-border/60 bg-background/60
                 hover:bg-accent/40 text-muted-foreground shadow-sm"
    >
      {isDark ? <Moon className="h-4 w-4 opacity-80" /> : <Sun className="h-4 w-4 opacity-80" />}
    </Button>
  )

  // Se você NÃO tiver Tooltip, pode simplesmente `return Btn`
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{Btn}</TooltipTrigger>
        <TooltipContent className="text-sm">Alternar tema</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
