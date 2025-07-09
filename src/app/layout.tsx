import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { RealtimeProvider } from '@/contexts/RealtimeContext'
import ResizableNavbar from '@/components/ui/resizable-navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Augur | Prediction Market Platform',
  description: 'Trade on future outcomes with Augur - the sophisticated prediction market platform combining real-time data, advanced trading features, and elegant user experience.',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RealtimeProvider>
          {children}
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 