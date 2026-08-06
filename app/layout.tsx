import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'
import { SidebarProvider } from '@/components/SidebarProvider'
import BackgroundWave from '@/components/BackgroundWave'

export const metadata: Metadata = {
  title: 'يلا نحكي | יַאלְלַה נִחְכִּי',
  description: 'ללמוד ערבית - כזה פשוט!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'יַאלְלַה נִחְכִּי',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2D5A27',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="relative bg-cream min-h-screen">
        <BackgroundWave />
        <SidebarProvider>
          <AppShell>{children}</AppShell>
        </SidebarProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (${process.env.NODE_ENV === 'production'}) {
                    navigator.serviceWorker.register('/sw.js').catch(console.error);
                  } else {
                    // A network-first SW left over from a previous prod build can
                    // intercept dev's HMR/RSC navigation fetches and cause client-side
                    // route clicks to hang or silently no-op. Keep dev origins clean.
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      regs.forEach(function(r) { r.unregister(); });
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
