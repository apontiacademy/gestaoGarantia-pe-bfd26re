import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WarrantyProvider } from "./contexts/WarrantyContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { SessionExpiredRedirect } from "./components/routes/SessionExpiredRedirect";
import Splash from "./Pages/Splash";
import Login from "./Pages/Login";
import UserRegister from "./Pages/UserRegister";
import Home from "./Pages/Home";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword"; 
import CreateWarranty from "./Pages/CreateWarranty";
import LixeiraScreen from "./Pages/Lixeira";
import AuthLayout from "./layout/AuthLayout";
import ViewWarranty from "./Pages/ViewWarranty"; 
import Settings from './Pages/Settings';

function App() {
  return (
    <AuthProvider>
      <WarrantyProvider>
      <Router>
        <SessionExpiredRedirect />
        <Routes>
          <Route path="/" element={<Splash />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute><UserRegister /></PublicRoute>
            } />
          </Route>
          
          {/* Fluxo de Recuperação de Senha */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Deixando a lixeira protegida para visitantes se necessário, ou mantenha livre se preferir */}
          <Route path="/lixeira" element={<LixeiraScreen />} />
          
          {/* ROTA DA HOME ALTERADA (OPÇÃO B): Removido o ProtectedRoute para o visitante acessar o Dashboard */}
          <Route path="/home" element={<Home />} />

          <Route
            path="/create-warranty"
            element={<CreateWarranty />}
          />

          <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
            }
          />
          
          <Route path="/garantia/:id" element={<ViewWarranty />} />
          
          {/* Rota curinga para redirecionamento */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      </WarrantyProvider>
    </AuthProvider>
  );
}

export default App;