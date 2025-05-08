import { PatientProvider } from '@/context/PatientContext';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  return (
    <PatientProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <BaseTemplate className="flex-1 flex flex-col bg-background">
          {props.children}
        </BaseTemplate>
      </div>
    </PatientProvider>
  );
}
