import { Mulish } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const mulish = Mulish({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-mulish',
})

export const metadata: Metadata = {
  title: 'Beach Dog Marketing — Make your customers the campaign',
  description: 'Beach Dog Marketing helps local businesses grow with playful, high-converting marketing experiences.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={mulish.variable}>
      <body className={`${mulish.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
