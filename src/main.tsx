import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testSupabaseConnection } from './lib/supabase';

// Testar conexão em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  testSupabaseConnection().then(connected => {
    if (connected) console.log('✅ Conectado ao Supabase com sucesso.');
  });
}

import { AuthProvider } from './lib/auth-context';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
