import logo from '../Assets/logo.jpg';

function Splash() {

  setTimeout(() => {
    window.location.href = '/login';
  }, 5000);

  return (
    <div className='flex flex-col items-center justify-center gap-8 min-h-screen bg-white px-6'>
      <img src={logo} alt="Logo Aponti" title='Logo Aponti' width={250} />
    </div>
  )
}

export default Splash;