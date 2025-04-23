import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * OAuth Success Handler Component
 * 
 * This component handles the redirect from OAuth providers (like Google)
 * It extracts query parameters, stores tokens and user data, then redirects to dashboard
 */
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useAuth();
  
  useEffect(() => {
    const handleOAuthRedirect = () => {
      try {
        // Parse query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userId = params.get('userId');
        const username = params.get('username');
        const email = params.get('email');
        const authProvider = params.get('authProvider');
        
        // Verify token exists
        if (!token) {
          throw new Error('No authentication token received');
        }

        // Validate auth provider (check if it's Google)
        if (authProvider === import.meta.env.VITE_AUTH_PROVIDER_GOOGLE) {
          console.log('Google authentication successful');
        }
        
        // Store token and user data in localStorage (same as regular login)
        localStorage.setItem('token', token);
        
        const userData = {
          _id: userId,
          username,
          email,
          authProvider
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update auth context
        setCurrentUser(userData);
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth redirect handling error:', error);
        navigate('/login?error=auth_failed', { replace: true });
      }
    };
    
    handleOAuthRedirect();
  }, [location, navigate, setCurrentUser]);
  
  // Show loading state while processing
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;