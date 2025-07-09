import { SignIn } from '@clerk/nextjs';

export default async function SignInPage(props: {
  searchParams: Promise<{ return_url?: string }>;
}) {
  const searchParams = await props.searchParams;
  const returnUrl = searchParams.return_url;

  return <SignIn forceRedirectUrl={returnUrl} />;
}
