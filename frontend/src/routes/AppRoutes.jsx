import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiAssistant from '../components/AiAssistant';
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

// Choice screen for reporting an item — picks between Lost and Found.
const LostIllustration = () => (
  <svg viewBox="0 0 80 80" fill="none" className="h-9 w-9" aria-hidden="true">
    <rect x="14" y="22" width="44" height="40" rx="6" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
    <path d="M14 32 L36 46 L58 32" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="60" cy="20" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
    <path d="M60 14 v6 m0 4 v0.5" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const FoundIllustration = () => (
  <svg viewBox="0 0 80 80" fill="none" className="h-9 w-9" aria-hidden="true">
    <rect x="14" y="22" width="44" height="40" rx="6" fill="#bbf7d0" stroke="#166534" strokeWidth="2" />
    <path d="M14 32 L36 46 L58 32" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="60" cy="20" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
    <path d="M54 20 l4 4 l8 -8" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Arrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const ReportItem = () => (
  <div className="max-w-xl mx-auto animate-fadeInUp">
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Report an item</p>
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">What would you like to report?</h1>
      <p className="text-sm text-gray-500 mt-1">
        Choose the option that describes your situation.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {/* Lost */}
      <Link
        to="/report-lost"
        className="group relative aspect-square flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-xl transition-all hover:border-brand-blue hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-amber-50 border border-amber-100">
          <LostIllustration />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">I lost an item</h2>
          <p className="text-xs text-gray-500 mt-1 leading-snug">
            Tell us what you lost and where.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 transition-transform group-hover:translate-x-0.5">
          Report lost <Arrow />
        </span>
      </Link>

      {/* Found */}
      <Link
        to="/report-found"
        className="group relative aspect-square flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-xl transition-all hover:border-brand-blue hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-50 border border-emerald-100">
          <FoundIllustration />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">I found an item</h2>
          <p className="text-xs text-gray-500 mt-1 leading-snug">
            Pin the exact spot on the map.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 transition-transform group-hover:translate-x-0.5">
          Report found <Arrow />
        </span>
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
    <AiAssistant />
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