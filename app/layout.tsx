import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/app/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DC Friends',
  description: 'Friends Community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="mx-auto max-w-[1000px] px-0 sm:px-4 pb-10">
          <main className="dc-container p-4 bg-white sm:shadow-sm">
            {children}
          </main>
          <footer className="mt-4 text-center text-xs text-gray-500">
            &copy; 2026 DC Friends. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  )
}
