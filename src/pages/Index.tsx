
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      // Redirect to home page if authenticated, otherwise to auth page
      if (user) {
        navigate('/', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    }
  }, [navigate, user, loading]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    </div>
  );
};

export default Index;
