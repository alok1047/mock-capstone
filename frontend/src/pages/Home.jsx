import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="text-5xl font-bold mb-4">
      <span className="text-blue-500">Even Lost</span>, I Found
    </h1>
    <p className="text-lg text-gray-700 mb-8">
      The community platform that connects people who have lost items with
      those who have found them.
    </p>
    <div className="flex justify-center gap-4">
      <Link to="/report" className="bg-blue-500 text-white px-6 py-3 rounded-md">Report an Item</Link>
      <Link to="/lost-items" className="border border-gray-300 px-6 py-3 rounded-md">Search Lost Items</Link>
    </div>
  </div>
);

export default Home;