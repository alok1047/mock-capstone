import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deleteItem, getUserDashboard, respondToClaim } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';

// Icons
const ClaimIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ApproveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RejectIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const FoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    postedItems: [],
    receivedClaims: [],
    myClaims: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [processingClaimId, setProcessingClaimId] = useState(null);

  // Fetch user's items
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getUserDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user items:', err);
        setError('Failed to load your items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Handle item deletion
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setDeletingItemId(id);
        await deleteItem(id);
        setDashboardData(prev => ({
          ...prev,
          postedItems: prev.postedItems.filter(item => item._id !== id)
        }));
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete the item. Please try again.');
      } finally {
        setDeletingItemId(null);
      }
    }
  };

  // Handle approve/reject claim
  const handleRespondToClaim = async (itemId, claimId, status) => {
    try {
      setProcessingClaimId(claimId);
      await respondToClaim(itemId, claimId, { status });
      
      // Update local state to reflect the change
      setDashboardData(prev => ({
        ...prev,
        receivedClaims: prev.receivedClaims.map(claim => 
          claim._id === claimId ? { ...claim, status } : claim
        )
      }));
      
      setError(null);
    } catch (err) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} claim:`, err);
      setError(`Failed to ${status === 'approved' ? 'approve' : 'reject'} the claim. Please try again.`);
    } finally {
      setProcessingClaimId(null);
    }
  };

  // Split items by status
  const lostItems = dashboardData.postedItems.filter(item => item.status === 'lost');
  const foundItems = dashboardData.postedItems.filter(item => item.status === 'found');

  // Pending claims (not yet approved or rejected)
  const pendingClaims = dashboardData.receivedClaims.filter(claim => 
    claim.status === 'pending'
  );

  // Calculate stats
  const totalItems = dashboardData.postedItems.length;
  const totalLost = lostItems.length;
  const totalFound = foundItems.length;
  const totalClaims = dashboardData.receivedClaims.length;
  const totalMyClaims = dashboardData.myClaims.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/report-lost"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm text-sm"
          >
            Report Lost Item
          </Link>
          <Link
            to="/report-found"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm text-sm"
          >
            Report Found Item
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-blue">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Items</h3>
          <p className="text-3xl font-bold text-brand-blue">{totalItems}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-amber-500">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Lost Items</h3>
          <p className="text-3xl font-bold text-amber-500">{totalLost}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Found Items</h3>
          <p className="text-3xl font-bold text-green-500">{totalFound}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Received Claims</h3>
          <p className="text-3xl font-bold text-indigo-500">{totalClaims}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">My Claims</h3>
          <p className="text-3xl font-bold text-purple-500">{totalMyClaims}</p>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && dashboardData.postedItems.length === 0 && 
        dashboardData.receivedClaims.length === 0 && 
        dashboardData.myClaims.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">You haven't reported any items yet</h2>
          <p className="text-gray-600 mb-6">Start by reporting a lost or found item using the buttons above.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Link
              to="/report-lost"
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow-sm"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      )}

      {/* Items Tables */}
      {!loading && !error && (dashboardData.postedItems.length > 0 || 
                              dashboardData.receivedClaims.length > 0 ||
                              dashboardData.myClaims.length > 0) && (
        <div className="space-y-8">
          {/* Lost Items Table */}
          {lostItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <LostIcon />
                <span className="ml-2">Your Lost Items</span>
              </h2>
              <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lostItems.map(item => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={item.image || `https://source.unsplash.com/random/100x100?${item.category}`} alt={item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{item.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/item/${item._id}`}
                              className="text-brand-blue hover:text-brand-blue-dark"
                            >
                              <EditIcon />
                            </Link>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={deletingItemId === item._id}
                            >
                              {deletingItemId === item._id ? (
                                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <DeleteIcon />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Found Items Table */}
          {foundItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FoundIcon />
                <span className="ml-2">Your Found Items</span>
              </h2>
              <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {foundItems.map(item => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={item.image || `https://source.unsplash.com/random/100x100?${item.category}`} alt={item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{item.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/item/${item._id}`}
                              className="text-brand-blue hover:text-brand-blue-dark"
                            >
                              <EditIcon />
                            </Link>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={deletingItemId === item._id}
                            >
                              {deletingItemId === item._id ? (
                                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <DeleteIcon />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Claims on Your Items */}
          {pendingClaims.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ClaimIcon />
                <span className="ml-2">Claims on Your Items</span>
              </h2>
              <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimed By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingClaims.map(claim => (
                      <tr key={claim._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={claim.item.image || `https://source.unsplash.com/random/100x100?${claim.item.category}`} alt={claim.item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{claim.item.name}</div>
                              <div className="text-xs text-gray-500">{claim.item.status === 'lost' ? 'Lost' : 'Found'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{claim.claimant.username}</div>
                          <div className="text-xs text-gray-500">{claim.claimant.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{claim.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleRespondToClaim(claim.item._id, claim._id, 'approved')}
                              className="text-green-600 hover:text-green-900 flex items-center"
                              disabled={processingClaimId === claim._id}
                            >
                              {processingClaimId === claim._id ? (
                                <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <>
                                  <ApproveIcon />
                                  <span className="ml-1">Approve</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRespondToClaim(claim.item._id, claim._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              disabled={processingClaimId === claim._id}
                            >
                              {processingClaimId === claim._id ? (
                                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <>
                                  <RejectIcon />
                                  <span className="ml-1">Reject</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Your Claims Table */}
          {dashboardData.myClaims.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ClaimIcon />
                <span className="ml-2">Your Claims</span>
              </h2>
              <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.myClaims.map(claim => (
                      <tr key={claim._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={claim.item.image || `https://source.unsplash.com/random/100x100?${claim.item.category}`} alt={claim.item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{claim.item.name}</div>
                              <div className="text-xs text-gray-500">{claim.item.status === 'lost' ? 'Lost' : 'Found'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{claim.owner.username}</div>
                          <div className="text-xs text-gray-500">{claim.owner.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {claim.status === 'pending' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {claim.status === 'approved' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {claim.status === 'rejected' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;