import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaSignOutAlt, FaSearch, FaToggleOn, FaToggleOff, FaTrash, FaEye, FaBan, FaCheckCircle } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import ThemeToggle from '../../ThemeToggle';
import './index.css';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updating, setUpdating] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [restaurantStats, setRestaurantStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        // Verify authentication and fetch restaurants in one call
        // Since httpOnly cookies can't be read by JavaScript, we verify by calling a protected endpoint
        const verifyAuthAndFetch = async () => {
            setLoading(true);
            try {
                // Try to get token from cookie (non-httpOnly) for Authorization header
                const token = Cookies.get('sa_user');
                const res = await fetch('http://localhost:8000/superAdmin/getAllRestaurants', {
                    method: 'GET',
                    credentials: 'include', // This sends the httpOnly cookie
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                
                if (res.ok) {
                    // Authenticated - get restaurants data
                    const data = await res.json();
                    setRestaurants(data.restaurants || []);
                } else if (res.status === 401 || res.status === 403) {
                    // Not authenticated - redirect to login
                    Cookies.remove('sa_user');
                    navigate('/superAdminLogin');
                    return;
                } else {
                    console.error('Failed to fetch restaurants');
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                // On network error, check if we have a token cookie (non-httpOnly) as fallback
                const token = Cookies.get('sa_user');
                if (!token) {
                    navigate('/superAdminLogin');
                    return;
                }
            } finally {
                setLoading(false);
            }
        };
        
        verifyAuthAndFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            // Try to get token from cookie (non-httpOnly) for Authorization header
            const token = Cookies.get('sa_user');
            const res = await fetch('http://localhost:8000/superAdmin/getAllRestaurants', {
                method: 'GET',
                credentials: 'include', // This sends the httpOnly cookie
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRestaurants(data.restaurants || []);
            } else if (res.status === 401 || res.status === 403) {
                // Not authenticated - redirect to login
                Cookies.remove('sa_user');
                navigate('/superAdminLogin');
            } else {
                console.error('Failed to fetch restaurants');
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (restaurantId, currentStatus) => {
        setUpdating(restaurantId);
        try {
            const token = Cookies.get('sa_user');
            const res = await fetch(`http://localhost:8000/superAdmin/updateRestaurantStatus/${restaurantId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (res.ok) {
                await fetchRestaurants();
            } else {
                alert('Failed to update restaurant status');
            }
        } catch (error) {
            console.error('Error updating restaurant status:', error);
            alert('Error updating restaurant status');
        } finally {
            setUpdating(null);
        }
    };

    const handleToggleSuspended = async (restaurantId, currentStatus) => {
        setUpdating(restaurantId);
        try {
            const token = Cookies.get('sa_user');
            const res = await fetch(`http://localhost:8000/superAdmin/updateRestaurantStatus/${restaurantId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ is_suspended: !currentStatus })
            });
            if (res.ok) {
                await fetchRestaurants();
            } else {
                alert('Failed to update restaurant status');
            }
        } catch (error) {
            console.error('Error updating restaurant status:', error);
            alert('Error updating restaurant status');
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
            return;
        }
        setDeleting(restaurantId);
        try {
            const token = Cookies.get('sa_user');
            const res = await fetch(`http://localhost:8000/superAdmin/deleteRestaurant/${restaurantId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                await fetchRestaurants();
            } else {
                alert('Failed to delete restaurant');
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            alert('Error deleting restaurant');
        } finally {
            setDeleting(null);
        }
    };

    const handleViewDetails = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        setShowDetailsModal(true);
        setLoadingStats(true);
        try {
            const token = Cookies.get('sa_user');
            const res = await fetch(`http://localhost:8000/superAdmin/getRestaurantStats/${restaurant.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRestaurantStats(data);
            }
        } catch (error) {
            console.error('Error fetching restaurant stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Get token for Authorization header
            const token = Cookies.get('sa_user');
            
            // Call backend logout endpoint to clear HttpOnly cookie
            await fetch('http://localhost:8000/superAdmin/logout', {
                method: 'POST',
                credentials: 'include', // Send HttpOnly cookie
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Clear client-side cookie
            Cookies.remove('sa_user');
            // Navigate to login page
            navigate('/superAdminLogin', { replace: true });
        }
    };

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.restaurentname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='super-admin-dashboard-container'>
            <header className='super-admin-dashboard-header'>
                <div>
                    <h1 className='super-admin-dashboard-title'>Super Admin Dashboard</h1>
                    <p className='super-admin-dashboard-subtitle'>Manage all restaurants</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ThemeToggle />
                    <button className='super-admin-logout-btn' onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>

            <div className='super-admin-dashboard-content'>
                <div className='super-admin-search-container'>
                    <FaSearch className='super-admin-search-icon' />
                    <input
                        type='text'
                        placeholder='Search restaurants by name, email, or restaurant name...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='super-admin-search-input'
                    />
                </div>

                {loading ? (
                    <div className='super-admin-loading'>
                        <PulseLoader color='#667eea' size={12} />
                        <p>Loading restaurants...</p>
                    </div>
                ) : filteredRestaurants.length === 0 ? (
                    <div className='super-admin-empty'>
                        <p>No restaurants found</p>
                    </div>
                ) : (
                    <div className='super-admin-restaurants-grid'>
                        {filteredRestaurants.map((restaurant) => (
                            <div key={restaurant.id} className='super-admin-restaurant-card'>
                                <div className='super-admin-restaurant-card-header'>
                                    <h3 className='super-admin-restaurant-name'>{restaurant.restaurentname || 'N/A'}</h3>
                                    <div className='super-admin-restaurant-status-badges'>
                                        {restaurant.is_active ? (
                                            <span className='super-admin-badge active'>Active</span>
                                        ) : (
                                            <span className='super-admin-badge inactive'>Inactive</span>
                                        )}
                                        {restaurant.is_suspended && (
                                            <span className='super-admin-badge suspended'>Suspended</span>
                                        )}
                                    </div>
                                </div>
                                <div className='super-admin-restaurant-card-body'>
                                    <p><strong>Admin:</strong> {restaurant.name}</p>
                                    <p><strong>Email:</strong> {restaurant.email}</p>
                                    <p><strong>Branch:</strong> {restaurant.branchname || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {restaurant.phonenumber || 'N/A'}</p>
                                    <p><strong>Country:</strong> {restaurant.country || 'N/A'}</p>
                                    <p><strong>Joined:</strong> {new Date(restaurant.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className='super-admin-restaurant-card-actions'>
                                    <button
                                        className='super-admin-action-btn view-btn'
                                        onClick={() => handleViewDetails(restaurant)}
                                    >
                                        <FaEye /> View Details
                                    </button>
                                    <button
                                        className={`super-admin-action-btn ${restaurant.is_active ? 'deactivate-btn' : 'activate-btn'}`}
                                        onClick={() => handleToggleActive(restaurant.id, restaurant.is_active)}
                                        disabled={updating === restaurant.id}
                                    >
                                        {updating === restaurant.id ? (
                                            <PulseLoader color='#fff' size={6} />
                                        ) : restaurant.is_active ? (
                                            <>
                                                <FaToggleOff /> Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <FaToggleOn /> Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className={`super-admin-action-btn ${restaurant.is_suspended ? 'unsuspend-btn' : 'suspend-btn'}`}
                                        onClick={() => handleToggleSuspended(restaurant.id, restaurant.is_suspended)}
                                        disabled={updating === restaurant.id}
                                    >
                                        {updating === restaurant.id ? (
                                            <PulseLoader color='#fff' size={6} />
                                        ) : restaurant.is_suspended ? (
                                            <>
                                                <FaCheckCircle /> Unsuspend
                                            </>
                                        ) : (
                                            <>
                                                <FaBan /> Suspend
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className='super-admin-action-btn delete-btn'
                                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                                        disabled={deleting === restaurant.id}
                                    >
                                        {deleting === restaurant.id ? (
                                            <PulseLoader color='#fff' size={6} />
                                        ) : (
                                            <>
                                                <FaTrash /> Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Restaurant Details Modal */}
            {showDetailsModal && selectedRestaurant && (
                <div className='super-admin-modal-overlay' onClick={() => setShowDetailsModal(false)}>
                    <div className='super-admin-modal' onClick={(e) => e.stopPropagation()}>
                        <div className='super-admin-modal-header'>
                            <h2>Restaurant Details</h2>
                            <button className='super-admin-modal-close' onClick={() => setShowDetailsModal(false)}>×</button>
                        </div>
                        <div className='super-admin-modal-body'>
                            <div className='super-admin-modal-section'>
                                <h3>Basic Information</h3>
                                <p><strong>Restaurant Name:</strong> {selectedRestaurant.restaurentname || 'N/A'}</p>
                                <p><strong>Admin Name:</strong> {selectedRestaurant.name}</p>
                                <p><strong>Email:</strong> {selectedRestaurant.email}</p>
                                <p><strong>Phone:</strong> {selectedRestaurant.phonenumber || 'N/A'}</p>
                                <p><strong>Branch:</strong> {selectedRestaurant.branchname || 'N/A'}</p>
                                <p><strong>Address:</strong> {selectedRestaurant.branchaddress || 'N/A'}</p>
                                <p><strong>Country:</strong> {selectedRestaurant.country || 'N/A'}</p>
                                <p><strong>Joined Date:</strong> {new Date(selectedRestaurant.created_at).toLocaleString()}</p>
                            </div>
                            <div className='super-admin-modal-section'>
                                <h3>Status</h3>
                                <p><strong>Active:</strong> {selectedRestaurant.is_active ? 'Yes' : 'No'}</p>
                                <p><strong>Suspended:</strong> {selectedRestaurant.is_suspended ? 'Yes' : 'No'}</p>
                                <p><strong>Email Verified:</strong> {selectedRestaurant.is_email_verified ? 'Yes' : 'No'}</p>
                                <p><strong>Phone Verified:</strong> {selectedRestaurant.is_phonenumber_verified ? 'Yes' : 'No'}</p>
                            </div>
                            {loadingStats ? (
                                <div className='super-admin-loading'>
                                    <PulseLoader color='#667eea' size={8} />
                                    <p>Loading statistics...</p>
                                </div>
                            ) : restaurantStats && (
                                <div className='super-admin-modal-section'>
                                    <h3>Statistics</h3>
                                    <div className='super-admin-stats-grid'>
                                        <div className='super-admin-stat-card'>
                                            <h4>Total Orders</h4>
                                            <p className='super-admin-stat-number'>{restaurantStats.total_orders}</p>
                                        </div>
                                        <div className='super-admin-stat-card'>
                                            <h4>Total Staff</h4>
                                            <p className='super-admin-stat-number'>{restaurantStats.total_staff}</p>
                                        </div>
                                        <div className='super-admin-stat-card'>
                                            <h4>Total Tables</h4>
                                            <p className='super-admin-stat-number'>{restaurantStats.total_tables}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;

