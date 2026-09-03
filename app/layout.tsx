import type { Metadata } from "next";
import { Geist, Gelasio, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { AuthProvider } from "@/components/auth-context"
import { TimerProvider } from "@/components/timer-context"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Gelasio({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});


export const metadata: Metadata = {
  title: "FreelanceOS | Freelancer CRM & Work Suite",
  description: "Modern client, project, leads, tasks, and time management CRM for freelancers.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable
      )}
    >
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ThemeProvider>
          <AuthProvider>
            <TimerProvider>
              <TooltipProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <div className="flex flex-col flex-1 min-w-0">
                    <TopNav />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                      {children}
                    </main>
                  </div>
                </SidebarProvider>
              </TooltipProvider>
            </TimerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
