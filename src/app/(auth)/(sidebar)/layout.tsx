import { NewSidebar } from '@/components/NewSidebar';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row flex-1 w-full">
      <NewSidebar />
      <div className="flex-grow flex flex-col">{props.children}</div>
    </div>
  );
}
