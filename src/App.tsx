import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Adjust path as needed
import { CustomThemeProvider } from './contexts/ThemeContext';
import { router } from './router'; // Assuming your router configuration is here

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}
