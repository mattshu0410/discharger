import { ClerkProvider } from '@clerk/nextjs';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function AuthLayout(props: {
  children: React.ReactNode;
}) {
  const signInUrl = '/sign-in';
  const signUpUrl = '/sign-up';
  const dashboardUrl = '/dashboard';
  const afterSignOutUrl = '/';

  return (
    <ClerkProvider
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      <BaseTemplate>
        {props.children}
      </BaseTemplate>
    </ClerkProvider>
  );
}
