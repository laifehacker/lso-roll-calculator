export const metadata = {
  title: 'LSO Roll Calculator',
  description: 'Calculate optimal roll timing for options trading',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
