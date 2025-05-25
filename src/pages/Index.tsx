
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#DDDDDD]">Carregando...</div>
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />;
};

export default Index;
