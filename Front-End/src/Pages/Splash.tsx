import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer); // limpa o timer se o componente desmontar
  },);

  return (
    <div className='flex flex-col items-center justify-center gap-8 min-h-screen bg-white px-6'>
      <img src={logo} alt="Logo Aponti" title='Logo Aponti' width={250} />
    </div>
  );
}

export default Splash;