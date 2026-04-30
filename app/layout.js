import './globals.css'

export const metadata = {
  title: 'Vinted Describe',
  description: 'Genera descripciones para tus artículos de Vinted con IA',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
