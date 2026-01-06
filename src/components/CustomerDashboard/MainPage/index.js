import React from 'react'

import { useState, useEffect, useContext } from 'react';
import './index.css'

import { useNavigate } from 'react-router-dom';

import { FaBell } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import HeaderMini from '../HeaderMini';

import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import Footer from "../Footer"

import ComplexCustomer from '../../../complexOneForCustomer';
import MenuItemsContainer from '../MenuItemsContainer';
import { getCustomerOrderIds, cleanupExpiredOrders } from '../../../utils/customerOrdersStorage';

const MainPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const {menuItems,tableNameStatus, menuCategoris, tableName, restaurantId, tableId, cartItems, setCurrentSection, orderId, updateOrderId} = useContext(ComplexCustomer)

  // console.log(params)

  const [categorySelector, setCategorySelector] = useState("Show all")
  const [filteredMenuItems, setFilteredMenuItems] = useState([])

  const [searchInput, setSearchInput] = useState("")
  const [callWaiter, setCallWaiter] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [previousOrderStatus, setPreviousOrderStatus] = useState(null)
  const [activeOrders, setActiveOrders] = useState([])

  const [showAllOrders, setShowAllOrders] = useState(false)

  // Cleanup expired orders on component mount
  useEffect(() => {
    cleanupExpiredOrders();
  }, []);

  useEffect(() => {
    if(menuItems.length > 0){
      const filteredOne = menuItems.filter(each => {
        const searchedOne = each.item_name.toLowerCase().includes(searchInput.toLocaleLowerCase());
        if(categorySelector != "Show all"){
          const selectedCatgory = each.category_name === categorySelector;
          return searchedOne && selectedCatgory;
        }
        return searchedOne;
      })
      setFilteredMenuItems(filteredOne);
      // console.log("cat", categorySelector);
    }
  }, [menuItems, searchInput, categorySelector])

  // Show cart popup when items are added
  useEffect(() => {
    if(cartItems.length > 0) {
      setShowCartPopup(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowCartPopup(false)
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setShowCartPopup(false)
    }
  }, [cartItems.length])

  // Fetch order status - polls every 10 seconds and only updates if status changes
  useEffect(() => {
    if (!tableId) {
      setOrderStatus(null);
      return;
    }

    const fetchOrderStatus = async () => {
      setOrderLoading(true);
      try {
        // Get customer's order IDs from localStorage
        const customerOrderIds = getCustomerOrderIds();
        
        if (customerOrderIds.length === 0) {
          setOrderStatus(null);
          setActiveOrders([]);
          setOrderLoading(false);
          return;
        }

        // Fetch orders for this table
        const response = await fetch(`http://localhost:8000/getOrdersByTable/${tableId}`);
        if (response.ok) {
          const data = await response.json();
          // Get all active orders for this table
          if (data.orders && data.orders.length > 0) {
            // Filter to only show customer's own orders
            const customerOrders = data.orders.filter(order => 
              customerOrderIds.includes(order.id)
            );
            
            // Sort by created_at descending to get latest first
            const sortedOrders = customerOrders.sort((a, b) => 
              new Date(b.created_at) - new Date(a.created_at)
            );
            
            // Filter active orders (not completed/served)
            const active = sortedOrders.filter(order => {
              const status = order.order_status || order.status;
              return status && status !== 'Served' && status !== 'Completed' && status !== 'Delivered';
            });

            // Update active orders list
            setActiveOrders(active);
            
            // Set the latest order for backward compatibility
            if (active.length > 0) {
              const latestOrder = active[0];
              const currentStatus = latestOrder.order_status || latestOrder.status;
              
              if (!orderStatus || orderStatus.id !== latestOrder.id) {
                // New order or different order
                setOrderStatus(latestOrder);
                setPreviousOrderStatus(currentStatus);
              } else if (previousOrderStatus !== currentStatus) {
                // Status changed - update
                setOrderStatus(latestOrder);
                setPreviousOrderStatus(currentStatus);
              }
            } else {
              setOrderStatus(null);
              setPreviousOrderStatus(null);
            }
          } else {
            setOrderStatus(null);
            setPreviousOrderStatus(null);
            setActiveOrders([]);
          }
        } else {
          setOrderStatus(null);
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
        setOrderStatus(null);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderStatus();
    // Poll every 10 seconds for order status updates
    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId])

  const handleCallWaiter = async () => {
    if (!restaurantId || !tableId) {
      alert('Restaurant or table information is missing. Please refresh the page.')
      return
    }

    setRequestLoading(true)
    try {
      const requestId = uuidv4()
      const requestData = {
        id: requestId,
        restaurant_id: restaurantId,
        table_id: tableId,
        table_name: tableName || 'Unknown',
        request_type: 'general',
        notes: 'Customer requested waiter assistance'
      }

      const response = await fetch('http://localhost:8000/createWaiterRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const responseData = await response.json()
        if (responseData.waiter_name) {
          setRequestSuccess(true)
          // Show notification that waiter is coming
          setTimeout(() => {
            setCallWaiter(false)
            setRequestSuccess(false)
            // Show persistent notification
            alert(`Waiter ${responseData.waiter_name} is coming to your table. Please wait.`)
          }, 2000)
        } else {
          setRequestSuccess(true)
          setTimeout(() => {
            setCallWaiter(false)
            setRequestSuccess(false)
            alert('Request sent. No available waiters at the moment. Please wait.')
          }, 2000)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to call waiter. Please try again.')
      }
    } catch (error) {
      console.error('Error calling waiter:', error)
      alert('Failed to call waiter. Please try again.')
    } finally {
      setRequestLoading(false)
    }
  }

  
  const callWaiterPopup = () => {
    return(
      <div className='call-waiter-popup-main-cont'>
        <div className='call-waiter-popup-inner-cont'>
          {requestSuccess ? (
            <>
              <p style={{ color: '#4CAF50', fontSize: '20px', fontWeight: 'bold' }}>✓ Request Sent!</p>
              <p>Waiter will be notified shortly.</p>
            </>
          ) : (
            <>
              <p>Do you want to call the waiter?</p>
              <h1>Table Name: <span>{tableName}</span></h1>
              <div className='call-waiter-popup-buttons-cont'>
                <button 
                  className='yes-button' 
                  onClick={handleCallWaiter}
                  disabled={requestLoading}
                >
                  {requestLoading ? 'Sending...' : 'Yes'}
                </button>
                <button 
                  onClick={() => setCallWaiter(false)} 
                  className='no-button'
                  disabled={requestLoading}
                >
                  No
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }




  return (
      <div className='customer-main-dashboard'>
        <HeaderMini />
        {tableName === "" && tableNameStatus === "SUCCESS" ? <div className='no-table-name'><p>Table Not Found Ask Waiter To Come.</p>
        <button className='call-waiter-button-customer'>Call Waiter</button></div> : 
        <>
        <div className='customer-main-search-engine'>
          <input type='search' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder='Search Food Item' />
          <select>
            <option>
              Sort By --
            </option>
          </select>
        </div>
        <div className='customer-main-cat-cont'>
          <ul>
            <li id="" className={`${categorySelector === "Show all" && "sp-one-active"}`} onClick={() => setCategorySelector("Show all")}>Show all</li>
            {menuCategoris.length >0 && 
              menuCategoris.map(each => <li id={each.menu_category_name} className={`${categorySelector === each.menu_category_name && "sp-one-active"}`} onClick={() => setCategorySelector(each.menu_category_name)}>{each.menu_category_name}</li>)
            }
          </ul>
        </div>
        <div className='customer-main-action-buttons'>
          <button onClick={() => setCallWaiter(true)} className='call-waiter-button-customer'><FaBell /> Call Waiter</button>
          <select className='item-type-select'>
            <option>All --</option>
            <option>Veg</option>
            <option>Non - Veg</option>
          </select>
        </div>
        {callWaiter && callWaiterPopup()}
        <MenuItemsContainer filteredMenuItems={filteredMenuItems}  />
        
        {/* Cart Popup */}
        {showCartPopup && cartItems.length > 0 && (
          <div className='cart-popup-bottom' onClick={() => {
            navigate(`/customerDashboard/${tableId}/${restaurantId}/cart`)
            setCurrentSection("Cart")
            setShowCartPopup(false)
          }}>
            <div className='cart-popup-content'>
              <div className='cart-popup-info'>
                <p className='cart-popup-items-count'>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart</p>
                <p className='cart-popup-total'>₹{cartItems.reduce((sum, item) => sum + item.cart_item_price * item.quantity, 0)}</p>
              </div>
              <button className='cart-popup-button'>Place Order</button>
            </div>
          </div>
        )}

        {/* Active Orders Container - Shows all active orders */}
        {activeOrders.length > 0 && !showCartPopup && (
          <div className='active-orders-bottom-container'>
            {activeOrders.length === 1 ? (
              // Single order - show full details
              <div className='order-status-bottom-container' onClick={() => {
                updateOrderId(activeOrders[0].id);
                localStorage.setItem("orderId", activeOrders[0].id);
                navigate(`/customerDashboard/${tableId}/${restaurantId}/orderDetails`)
                setCurrentSection("OrderDetails")
              }}>
                <div className='order-status-bottom-content'>
                  <div className='order-status-bottom-info'>
                    <p className='order-status-bottom-title'>Order #{activeOrders[0].order_number || 'Active'}</p>
                    <p className='order-status-bottom-status'>{activeOrders[0].order_status || activeOrders[0].status || 'In Progress'}</p>
                  </div>
                  <button className='order-status-bottom-button'>Go to Order</button>
                </div>
              </div>
            ) : (
              // Multiple orders - show scrollable list
              <div className='multiple-orders-container'>
                <div className='multiple-orders-header'>
                  <p className='multiple-orders-title'>{activeOrders.length} Active Orders</p>
                  <button type='button' onClick={() => setShowAllOrders(!showAllOrders)}> {showAllOrders ? "Hide" : "Show"} all {showAllOrders ? <FaChevronDown/> : <FaChevronUp/>} </button>
                </div>
                {showAllOrders && <div className='multiple-orders-list'>
                  {activeOrders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className='order-status-item-container'
                      onClick={() => {
                        updateOrderId(order.id);
                        localStorage.setItem("orderId", order.id);
                        navigate(`/customerDashboard/${tableId}/${restaurantId}/orderDetails`)
                        setCurrentSection("OrderDetails")
                      }}
                    >
                      <div className='order-status-item-content'>
                        <div className='order-status-item-info'>
                          <p className='order-status-item-title'>Order #{order.order_number || index + 1}</p>
                          <p className='order-status-item-status'>{order.order_status || order.status || 'In Progress'}</p>
                        </div>
                        <button className='order-status-item-button'>View</button>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}
          </div>
        )}
       
      </>
      }
      </div>

        
  )
}

export default MainPage
