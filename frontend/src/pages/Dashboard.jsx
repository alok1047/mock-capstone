import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteItem, getUserDashboard, respondToClaim } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';

// ---------- Tiny presentational helpers ----------

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 transition hover:border-gray-300">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 mt-2 tabular-nums">{value}</p>
  </div>
);

const Pill = ({ tone = 'gray', children }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${tones[tone]}`}>
      {children}
    </span>
  );
};

const Spinner = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const SectionHeader = ({ title, count }) => (
  <div className="flex items-baseline gap-2 mb-3">
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    <span className="text-xs text-gray-500 tabular-nums">{count}</span>
  </div>
);

const Th = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>
);

const Thumb = ({ src, alt }) => (
  <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
    {src ? (
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    ) : (
      <div className="h-full w-full flex items-center justify-center text-gray-300 text-[10px]">—</div>
    )}
  </div>
);

const TableShell = ({ children }) => (
  <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
    <div className="overflow-x-auto">{children}</div>
  </div>
);

// Icons
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ---------- Page ----------

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState({ postedItems: [], receivedClaims: [], myClaims: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [processingClaimId, setProcessingClaimId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const d = await getUserDashboard();
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        if (!cancelled) setError('Failed to load your items. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await deleteItem(id);
      setData((p) => ({ ...p, postedItems: p.postedItems.filter((i) => i._id !== id) }));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete the item. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClaimResponse = async (itemId, claimId, status) => {
    try {
      setProcessingClaimId(claimId);
      await respondToClaim(itemId, claimId, { status });
      setData((p) => ({
        ...p,
        receivedClaims: p.receivedClaims.map((c) => (c._id === claimId ? { ...c, status } : c)),
      }));
      setError(null);
    } catch (err) {
      console.error('Claim response failed:', err);
      setError(`Failed to ${status === 'approved' ? 'approve' : 'reject'} the claim.`);
    } finally {
      setProcessingClaimId(null);
    }
  };

  const lostItems = data.postedItems.filter((i) => i.status === 'lost');
  const foundItems = data.postedItems.filter((i) => i.status === 'found');
  const pendingClaims = data.receivedClaims.filter((c) => c.status === 'pending');

  const stats = [
    { label: 'Total items', value: data.postedItems.length },
    { label: 'Lost', value: lostItems.length },
    { label: 'Found', value: foundItems.length },
    { label: 'Received claims', value: data.receivedClaims.length },
    { label: 'My claims', value: data.myClaims.length },
  ];

  const isEmpty =
    !loading &&
    !error &&
    data.postedItems.length === 0 &&
    data.receivedClaims.length === 0 &&
    data.myClaims.length === 0;

  const fmtDate = (s) =>
    new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-7 animate-fadeInDown">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username || 'User avatar'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-gray-400">
                  {(currentUser?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Profile</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight truncate">
                {currentUser?.username || 'Your profile'}
              </h1>
              {currentUser?.email && (
                <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <Link
              to="/report-lost"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              Report lost
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-md transition"
            >
              Report found
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 60}ms` }} className="animate-fadeInUp">
            <StatCard label={s.label} value={s.value} />
          </div>
        ))}
      </div>

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-gray-400" />
        </div>
      )}
      {error && !loading && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}
      {isEmpty && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Nothing here yet</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Report a lost or found item to get started.
          </p>
          <div className="flex justify-center gap-2">
            <Link
              to="/report-lost"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              Report lost
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-md transition"
            >
              Report found
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className="space-y-10">
          {/* Lost items */}
          {lostItems.length > 0 && (
            <section>
              <SectionHeader title="Your lost items" count={lostItems.length} />
              <TableShell>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Item</Th>
                      <Th>Location</Th>
                      <Th>Date</Th>
                      <Th>Category</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {lostItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <Td>
                          <div className="flex items-center gap-3">
                            <Thumb src={item.image} alt={item.name} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 truncate">{item.description}</p>
                            </div>
                          </div>
                        </Td>
                        <Td><span className="text-sm text-gray-700">{item.location}</span></Td>
                        <Td><span className="text-sm text-gray-500">{fmtDate(item.createdAt)}</span></Td>
                        <Td><Pill tone="gray">{item.category}</Pill></Td>
                        <Td className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/item/${item._id}`}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                              title="View"
                            >
                              <EditIcon />
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === item._id ? <Spinner /> : <TrashIcon />}
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </section>
          )}

          {/* Found items */}
          {foundItems.length > 0 && (
            <section>
              <SectionHeader title="Your found items" count={foundItems.length} />
              <TableShell>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Item</Th>
                      <Th>Location</Th>
                      <Th>Date</Th>
                      <Th>Category</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {foundItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <Td>
                          <div className="flex items-center gap-3">
                            <Thumb src={item.image} alt={item.name} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 truncate">{item.description}</p>
                            </div>
                          </div>
                        </Td>
                        <Td><span className="text-sm text-gray-700">{item.location}</span></Td>
                        <Td><span className="text-sm text-gray-500">{fmtDate(item.createdAt)}</span></Td>
                        <Td><Pill tone="gray">{item.category}</Pill></Td>
                        <Td className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/item/${item._id}`}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                              title="View"
                            >
                              <EditIcon />
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === item._id ? <Spinner /> : <TrashIcon />}
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </section>
          )}

          {/* Pending claims received */}
          {pendingClaims.length > 0 && (
            <section>
              <SectionHeader title="Claims awaiting your response" count={pendingClaims.length} />
              <TableShell>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Item</Th>
                      <Th>Claimant</Th>
                      <Th>Date</Th>
                      <Th>Message</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pendingClaims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-gray-50/50 transition-colors">
                        <Td>
                          <div className="flex items-center gap-3">
                            <Thumb src={claim.item.image} alt={claim.item.name} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{claim.item.name}</p>
                              <p className="text-xs text-gray-500">{claim.item.status === 'lost' ? 'Lost' : 'Found'}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <p className="text-sm text-gray-900">{claim.claimant.username}</p>
                          <p className="text-xs text-gray-500">{claim.claimant.email}</p>
                        </Td>
                        <Td><span className="text-sm text-gray-500">{fmtDate(claim.createdAt)}</span></Td>
                        <Td>
                          <p className="text-sm text-gray-700 max-w-xs truncate">{claim.message}</p>
                        </Td>
                        <Td className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleClaimResponse(claim.item._id, claim._id, 'rejected')}
                              disabled={processingClaimId === claim._id}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleClaimResponse(claim.item._id, claim._id, 'approved')}
                              disabled={processingClaimId === claim._id}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-black rounded transition disabled:opacity-50"
                            >
                              {processingClaimId === claim._id && <Spinner className="h-3 w-3 mr-1.5" />}
                              Approve
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </section>
          )}

          {/* My claims */}
          {data.myClaims.length > 0 && (
            <section>
              <SectionHeader title="Your claims" count={data.myClaims.length} />
              <TableShell>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Item</Th>
                      <Th>Owner</Th>
                      <Th>Date</Th>
                      <Th className="text-right">Status</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {data.myClaims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-gray-50/50 transition-colors">
                        <Td>
                          <div className="flex items-center gap-3">
                            <Thumb src={claim.item.image} alt={claim.item.name} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{claim.item.name}</p>
                              <p className="text-xs text-gray-500">{claim.item.status === 'lost' ? 'Lost' : 'Found'}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <p className="text-sm text-gray-900">{claim.owner.username}</p>
                          <p className="text-xs text-gray-500">{claim.owner.email}</p>
                        </Td>
                        <Td><span className="text-sm text-gray-500">{fmtDate(claim.createdAt)}</span></Td>
                        <Td className="text-right">
                          {claim.status === 'pending' && <Pill tone="amber">Pending</Pill>}
                          {claim.status === 'approved' && <Pill tone="emerald">Approved</Pill>}
                          {claim.status === 'rejected' && <Pill tone="rose">Rejected</Pill>}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
