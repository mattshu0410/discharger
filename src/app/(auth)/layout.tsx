import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { BaseTemplate } from '@/templates/BaseTemplate';

export const metadata: Metadata = {
  title: 'Discharger',
  description: 'AI-Powered Medical Documentation - Transform discharge summaries into patient-friendly explanations.',
};

export default async function AuthLayout(props: {
  children: React.ReactNode;
}) {
  const signInUrl = '/sign-in';
  const signUpUrl = '/sign-up';
  const afterSignOutUrl = '/';

  return (
    <ClerkProvider
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl="/discharge"
      signUpFallbackRedirectUrl="/discharge"
      afterSignOutUrl={afterSignOutUrl}
    >
      <BaseTemplate>
        {props.children}
      </BaseTemplate>
    </ClerkProvider>
  );
}
