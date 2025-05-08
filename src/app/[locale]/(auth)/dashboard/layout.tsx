import { BaseTemplate } from '@/templates/BaseTemplate';
import { setRequestLocale } from 'next-intl/server';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return (
    <BaseTemplate>
      {props.children}
    </BaseTemplate>
  );
}
