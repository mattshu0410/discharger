import type { Metadata } from 'next';
import { BaseTemplate } from '@/templates/BaseTemplate';

export const metadata: Metadata = {
  title: 'Discharger',
  description: 'AI-Powered Medical Documentation - Transform discharge summaries into patient-friendly explanations.',
};

export default async function AuthLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <BaseTemplate>
      {props.children}
    </BaseTemplate>
  );
}
