
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '@/contexts/AppContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();
  
  useEffect(() => {
    // Redirect to home page if authenticated, otherwise to auth page
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate, isAuthenticated]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    </div>
  );
};

export default Index;
