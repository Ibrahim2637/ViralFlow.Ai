import type { Metadata } from "next";
import ThemeSwitcher from '@/components/ThemeSwitcher';
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralFlow AI | Autonomous Content Agent",
  description: "Autonomous AI Content Discovery, Creation, Publishing & Learning Platform for Creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,700;0,800;1,400&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', initialTheme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        {/* Theme toggle button */}
        <header className="flex justify-end p-2">
          <ThemeSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}

