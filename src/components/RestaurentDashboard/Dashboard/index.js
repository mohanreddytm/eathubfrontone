import React from 'react'
import { useState, useEffect, useContext } from 'react'

// import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';


import { FaCaretDown, FaAngleDown,FaRegBell, FaAngleDoubleUp, FaThumbsUp, FaThumbsDown  } from "react-icons/fa";

import { MdBlock, MdFrontHand } from "react-icons/md";

import { TfiLineDashed } from "react-icons/tfi";
import { BsQrCodeScan } from "react-icons/bs";

import serving from '../../../images/hot-food.png'
import { SiCcleaner } from "react-icons/si";

import error from '../../../images/error.jpg'

import './index.css'

import { useNavigate } from 'react-router-dom'

import { FaArrowUpLong, FaCircleCheck } from "react-icons/fa6";
import { GiCash } from "react-icons/gi";

import { CiCircleAlert } from "react-icons/ci";

import AllInOne from '../../../complexOne';




const Dashboard = () => {

    const navigate = useNavigate();
    const { orders, ordersStatus, userId, staffData, updateClickedOrder, updateCurrentMenu } = useContext(AllInOne);
    const [payments, setPayments] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [stats, setStats] = useState({
        todayOrders: 0,
        currentOrders: 0,
        todayEarnings: 0,
        yesterdayEarnings: 0,
        avgDailyEarnings: 0,
        topSellingDish: '',
        yesterdayTopDish: '',
        paymentMethods: { UPI: 0, Cash: 0 },
        availableWaiters: [],
        activeOrders: []
    });

  
    const getTime = () => {
      const newDate = new Date();
      const date = newDate.getDate();
      const day = newDate.getDay();
      const hours = newDate.getHours();
      let dayText = "";
      switch (day){
        case 0:
          dayText = "Sunday";
          break;
        case 1:
          dayText = "Monday";
          break;
        case 2:
          dayText = "Tuesday";
          break;
          
        case 3:
          dayText = "Wednesday";
          break;
        case 4:
          dayText = "Thursday";
          break;
        case 5:
          dayText = "Friday";
          break;
        case 6:
          dayText = "Saturday";
          break;
        default:
      }
      let MonthText = "";
      const Month = newDate.getMonth();
      switch (Month){
        case 0:
          MonthText = "January";
          break;
        case 1:
          MonthText = "February";
          break;
        case 2:
          MonthText = "March";
          break;
        case 3:
          MonthText = "April";
          break;
        case 4:
          MonthText = "May";
          break;
        case 5:
          MonthText = "June";
          break;
        case 6:
          MonthText = "July";
          break;
        case 7:
          MonthText = "August";
          break;
        case 8:
          MonthText = "September";
          break;
        case 9:
          MonthText = "October";
          break;
        case 10:
          MonthText = "November";
          break;
        case 11:
          MonthText = "December";
          break;
        default:
          MonthText = "January";
        }
      const minutes = newDate.getMinutes();
      const ampm = newDate.getHours() >= 12 ? "PM" : "AM";
      const hours12 = newDate.getHours() % 12 || 12;
      return `${dayText}, ${date} ${MonthText}, ${hours12}:${minutes} ${ampm}`;
    }

    // Fetch payments
    useEffect(() => {
        const fetchPayments = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:8000/getPayments/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPayments(data.payments || []);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            }
        };
        fetchPayments();
        const interval = setInterval(fetchPayments, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    // Fetch pending payments
    useEffect(() => {
        const fetchPendingPayments = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:8000/getPendingPayments/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    const pending = data.payments || [];
                    setPendingPayments(pending);
                    
                    // Show modal if there are pending payments and no modal is currently shown
                    if (pending.length > 0 && !showPaymentModal) {
                        setSelectedPayment(pending[0]);
                        setShowPaymentModal(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching pending payments:', error);
            }
        };
        fetchPendingPayments();
        const interval = setInterval(fetchPendingPayments, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [userId, showPaymentModal]);

    // Calculate statistics
    useEffect(() => {
        if (ordersStatus !== "SUCCESS" || !orders) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        // Today's orders
        const todayOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= today && orderDate <= endOfToday;
        });

        // Current active orders (not completed/served)
        const currentOrders = orders.filter(order => {
            const status = order.order_status || order.status;
            return status && status !== 'Served' && status !== 'Completed' && status !== 'Delivered' && status !== 'Paid';
        });

        // Yesterday's orders
        const yesterdayOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= yesterday && orderDate <= endOfYesterday;
        });

        // Today's earnings from payments
        const todayPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.created_at);
            return paymentDate >= today && paymentDate <= endOfToday && payment.payment_status === 'Paid';
        });
        const todayEarnings = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        // Yesterday's earnings
        const yesterdayPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.created_at);
            return paymentDate >= yesterday && paymentDate <= endOfYesterday && payment.payment_status === 'Paid';
        });
        const yesterdayEarnings = yesterdayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        // Calculate percentage change
        const earningsChange = yesterdayEarnings > 0 
            ? ((todayEarnings - yesterdayEarnings) / yesterdayEarnings * 100).toFixed(0)
            : todayEarnings > 0 ? 100 : 0;

        // Average daily earnings (this month)
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.created_at);
            return paymentDate >= thisMonthStart && payment.payment_status === 'Paid';
        });
        const thisMonthEarnings = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const daysInMonth = today.getDate();
        const avgDailyEarnings = daysInMonth > 0 ? Math.round(thisMonthEarnings / daysInMonth) : 0;

        // Top selling dish (from today's orders)
        const dishCounts = {};
        todayOrders.forEach(order => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const dishName = item.item_name || item.name;
                    if (dishName) {
                        dishCounts[dishName] = (dishCounts[dishName] || 0) + (item.quantity || 1);
                    }
                });
            }
        });
        const topSellingDish = Object.keys(dishCounts).length > 0
            ? Object.keys(dishCounts).reduce((a, b) => dishCounts[a] > dishCounts[b] ? a : b)
            : 'N/A';

        // Yesterday's top dish
        const yesterdayDishCounts = {};
        yesterdayOrders.forEach(order => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const dishName = item.item_name || item.name;
                    if (dishName) {
                        yesterdayDishCounts[dishName] = (yesterdayDishCounts[dishName] || 0) + (item.quantity || 1);
                    }
                });
            }
        });
        const yesterdayTopDish = Object.keys(yesterdayDishCounts).length > 0
            ? Object.keys(yesterdayDishCounts).reduce((a, b) => yesterdayDishCounts[a] > yesterdayDishCounts[b] ? a : b)
            : 'N/A';

        // Payment methods breakdown
        const paymentMethods = { UPI: 0, Cash: 0, Card: 0 };
        todayPayments.forEach(payment => {
            const method = payment.payment_method || 'Cash';
            if (method === 'UPI' || method === 'UPI Payment') {
                paymentMethods.UPI += parseFloat(payment.amount || 0);
            } else if (method === 'Cash') {
                paymentMethods.Cash += parseFloat(payment.amount || 0);
            } else if (method === 'Card') {
                paymentMethods.Card += parseFloat(payment.amount || 0);
            }
        });

        // Available waiters
        const waiters = staffData.filter(staff => 
            staff.role && staff.role.toLowerCase().includes('waiter')
        );
        const availableWaiters = waiters.map(waiter => {
            // Find orders assigned to this waiter
            const waiterOrders = currentOrders.filter(order => 
                order.waiter_id === waiter.id || order.waiter_name === waiter.name
            );
            return {
                ...waiter,
                status: waiterOrders.length > 0 ? 'Serving' : (waiter.status || 'Available'),
                table: waiterOrders.length > 0 ? waiterOrders[0].table_name : null
            };
        });

        // Active orders for right side
        const activeOrdersList = currentOrders.slice(0, 5).map(order => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const itemCount = Array.isArray(items) ? items.length : 0;
            return {
                ...order,
                itemCount
            };
        });

        // Orders change percentage
        const ordersChange = yesterdayOrders.length > 0
            ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(0)
            : todayOrders.length > 0 ? 100 : 0;

        setStats({
            todayOrders: todayOrders.length,
            currentOrders: currentOrders.length,
            todayEarnings: Math.round(todayEarnings),
            yesterdayEarnings: Math.round(yesterdayEarnings),
            earningsChange: parseFloat(earningsChange),
            ordersChange: parseFloat(ordersChange),
            avgDailyEarnings: avgDailyEarnings,
            topSellingDish,
            yesterdayTopDish,
            paymentMethods,
            availableWaiters,
            activeOrders: activeOrdersList
        });
    }, [orders, ordersStatus, payments, staffData]);

    const generateData = () => {
        const data = [];
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);
        
        const today = new Date();
        const daysInMonth = today.getDate();
        
        for (let i = 1; i <= Math.min(daysInMonth, 30); i++) {
            const dayDate = new Date(thisMonthStart);
            dayDate.setDate(i);
            const dayEnd = new Date(dayDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            const dayPayments = payments.filter(payment => {
                const paymentDate = new Date(payment.created_at);
                return paymentDate >= dayDate && paymentDate <= dayEnd && payment.payment_status === 'Paid';
            });
            
            const dayEarnings = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            
            data.push({
                day: `Day ${i}`,
                amount: Math.round(dayEarnings)
            });
        }
        return data;
    };

    const data = generateData();

    const handleOrderClick = (order) => {
        updateClickedOrder(order);
        updateCurrentMenu(6); // Navigate to order details
    };

    const handlePaymentConfirmation = async (paymentId, status) => {
        if (!paymentId || !status) return;
        
        setProcessingPayment(true);
        try {
            const response = await fetch(`http://localhost:8000/updatePaymentStatus/${paymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_status: status })
            });

            if (response.ok) {
                // Remove this payment from pending list
                setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
                
                // If there are more pending payments, show the next one
                const remainingPending = pendingPayments.filter(p => p.id !== paymentId);
                if (remainingPending.length > 0) {
                    setSelectedPayment(remainingPending[0]);
                } else {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                }
                
                // Refresh payments
                const refreshResponse = await fetch(`http://localhost:8000/getPayments/${userId}`);
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    setPayments(refreshData.payments || []);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to confirm payment. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
        setSelectedPayment(null);
    };

    const paymentConfirmationModal = () => {
        if (!showPaymentModal || !selectedPayment) return null;

        return (
            <div className='payment-confirmation-modal-overlay'>
                <div className='payment-confirmation-modal'>
                    <div className='payment-confirmation-modal-header'>
                        <h2>Payment Confirmation Required</h2>
                        <button className='payment-confirmation-modal-close' onClick={handleCloseModal}>×</button>
                    </div>
                    <div className='payment-confirmation-modal-body'>
                        <div className='payment-confirmation-info'>
                            <p><strong>Order Number:</strong> #{selectedPayment.order_number || 'N/A'}</p>
                            <p><strong>Table:</strong> {selectedPayment.table_name || 'N/A'}</p>
                            <p><strong>Amount:</strong> ₹{parseFloat(selectedPayment.amount || 0).toFixed(2)}</p>
                            <p><strong>UPI ID:</strong> {selectedPayment.upi_id || 'N/A'}</p>
                            <p><strong>Payment Method:</strong> {selectedPayment.payment_method || 'Online'}</p>
                            <p><strong>Transaction ID:</strong> {selectedPayment.transaction_id || 'N/A'}</p>
                            <p className='payment-confirmation-message'>
                                Customer has confirmed payment. Please verify the payment in your UPI app and confirm.
                            </p>
                        </div>
                        <div className='payment-confirmation-buttons'>
                            <button 
                                className='payment-confirmation-success-btn'
                                onClick={() => handlePaymentConfirmation(selectedPayment.id, 'SUCCESS')}
                                disabled={processingPayment}
                            >
                                <FaCircleCheck /> Confirm Payment Success
                            </button>
                            <button 
                                className='payment-confirmation-failed-btn'
                                onClick={() => handlePaymentConfirmation(selectedPayment.id, 'FAILED')}
                                disabled={processingPayment}
                            >
                                <CiCircleAlert /> Mark as Failed
                            </button>
                        </div>
                        {processingPayment && (
                            <p className='payment-confirmation-processing'>Processing...</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };
  
    return(

          <div className='dash-main-m'>
            {paymentConfirmationModal()}
            <div className='dash-main-dashboard-cont'>
              <div>
                <h1 className='dash-dash-head'>DashBoard</h1>
                <p className='dash-dash-time'>{getTime()}</p>
              </div>
              <ul className='dash-dash-waiter-container'>
                <li>
                  <h1>Waiter Requests</h1>
                  <h1>{stats.availableWaiters.filter(w => w.status === 'Available').length}</h1>
                </li>
                <li>
                  <h1>Current Orders</h1>
                  <h1>{stats.currentOrders}</h1>
                </li>
              </ul>

            </div>
            <div className='dash-middle-m-cont'>
                <div className='dash-middle-m-left-cont'>
                  <h1 className='dash-middle-m-left-main-head'>Statistics</h1>
                  <div className='dash-stats-cont'>
                    <div className='dash-stats-parts dash-stats-parts-one'>

                      <div className='dash-stats-parts-heads-cont'>
                        <h1 className='dash-stats-parts-heads dash-stats-parts-head-orders' >Today's Orders</h1>
                      </div>

                      <p className='dash-stats-parts-count'>{stats.todayOrders}</p>
                      <div className='dash-stats-parts-inner-cont'>
                          <p className='dash-stats-parts-percent'><FaArrowUpLong /> {stats.ordersChange}%</p>
                          <p className='dash-stats-parts-p'>Since Yesterday</p>
                      </div>
                      <button type='button' className='dash-stats-parts-button'>Current <p>{stats.currentOrders}</p></button>
                    </div>
                    <div className='dash-stats-parts dash-stats-parts-two'>

                      <div className='dash-stats-parts-heads-cont dash-stats-parts-head-earnings'>
                        <h1 className='dash-stats-parts-heads dash-stats-parts-head-earnings'>Today's Earnings</h1>
                      </div>
                      <p className='dash-stats-parts-count'>₹ {stats.todayEarnings.toLocaleString()}</p>
                      <div className='dash-stats-parts-inner-cont'>
                          <p className='dash-stats-parts-percent'><FaArrowUpLong /> {stats.earningsChange}%</p>
                          <p className='dash-stats-parts-p'>Since Yesterday</p>
                      </div>
                    </div>
                    <div className='dash-stats-parts dash-stats-parts-three'>

                      <div className='dash-stats-parts-heads-cont dash-stats-parts-head-avg'>
                        <h1 className='dash-stats-parts-heads dash-stats-parts-head-avg'>Average Daily Earnings</h1>
                      </div>
                      <p className='dash-stats-parts-count'>₹ {stats.avgDailyEarnings.toLocaleString()}</p>
                      <div className='dash-stats-parts-inner-cont'>
                          <p className='dash-stats-parts-percent'><FaArrowUpLong /> {stats.avgDailyEarnings > 0 ? 100 : 0}%</p>
                          <p className='dash-stats-parts-p'>This Month - {getTime().split(',')[1].trim().split(' ')[1]}</p>
                      </div>
                    </div>
                    <div className='dash-stats-parts dash-stats-parts-four'>

                      <div className='dash-stats-parts-heads-cont dash-stats-parts-head-selling'>
                        <h1 className='dash-stats-parts-heads dash-stats-parts-head-selling'>#1 Selling Dish</h1>
                      </div>

                      <p className='dash-stats-parts-count on-sp-count'>{stats.topSellingDish}</p>
                      <div className='dash-stats-parts-inner-cont'>
                          <p className='dash-stats-parts-selling-ye'>{stats.yesterdayTopDish}</p>
                          <p className='dash-stats-parts-p'>- Yesterday</p>
                      </div>
                    </div>
                  </div>
                  <div className='dash-payment-cont'>
                    <h1 className='dash-payment-one'>Payment Method</h1>
                    <div className='dash-payment-inner-cont'>
                      <BsQrCodeScan className='dash-payment-inner-logo' />
                      <h1 className='dash-payment-inner-text'>UPI</h1>
                      <input className='dash-payment-inner-input' type="range" min="0" max={stats.todayEarnings || 1} value={stats.paymentMethods.UPI} readOnly />
                      <p className='dash-payment-inner-price'>₹{Math.round(stats.paymentMethods.UPI).toLocaleString()}</p>
                    </div>
                    <hr className='dash-payment-line' />
                    <div className='dash-payment-inner-cont'>
                      <GiCash className='dash-payment-inner-logo' />
                      <h1 className='dash-payment-inner-text'>Cash</h1>
                      <input className='dash-payment-inner-input' type="range" min="0" max={stats.todayEarnings || 1} value={stats.paymentMethods.Cash} readOnly />

                      <p className='dash-payment-inner-price'>₹{Math.round(stats.paymentMethods.Cash).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="dash-stats-conts">
                    <h2 className="dash-payment-one">Restaurant Earnings (Day 1 to 300)</h2>
                    <ResponsiveContainer width="100%" height="75%">
                      <LineChart data={data}>
                        {/* <CartesianGrid strokeDasharray="10 10" /> */}
                        <XAxis dataKey="day" hide />
                        <YAxis domain={[0, 10000]} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='dash-payment-cont dash-waiter-availability'>
                    <h1 className='dash-payment-one'>Available Waiters</h1>
                    <ul className='dash-waiter-availability-inner-cont' >
                      {stats.availableWaiters.length > 0 ? stats.availableWaiters.slice(0, 4).map((waiter, index) => (
                        <React.Fragment key={waiter.id || index}>
                          <li className='dash-waiter-availability-inner-item'>
                            <h1 className='dash-waiter-availability-item-name'>{waiter.name}</h1>
                            {waiter.status === 'Serving' ? (
                              <div className='dash-waiter-availability-item-action'>
                                <img className='serving-logo' src={serving} alt="serving" /> 
                                <p className='waiter-action-text'>Serving</p>
                              </div>
                            ) : waiter.status === 'Available' ? (
                              <div className='dash-waiter-availability-item-action available-one'>
                                <FaThumbsUp className='serving-logo cleaning-logo available-logo' /> 
                                <p className='waiter-action-text'>Available</p>
                              </div>
                            ) : (
                              <div className='dash-waiter-availability-item-action not-available-one in-kichen-one'>
                                <MdBlock className='serving-logo cleaning-logo in-kichen-logo' /> 
                                <p className='waiter-action-text'>{waiter.status || 'On Break'}</p>
                              </div>
                            )}
                            <p className='dash-waiter-availability-item-table'>
                              {waiter.table ? waiter.table : <TfiLineDashed className='available-line' />}
                            </p>
                          </li>
                          {index < stats.availableWaiters.slice(0, 4).length - 1 && <hr className='line-waiter-cont' />}
                        </React.Fragment>
                      )) : (
                        <li className='dash-waiter-availability-inner-item'>
                          <p className='dash-waiter-availability-item-table'>No waiters available</p>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className='dash-middle-m-right-cont'>
                  <h1 className='dash-middle-m-right-head'>Active Orders</h1>
                  <ul className='dash-middle-m-right-list'>
                    {stats.activeOrders.length > 0 ? stats.activeOrders.map((order, index) => {
                      const orderDate = new Date(order.created_at);
                      const hours = orderDate.getHours();
                      const minutes = orderDate.getMinutes().toString().padStart(2, '0');
                      const ampm = hours >= 12 ? "PM" : "AM";
                      const hours12 = hours % 12 || 12;
                      const timeStr = `${hours12}:${minutes} ${ampm}`;
                      const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const status = order.order_status || order.status || 'Pending';
                      
                      return (
                        <li 
                          key={order.id} 
                          className='dash-middle-m-right-list-item'
                          onClick={() => handleOrderClick(order)}
                          style={{ cursor: 'pointer' }}
                        >
                          <p className='dash-middle-m-right-list-item-number'>#{order.order_number || index + 1}</p>
                          <div className='dash-middle-m-right-list-item-cont-one'>
                            <div className='dash-middle-m-right-list-item-cont'>
                              <h1 className='dash-middle-m-right-list-item-head'>{order.table_name || '---'}</h1>
                              <p className='dash-middle-m-right-list-item-name'>{order.customer_name || '---'}</p>
                            </div>
                            <button 
                              type='button' 
                              className={`dash-middle-m-right-list-item-button ${status === 'KOT' ? 'order-status-kot' : ''}`}
                            >
                              {status}
                            </button>
                          </div>
                          <div className='dash-middle-m-right-list-item-cont-two'>
                            <hr className='dash-middle-m-right-list-item-hr' />
                            <h1 className='dash-middle-m-right-list-item-button-text'>Order {status}</h1>
                            <hr className='dash-middle-m-right-list-item-hr' />
                          </div>
                          <div className='dash-middle-m-right-list-item-cont-three'>
                            <p className='dash-middle-m-right-list-item-cont-three-text'>{dateStr} {timeStr}</p>
                            <p className='dash-middle-m-right-list-item-cont-three-text'>
                              <span className='dash-middle-m-right-list-item-cont-three-text-span'>{order.itemCount || 0}</span> Items
                            </p>
                          </div>
                          <hr className='dash-middle-m-right-list-item-hr' />
                          <div className='dash-middle-m-right-list-item-cont-four'>
                            <h1 className='dash-middle-m-right-list-item-cont-four-head'>₹ {Math.round(order.total_price || 0).toLocaleString()}</h1>
                            <p className='dash-middle-m-right-list-item-cont-four-text'>{order.waiter_name || 'Unassigned'}</p>
                          </div>
                        </li>
                      );
                    }) : (
                      <li className='dash-middle-m-right-list-item'>
                        <p style={{ textAlign: 'center', color: 'var(--text-color)', padding: '20px' }}>No active orders</p>
                      </li>
                    )}
                  </ul>
                </div>
            </div>
          </div>


    )   
}

export default Dashboard