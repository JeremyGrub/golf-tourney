export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <div className="absolute inset-0 cm-grid-fine pointer-events-none opacity-60" aria-hidden />
      <div className="relative mx-auto w-full max-w-md px-5 py-6">
        {children}
      </div>
    </div>
  );
}
