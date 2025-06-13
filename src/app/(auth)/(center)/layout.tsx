export default async function CenteredLayout(props: {
  children: React.ReactNode;
}) {
  // Override the BaseTemplate layout for authentication pages
  // to properly center the Clerk components
  return (
    <div className="absolute inset-0 min-h-screen w-full flex items-center justify-center bg-background p-4 z-10">
      <div className="w-full max-w-md">
        {props.children}
      </div>
    </div>
  );
}
