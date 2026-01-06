import React from 'react'
import ComplexCustomer from '../../../complexOneForCustomer'
import { useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';

import { useNavigate } from 'react-router-dom'
import { FaArrowLeftLong, FaCopyright } from "react-icons/fa6";
import './index.css'
import { isCustomerOrder } from '../../../utils/customerOrdersStorage';

const OrderOne = () => {
    const navigate = useNavigate();
    let {restaurantName, orderId, restaurantId, tableId} = useContext(ComplexCustomer)
    const [orderDetails, setOrderDetails] = useState(null);
    const [callWaiterOne, setCallWaiterOne] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showUPIPopup, setShowUPIPopup] = useState(false);
    const [showPaymentStatusScreen, setShowPaymentStatusScreen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [restaurantPaymentSettings, setRestaurantPaymentSettings] = useState(null);
    const [currentPaymentId, setCurrentPaymentId] = useState(null);
    const [restaurantNameFull, setRestaurantNameFull] = useState('');

    useEffect(() => {
        const getOrderDetails = async () => {
            let currentOrderId = orderId;
            if(!currentOrderId) {
                currentOrderId = localStorage.getItem("orderId");
            }
            if(!currentOrderId) {
                console.error("No order ID available");
                return;
            }
            
            // Verify this order belongs to the customer
            if (!isCustomerOrder(currentOrderId)) {
                console.error("Order does not belong to this customer");
                alert("You don't have access to this order.");
                navigate(`/customerDashboard/${tableId}/${restaurantId}/home`);
                return;
            }
            
            try {
                const url = `http://localhost:8000/getOrderDetails/${currentOrderId}`;
                const response = await fetch(url);
                if(response.ok) {
                    const data = await response.json();
                    console.log(data)
                    if(data.order && data.order.length > 0) {
                        const order = data.order[0];
                        // Parse items if they are a string
                        if(order.items && typeof order.items === 'string') {
                            try {
                                order.items = JSON.parse(order.items);
                            } catch(e) {
                                console.error('Error parsing items:', e);
                                order.items = [];
                            }
                        }
                        setOrderDetails(order);
                        
                        // Check payment status
                        if(order.payment_status) {
                            setPaymentStatus(order.payment_status);
                        }
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.log("Failed to fetch order details", errorData);
                    alert("Failed to fetch order details. Please try again.");
                }
            } catch(error) {
                console.error("Error fetching order details:", error);
                alert("Failed to fetch order details. Please check your connection.");
            }
        }
            
        getOrderDetails();
    }, [orderId, tableId, restaurantId, navigate]);

    // Fetch restaurant payment settings
    useEffect(() => {
        const fetchPaymentSettings = async () => {
            if (!restaurantId) return;
            try {
                const response = await fetch(`http://localhost:8000/getPaymentSettings/${restaurantId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRestaurantPaymentSettings(data.settings);
                }
            } catch (error) {
                console.error('Error fetching payment settings:', error);
            }
        };
        fetchPaymentSettings();
    }, [restaurantId]);

    // Fetch restaurant name
    useEffect(() => {
        const fetchRestaurantName = async () => {
            if (!restaurantId) return;
            try {
                const response = await fetch(`http://localhost:8000/restaurant/${restaurantId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setRestaurantNameFull(data[0].restaurentname || restaurantName || 'Restaurant');
                    }
                }
            } catch (error) {
                console.error('Error fetching restaurant name:', error);
                setRestaurantNameFull(restaurantName || 'Restaurant');
            }
        };
        fetchRestaurantName();
    }, [restaurantId, restaurantName]);

    // Poll for payment status updates
    useEffect(() => {
        if (!currentPaymentId || !showPaymentStatusScreen) return;

        const pollPaymentStatus = async () => {
            try {
                const response = await fetch(`http://localhost:8000/getPayment/${currentPaymentId}`);
                if (response.ok) {
                    const data = await response.json();
                    const payment = data.payment;
                    
                    if (payment.payment_status === 'SUCCESS') {
                        setPaymentStatus('Paid');
                        setPaymentMethod('Online');
                        setShowPaymentStatusScreen(false);
                        // Refresh order details
                        const refreshResponse = await fetch(`http://localhost:8000/getOrderDetails/${orderId}`);
                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            if (refreshData.order && refreshData.order.length > 0) {
                                const order = refreshData.order[0];
                                if (order.items && typeof order.items === 'string') {
                                    try {
                                        order.items = JSON.parse(order.items);
                                    } catch(e) {
                                        order.items = [];
                                    }
                                }
                                setOrderDetails(order);
                            }
                        }
                    } else if (payment.payment_status === 'FAILED') {
                        setPaymentStatus('Pending');
                        setShowPaymentStatusScreen(false);
                        alert('Payment was marked as failed by the restaurant. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        };

        const interval = setInterval(pollPaymentStatus, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [currentPaymentId, showPaymentStatusScreen, orderId]);

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
                table_name: orderDetails?.table_name || 'Unknown',
                request_type: 'general',
                notes: 'Customer requested waiter assistance from order details page'
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
                    setTimeout(() => {
                        setCallWaiterOne(false)
                        setRequestSuccess(false)
                        alert(`Waiter ${responseData.waiter_name} is coming to your table. Please wait.`)
                    }, 2000)
                } else {
                    setRequestSuccess(true)
                    setTimeout(() => {
                        setCallWaiterOne(false)
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
                            <h1>Table Name: <span>{orderDetails?.table_name || 'N/A'}</span></h1>
                            <div className='call-waiter-popup-buttons-cont'>
                                <button 
                                    className='yes-button' 
                                    onClick={handleCallWaiter}
                                    disabled={requestLoading}
                                >
                                    {requestLoading ? 'Sending...' : 'Yes'}
                                </button>
                                <button 
                                    onClick={() => {
                                        setCallWaiterOne(false);
                                        setRequestSuccess(false);
                                    }} 
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

    const handlePayment = async (method) => {
        if (!orderDetails || !orderId) {
            alert('Order details not available. Please refresh the page.');
            return;
        }

        if (method === 'Cash') {
            // For cash payment, just update status and show message
            setPaymentLoading(true);
            try {
                const paymentId = uuidv4();
                const totalAmount = calculateTotal();

                const paymentData = {
                    id: paymentId,
                    restaurant_id: restaurantId,
                    order_id: orderId,
                    order_number: orderDetails.order_number,
                    table_id: tableId,
                    table_name: orderDetails.table_name,
                    amount: totalAmount,
                    payment_method: 'Cash',
                    payment_status: 'Pending',
                    transaction_id: `CASH${Date.now()}`,
                    notes: 'Payment pending - customer will pay cash to waiter'
                };

                const response = await fetch('http://localhost:8000/createPayment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(paymentData)
                });

                if (response.ok) {
                    setPaymentStatus('Pending');
                    setPaymentMethod('Cash');
                    setShowPaymentPopup(false);
                    
                    // Update order payment status
                    await fetch(`http://localhost:8000/updateOrderPaymentStatus/${orderId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ payment_status: 'Pending', payment_method: 'Cash' })
                    });
                    
                    // Refresh order details
                    const refreshResponse = await fetch(`http://localhost:8000/getOrderDetails/${orderId}`);
                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        if (refreshData.order && refreshData.order.length > 0) {
                            const order = refreshData.order[0];
                            if (order.items && typeof order.items === 'string') {
                                try {
                                    order.items = JSON.parse(order.items);
                                } catch(e) {
                                    order.items = [];
                                }
                            }
                            setOrderDetails(order);
                        }
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.error || 'Failed to process payment request. Please try again.');
                }
            } catch (error) {
                console.error('Error processing payment:', error);
                alert('Failed to process payment request. Please check your connection and try again.');
            } finally {
                setPaymentLoading(false);
            }
        } else if (method === 'Online') {
            // For online payment, show UPI payment options
            setShowPaymentPopup(false);
            setShowUPIPopup(true);
        }
    }

    const handlePayOnline = async (upiId) => {
        if (!orderDetails || !orderId || !restaurantId) {
            alert('Order details not available. Please refresh the page.');
            return;
        }

        setPaymentLoading(true);
        try {
            const paymentId = uuidv4();
            const totalAmount = calculateTotal();

            // Create payment with INITIATED status
            const paymentData = {
                id: paymentId,
                restaurant_id: restaurantId,
                order_id: orderId,
                order_number: orderDetails.order_number,
                table_id: tableId,
                table_name: orderDetails.table_name,
                amount: totalAmount,
                upi_id: upiId
            };

            const createPaymentResponse = await fetch('http://localhost:8000/createUPIPayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (!createPaymentResponse.ok) {
                const errorData = await createPaymentResponse.json();
                throw new Error(errorData.error || 'Failed to initiate payment');
            }

            // Generate UPI intent URL
            const intentResponse = await fetch('http://localhost:8000/generateUPIIntent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    upi_id: upiId,
                    restaurant_name: restaurantNameFull,
                    amount: totalAmount,
                    order_id: orderId
                })
            });

            if (!intentResponse.ok) {
                throw new Error('Failed to generate UPI intent');
            }

            const intentData = await intentResponse.json();
            const upiIntentUrl = intentData.upi_intent_url;

            // Store payment ID for status polling
            setCurrentPaymentId(paymentId);
            setShowUPIPopup(false);
            setShowPaymentStatusScreen(true);

            // Redirect to UPI app
            window.location.href = upiIntentUrl;
        } catch (error) {
            console.error('Error initiating UPI payment:', error);
            alert(error.message || 'Failed to initiate payment. Please try again.');
            setPaymentLoading(false);
        }
    }

    const handleConfirmPayment = async () => {
        if (!currentPaymentId) return;

        setPaymentLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/confirmPaymentPending/${currentPaymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setPaymentStatus('Pending');
                setPaymentMethod('Online');
                setShowPaymentStatusScreen(false);
                alert('Payment confirmation sent to restaurant. Waiting for restaurant confirmation...');
                
                // Start polling for status update
                const pollInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch(`http://localhost:8000/getPayment/${currentPaymentId}`);
                        if (statusResponse.ok) {
                            const data = await statusResponse.json();
                            const payment = data.payment;
                            
                            if (payment.payment_status === 'SUCCESS') {
                                clearInterval(pollInterval);
                                setPaymentStatus('Paid');
                                // Refresh order details
                                const refreshResponse = await fetch(`http://localhost:8000/getOrderDetails/${orderId}`);
                                if (refreshResponse.ok) {
                                    const refreshData = await refreshResponse.json();
                                    if (refreshData.order && refreshData.order.length > 0) {
                                        const order = refreshData.order[0];
                                        if (order.items && typeof order.items === 'string') {
                                            try {
                                                order.items = JSON.parse(order.items);
                                            } catch(e) {
                                                order.items = [];
                                            }
                                        }
                                        setOrderDetails(order);
                                    }
                                }
                                alert('Payment confirmed successfully!');
                            } else if (payment.payment_status === 'FAILED') {
                                clearInterval(pollInterval);
                                setPaymentStatus('Pending');
                                alert('Payment was marked as failed by the restaurant. Please try again.');
                            }
                        }
                    } catch (error) {
                        console.error('Error polling payment status:', error);
                    }
                }, 3000);

                // Stop polling after 5 minutes
                setTimeout(() => clearInterval(pollInterval), 300000);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to confirm payment. Please try again.');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to confirm payment. Please try again.');
        } finally {
            setPaymentLoading(false);
        }
    }

    const handleCancelPayment = () => {
        setShowPaymentStatusScreen(false);
        setCurrentPaymentId(null);
        setPaymentLoading(false);
    }

    const paymentPopup = () => {
        if (!orderDetails) return null;
        
        const totalAmount = calculateTotal();
        const isOnlinePaymentEnabled = restaurantPaymentSettings?.paymentMethods?.online === true;
        const hasUPIIds = restaurantPaymentSettings?.upi_ids && restaurantPaymentSettings.upi_ids.length > 0;
        const canPayOnline = isOnlinePaymentEnabled && hasUPIIds;

        return (
            <div className='payment-popup-main-cont'>
                <div className='payment-popup-inner-cont'>
                    <h1>Make Payment</h1>
                    <p className='payment-popup-total'>Total Amount: ₹{totalAmount.toFixed(2)}</p>
                    <div className='payment-popup-methods'>
                        {canPayOnline ? (
                            <button 
                                className='payment-method-button upi-button'
                                onClick={() => handlePayment('Online')}
                                disabled={paymentLoading}
                            >
                                Pay Online
                            </button>
                        ) : null}
                        <button 
                            className='payment-method-button cash-button'
                            onClick={() => handlePayment('Cash')}
                            disabled={paymentLoading}
                        >
                            Pay Cash to Waiter
                        </button>
                    </div>
                    {!canPayOnline && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                            Online payment is not available. Please pay cash to waiter.
                        </p>
                    )}
                    <button 
                        className='payment-popup-cancel'
                        onClick={() => setShowPaymentPopup(false)}
                        disabled={paymentLoading}
                    >
                        Cancel
                    </button>
                    {paymentLoading && <p className='payment-loading'>Processing payment...</p>}
                </div>
            </div>
        );
    }

    const upiPaymentPopup = () => {
        if (!orderDetails) return null;
        
        const totalAmount = calculateTotal();
        const upiOptions = restaurantPaymentSettings?.upi_ids || [];

        return (
            <div className='payment-popup-main-cont'>
                <div className='payment-popup-inner-cont upi-popup-inner'>
                    <h1>Pay Online</h1>
                    <p className='payment-popup-total'>Total Amount: ₹{totalAmount.toFixed(2)}</p>
                    {upiOptions.length > 0 ? (
                        <>
                            <p className='upi-select-text'>Select UPI ID to pay:</p>
                            <div className='payment-popup-methods upi-options-list'>
                                {upiOptions.map((upi, index) => (
                                    <button 
                                        key={index}
                                        className='payment-method-button upi-option-button'
                                        onClick={() => handlePayOnline(upi.upi_id)}
                                        disabled={paymentLoading}
                                    >
                                        <span className='upi-option-name'>{upi.name || 'UPI Payment'}</span>
                                        <span className='upi-option-id'>{upi.upi_id}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className='no-upi-message'>
                            <p>No UPI payment options available.</p>
                            <p>Please contact the restaurant for payment details.</p>
                        </div>
                    )}
                    <button 
                        className='payment-popup-cancel'
                        onClick={() => {
                            setShowUPIPopup(false);
                            setShowPaymentPopup(true);
                        }}
                        disabled={paymentLoading}
                    >
                        Back
                    </button>
                    {paymentLoading && <p className='payment-loading'>Processing payment...</p>}
                </div>
            </div>
        );
    }

    const paymentStatusScreen = () => {
        if (!orderDetails) return null;

        return (
            <div className='payment-popup-main-cont'>
                <div className='payment-popup-inner-cont payment-status-screen'>
                    <h1>Payment Status</h1>
                    <p className='payment-popup-total'>Amount: ₹{calculateTotal().toFixed(2)}</p>
                    <div className='payment-status-message'>
                        <p>Have you completed the payment in your UPI app?</p>
                        <p className='payment-status-hint'>Please confirm after completing the payment.</p>
                    </div>
                    <div className='payment-status-buttons'>
                        <button 
                            className='payment-method-button success-button'
                            onClick={handleConfirmPayment}
                            disabled={paymentLoading}
                        >
                            I Have Paid
                        </button>
                        <button 
                            className='payment-popup-cancel'
                            onClick={handleCancelPayment}
                            disabled={paymentLoading}
                        >
                            Cancel Payment
                        </button>
                    </div>
                    {paymentLoading && <p className='payment-loading'>Processing...</p>}
                </div>
            </div>
        );
    }
    

    const calculateTotal = () => {
        if (!orderDetails) return 0;
        const subtotal = typeof orderDetails.total_price === 'string' 
            ? parseFloat(orderDetails.total_price) 
            : orderDetails.total_price || 0;
        const tax = orderDetails.tax_amount 
            ? (typeof orderDetails.tax_amount === 'string' 
                ? parseFloat(orderDetails.tax_amount) 
                : orderDetails.tax_amount)
            : 0;
        const discount = orderDetails.discount_amount 
            ? (typeof orderDetails.discount_amount === 'string' 
                ? parseFloat(orderDetails.discount_amount) 
                : orderDetails.discount_amount)
            : 0;
        return subtotal + tax - discount;
    };

    const getItems = () => {
        if (!orderDetails || !orderDetails.items) return [];
        if (typeof orderDetails.items === 'string') {
            try {
                return JSON.parse(orderDetails.items);
            } catch(e) {
                console.error('Error parsing items:', e);
                return [];
            }
        }
        return orderDetails.items;
    };

  return (
    <div className='order-one-initial-cont'>
        {callWaiterOne && callWaiterPopup()}
        {showPaymentPopup && paymentPopup()}
        {showUPIPopup && upiPaymentPopup()}
        {showPaymentStatusScreen && paymentStatusScreen()}
        <div className='customer-main-title-cont'>
            <h1 className='customer-main-title'><span>A</span>{restaurantName}</h1>
        </div>
        <div className='order-one-head-cont'>
            <h1>Order Details</h1>
            <button onClick={() => setCallWaiterOne(true)}>Call Waiter</button>
        </div>
        {orderDetails ? (
            <>
                <div className='order-status-cont'>
                    <h1>Order Status</h1>
                    <ul className='order-status-ul'>
                        <li className={orderDetails.status === "Pending" ? "only-sp-one-status-cont" : ""}> {orderDetails.status === "Pending" || orderDetails.status === "Confirmed" || orderDetails.status === "Preparing" || orderDetails.status === "Ready" ? <p className='only-sp-one-status'>✔</p> : <p></p> } Order Pending</li>
                        <li className={orderDetails.status === "Confirmed" ? "only-sp-one-status-cont" : ""}> {orderDetails.status === "Confirmed" || orderDetails.status === "Preparing" || orderDetails.status === "Ready" ? <p className='only-sp-one-status'>✔</p> : <p></p>} Order Confirmed</li>
                        <li className={orderDetails.status === "Preparing" ? "only-sp-one-status-cont" : ""}> {orderDetails.status === "Preparing" || orderDetails.status === "Ready" ? <p className='only-sp-one-status'>✔</p> : <p></p>} Order Preparation</li>
                        <li className={orderDetails.status === "Ready" ? "only-sp-one-status-cont" : ""}> {orderDetails.status === "Ready" ? <p className='only-sp-one-status'>✔</p> : <p></p>} Order Served</li>
                    </ul>
                </div>
                <div className='order-details-cont'>
                    <h1>Order #{orderDetails.order_number || 'N/A'}</h1>
                    <p>
                        {orderDetails.created_at 
                            ? (() => {
                                const date = new Date(orderDetails.created_at);
                                const day = date.getDate();
                                const month = date.toLocaleString('default', { month: 'short' });
                                const year = date.getFullYear();
                                const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                const getDaySuffix = (d) => {
                                    if (d > 3 && d < 21) return 'th';
                                    switch (d % 10) {
                                        case 1: return 'st';
                                        case 2: return 'nd';
                                        case 3: return 'rd';
                                        default: return 'th';
                                    }
                                };
                                return `Placed on ${day}${getDaySuffix(day)} ${month}, ${year} at ${time}`;
                              })()
                            : 'Placed on ...'
                        }
                    </p>
                    <p>Table Name: <span className='table-name-order-details-one'>{orderDetails.table_name || 'N/A'}</span></p>
                    <p>Estimated Preparation Time: 13 Minutes</p>
                </div>

                <div className='order-items-cont'>
                    <ul>
                        {getItems().map((item, index) => (
                            <li key={index} className='order-item-one-cont'>
                                <img src={item.cart_item_image || item.image_url || '/noimage.png'} alt={item.cart_item_name || item.item_name} />
                                <p className='order-item-name'>{item.cart_item_name || item.item_name} x {item.quantity}</p>
                                <p className='order-item-price'>₹{((item.cart_item_price || item.price) * item.quantity).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <hr className='order-items-divider' />
                    <h1 className='order-summary-title'>Order Summary</h1>
                    <div className='order-summary-cont'>
                        <p>Item Total: <span>₹{(() => {
                            const subtotal = typeof orderDetails.total_price === 'string' 
                                ? parseFloat(orderDetails.total_price) 
                                : orderDetails.total_price || 0;
                            return subtotal.toFixed(2);
                        })()}</span></p>
                        <p>Tax and Charges: <span>₹{(() => {
                            const tax = orderDetails.tax_amount 
                                ? (typeof orderDetails.tax_amount === 'string' 
                                    ? parseFloat(orderDetails.tax_amount) 
                                    : orderDetails.tax_amount)
                                : 0;
                            return tax.toFixed(2);
                        })()}</span></p>
                        {orderDetails.discount_amount && parseFloat(orderDetails.discount_amount) > 0 && (
                            <p>Discount: <span>-₹{(() => {
                                const discount = typeof orderDetails.discount_amount === 'string' 
                                    ? parseFloat(orderDetails.discount_amount) 
                                    : orderDetails.discount_amount;
                                return discount.toFixed(2);
                            })()}</span></p>
                        )}
                        <h1 className='order-summary-total-money'>Total Amount: <span>₹{calculateTotal().toFixed(2)}</span></h1>
                    </div>
                </div>

                <button onClick={() => navigate(`/customerDashboard/${tableId}/${restaurantId}/home`)} className='new-order-button'><FaArrowLeftLong />New Order</button>

                <div className='payment-details-main-cont'>
                    <h1 className='payment-details-title'>Payment Details</h1>
                    <div className='payment-details-cont-inner'>
                        <div className='payment-details-cont'>
                            {paymentStatus === 'Paid' ? (
                                <>
                                    <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ Payment Completed</p>
                                    <p>Payment Method: {orderDetails.payment_method || paymentMethod || 'N/A'}</p>
                                </>
                            ) : paymentMethod === 'Cash' ? (
                                <>
                                    <p style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: '10px' }}>
                                        💵 Pay Cash to Waiter
                                    </p>
                                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                                        Please pay ₹{calculateTotal().toFixed(2)} to the waiter when they arrive at your table.
                                    </p>
                                    <button 
                                        onClick={() => setCallWaiterOne(true)} 
                                        className='call-waiter-for-payment-button'
                                    >
                                        Call Waiter
                                    </button>
                                </>
                            ) : (
                                <>
                                    {(() => {
                                        const isOnlinePaymentEnabled = restaurantPaymentSettings?.paymentMethods?.online === true;
                                        const hasUPIIds = restaurantPaymentSettings?.upi_ids && restaurantPaymentSettings.upi_ids.length > 0;
                                        const canPayOnline = isOnlinePaymentEnabled && hasUPIIds;
                                        
                                        return (
                                            <>
                                                <button onClick={() => setShowPaymentPopup(true)} disabled={paymentLoading}>
                                                    Make Payment
                                                </button>
                                                {canPayOnline ? (
                                                    <p>( or ) You Can Pay cash to the waiter.</p>
                                                ) : (
                                                    <p>Please pay cash to the waiter.</p>
                                                )}
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                        <p className={`payment-status ${paymentStatus === 'Paid' ? 'payment-paid' : ''}`}>
                            {paymentStatus === 'Paid' ? 'Payment Completed' : paymentMethod === 'Cash' ? 'Awaiting Cash Payment' : 'Payment Pending'}
                        </p>
                    </div>
                </div>
            </>
        ) : (
            <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>
                <p>Loading order details...</p>
            </div>
        )}

        <div className='powered-by-cont-one'>
            <p className='powered-by-one'> <FaCopyright /> Powered by EatHub 2025. All rights Reserved.</p>
        </div>
    </div>
  )
}

export default OrderOne;

