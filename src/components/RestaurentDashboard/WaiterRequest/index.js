import './index.css'
import { useState, useEffect, useContext } from 'react';   
import AllInOne from '../../../complexOne'
import { IoMdNotificationsOff } from "react-icons/io";
import { FaBell } from "react-icons/fa";

const WaiterRequest = () => {
    const { areasData, tablesData, userId, waiterRequestCount } = useContext(AllInOne);
    const [waiterRequests, setWaiterRequests] = useState([])
    const [waiters, setWaiters] = useState([])
    const [requestsLoading, setRequestsLoading] = useState(false)
    const [waitersLoading, setWaitersLoading] = useState(false)
    const [assigningWaiter, setAssigningWaiter] = useState(null)
    const [adminCalls, setAdminCalls] = useState([])
    const [adminCallsLoading, setAdminCallsLoading] = useState(false)
    const [updatingWaiterStatus, setUpdatingWaiterStatus] = useState(null)

    // Fetch waiter requests
    useEffect(() => {
        const fetchWaiterRequests = async () => {
            if (!userId) return;
            
            setRequestsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/getPendingWaiterRequests/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setWaiterRequests(data.requests || []);
                } else {
                    console.error('Failed to fetch waiter requests');
                    setWaiterRequests([]);
                }
            } catch (error) {
                console.error('Error fetching waiter requests:', error);
                setWaiterRequests([]);
            } finally {
                setRequestsLoading(false);
            }
        };

        fetchWaiterRequests();
        // Refresh every 5 seconds
        const interval = setInterval(fetchWaiterRequests, 5000);
        return () => clearInterval(interval);
    }, [userId]);

    // Fetch waiters with status
    useEffect(() => {
        const fetchWaiters = async () => {
            if (!userId) return;
            
            setWaitersLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/getWaitersWithStatus/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    // Sort waiters by availability: Available first, then Serving, then others
                    const sortedWaiters = (data.waiters || []).sort((a, b) => {
                        const getPriority = (waiter) => {
                            const status = waiter.status ? waiter.status.toLowerCase() : '';
                            const assignedCount = waiter.assigned_requests_count || 0;
                            
                            // Available waiters first (priority 1)
                            if (!status || status.includes('available') || (assignedCount === 0 && !status.includes('serving') && !status.includes('busy'))) {
                                return 1;
                            }
                            // Serving waiters second (priority 2)
                            if (status.includes('serving') || status.includes('busy') || assignedCount > 0) {
                                return 2;
                            }
                            // Cleaning waiters third (priority 3)
                            if (status.includes('cleaning')) {
                                return 3;
                            }
                            // Others last (priority 4)
                            return 4;
                        };
                        
                        return getPriority(a) - getPriority(b);
                    });
                    
                    setWaiters(sortedWaiters);
                } else {
                    console.error('Failed to fetch waiters');
                    setWaiters([]);
                }
            } catch (error) {
                console.error('Error fetching waiters:', error);
                setWaiters([]);
            } finally {
                setWaitersLoading(false);
            }
        };

        fetchWaiters();
        // Refresh waiters every 10 seconds
        const interval = setInterval(fetchWaiters, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    // Fetch admin calls for this restaurant (admin -> waiter)
    useEffect(() => {
        const fetchAdminCalls = async () => {
            if (!userId) return;

            setAdminCallsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/getAdminCallsRestaurant/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAdminCalls(data.calls || []);
                } else {
                    console.error('Failed to fetch admin calls');
                    setAdminCalls([]);
                }
            } catch (error) {
                console.error('Error fetching admin calls:', error);
                setAdminCalls([]);
            } finally {
                setAdminCallsLoading(false);
            }
        };

        fetchAdminCalls();
        const interval = setInterval(fetchAdminCalls, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    // Get requests for a specific area/table
    const getRequestsForArea = (areaId) => {
        if (!tablesData || tablesData.length === 0) return [];
        
        const area = tablesData.find(a => a.id === areaId);
        if (!area || !area.tables) return [];
        
        const tableIds = area.tables.map(t => t.id);
        return waiterRequests.filter(req => tableIds.includes(req.table_id));
    };

    // Assign waiter to a request
    const handleAssignWaiter = async (requestId, waiterId) => {
        setAssigningWaiter(requestId);
        try {
            const response = await fetch(`http://localhost:8000/assignWaiterToRequest/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ waiter_id: waiterId })
            });

            if (response.ok) {
                // Refresh requests
                const refreshResponse = await fetch(`http://localhost:8000/getPendingWaiterRequests/${userId}`);
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setWaiterRequests(data.requests || []);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to assign waiter');
            }
        } catch (error) {
            console.error('Error assigning waiter:', error);
            alert('Failed to assign waiter. Please try again.');
        } finally {
            setAssigningWaiter(null);
        }
    };

    // Get latest admin-call related info for a waiter
    // Prioritise live waiter.status (serving / busy), then fall back to pending call
    const getAdminCallInfoForWaiter = (waiter) => {
        if (!waiter) return null;
        const statusLower = (waiter.status || '').toLowerCase();

        // If waiter status already reflects an action, show that
        if (statusLower.includes('serving')) {
            return { text: 'Waiter is coming to you. Please wait.', type: 'answered' };
        }
        if (statusLower.includes('busy')) {
            return { text: 'Waiter is busy right now.', type: 'missed' };
        }
        // If waiter is available, don't show old "waiting" text
        if (statusLower.includes('available')) {
            return null;
        }

        // Otherwise, check if there is a pending admin call
        if (!adminCalls || adminCalls.length === 0) return null;
        const pendingCall = adminCalls.find(
            call => call.waiter_id === waiter.id && call.status === 'pending'
        );
        if (pendingCall) {
            return { text: 'You called this waiter. Waiting for response...', type: 'pending' };
        }

        return null;
    };

    // Get waiter status class
    const getWaiterStatusClass = (status) => {
        if (!status) return 'available-p';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('serving') || statusLower.includes('busy')) return 'serving-p';
        if (statusLower.includes('cleaning')) return 'cleaning-p';
        return 'available-p';
    };

    // Get waiter status text
    const getWaiterStatusText = (status, assignedCount) => {
        if (!status) return 'Available';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('serving') || statusLower.includes('busy')) return 'Serving';
        if (statusLower.includes('cleaning')) return 'Cleaning';
        if (assignedCount > 0) return `Serving (${assignedCount})`;
        return 'Available';
    };

    const handleSetWaiterFree = async (waiterId) => {
        if (!waiterId || !userId) return;
        setUpdatingWaiterStatus(waiterId);
        try {
            await fetch(`http://localhost:8000/updateWaiterStatus/${waiterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'available' }),
            });
            // Refresh waiters after status update
            const response = await fetch(`http://localhost:8000/getWaitersWithStatus/${userId}`);
            if (response.ok) {
                const data = await response.json();
                const sortedWaiters = (data.waiters || []).sort((a, b) => {
                    const getPriority = (waiter) => {
                        const status = waiter.status ? waiter.status.toLowerCase() : '';
                        const assignedCount = waiter.assigned_requests_count || 0;
                        if (!status || status.includes('available') || (assignedCount === 0 && !status.includes('serving') && !status.includes('busy'))) {
                            return 1;
                        }
                        if (status.includes('serving') || status.includes('busy') || assignedCount > 0) {
                            return 2;
                        }
                        if (status.includes('cleaning')) {
                            return 3;
                        }
                        return 4;
                    };
                    return getPriority(a) - getPriority(b);
                });
                setWaiters(sortedWaiters);
            }
        } catch (error) {
            console.error('Error setting waiter free:', error);
        } finally {
            setUpdatingWaiterStatus(null);
        }
    };

    return (
        <div className='tables-page-main-cont'>
            <div className='tables-page-main-cont-one'>
                <div className='waiter-request-header-title'>
                    <h1 className='tables-page-main-cont-one-head'>
                        Waiter Request
                        {waiterRequests.length > 0 && (
                            <span className='waiter-request-header-badge'>{waiterRequests.length}</span>
                        )}
                    </h1>
                </div>
                <button 
                    className='waiter-request-button'
                    onClick={() => {
                        // Refresh requests
                        if (userId) {
                            setRequestsLoading(true);
                            fetch(`http://localhost:8000/getPendingWaiterRequests/${userId}`)
                                .then(res => res.json())
                                .then(data => {
                                    setWaiterRequests(data.requests || []);
                                    setRequestsLoading(false);
                                })
                                .catch(err => {
                                    console.error(err);
                                    setRequestsLoading(false);
                                });
                        }
                    }}
                >
                    Refresh
                </button>
            </div>
            <div className='waiter-request-main-cont'>
                <div className='waiter-request-main-cont-one'>
                    <h1 className='waiter-request-main-cont-one-head'>Tables</h1>
                    {requestsLoading ? (
                        <div className='waiter-request-loading'>
                            <div className='waiter-request-spinner'></div>
                            <p>Loading requests...</p>
                        </div>
                    ) : (
                        <ul className='waiter-request-main-cont-one-list'>
                            {tablesData && tablesData.length > 0 
                                ? tablesData.map(each => {
                                    const areaRequests = getRequestsForArea(each.id);
                                    return (
                                        (each.tables && each.tables.length > 0) && (
                                            <li key={each.id}>
                                                <h1 className='waiter-request-main-cont-one-list-head'>{each.name}</h1>
                                                {areaRequests.length > 0 ? (
                                                    <div className='waiter-request-main-cont-one-list-requests'>
                                                        {areaRequests.map(request => (
                                                            <div key={request.id} className='waiter-request-item'>
                                                                <div className='waiter-request-item-header'>
                                                                    <FaBell className='waiter-request-bell-icon' />
                                                                    <div>
                                                                        <p className='waiter-request-table-name'>{request.table_name || 'Unknown Table'}</p>
                                                                        <p className='waiter-request-time'>
                                                                            {new Date(request.created_at).toLocaleTimeString('en-IN', { 
                                                                                hour: '2-digit', 
                                                                                minute: '2-digit' 
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {request.waiter_name && (
                                                                    <p className='waiter-request-assigned'>Assigned to: {request.waiter_name}</p>
                                                                )}
                                                                {request.status === 'assigned' && request.waiter_name && (
                                                                    <button 
                                                                        className='waiter-request-complete-btn'
                                                                        onClick={async () => {
                                                                            try {
                                                                                const response = await fetch(`http://localhost:8000/completeWaiterRequest/${request.id}`, {
                                                                                    method: 'PUT'
                                                                                });
                                                                                if (response.ok) {
                                                                                    // Refresh requests
                                                                                    const refreshResponse = await fetch(`http://localhost:8000/getPendingWaiterRequests/${userId}`);
                                                                                    if (refreshResponse.ok) {
                                                                                        const data = await refreshResponse.json();
                                                                                        setWaiterRequests(data.requests || []);
                                                                                    }
                                                                                    // Refresh waiters to update order
                                                                                    const waitersResponse = await fetch(`http://localhost:8000/getWaitersWithStatus/${userId}`);
                                                                                    if (waitersResponse.ok) {
                                                                                        const waitersData = await waitersResponse.json();
                                                                                        const sortedWaiters = (waitersData.waiters || []).sort((a, b) => {
                                                                                            const getPriority = (waiter) => {
                                                                                                const status = waiter.status ? waiter.status.toLowerCase() : '';
                                                                                                const assignedCount = waiter.assigned_requests_count || 0;
                                                                                                if (!status || status.includes('available') || (assignedCount === 0 && !status.includes('serving') && !status.includes('busy'))) {
                                                                                                    return 1;
                                                                                                }
                                                                                                if (status.includes('serving') || status.includes('busy') || assignedCount > 0) {
                                                                                                    return 2;
                                                                                                }
                                                                                                if (status.includes('cleaning')) {
                                                                                                    return 3;
                                                                                                }
                                                                                                return 4;
                                                                                            };
                                                                                            return getPriority(a) - getPriority(b);
                                                                                        });
                                                                                        setWaiters(sortedWaiters);
                                                                                    }
                                                                                }
                                                                            } catch (error) {
                                                                                console.error('Error completing request:', error);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Mark Complete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className='waiter-request-main-cont-one-list-inner-cont'>
                                                        <IoMdNotificationsOff className='waiter-request-main-cont-one-list-inner-cont-icon' />
                                                        <p>No Requests Yet!</p>
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    );
                                })
                                : <p>Loading tables...</p>
                            }
                        </ul>
                    )}
                </div>
                <div className='waiter-request-main-cont-two'>
                    <h1 className='waiter-request-main-cont-two-head'>Waiters</h1>
                    {adminCallsLoading && (
                        <p style={{ color: '#bab5b5', fontSize: '12px', margin: '4px 0 8px' }}>Checking admin calls...</p>
                    )}
                    {waitersLoading ? (
                        <div className='waiter-request-loading'>
                            <div className='waiter-request-spinner'></div>
                            <p>Loading waiters...</p>
                        </div>
                    ) : (
                        <ul className='waiter-request-main-cont-two-list'>
                            {waiters.length > 0 ? (
                                waiters.map(waiter => (
                                <li key={waiter.id}>
                                        <div className='waiter-request-main-cont-two-list-inner-cont'>
                                            <h1 className='waiter-request-main-cont-two-list-inner-cont-head'>{waiter.name}</h1>
                                            <p className={`waiter-request-main-cont-two-list-inner-cont-p ${getWaiterStatusClass(waiter.status)}`}>
                                                {getWaiterStatusText(waiter.status, waiter.assigned_requests_count)}
                                            </p>
                                        </div>
                                        {(() => {
                                            const info = getAdminCallInfoForWaiter(waiter);
                                            if (!info || !info.text) return null;
                                            const baseClass = 'waiter-admin-call-status';
                                            const statusClass =
                                                info.type === 'answered'
                                                    ? 'waiter-admin-call-status-coming'
                                                    : info.type === 'missed'
                                                    ? 'waiter-admin-call-status-busy'
                                                    : 'waiter-admin-call-status-pending';
                                            return (
                                                <p className={`${baseClass} ${statusClass}`}>
                                                    {info.text}
                                                </p>
                                            );
                                        })()}
                                        { (waiter.status || '').toLowerCase().includes('serving') || (waiter.status || '').toLowerCase().includes('busy') ? (
                                            <button
                                                type='button'
                                                className='waiter-set-free-btn'
                                                onClick={() => handleSetWaiterFree(waiter.id)}
                                                disabled={updatingWaiterStatus === waiter.id}
                                            >
                                                {updatingWaiterStatus === waiter.id ? 'Updating...' : 'Set Free'}
                                            </button>
                                        ) : null}
                                        {waiterRequests.length > 0 && (
                                            <select 
                                                className='waiter-request-assign-select'
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleAssignWaiter(e.target.value, waiter.id);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                disabled={assigningWaiter !== null}
                                            >
                                                <option value="">Assign Table</option>
                                                {waiterRequests.map(req => (
                                                    <option key={req.id} value={req.id}>
                                                        {req.table_name || 'Table'} - {new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <p style={{ color: '#bab5b5', textAlign: 'center', padding: '20px' }}>
                                        No waiters found
                                    </p>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WaiterRequest;
