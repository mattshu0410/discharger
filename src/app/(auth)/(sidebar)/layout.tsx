import { Sidebar } from '@/components/Sidebar';

export default async function Layout(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-row flex-1 w-full overflow-hidden">
      <Sidebar />
      <div className="flex-grow">{props.children}</div>
    </div>
  );
}
