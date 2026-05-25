import type { Metadata, Viewport } from 'next';
import { Outfit, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VedaAI — AI Assessment Creator',
    template: '%s | VedaAI',
  },
  description:
    'Create, manage and grade assignments with AI. Set up rubrics, define marking criteria, and let AI generate question papers instantly.',
  keywords: ['AI assessment', 'assignment creator', 'question paper generator', 'VedaAI'],
  authors: [{ name: 'VedaAI' }],
  robots: { index: false, follow: false },
  openGraph: {
    title: 'VedaAI — AI Assessment Creator',
    description: 'AI-powered assignment and question paper generator for educators.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
