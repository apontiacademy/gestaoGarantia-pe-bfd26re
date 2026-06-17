import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
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
      <Router>
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
          <Route path="/forgot-password" element={
            <PublicRoute><ForgotPassword /></PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute><ResetPassword /></PublicRoute>
          } />
          
          <Route path="/lixeira" element={<LixeiraScreen />} />
          
          <Route path="/home" element={
              <ProtectedRoute><Home /></ProtectedRoute>
          }/>

          <Route
            path="/create-warranty"
            element = {
              <ProtectedRoute>
                <CreateWarranty />
              </ProtectedRoute> 
            }
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
    </AuthProvider>
  );
}

export default App;