import { createBrowserRouter, Navigate } from 'react-router';
import React from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// Custom event for auth state changes
export const AUTH_CHANGE_EVENT = 'auth-state-changed';

// Dispatch auth change event
export const dispatchAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

// Loading fallback (not used anymore, but keep for reference)
function LoadingFallback() {
  const [showTimeout, setShowTimeout] = React.useState(false);
  
  React.useEffect(() => {
    // Show timeout message after 10 seconds
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Roboto, sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ fontSize: '18px', fontWeight: '500' }}>Loading...</p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
          {showTimeout ? 'Taking longer than usual...' : 'Please wait a moment'}
        </p>
        {showTimeout && (
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              background: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        )}
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);