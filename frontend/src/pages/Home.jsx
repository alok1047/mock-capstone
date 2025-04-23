import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import { getAllItems } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';

// Icons
const ReportIcon = () => <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const SearchIcon = () => <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const VerifyIcon = () => <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const SearchIconSmall = () => <svg className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ReportIconSmall = () => <svg className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

// Fallback image if no image is available or loading fails
const fallbackItemImages = {
  Electronics: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Accessories: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Documents: 'https://images.unsplash.com/photo-1588458034288-9ced35a307fe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Clothing: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  other: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f2?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for recent items section
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch recent items when component mounts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // Get items from the API
        const data = await getAllItems();
        
        // Process and sort items by date (newest first)
        const processedItems = data.map(item => ({
          ...item,
          // Use fallback image if no image is provided
          image: item.image || fallbackItemImages[item.category] || fallbackItemImages.other
        }));
        
        // Sort by date (newest first) and take only the most recent 6 items
        const sortedItems = processedItems.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        ).slice(0, 6);
        
        setItems(sortedItems);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch items:', err);
        setError('Failed to load recent items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);
  
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
      <section className="text-center pt-12 md:pt-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-blue mb-4 leading-tight">
          Even Lost, <span className="text-gray-800">I Found</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          The community platform that connects people who have lost items with those who have found them.
        </p>
        {/* Hero Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
           <Link
             to="/report-item"
             className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-md font-semibold transition duration-200 shadow-sm w-full sm:w-auto"
             onClick={handleReportItemClick}
           >
             <ReportIconSmall /> Report an Item
           </Link>
           <Link
             to="/search-items"
             className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-semibold transition duration-200 border border-gray-300 shadow-sm w-full sm:w-auto"
           >
              <SearchIconSmall /> Search Lost Items
           </Link>
        </div>
      </section>

      {/* === Features Section === */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1: Report */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500 mb-6">
              <ReportIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Report Lost Items</h3>
            <p className="text-gray-600">
              Quickly report your lost items with details and images to increase your chances of finding them.
            </p>
          </div>

          {/* Feature Card 2: Find */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
             <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500 mb-6">
              <SearchIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Items</h3>
            <p className="text-gray-600">
              Search for items by category, location, and date. Filter to find exactly what you're looking for.
            </p>
          </div>

          {/* Feature Card 3: Verify */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
             <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue mb-6">
              <VerifyIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Verification System</h3>
            <p className="text-gray-600">
              Our verification system ensures that items are returned to their rightful owners.
            </p>
          </div>
        </div>
      </section>

      {/* === Recent Items Section === */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Items</h2>
          <div className="flex space-x-3">
            <Link
              to="/lost-items"
              className="bg-white hover:bg-gray-50 text-amber-600 px-4 py-2 rounded-md font-medium text-sm transition duration-200 border border-amber-400 shadow-sm"
            >
              View Lost Items
            </Link>
            <Link
              to="/found-items"
              className="bg-white hover:bg-gray-50 text-green-600 px-4 py-2 rounded-md font-medium text-sm transition duration-200 border border-green-400 shadow-sm"
            >
              View Found Items
            </Link>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <svg className="animate-spin h-10 w-10 mx-auto text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Loading recent items...</p>
          </div>
        )}
        
        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* No items state */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No items have been reported yet. Be the first to report a lost or found item!</p>
            <Link to="/report-item" className="mt-4 inline-block text-brand-blue hover:underline" onClick={handleReportItemClick}>
              Report an Item
            </Link>
          </div>
        )}
        
        {/* Item grid - Success state */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map(item => (
              <ItemCard key={item._id || item.id} {...item} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-8">
        <p className="text-lg mb-4">Lost something? Report it and we'll help you find it!</p>
        <Link
          to="/report-item"
          className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-md font-semibold transition duration-200 shadow-sm"
          onClick={handleReportItemClick}
        >
          Report an Item
        </Link>
      </section>

      {/* === How It Works Section === */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white text-2xl font-bold mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Report</h3>
            <p className="text-gray-600">
              Report your lost item or something you've found with details, photos, and location.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white text-2xl font-bold mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect</h3>
            <p className="text-gray-600">
              Our system matches lost items with found reports and connects the users securely.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white text-2xl font-bold mb-6">
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