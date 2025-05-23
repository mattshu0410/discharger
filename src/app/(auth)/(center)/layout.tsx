export default async function CenteredLayout(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {props.children}
    </div>
  );
}
