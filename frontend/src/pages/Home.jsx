import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EyeIcon from '../components/EyeIcon';
import Testimonials from '../components/Testimonials';
import { useAuth } from '../contexts/AuthContext';

// Icons
const ReportIcon = () => <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const SearchIcon = () => <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const VerifyIcon = () => <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const SearchIconSmall = () => <svg className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ReportIconSmall = () => <svg className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Handle report item button click - redirect to login if not authenticated
  const handleReportItemClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: '/report-item' } } });
    }
  };
  return (
    <div className="space-y-16 md:space-y-24">

      {/* === Hero Section === */}
      <section className="relative pt-12 md:pt-20 pb-12 md:pb-20 overflow-hidden">
        {/* Soft ambient blobs (kept from original design) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-8 -left-12 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-teal/10 blur-3xl animate-float [animation-delay:1.5s]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* === Left: text & buttons (unchanged content) === */}
          <div className="text-center md:text-left order-2 md:order-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight animate-fadeInUp">
              <span className="gradient-text">Even Lost,</span>{' '}
              <span className="text-gray-800">I Found</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0 mb-8 animate-fadeInUp animation-delay-100">
              The community platform that connects people who have lost items with those who have found them.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center space-y-3 sm:space-y-0 sm:space-x-4 animate-fadeInUp animation-delay-200">
              <Link
                to="/report-item"
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] w-full sm:w-auto"
                onClick={handleReportItemClick}
              >
                <ReportIconSmall /> Report an Item
              </Link>
              <Link
                to="/lost-items?focus=search"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-semibold transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] w-full sm:w-auto"
              >
                <SearchIconSmall /> Search Lost Items
              </Link>
            </div>
          </div>

          {/* === Right: hero video ===
              The wrapper is painted bg-brand-bg so the video's near-white
              backdrop multiplies against a flat page-coloured surface — no
              gradient blobs bleed through, no visible square edge. */}
          <div className="order-1 md:order-2 w-full max-w-md mx-auto md:max-w-none animate-fadeIn animation-delay-100 bg-brand-bg">
            <video
              src="/video.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="w-full h-auto object-contain select-none pointer-events-none [mix-blend-mode:multiply]"
              style={{
                // Soft horizontal feather so the video edges don't end in a
                // hard rectangle — fully visible in the middle, fading to
                // transparent at left/right where the page bg shows through.
                maskImage:
                  'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </section>

      {/* === Features Section === */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-lg shadow-soft text-center card-hover animate-fadeInUp animation-delay-100">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <ReportIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Report Lost Items</h3>
            <p className="text-gray-600">
              Quickly report your lost items with details and images to increase your chances of finding them.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-lg shadow-soft text-center card-hover animate-fadeInUp animation-delay-200">
             <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500 mb-6 transition-transform duration-300 group-hover:scale-110">
              <EyeIcon className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Items</h3>
            <p className="text-gray-600">
              Search for items by category, location, and date. Filter to find exactly what you're looking for.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-lg shadow-soft text-center card-hover animate-fadeInUp animation-delay-300">
             <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <VerifyIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Verification System</h3>
            <p className="text-gray-600">
              Our verification system ensures that items are returned to their rightful owners.
            </p>
          </div>
        </div>
      </section>

      {/* === Testimonials Section === */}
      <Testimonials />

      <section className="text-center py-8 animate-fadeIn">
        <p className="text-lg mb-4">Lost something? Report it and we'll help you find it!</p>
        <Link
          to="/report-item"
          className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          onClick={handleReportItemClick}
        >
          Report an Item
        </Link>
      </section>

      {/* === How It Works Section === */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 animate-fadeInUp">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group text-center animate-fadeInUp animation-delay-100">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white text-2xl font-bold mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Report</h3>
            <p className="text-gray-600">
              Report your lost item or something you've found with details, photos, and location.
            </p>
          </div>

          <div className="group text-center animate-fadeInUp animation-delay-200">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white text-2xl font-bold mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect</h3>
            <p className="text-gray-600">
              Our system matches lost items with found reports and connects the users securely.
            </p>
          </div>

          <div className="group text-center animate-fadeInUp animation-delay-300">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white text-2xl font-bold mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Recover</h3>
            <p className="text-gray-600">
              Verify ownership and arrange a safe return of the item to its rightful owner.
            </p>
          </div>
        </div>
      </section>

    </div> // End main container div
  );
};

export default Home;