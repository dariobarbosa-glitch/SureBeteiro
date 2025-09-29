// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "Passos Inteligência Esportiva",
    template: "%s | Passos IE",
  },
  description: "Visão geral da sua performance esportiva.",
};

// sem tipagem Viewport (compatível com sua versão do Next)
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-primary">Passos IE</span>
                    <span className="text-muted-foreground">Painel</span>
                  </div>
                  <div className="text-xs text-muted-foreground">v1.0.0</div>
                </div>
              </header>
              <main className="mx-auto w-full max-w-7xl p-6">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
