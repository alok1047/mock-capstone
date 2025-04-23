import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 py-6 mt-auto w-full">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} ELIF - Even Lost, I Found. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;