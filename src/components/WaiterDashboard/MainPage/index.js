import React, { useState, useEffect, useRef } from 'react'
import complexWaiter from '../../../complexWaiter'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdTableBar } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import './index.css'
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { GiCampCookingPot } from "react-icons/gi";
import { BiSolidDish } from "react-icons/bi";
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { FaUserCircle, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ThemeToggle from '../../ThemeToggle';

const statusOne = {
  INITIAl:"INITIAL",
  PENDING:"PENDING",
  SUCCESS:"SUCCESS",
  FAILURE:"FAILURE"
}

const MainPage = () => {
  const navigate = useNavigate();
  const {waiterId, restaurantId, restaurantDetails, waiterDetails, areas, tables, areasStatus, tablesStatus, orders, ordersStatus, adminCalls, adminCallsStatus} = useContext(complexWaiter);
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewOrderPanel, setShowNewOrderPanel] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [menuItemsStatus, setMenuItemsStatus] = useState('INITIAL');
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  const statusTimeoutRef = useRef(null);
  const [hasRespondedToCurrentCall, setHasRespondedToCurrentCall] = useState(false);
  const [updatingCall, setUpdatingCall] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const [chatSending, setChatSending] = useState(false);
  const chatMessagesEndRef = useRef(null);

  console.log(orders);

  useEffect(() => {
    if(showNewOrderPanel && restaurantId) {
      fetchMenuItems();
      fetchMenuCategories();
    }
  }, [showNewOrderPanel, restaurantId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchMenuItems = async () => {
    setMenuItemsStatus('PENDING');
    try {
      const url = `https://eathubbackend-1.onrender.com/getMenuItems/${restaurantId}`;
      const response = await fetch(url);
      if(response.ok){
        const data = await response.json();
        setMenuItems(data.filter(item => item.availability === "Yes"));
        setMenuItemsStatus('SUCCESS');
      } else {
        setMenuItemsStatus('FAILURE');
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItemsStatus('FAILURE');
    }
  };

  const fetchMenuCategories = async () => {
    try {
      const url = `https://eathubbackend-1.onrender.com/restaurant_details/getMenuCategory/${restaurantId}`;
      const response = await fetch(url);
      if(response.ok){
        const data = await response.json();
        setMenuCategories(data);
      }
    } catch (error) {
      console.error("Error fetching menu categories:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileMenu(false);
  };

  const handleLogoutConfirm = () => {
    Cookies.remove('w_user');
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const onClickAddMenuItem = (item) => {
    const existingItem = orderItems.find(orderItem => orderItem.id === item.id);
    if(existingItem) {
      setOrderItems(orderItems.map(orderItem => 
        orderItem.id === item.id 
          ? {...orderItem, quantity: orderItem.quantity + 1}
          : orderItem
      ));
    } else {
      setOrderItems([...orderItems, {
        id: item.id,
        name: item.item_name,
        price: parseFloat(item.price),
        quantity: 1
      }]);
    }
  };

  const onClickRemoveMenuItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const onClickUpdateQuantity = (itemId, delta) => {
    setOrderItems(orderItems.map(item => {
      if(item.id === itemId) {
        const newQuantity = item.quantity + delta;
        return {...item, quantity: Math.max(1, newQuantity)};
      }
      return item;
    }));
  };

  const onClickSelectTable = (table) => {
    setSelectedTable(table);
    setShowTableSelect(false);
  };

  const onClickTableFromDashboard = (table) => {
    // Set the selected table
    setSelectedTable({
      id: table.id,
      name: table.name || table.table_name
    });
    // Open the create new order panel
    setShowNewOrderPanel(true);
  };

  const onClickCreateOrder = async () => {
    if(orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      const url = "https://eathubbackend-1.onrender.com/addNewOrder";
      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const orderData = {
        id: uuidv4(),
        table_id: selectedTable ? selectedTable.id : null,
        restaurant_id: restaurantId,
        items: JSON.stringify(orderItems),
        total_price: subtotal,
        status: "Pending",
        order_status: "KOT",
        table_name: selectedTable ? selectedTable.name : null,
        customer_name: null,
        waiter_id: waiterId,
        waiter_name: waiterDetails && waiterDetails.name ? waiterDetails.name : null,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(orderData)
      };

      const response = await fetch(url, options);
      if(response.ok){
        const data = await response.json();
        console.log("Order created successfully:", data);
        // Reset form
        setOrderItems([]);
        setSelectedTable(null);
        setShowNewOrderPanel(false);
        // Refresh orders
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to create order: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.menu_category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Function to determine table status
  const getTableStatus = (table) => {
    // First check if table has an active order (takes priority over reservation)
    if (orders && Array.isArray(orders) && orders.length > 0) {
      const activeOrder = orders.find(order => {
        // Check if order is for this table and is not completed/cancelled
        const isTableMatch = order.table_id === table.id || 
                           (order.table_name && order.table_name === (table.name || table.table_name));
        const isActive = order.status !== 'Completed' && 
                        order.status !== 'Cancelled' &&
                        order.order_status !== 'Served' &&
                        order.order_status !== 'Completed';
        return isTableMatch && isActive;
      });
      if (activeOrder) {
        return 'use';
      }
    }
    
    // Check if table has active reservation
    if (table.reservation_info) {
      try {
        // Handle both JSON string and object
        const reservation = typeof table.reservation_info === 'string' 
          ? JSON.parse(table.reservation_info) 
          : table.reservation_info;
        
        if (reservation && typeof reservation === 'object') {
          // Check if reservation is active (not cancelled, not completed)
          if (reservation.status && 
              reservation.status !== 'cancelled' && 
              reservation.status !== 'completed') {
            // Check if reservation date/time is in the future or current
            if (reservation.date && reservation.time) {
              const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
              const now = new Date();
              // Add 2 hours buffer for reservation time
              const reservationEnd = new Date(reservationDateTime);
              reservationEnd.setHours(reservationEnd.getHours() + 2);
              
              if (now >= reservationDateTime && now <= reservationEnd) {
                return 'reserved';
              } else if (now < reservationDateTime) {
                return 'reserved';
              }
            } else if (reservation.status === 'confirmed' || reservation.status === 'pending') {
              return 'reserved';
            }
          } else if (!reservation.status && Object.keys(reservation).length > 0) {
            // If reservation_info exists but no status, assume it's reserved
            return 'reserved';
          }
        }
      } catch (error) {
        console.error('Error parsing reservation_info:', error);
        // If reservation_info exists but can't be parsed, check if table status is reserved
        if (table.status === 'reserved') {
          return 'reserved';
        }
      }
    }
    
    // Check table status from database
    if (table.status === 'reserved') {
      return 'reserved';
    }
    if (table.status === 'use' || table.status === 'in_use') {
      return 'use';
    }
    
    // Default to available/free
    return 'free';
  };

  const latestAdminCall = adminCalls && adminCalls.length > 0 ? adminCalls[0] : null;

  // Reset response flag when a new call comes in
  useEffect(() => {
    if (latestAdminCall) {
      setHasRespondedToCurrentCall(false);
    }
  }, [latestAdminCall && latestAdminCall.id]);

  const setTemporaryWaiterStatus = async (newStatus) => {
    if (!waiterId) return;

    try {
      await fetch(`https://eathubbackend-1.onrender.com/updateWaiterStatus/${waiterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Error updating waiter status:', error);
    }

    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }

    // After 2 minutes, set back to available
    statusTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`https://eathubbackend-1.onrender.com/updateWaiterStatus/${waiterId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'available' })
        });
      } catch (error) {
        console.error('Error resetting waiter status to available:', error);
      }
    }, 2 * 60 * 1000);
  };

  const updateAdminCallStatus = async (callId, status, waiterStatusForDuration) => {
    setUpdatingCall(true);
    try {
      const res = await fetch(`https://eathubbackend-1.onrender.com/updateAdminCallStatus/${callId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        console.error('Failed to update admin call status');
      }
      // Optionally update waiter status for a short duration
      if (waiterStatusForDuration) {
        await setTemporaryWaiterStatus(waiterStatusForDuration);
      }
      // Mark this call as responded in UI and add to local history
      setHasRespondedToCurrentCall(true);
      setCallHistory(prev => [
        {
          id: callId,
          action: status === 'answered' ? 'Coming' : 'Busy',
          time: new Date().toISOString(),
          adminName: latestAdminCall && latestAdminCall.admin_name,
          restaurantName: restaurantDetails && restaurantDetails.restaurentname
        },
        ...prev
      ]);
      // no need to manually refetch, polling will refresh
    } catch (error) {
      console.error('Error updating admin call status:', error);
    } finally {
      setUpdatingCall(false);
    }
  };

  const fetchChatMessages = async (showLoader = false) => {
    if (!restaurantId) return;
    if (showLoader) {
      setChatLoading(true);
    }
    try {
      const res = await fetch(`https://eathubbackend-1.onrender.com/restaurant_messages/${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat messages (waiter):', error);
      setChatMessages([]);
    } finally {
      if (showLoader) {
        setChatLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChatMessages(true);
    const interval = setInterval(() => fetchChatMessages(false), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const scrollChatToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!chatLoading) {
      scrollChatToBottom();
    }
  }, [chatMessages, chatLoading]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || !restaurantId || !waiterId) return;
    setChatSending(true);
    try {
      const payload = {
        id: uuidv4(),
        restaurant_id: restaurantId,
        sender_id: waiterId,
        sender_role: 'waiter',
        sender_name: waiterDetails ? waiterDetails.name : 'Waiter',
        message: chatInput.trim(),
      };
      const res = await fetch('https://eathubbackend-1.onrender.com/restaurant_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setChatInput('');
        fetchChatMessages(false);
      }
    } catch (error) {
      console.error('Error sending waiter chat message:', error);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <div className='waiter-main-dashboard-initial-cont'>
        <div className='waiter-main-dashboard-header-cont'>
            <div>
                <h1 className='waiter-main-header-name'>{restaurantDetails && restaurantDetails.restaurentname}</h1>
                <button className='waiter-create-order-btn' onClick={() => setShowNewOrderPanel(true)}>Create New Order</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ThemeToggle />
                <div className='waiter-profile-container'>
                <div 
                  className='waiter-profile-icon-container'
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={() => {
                    // Delay to allow clicking on dropdown items
                    setTimeout(() => {
                      if (dropdownRef.current && !dropdownRef.current.matches(':hover')) {
                        setShowProfileMenu(false);
                      }
                    }, 200);
                  }}
                  ref={profileRef}
                >
                    <h1 className='waiter-main-header-waiter-l'>{waiterDetails && waiterDetails.name && waiterDetails.name[0]}</h1>
                    {showProfileMenu && (
                      <div 
                        className='waiter-profile-dropdown'
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}
                        ref={dropdownRef}
                      >
                        <div className='waiter-profile-dropdown-item' onClick={() => {
                          setShowProfileMenu(false);
                          // Handle profile
                        }}>
                          <FaUserCircle /> Profile
                        </div>
                        <div className='waiter-profile-dropdown-item' onClick={() => {
                          setShowProfileMenu(false);
                          // Handle help
                        }}>
                          <FaQuestionCircle /> Help
                        </div>
                        <div className='waiter-profile-dropdown-item waiter-profile-dropdown-item-logout' onClick={handleLogoutClick}>
                          <FaSignOutAlt /> Logout
                        </div>
                      </div>
                    )}
                    <h1 className='waiter-main-header-waiter-name'>{waiterDetails && waiterDetails.name}</h1>

                </div>
            </div>
            </div>
        </div>

        {latestAdminCall && !hasRespondedToCurrentCall && (
          <div className='waiter-admin-call-banner'>
            <p>
              Admin {latestAdminCall.admin_name || ''} is calling you
              {restaurantDetails && ` at ${restaurantDetails.restaurentname}`}.
            </p>
            <div className='waiter-admin-call-actions'>
              <button
                type='button'
                className='waiter-admin-call-btn coming'
                onClick={() => updateAdminCallStatus(latestAdminCall.id, 'answered', 'serving')}
                disabled={updatingCall}
              >
                Coming
              </button>
              <button
                type='button'
                className='waiter-admin-call-btn busy'
                onClick={() => updateAdminCallStatus(latestAdminCall.id, 'missed', 'busy')}
                disabled={updatingCall}
              >
                Busy
              </button>
            </div>
          </div>
        )}

        {callHistory.length > 0 && (
          <div className='waiter-admin-call-history'>
            <h3>Recent Admin Calls</h3>
            <ul>
              {callHistory.map(entry => (
                <li key={entry.id + entry.time}>
                  <span className='waiter-admin-call-history-main'>
                    {entry.adminName || 'Admin'} – {entry.action === 'Coming' ? 'You are coming' : 'You are busy'}
                  </span>
                  <span className='waiter-admin-call-history-time'>
                    {new Date(entry.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='waiter-team-chat-container'>
          <div className='waiter-team-chat-header'>
            <h2>Team Chat</h2>
            <p>Discuss important info with admin and other staff.</p>
          </div>
          <div className='waiter-team-chat-messages'>
            {chatLoading ? (
              <p className='waiter-team-chat-info'>Loading messages...</p>
            ) : chatMessages.length === 0 ? (
              <p className='waiter-team-chat-info'>No messages yet.</p>
            ) : (
              <ul>
              {(() => {
                let lastDateKey = null;
                const sortedMessages = [...chatMessages].sort((a, b) => {
                  const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return aTime - bTime; // oldest first, newest last
                });

                return sortedMessages.map((msg) => {
                  const isSelf = msg.sender_role === 'waiter' && msg.sender_id === waiterId;
                  const msgDate = msg.created_at ? new Date(msg.created_at) : null;
                  const dateKey = msgDate ? msgDate.toDateString() : null;

                  let dateLabel = null;
                  if (dateKey && dateKey !== lastDateKey) {
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    if (dateKey === today.toDateString()) {
                      dateLabel = 'Today';
                    } else if (dateKey === yesterday.toDateString()) {
                      dateLabel = 'Yesterday';
                    } else {
                      dateLabel = msgDate.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                    }

                    lastDateKey = dateKey;
                  }

                  return (
                    <React.Fragment key={msg.id}>
                      {dateLabel && (
                        <li className='waiter-team-chat-date-separator'>
                          <span>{dateLabel}</span>
                        </li>
                      )}
                      <li className={`waiter-team-chat-row ${isSelf ? 'self' : 'other'}`}>
                        <div className={`waiter-team-chat-message-main ${isSelf ? 'self' : 'other'}`}>
                          <span className='waiter-team-chat-sender'>
                            {msg.sender_name || (msg.sender_role === 'admin' ? 'Admin' : 'Waiter')}
                          </span>
                          <span className='waiter-team-chat-text'>{msg.message}</span>
                        </div>
                        <span className='waiter-team-chat-time'>
                          {msgDate &&
                            msgDate.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </span>
                      </li>
                    </React.Fragment>
                  );
                });
              })()}
              <li ref={chatMessagesEndRef} />
              </ul>
            )}
          </div>
          <div className='waiter-team-chat-input'>
            <input
              type='text'
              placeholder='Type a message to your team...'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendChat();
                }
              }}
            />
            <button
              type='button'
              onClick={handleSendChat}
              disabled={chatSending || !chatInput.trim()}
            >
              Send
            </button>
          </div>
        </div>

        <div className='waiter-main-dash-main-cont'>
          <div className='waiter-main-dashboard-orders-cont'>
            <h1 className='waiter-main-dashboard-orders-head'>Orders</h1>
            {orders && Array.isArray(orders) && orders.length > 0 ? (
              <>
                <p className='waiter-orders-message'>You have {orders.length} active order{orders.length > 1 ? 's' : ''}</p>
                <ul className='waiter-main-dashboard-orders-list'>
                {orders.map(each => {
                  return(
                    <li key={each.id || each.order_number}>
                      <div className='waiter-main-dashboard-orders-list-item-cont-one'>
                        <h1 className='waiter-main-dashboard-orders-list-item-cont-one-head'>#{each.order_number}</h1>
                        <h1 className={`waiter-list-item-cont-one-table-name ${each.table_name === null && "d-none"}`}>{each.table_name}</h1>
                        {/* <h1>Table No: {each.table_name}</h1> */}
                        <h1>Customer Name: {each.customer_name}</h1>
                        <h1 className={`waiter-main-dashboard-orders-list-item-cont-one-status ${each.order_status === "KOT" && "waiter-main-dashboard-orders-list-item-cont-one-status-kot"}`}>{each.order_status}</h1>
                        <h1>Order Time: {each.created_at}</h1>
                        <h1>Order Total: {each.total_price}</h1>
                        <h1>Order Items: {each.items.length}</h1>
                        <ul className='waiter-main-dashboard-orders-list-item-cont-one-items-list'>
                          {each.items.map((item, index) => {
                            return(
                              <li key={index}>
                                <h1>{item.name} x {item.quantity}</h1>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div className='waiter-main-dashboard-orders-list-item-cont-two'>
                        <h1><MdOutlineConfirmationNumber /> Order Received</h1>
                        <h1><FaCircleCheck /> Order Confirmed</h1>
                        <h1><GiCampCookingPot /> Order Preparing</h1>
                        <h1><BiSolidDish /> Order Served</h1>
                        <button>Move One </button>
                      </div>
                    </li>
                  )
                })}
                </ul>
              </>
            ) : (
              <div className='waiter-no-orders-message'>
                <p>No orders available</p>
              </div>
            )}

          </div>
          <div className='available-tables-cont'>
            <h1 className='avaiable-tables-text'>Available Tables</h1>
            <div className='avaiable-tables-color-conts'>
              <h1>Available</h1>
              <h1>Reserved</h1>
              <h1>In use</h1>
            </div>
            <ul className='area-cont-list'>
              {tablesStatus === statusOne.PENDING || areasStatus === statusOne.PENDING ? (
                <li className='waiter-tables-loading-item'>
                  <div className='waiter-spinner-small'></div>
                  <p className='waiter-loading-message'>Loading tables...</p>
                </li>
              ) : areasStatus === statusOne.SUCCESS && tablesStatus === statusOne.SUCCESS ? (
                <>
                  {(Array.isArray(areas) ? areas : []).length > 0 ? (
                    (Array.isArray(areas) ? areas : []).map(area => {
                      const areaTables = (Array.isArray(tables) ? tables : []).length > 0 
                        ? (Array.isArray(tables) ? tables : []).filter(table => {
                            const tableAreaId = table.area_id || table.areaId;
                            const areaId = area.id || area.area_id;
                            return tableAreaId == areaId || tableAreaId === areaId;
                          })
                        : [];
                      
                      if(areaTables.length === 0){
                        return null;
                      }
                      
                      return(
                        <li key={area.id || area.area_id}>
                          <h1 className='area-name'>{area.area_name || area.name}</h1>
                          <ul className='area-tables-cont'>
                            {areaTables.map(table => {
                              const tableStatus = getTableStatus(table);
                              const statusClass = 
                                tableStatus === "free" ? "available-table-one" :
                                tableStatus === "use" ? "in-use-table-one" :
                                tableStatus === "reserved" ? "reserved-table-one" : "available-table-one";
                              
                            return(
                              <li 
                                key={table.id}
                                className={statusClass}
                                title={`Table: ${table.name || table.table_name} - ${tableStatus === "free" ? "Available" : tableStatus === "use" ? "In Use" : "Reserved"}`}
                                onClick={() => onClickTableFromDashboard(table)}
                              >
                                <MdTableBar />
                                <h1 className='table-name-display'>{table.name || table.table_name}</h1>
                              </li>
                            )
                            })}
                          </ul>
                        </li>
                      )
                    })
                  ) : (
                    <li>
                      <p className='waiter-no-tables-message'>No areas available</p>
                    </li>
                  )}
                  {(Array.isArray(areas) ? areas : []).length > 0 && (Array.isArray(tables) ? tables : []).length === 0 && (
                    <li>
                      <p className='waiter-no-tables-message'>No tables available</p>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <p className='waiter-no-tables-message'>Failed to load tables</p>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* New Order Side Panel */}
        {showNewOrderPanel && (
          <>
            <div className='waiter-new-order-panel-overlay' onClick={() => setShowNewOrderPanel(false)}></div>
            <div className='waiter-new-order-panel'>
            <div className='waiter-new-order-panel-header'>
              <h2>Create New Order</h2>
              <button className='waiter-close-panel-btn' onClick={() => setShowNewOrderPanel(false)}>
                <IoMdClose />
              </button>
            </div>
            
            <div className='waiter-new-order-panel-content'>
              {/* Table Selection */}
              <div className='waiter-order-table-selection'>
                <button 
                  className='waiter-select-table-btn'
                  onClick={() => setShowTableSelect(!showTableSelect)}
                >
                  {selectedTable ? selectedTable.name : 'Select Table'}
                </button>
                {showTableSelect && (
                  <div className='waiter-table-select-dropdown'>
                    <div className='waiter-table-select-item' onClick={() => { setSelectedTable(null); setShowTableSelect(false); }}>
                      No Table
                    </div>
                    {tables && Array.isArray(tables) && tables.length > 0 && tables.map(table => (
                      <div 
                        key={table.id} 
                        className='waiter-table-select-item'
                        onClick={() => onClickSelectTable({
                          id: table.id,
                          name: table.name
                        })}
                      >
                        {table.name || table.table_name || `Table ${table.id}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className='waiter-order-menu-section'>
                <div className='waiter-order-search-cont'>
                  <input 
                    type="text" 
                    placeholder="Search menu items..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='waiter-order-search-input'
                  />
                </div>
                
                <div className='waiter-order-categories'>
                  <button 
                    className={selectedCategory === 'all' ? 'waiter-category-btn active' : 'waiter-category-btn'}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </button>
                  {menuCategories.map(category => (
                    <button 
                      key={category.id}
                      className={selectedCategory === category.id ? 'waiter-category-btn active' : 'waiter-category-btn'}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.menu_category_name}
                    </button>
                  ))}
                </div>

                <div className='waiter-order-menu-items'>
                  {menuItemsStatus === statusOne.PENDING ? (
                    <div className='waiter-menu-loading-container'>
                      <div className='waiter-spinner'></div>
                    </div>
                  ) : menuItemsStatus === statusOne.SUCCESS ? (
                    filteredMenuItems.length > 0 ? (
                      filteredMenuItems.map(item => (
                        <div key={item.id} className='waiter-order-menu-item' onClick={() => onClickAddMenuItem(item)}>
                          <img 
                            src={item.image_url || require('../../../images/hot-food.png')} 
                            alt={item.item_name}
                            className='waiter-order-item-image'
                            onError={(e) => {
                              if (e.target.src !== require('../../../images/hot-food.png')) {
                                e.target.src = require('../../../images/hot-food.png');
                              }
                            }}
                          />
                          <div className='waiter-order-item-details'>
                            <h3>{item.item_name}</h3>
                            <p>₹{item.price}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='waiter-no-items-text'>No menu items available</p>
                    )
                  ) : (
                    <p className='waiter-no-items-text'>Failed to load menu items</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className='waiter-order-items-section'>
                <h3>Order Items</h3>
                {orderItems.length === 0 ? (
                  <p className='waiter-no-items-text'>No items added yet</p>
                ) : (
                  <div className='waiter-order-items-list'>
                    {orderItems.map(item => (
                      <div key={item.id} className='waiter-order-item-row'>
                        <div className='waiter-order-item-info'>
                          <span>{item.name}</span>
                          <span>₹{item.price} x {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className='waiter-order-item-controls'>
                          <button onClick={() => onClickUpdateQuantity(item.id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => onClickUpdateQuantity(item.id, 1)}>+</button>
                          <button onClick={() => onClickRemoveMenuItem(item.id)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {orderItems.length > 0 && (
                  <div className='waiter-order-total'>
                    <h3>Total: ₹{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</h3>
                    <button className='waiter-create-order-submit-btn' onClick={onClickCreateOrder}>
                      Create Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className='waiter-logout-modal-overlay' onClick={handleLogoutCancel}>
            <div className='waiter-logout-modal' onClick={(e) => e.stopPropagation()}>
              <h2 className='waiter-logout-modal-title'>Confirm Logout</h2>
              <p className='waiter-logout-modal-message'>Are you sure you want to logout?</p>
              <div className='waiter-logout-modal-buttons'>
                <button 
                  type='button' 
                  className='waiter-logout-modal-btn waiter-logout-modal-btn-cancel'
                  onClick={handleLogoutCancel}
                >
                  Cancel
                </button>
                <button 
                  type='button' 
                  className='waiter-logout-modal-btn waiter-logout-modal-btn-confirm'
                  onClick={handleLogoutConfirm}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}

export default MainPage
