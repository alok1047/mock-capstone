import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const desktopLinkBase = "nav-link-underline text-sm font-medium transition-colors duration-200";
  const activeClass = `${desktopLinkBase} text-brand-blue is-active`;
  const inactiveClass = `${desktopLinkBase} text-gray-600 hover:text-brand-blue`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">

        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-2xl font-extrabold text-brand-blue transition-transform duration-300 group-hover:scale-110">
            ELIF
          </span>
          <span className="text-sm text-gray-500 hidden sm:inline transition-colors duration-200 group-hover:text-gray-700">
            Even Lost, I Found
          </span>
        </Link>

        <ul className="hidden md:flex space-x-8 items-center">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? activeClass : inactiveClass}>Home</NavLink></li>
          <li><NavLink to="/lost-items" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Lost Items</NavLink></li>
          <li><NavLink to="/found-items" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Found Items</NavLink></li>
          {currentUser && (
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                Profile
              </NavLink>
            </li>
          )}
        </ul>

        <div className="hidden md:flex items-center space-x-3">
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-transparent hover:bg-gray-100 active:scale-[0.97]"
            >
              <UserIcon />
              Log out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center text-gray-700 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-transparent hover:bg-gray-100 active:scale-[0.97]"
              >
                <UserIcon />
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-brand-blue focus:outline-none p-2 rounded-md transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className={`h-6 w-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40 animate-slideDown">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" end className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/lost-items" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Lost Items</NavLink>
            <NavLink to="/found-items" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Found Items</NavLink>

            {currentUser && (
              <NavLink to="/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Profile</NavLink>
            )}

            <div className="border-t border-gray-200 pt-4 mt-3 pb-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition-colors duration-200"
                >
                  <UserIcon />Log out
                </button>
              ) : (
                <>
                  <Link to="/login" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition-colors duration-200" onClick={() => setIsMobileMenuOpen(false)}><UserIcon />Log in</Link>
                  <Link to="/signup" className="block w-full mt-2 text-center bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-md text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
