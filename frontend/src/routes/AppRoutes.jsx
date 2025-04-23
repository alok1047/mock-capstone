import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import OAuthSuccess from '../pages/OAuthSuccess';
import ProtectedRoute from '../components/ProtectedRoute';

// Import actual components if they exist, or use placeholders
// These will be implemented with real functionality progressively
import LostItems from '../pages/LostItems';
import FoundItems from '../pages/FoundItems';
import ReportLost from '../pages/ReportLost';
import ReportFound from '../pages/ReportFound';
import Dashboard from '../pages/Dashboard';
import SearchItems from '../pages/SearchItems';
import ItemDetail from '../pages/ItemDetail';

// Placeholder components for pages not yet implemented
const ReportItem = () => (
  <div className="p-6 bg-white rounded shadow">
    <h1 className="text-xl font-bold mb-4">Report an Item</h1>
    <p>Choose an option:</p>
    <div className="mt-4 space-y-3">
      <Link to="/report-lost" className="block p-4 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100">
        I lost an item
      </Link>
      <Link to="/report-found" className="block p-4 bg-green-50 border border-green-200 rounded-md hover:bg-green-100">
        I found an item
      </Link>
    </div>
  </div>
);
const NotFound = () => <div className="p-6 bg-white rounded shadow text-center"><h1 className="text-xl font-bold text-red-600">404 - Page Not Found</h1></div>;

// --- Layout Component Definition ---
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-brand-bg">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 py-8 sm:py-12"> {/* Adjusted padding */}
        {children}
    </main>
    <Footer />
  </div>
);

// --- Route Definitions ---
const AppRoutes = () => {
  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/lost-items" element={<MainLayout><LostItems /></MainLayout>} />
        <Route path="/found-items" element={<MainLayout><FoundItems /></MainLayout>} />
        <Route path="/search-items" element={<MainLayout><SearchItems /></MainLayout>} />
        <Route path="/item/:id" element={<MainLayout><ItemDetail /></MainLayout>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/report-item" element={
          <ProtectedRoute>
            <MainLayout><ReportItem /></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/report-lost" element={
          <ProtectedRoute>
            <MainLayout><ReportLost /></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/report-found" element={
          <ProtectedRoute>
            <MainLayout><ReportFound /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Not Found */}
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;