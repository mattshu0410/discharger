import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BaseTemplate>
      {props.children}
    </BaseTemplate>
  );
}
