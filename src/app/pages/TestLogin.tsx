export function TestLogin() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #020617, #0f172a, #020617)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Roboto, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          HR ID Card Portal
        </h1>
        <p style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '40px' }}>
          Login Page Loading Successfully!
        </p>
        <button
          onClick={() => {
            console.log('🔐 Login button clicked');
            
            // Clear any old user data first
            localStorage.clear();
            console.log('🧹 Cleared localStorage');
            
            // Set new user data with all required fields
            const userData = { 
              name: 'Test User',
              email: 'test@example.com',
              avatar: '' // Empty avatar will show the User icon
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('✅ User data saved to localStorage:', userData);
            
            // Dispatch auth change event to notify Header component
            window.dispatchEvent(new Event('auth-state-changed'));
            console.log('📢 Auth change event dispatched');
            
            // Navigate to dashboard
            setTimeout(() => {
              console.log('🚀 Navigating to dashboard...');
              window.location.href = '/dashboard';
            }, 100);
          }}
          style={{
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Click to Login
        </button>
      </div>
    </div>
  );
}