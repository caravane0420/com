import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/app/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Our Community',
  description: 'A private space for friends.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
