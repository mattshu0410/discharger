import type { Metadata } from 'next';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { ReactQueryClientProvider } from '@/components/query/ReactQueryClientProvider';
import { PatientProvider } from '@/context/PatientContext';
import { Funnel_Sans, Lexend } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import '@/styles/global.css';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--display-family',
});

const funnel_sans = Funnel_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--text-family',
});

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <html lang="en" className={`${lexend.variable} ${funnel_sans.variable}`}>
      <body className="min-h-screen">
        <ReactQueryClientProvider>
          <PostHogProvider>
            <NuqsAdapter>
              <PatientProvider>
                <Toaster />
                {props.children}
              </PatientProvider>
            </NuqsAdapter>
          </PostHogProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
