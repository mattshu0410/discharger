import { SignUp } from '@clerk/nextjs';

export default async function SignUpPage(props: {
  searchParams: Promise<{ return_url?: string }>;
}) {
  const searchParams = await props.searchParams;
  const returnUrl = searchParams.return_url;

  return <SignUp forceRedirectUrl={returnUrl} />;
}
