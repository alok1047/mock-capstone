import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-white text-gray-600 py-6 mt-auto w-full">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent" />
      <div className="container mx-auto px-4 text-center text-sm">
        <p>
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold text-brand-blue">ELIF</span> — Even Lost, I Found. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
