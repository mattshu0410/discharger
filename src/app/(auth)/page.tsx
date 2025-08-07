import { redirect } from 'next/navigation';

export default function AuthRootPage() {
  // Redirect to the main landing page
  redirect('/');
}
