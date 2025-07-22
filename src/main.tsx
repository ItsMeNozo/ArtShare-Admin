// src/main.tsx
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SnackbarProvider } from './contexts/SnackbarProvider';
import './index.css';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
