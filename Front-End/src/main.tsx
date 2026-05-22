import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { WarrantyProvider } from './contexts/WarrantyContext'
import { ToastProvider } from './contexts/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WarrantyProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </WarrantyProvider>
  </StrictMode>,
)
