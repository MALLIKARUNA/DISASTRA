// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root application component
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

// Global React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#1f2937' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1f2937' },
            },
          }}
        />
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
