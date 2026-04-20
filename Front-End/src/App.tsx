import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './Pages/Splash';
import Login from './Pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;