import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { ProductsProvider } from './lib/products';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ProductsProvider>
            <App />
          </ProductsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
