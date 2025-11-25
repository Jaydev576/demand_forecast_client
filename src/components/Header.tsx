import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LogOut, Menu, X, Upload, BarChart3, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out successfully', 'success');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [
    { to: '/upload', icon: Upload, label: 'Upload Data' },
    { to: '/forecast', icon: BarChart3, label: 'Forecast' },
    { to: '/insights', icon: Lightbulb, label: 'Business Insights' },
  ] : [];

  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphic background */}
      <div className="mx-auto px-5 py-2 transition-all duration-300 absolute inset-0 bg-white/5 backdrop-blur-3xl border-b border-white/10 shadow-lg shadow-white/5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-full shadow-md shadow-blue-500/10">
                <TrendingUp className="w-6 h-6 text-white animate-pulseConstellation" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              ForecastIQ
            </span>
          </Link>

          {user && (
            <>
              <nav className="hidden md:flex items-center gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.to)
                        ? 'bg-white/10 text-blue-300 shadow-inner shadow-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-lg hover:shadow-blue-500/10'
                      } backdrop-blur-xl border border-white/10`}
                  >
                    <link.icon className="w-4 h-4 animate-pulseConstellation" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex items-center">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 backdrop-blur-xl border border-white/10 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <LogOut className="w-4 h-4 animate-pulseConstellation" />
                  Sign Out
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 backdrop-blur-xl border border-white/10"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 backdrop-blur-xl border border-white/10 hover:shadow-lg hover:shadow-blue-500/10"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-md shadow-blue-500/10"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {user && mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10 bg-white/5 backdrop-blur-3xl animate-growIn">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.to)
                    ? 'bg-white/10 text-blue-300 shadow-inner shadow-blue-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-lg hover:shadow-blue-500/10'
                  } backdrop-blur-xl border border-white/10 mx-2`}
              >
                <link.icon className="w-4 h-4 animate-pulseConstellation" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 backdrop-blur-xl border border-white/10 mx-2 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <LogOut className="w-4 h-4 animate-pulseConstellation" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <style>{`
    @keyframes pulseConstellation {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes growIn {
      0% { transform: translateY(-10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .animate-pulseConstellation {
      animation: pulseConstellation 3s ease-in-out infinite;
    }
    .animate-growIn {
      animation: growIn 0.3s ease-out forwards;
    }
  `}</style>
    </header>


  );
}