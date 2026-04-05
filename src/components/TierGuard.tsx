import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkFeatureAccess, Tier, TierLimits } from '../services/tierService';
import { Loader2 } from 'lucide-react';

interface TierGuardProps {
  children: React.ReactNode;
  feature?: keyof TierLimits;
  fallbackPath?: string;
}

export const TierGuard: React.FC<TierGuardProps> = ({ 
  children, 
  feature, 
  fallbackPath = '/app/dashboard' 
}) => {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin bypass
  if (userData?.role === 'admin' || user.email === 'thebadencompany@gmail.com') {
    return <>{children}</>;
  }

  if (feature) {
    const userTier = (userData?.tier || 'free') as Tier;
    const hasAccess = checkFeatureAccess(userTier, feature);

    if (!hasAccess) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};
