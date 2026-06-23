import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </NotificationProvider>
  </StrictMode>,
)
