import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#101622]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#135bec] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#616f89] dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/giris" replace />;
  }
  
  return <>{children}</>;
}
