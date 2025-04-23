import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchItems } from '../api/itemsApi';
import ItemCard from '../components/ItemCard';

// Filter icon for input
const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

// Category options
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Jewelry', label: 'Jewelry' },
  { value: 'Bags', label: 'Bags' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' }
];

// Status options
const STATUSES = [
  { value: '', label: 'All Items' },
  { value: 'lost', label: 'Lost Items' },
  { value: 'found', label: 'Found Items' }
];

// Fallback images
const fallbackItemImages = {
  Electronics: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Accessories: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Documents: 'https://images.unsplash.com/photo-1588458034288-9ced35a307fe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  Clothing: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  other: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f2?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

const SearchItems = () => {
  // Use URL search params to persist filters in URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initial filter values from URL params or empty
  const initialTerm = searchParams.get('term') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialStatus = searchParams.get('status') || '';
  
  // Form state
  const [filters, setFilters] = useState({
    term: initialTerm,
    category: initialCategory,
    status: initialStatus
  });
  
  // Results state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Load items on component mount if URL has search params
  useEffect(() => {
    if (initialTerm || initialCategory || initialStatus) {
      handleSearch();
    }
  }, []);
  
  // Update URL when filters change
  const updateSearchParams = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.term) params.set('term', newFilters.term);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.status) params.set('status', newFilters.status);
    setSearchParams(params);
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };
  
  // Perform search
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      // Update URL with current filters
      updateSearchParams(filters);
      
      // Search items using the API
      const results = await searchItems(filters);
      
      // Process items to add fallback images if needed
      const processedItems = results.map(item => ({
        ...item,
        image: item.image || fallbackItemImages[item.category] || fallbackItemImages.other
      }));
      
      setItems(processedItems);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search items. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear all filters
  const handleClear = () => {
    setFilters({ term: '', category: '', status: '' });
    setSearchParams(new URLSearchParams());
    setItems([]);
    setHasSearched(false);
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Search Lost & Found Items</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search term input */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                name="term"
                value={filters.term}
                onChange={handleChange}
                placeholder="Search by name, description, or location"
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
          
          {/* Filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleChange}
                className="w-full py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status dropdown */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Item Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
              >
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Results section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Results header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {hasSearched ? `Search Results (${items.length})` : 'Search Results'}
          </h2>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 mx-auto text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Searching items...</p>
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
        
        {/* No search yet state */}
        {!loading && !error && !hasSearched && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-4 text-gray-600">Use the search filters above to find lost or found items.</p>
          </div>
        )}
        
        {/* No results state */}
        {!loading && !error && hasSearched && items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-600">No items match your search criteria. Try broadening your search.</p>
          </div>
        )}
        
        {/* Results grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map(item => (
              <ItemCard key={item._id || item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItems;