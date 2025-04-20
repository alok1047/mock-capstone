import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';

// Minimal placeholder for other pages
const PagePlaceholder = ({ title }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold">{title}</h1>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<PagePlaceholder title="Login" />} />
    <Route path="/lost-items" element={<PagePlaceholder title="Lost Items" />} />
    <Route path="/found-items" element={<PagePlaceholder title="Found Items" />} />
    <Route path="/report" element={<PagePlaceholder title="Report Item" />} />
  </Routes>
);

export default AppRoutes;