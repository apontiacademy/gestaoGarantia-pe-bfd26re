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
import CreateWarranty from "./Pages/CreateWarranty";
import LixeiraScreen from "./Pages/Lixeira";
import AuthLayout from "./layout/AuthLayout";
import WarrantyRegister from "./Pages/WarrantyRegister";

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
            element={
              <ProtectedRoute>
                <CreateWarranty />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/warranty-register" element={<WarrantyRegister/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
