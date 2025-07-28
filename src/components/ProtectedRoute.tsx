
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresLeader?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresLeader = false 
}) => {
  const { isAuthenticated, isLeader } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiresLeader && !isLeader) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
