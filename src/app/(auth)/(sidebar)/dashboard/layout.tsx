import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <BaseTemplate>
      {props.children}
    </BaseTemplate>
  );
}
