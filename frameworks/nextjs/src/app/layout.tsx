import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PushFlo Next.js Example',
  description: 'Real-time messaging with PushFlo and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
