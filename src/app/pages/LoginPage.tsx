import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import accLogo from 'figma:asset/93b0f57f0c6cb722d5511f7e11c5f2d8141cb070.png';
import { dispatchAuthChange } from '../routes';

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user && user !== 'null') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    // Mock Microsoft 365 authentication
    const userData = {
      name: 'HR Executive',
      email: 'hr@acc.ltd',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Dispatch auth change event for Header component
    window.dispatchEvent(new Event('auth-state-changed'));
    
    // Dispatch the app-level auth change
    dispatchAuthChange();
    
    // Small delay to ensure localStorage is set before navigation
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex relative overflow-hidden">
      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* LEFT SIDE - Dark Branding Section */}
        <div className="flex flex-col justify-between p-12 lg:p-16">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-slate-700/50">
                <img src={accLogo} alt="ACC Logo" className="h-12 w-auto object-contain" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Applied Cloud Computing
            </h1>
            <p className="text-slate-400 text-lg">Enterprise ID Card Automation Platform</p>
          </div>

          {/* Feature Display */}
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-slate-700/50 shadow-xl">
                      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30">
                    <span className="text-sm font-semibold text-blue-300">
                      1000+ Cards/Min
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Lightning Fast Generation</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Generate professional ID cards in seconds with our optimized processing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white mb-1">50K+</div>
              <div className="text-xs text-slate-400 font-medium">ACTIVE USERS</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white mb-1">10M+</div>
              <div className="text-xs text-slate-400 font-medium">CARDS GENERATED</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white mb-1">150+</div>
              <div className="text-xs text-slate-400 font-medium">COUNTRIES</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Dark Login Section */}
        <div className="bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-xl flex items-center justify-center p-12 lg:p-16 border-l border-slate-700/50">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
              
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-slate-700/50">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                  <p className="text-slate-400">Sign in with your Microsoft 365 account</p>
                </div>

                {/* Microsoft Sign In Button */}
                <button
                  onClick={handleLogin}
                  className="w-full mb-6 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 group-hover:blur-lg transition-all" />
                  
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold shadow-lg">
                    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                      <rect width="11" height="11" fill="#F25022"/>
                      <rect x="12" width="11" height="11" fill="#7FBA00"/>
                      <rect y="12" width="11" height="11" fill="#00A4EF"/>
                      <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
                    </svg>
                    Sign in with Microsoft 365
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Enterprise SSO Badge */}
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl mb-8 border border-blue-500/30 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm text-slate-300 font-medium">Enterprise Single Sign-On</span>
                </div>

                {/* Security Features */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="font-medium">Secure Authentication</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Directory Integration</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="font-medium">Multi-Factor Security</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm">
                Need help?{' '}
                <a href="#" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                  Contact Support
                </a>
              </p>
              <p className="text-slate-600 text-xs mt-3">
                © 2026 Applied Cloud Computing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}