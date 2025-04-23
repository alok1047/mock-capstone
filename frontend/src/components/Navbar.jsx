import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Placeholder User Icon SVG
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Navbar = () => {
  // Get authentication state and functions
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Adjust active/inactive class for the new design (subtler active state maybe)
  const activeClassName = "text-brand-blue font-medium"; // Use brand blue for active link
  const inactiveClassName = "text-gray-600 hover:text-brand-blue transition-colors duration-200 font-medium";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50"> {/* Lighter shadow */}
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">

        {/* Logo and Tagline */}
        <Link to="/" className="flex items-center space-x-2">
           <span className="text-2xl font-bold text-brand-blue">ELIF</span>
           <span className="text-sm text-gray-500 hidden sm:inline">Even Lost, I Found</span> {/* Tagline hidden on very small screens */}
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8 items-center"> {/* Adjusted spacing */}
          <li><NavLink to="/" end className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>Home</NavLink></li>
          <li><NavLink to="/lost-items" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>Lost Items</NavLink></li>
          <li><NavLink to="/found-items" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>Found Items</NavLink></li>
          {/* Report Item link - conditional based on auth */}
          <li>
            <NavLink 
              to={currentUser ? "/report-item" : "/login"} 
              className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
            >
              Report Item
            </NavLink>
          </li>
          {/* Dashboard link - only for authenticated users */}
          {currentUser && (
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
              >
                Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        {/* Desktop Auth Buttons - Conditional based on auth status */}
        <div className="hidden md:flex items-center space-x-3">
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-transparent hover:bg-gray-100"
            >
              <UserIcon />
              Log out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center text-gray-700 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-transparent hover:bg-gray-100"
              >
                <UserIcon />
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-brand-blue focus:outline-none p-1" aria-label="Toggle menu">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
           </button>
        </div>
      </div>

       {/* Mobile Menu Dropdown */}
       {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NavLink to="/" end className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
                <NavLink to="/lost-items" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Lost Items</NavLink>
                <NavLink to="/found-items" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Found Items</NavLink>
                <NavLink to={currentUser ? "/report-item" : "/login"} className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Report Item</NavLink>
                
                {/* Dashboard - Only for authenticated users */}
                {currentUser && (
                  <NavLink to="/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'}`} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                )}
                
                {/* Divider */}
                <div className="border-t border-gray-200 pt-4 mt-3 pb-2">
                  {currentUser ? (
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }} 
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue"
                    >
                      <UserIcon />Log out
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue" onClick={() => setIsMobileMenuOpen(false)}><UserIcon />Log in</Link>
                      <Link to="/signup" className="block w-full mt-2 text-center bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
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