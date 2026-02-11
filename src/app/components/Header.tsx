import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import accLogo from '../../assets/93b0f57f0c6cb722d5511f7e11c5f2d8141cb070.png';
import { dispatchAuthChange } from '../routes.tsx';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeaderProps {
  onNavigateToDatabase?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onNavigateToDatabase, onSearch, searchQuery = '' }: HeaderProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const loadUserData = () => {
      const userData = localStorage.getItem('user');
      console.log('🔍 Header: Loading user data from localStorage:', userData);
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Header: User data parsed:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ Header: Failed to parse user data:', error);
          localStorage.removeItem('user');
        }
      } else {
        console.log('⚠️ Header: No user data found in localStorage');
        setUser(null);
      }
    };

    // Initial load
    loadUserData();

    // Listen for storage changes (e.g., from login page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log('🔄 Header: Storage changed, reloading user data');
        loadUserData();
      }
    };

    // Listen for custom auth change event
    const handleAuthChange = () => {
      console.log('🔄 Header: Auth change event received');
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    dispatchAuthChange(false);
    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  const handleProfileUpdate = (updatedUser: { name: string; email: string; avatar: string }) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
  };

  const dropdownItems = [
    {
      icon: LogOut,
      label: 'Sign Out',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="desktop-header lg:sticky lg:top-0 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-b border-[#334155] px-8 py-4 relative z-50"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 animate-pulse pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6 relative z-10">
          <motion.div 
            className="flex items-center gap-4 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {/* ACC Logo */}
            <div className="h-14 flex items-center justify-center">
              <img src={accLogo} alt="ACC Logo" className="h-full w-auto object-contain" />
            </div>
          </motion.div>

          {/* Search Bar */}
          {onSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-1 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search employees, templates, ID cards..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => onSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-slate-300" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Profile Dropdown */}
          <div className="relative z-50 flex-shrink-0">
            <motion.button
              onClick={() => {
                if (!user) {
                  toast.error('Please log in first');
                  navigate('/login');
                  return;
                }
                setIsDropdownOpen(!isDropdownOpen);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400/80 hover:border-blue-300 transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center p-0.5"
              title={user ? 'Profile Menu' : 'Please log in'}
            >
              {user?.avatar ? (
                <ImageWithFallback
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && user && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-[100]"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 z-[101]"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl" />
                    
                    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                      {/* Logout Button */}
                      <motion.button
                        onClick={handleLogout}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Log Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>
    </>
  );
}