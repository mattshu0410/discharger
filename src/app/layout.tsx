import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Funnel_Sans, Lexend } from 'next/font/google';
import { NextStepProvider } from 'nextstepjs';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { ReactQueryClientProvider } from '@/components/query/ReactQueryClientProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TourProvider } from '@/components/TourProvider';
import { PatientProvider } from '@/context/PatientContext';
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
  const signInUrl = '/sign-in';
  const signUpUrl = '/sign-up';
  const afterSignOutUrl = '/';

  return (
    <html lang="en" className={`${lexend.variable} ${funnel_sans.variable}`}>
      <body className="min-h-screen">
        <ClerkProvider
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl="/discharge"
          signUpFallbackRedirectUrl="/discharge"
          afterSignOutUrl={afterSignOutUrl}
        >
          <NextStepProvider>
            <ReactQueryClientProvider>
              <ThemeProvider>
                <TourProvider>
                  <PostHogProvider>
                    <NuqsAdapter>
                      <PatientProvider>
                        <Toaster />
                        {props.children}
                      </PatientProvider>
                    </NuqsAdapter>
                  </PostHogProvider>
                </TourProvider>
              </ThemeProvider>
            </ReactQueryClientProvider>
          </NextStepProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
