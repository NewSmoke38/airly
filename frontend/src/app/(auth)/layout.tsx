export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 grid place-items-center">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
} 