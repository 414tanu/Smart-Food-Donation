import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const BackButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  if (pathname === '/') {
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(user ? '/dashboard' : '/');
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-colors hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
};

export default BackButton;
