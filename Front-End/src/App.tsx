import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import Splash from "./Pages/Splash";
import Login from "./Pages/Login";
import UserRegister from "./Pages/UserRegister";
import Home from "./Pages/Home";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyCode from "./Pages/Verifycode"; 
import ResetPassword from "./Pages/ResetPassword"; 
import CreateWarranty from "./Pages/CreateWarranty";
import LixeiraScreen from "./Pages/Lixeira";
import AuthLayout from "./layout/AuthLayout";
import WarrantyRegister from "./Pages/WarrantyRegister";
import ViewWarranty from "./Pages/ViewWarranty"; // Tela nova que veio do seu grupo
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<UserRegister />} />
          </Route>
          
          {/* Fluxo de Recuperação de Senha */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/home-demo" element={<Home />} />
          <Route path="/lixeira" element={<LixeiraScreen />} />
          
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-warranty"
            element = {
              /*<ProtectedRoute> COMENTÁRIO TEMPORÁRIO (RETIRAR DEPOIS DA HOSPEDAGEM DO BACKEND) */  
                <CreateWarranty />
              /*</ProtectedRoute> COMENTÁRIO TEMPORÁRIO (RETIRAR DEPOIS DA HOSPEDAGEM DO BACKEND) */
            }
          />
          
          <Route path="/warranty-register" element={<WarrantyRegister/>} />
          <Route path="/garantia" element={<ViewWarranty/>}/>
          
          {/* Rota curinga para redirecionamento */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;