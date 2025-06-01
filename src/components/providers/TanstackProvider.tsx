import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { ThemeProvider } from './ThemeProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { Toaster as ToasterShadcnUI } from '~/components/ui/toaster';

// Create a query client
const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme="light"
        storageKey="vite-ui-theme"
      >
        {children}
        <Toaster richColors position="top-right" />
        <ToasterShadcnUI />
      </ThemeProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
