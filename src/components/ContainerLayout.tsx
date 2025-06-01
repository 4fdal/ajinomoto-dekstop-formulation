import { cn } from '~/lib/utils';

export default function ContainerLayout({
  children,
  fallback,
  className,
}: Readonly<{
  children: React.ReactNode;
  fallback?: React.ReactElement<any, any>;
  className?: string;
}>) {
  return (
    <main
      className={cn(
        'flex h-full justify-center pl-[90px] pt-[90px]',
        className,
      )}
    >
      {children}
      {!children && fallback ? fallback : null}
    </main>
  );
}
