import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Travel&Go',
  description: 'Plan your perfect trip in one place',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
