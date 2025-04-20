import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-10 bg-white border-b border-gray-200 py-3 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-blue-600 font-bold text-xl">ELIF</span>
            <span className="ml-2 text-gray-700">Even Lost, I Found</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {['Home', 'Lost Items', 'Found Items', 'Report Item'].map((item, i) => (
            <Link key={i} to={i === 0 ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
              className="text-gray-600 hover:text-blue-600">{item}</Link>
          ))}
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600">Log in</Link>
          <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded">Sign up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;