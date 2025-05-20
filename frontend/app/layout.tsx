import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'; // ← add this

const inter = Inter({ subsets: ['latin'] });

import { FavoritesProvider } from './components/hooks/useFavorites';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
