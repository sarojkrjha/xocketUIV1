import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';

import { App } from './App';
import { queryClient } from './providers/queryClient';
import 'ag-grid-community/styles/ag-grid.css';
import '@/shared/theme/design-tokens.css';
import '@/shared/theme/global.css';
import '@/shared/theme/ag-grid.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
