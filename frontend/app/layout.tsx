import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'; // ← add this

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers> {/* ← wrap with context */}
      </body>
    </html>
  );
}
