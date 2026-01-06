import React, { useState, useEffect, useContext } from 'react'
import { FaDownload, FaPrint, FaPlus, FaTimes } from "react-icons/fa";
import { MdQrCodeScanner } from "react-icons/md";
import { GiCash } from "react-icons/gi";
import { FaCreditCard } from "react-icons/fa";
import AllInOne from '../../../complexOne';
import './index.css'

const Payment = () => {
  const { userId, orders, ordersStatus, tablesData } = useContext(AllInOne)
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [refreshPayments, setRefreshPayments] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('paid')
  const [selectedTable, setSelectedTable] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [reportPeriod, setReportPeriod] = useState('today')
  
  // Add Payment Form State
  const [addPaymentForm, setAddPaymentForm] = useState({
    orderId: '',
    amount: '',
    paymentMethod: 'Cash',
    transactionId: '',
    notes: ''
  })

  // Statistics
  const [stats, setStats] = useState({
    totalPayment: { count: 0, amount: 0 },
    failedPayment: { count: 0, amount: 0 },
    pendingPayment: { count: 0, amount: 0 },
    highestPayment: { amount: 0 }
  })

  // Get today's date range
  const getTodayRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    return { start: today, end: endOfToday }
  }

  // Check for pre-filled order ID from POS
  useEffect(() => {
    const prefillOrderId = localStorage.getItem('selectedOrderIdForPayment');
    const prefillAmount = localStorage.getItem('selectedOrderAmountForPayment');
    
    if (prefillOrderId) {
      setAddPaymentForm(prev => ({
        ...prev,
        orderId: prefillOrderId,
        amount: prefillAmount || prev.amount
      }));
      setShowAddPaymentModal(true);
      // Clear the localStorage after using it
      localStorage.removeItem('selectedOrderIdForPayment');
      localStorage.removeItem('selectedOrderAmountForPayment');
    }
  }, []);

  // Fetch payments from payments table
  useEffect(() => {
    const fetchPayments = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:8000/getPayments/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const { start, end } = getTodayRange();
          
          // Filter today's payments
          const todayPayments = (data.payments || [])
            .filter(payment => {
              const paymentDate = new Date(payment.created_at);
              return paymentDate >= start && paymentDate <= end;
            })
            .map(payment => ({
              id: payment.id,
              orderId: payment.order_id,
              orderNumber: payment.order_number || payment.order_id,
              tableId: payment.table_id,
              tableName: payment.table_name || `T${payment.table_id?.toString().padStart(2, '0') || '00'}`,
              amount: parseFloat(payment.amount) || 0,
              paymentMethod: payment.payment_method || 'Cash',
              paymentStatus: payment.payment_status || 'Pending',
              transactionId: payment.transaction_id || `TXN${payment.id}`,
              date: new Date(payment.created_at).toLocaleDateString('en-IN'),
              time: new Date(payment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              createdAt: new Date(payment.created_at)
            }));

          setPayments(todayPayments);
          setFilteredPayments(todayPayments);
        } else {
          setPayments([]);
          setFilteredPayments([]);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
        setFilteredPayments([]);
      }
    };

    fetchPayments();
    // Refresh every 10 seconds
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [userId, refreshPayments])

  // Calculate statistics
  useEffect(() => {
    if (filteredPayments.length > 0) {
      const paidPayments = filteredPayments.filter(p => p.paymentStatus === 'Paid')
      const failedPayments = filteredPayments.filter(p => p.paymentStatus === 'Failed')
      const pendingPayments = filteredPayments.filter(p => p.paymentStatus === 'Pending')

      const totalAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0)
      const failedAmount = failedPayments.reduce((sum, p) => sum + p.amount, 0)
      const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
      const highestAmount = paidPayments.length > 0 ? Math.max(...paidPayments.map(p => p.amount)) : 0

      setStats({
        totalPayment: { count: paidPayments.length, amount: totalAmount },
        failedPayment: { count: failedPayments.length, amount: failedAmount },
        pendingPayment: { count: pendingPayments.length, amount: pendingAmount },
        highestPayment: { amount: highestAmount }
      })
    } else {
      setStats({
        totalPayment: { count: 0, amount: 0 },
        failedPayment: { count: 0, amount: 0 },
        pendingPayment: { count: 0, amount: 0 },
        highestPayment: { amount: 0 }
      })
    }
  }, [filteredPayments])

  // Apply filters
  useEffect(() => {
    let filtered = [...payments]

    // Filter by payment method
    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(p => p.paymentMethod.toLowerCase() === selectedPaymentMethod.toLowerCase())
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.paymentStatus.toLowerCase() === selectedStatus.toLowerCase())
    }

    // Filter by table
    if (selectedTable !== 'all') {
      filtered = filtered.filter(p => p.tableName === selectedTable)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'amount-low':
          return a.amount - b.amount
        case 'ordernum':
          return b.orderNumber - a.orderNumber
        case 'ordernum-low':
          return a.orderNumber - b.orderNumber
        case 'date':
        default:
          return b.createdAt - a.createdAt
      }
    })

    setFilteredPayments(filtered)
  }, [payments, selectedPaymentMethod, selectedStatus, selectedTable, sortBy])

  // Get unique tables from payments
  const getUniqueTables = () => {
    const tables = [...new Set(payments.map(p => p.tableName))].sort()
    return tables
  }

  // Handle add payment
  const handleAddPayment = async () => {
    if (!addPaymentForm.orderId || !addPaymentForm.amount) {
      alert('Please fill in all required fields (Order ID and Amount)')
      return
    }

    // Validate amount
    const amount = parseFloat(addPaymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0')
      return
    }

    try {
      // Find order details to get table information
      let orderDetails = null;
      if (orders && ordersStatus === "SUCCESS") {
        orderDetails = orders.find(order => 
          order.id === addPaymentForm.orderId || 
          order.order_number === parseInt(addPaymentForm.orderId) ||
          String(order.order_number) === String(addPaymentForm.orderId)
        );
      }

      // If order not found, still allow payment creation but warn user
      if (!orderDetails) {
        const confirmCreate = window.confirm(
          `Order ID "${addPaymentForm.orderId}" not found in current orders. ` +
          `Do you want to create payment anyway? This might fail if the order doesn't exist in the database.`
        );
        if (!confirmCreate) {
          return;
        }
      }

      const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      const paymentData = {
        id: paymentId,
        restaurant_id: userId,
        order_id: addPaymentForm.orderId, // Use the order ID as provided
        order_number: orderDetails ? orderDetails.order_number : (parseInt(addPaymentForm.orderId) || null),
        table_id: orderDetails ? orderDetails.table_id : null,
        table_name: orderDetails ? orderDetails.table_name : null,
        amount: amount,
        payment_method: addPaymentForm.paymentMethod,
        payment_status: 'Paid',
        transaction_id: addPaymentForm.transactionId || `TXN${Date.now()}`,
        notes: addPaymentForm.notes || null
      };

      // Make API call to create payment
      const response = await fetch('http://localhost:8000/createPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const responseData = await response.json();

      if (response.ok) {
        const createdPayment = responseData.payment;
        
        // Format the payment to match the expected structure
        const formattedPayment = {
          id: createdPayment.id,
          orderId: createdPayment.order_id,
          orderNumber: createdPayment.order_number || createdPayment.order_id,
          tableId: createdPayment.table_id,
          tableName: createdPayment.table_name || `T${createdPayment.table_id?.toString().padStart(2, '0') || '00'}`,
          amount: parseFloat(createdPayment.amount) || 0,
          paymentMethod: createdPayment.payment_method || 'Cash',
          paymentStatus: createdPayment.payment_status || 'Paid',
          transactionId: createdPayment.transaction_id || `TXN${createdPayment.id}`,
          date: new Date(createdPayment.created_at).toLocaleDateString('en-IN'),
          time: new Date(createdPayment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date(createdPayment.created_at)
        };

        // Check if payment is from today
        const { start, end } = getTodayRange();
        const paymentDate = new Date(createdPayment.created_at);
        
        // Only add to list if it's from today
        if (paymentDate >= start && paymentDate <= end) {
          // Add to payments list
          setPayments(prev => [formattedPayment, ...prev]);
        } else {
          // If not from today, trigger a refresh to get all payments
          setRefreshPayments(prev => prev + 1);
        }
        
        setShowAddPaymentModal(false)
        setAddPaymentForm({
          orderId: '',
          amount: '',
          paymentMethod: 'Cash',
          transactionId: '',
          notes: ''
        })
        alert('Payment added successfully!')
      } else {
        console.error('Error adding payment:', responseData);
        const errorMessage = responseData.details 
          ? `${responseData.error || 'Failed to add payment'}: ${responseData.details}`
          : responseData.error || 'Failed to add payment. Please check that the Order ID exists.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error adding payment:', error)
      alert('Failed to add payment. Please try again.')
    }
  }

  // Download report
  const handleDownloadReport = (period = 'today') => {
    let reportData = [...payments]
    const today = new Date()
    
    // Filter by period
    if (period === 'this-week') {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      reportData = reportData.filter(p => p.createdAt >= startOfWeek)
    } else if (period === 'this-month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      reportData = reportData.filter(p => p.createdAt >= startOfMonth)
    } else if (period === 'this-year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      reportData = reportData.filter(p => p.createdAt >= startOfYear)
    }

    // Create CSV content
    const headers = ['Table', 'Transaction ID', 'Order Number', 'Payment Method', 'Payment Status', 'Amount', 'Date', 'Time']
    const rows = reportData.map(p => [
      p.tableName,
      p.transactionId,
      `#${p.orderNumber}`,
      p.paymentMethod,
      p.paymentStatus,
      `₹${p.amount.toFixed(2)}`,
      p.date,
      p.time
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Calculate totals
    const totalAmount = reportData.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + p.amount, 0)
    const totalCount = reportData.filter(p => p.paymentStatus === 'Paid').length

    const summary = [
      '',
      'Summary',
      `Total Payments: ${totalCount}`,
      `Total Amount: ₹${totalAmount.toFixed(2)}`,
      `Report Generated: ${new Date().toLocaleString('en-IN')}`
    ].join('\n')

    const fullContent = csvContent + '\n\n' + summary

    // Create and download file
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payment-report-${period}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='menu-page-main-cont payment-page-main-cont'>
      <div className='payment-page-main-cont-one'>
        <div className='payment-page-main-cont-one-div-one-one'>
          <h1>Payment</h1>
          <button onClick={() => setShowAddPaymentModal(true)}>
            <FaPlus /> Add Payment
          </button>
        </div>
        <div className='payment-page-main-cont-one-div-one-two'>
          <h1>Today's Report</h1>
          <button onClick={() => handleDownloadReport('today')}>
            <FaDownload /> Download
          </button>
        </div>
        <div className='payment-page-main-cont-one-div-one-two'>
          <h1>
            <select 
              className='payment-page-main-cont-one-div-one-two-select'
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-year">This Year</option>
            </select> Report
          </h1>
          <button onClick={() => handleDownloadReport(reportPeriod)}>
            <FaDownload /> Download
          </button>
        </div>
      </div>

      <div className='payment-page-main-cont-one payment-page-mini-status-cone'>
        <div className='payment-page-main-cont-one-div-one total-payment'>
          <div className='total-payment-div-one'>
            <p>{stats.totalPayment.count}</p>
          </div>
          <p>Total Payment</p>
          <p>₹{stats.totalPayment.amount.toFixed(2)}</p>
        </div>
        <div className='payment-page-main-cont-one-div-one failed-payment'>
          <div className='total-payment-div-one'>
            <p>{stats.failedPayment.count}</p>
          </div>
          <p>Failed Payment</p>
          <p>₹{stats.failedPayment.amount.toFixed(2)}</p>
        </div>
        <div className='payment-page-main-cont-one-div-one pending-payment'>
          <div className='total-payment-div-one'>
            <p>{stats.pendingPayment.count}</p>
          </div>
          <p>Pending Payment</p>
          <p>₹{stats.pendingPayment.amount.toFixed(2)}</p>
        </div>
        <div className='payment-page-main-cont-one-div-one highest-payment'>
          <div className='total-payment-div-one'>
            <p>{stats.highestPayment.amount > 0 ? '1' : '0'}</p>
          </div>
          <p>Highest Payment</p>
          <p>₹{stats.highestPayment.amount.toFixed(2)}</p>
        </div>
      </div>

      <div className='payment-page-main-cont-two'>
        <div className='payment-page-main-cont-two-filter-cont'>
          <select 
            className='payment-page-main-cont-two-select'
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select 
            className='payment-page-main-cont-two-select'
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort By</option>
            <option value="amount">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
            <option value="ordernum">Order Number (High to Low)</option>
            <option value="ordernum-low">Order Number (Low to High)</option>
          </select>
          <select 
            className='payment-page-main-cont-two-select'
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="all">All tables</option>
            {getUniqueTables().map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
        
        <div className='payment-page-main-cont-two-div-one'>
          <button 
            className={selectedPaymentMethod === 'upi' ? 'active' : ''}
            onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === 'upi' ? 'all' : 'upi')}
          >
            <MdQrCodeScanner /> UPI
          </button>
          <button 
            className={selectedPaymentMethod === 'cash' ? 'active' : ''}
            onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === 'cash' ? 'all' : 'cash')}
          >
            <GiCash /> Cash
          </button>
          <button 
            className={selectedPaymentMethod === 'card' ? 'active' : ''}
            onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === 'card' ? 'all' : 'card')}
          >
            <FaCreditCard /> Card
          </button>
        </div>
      </div>

      <div className='table-container-payment'>
        <table>
          <thead>
            <tr>
              <th>Table</th>
              <th>Transaction ID</th>
              <th>Order Number</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Amount</th>
              <th>Date / Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td><p className='table-name'>{payment.tableName}</p></td>
                  <td>{payment.transactionId}</td>
                  <td>
                    <div className='order-number'>
                      <hr/> <span>#{payment.orderNumber}</span> <hr/>
                    </div>
                  </td>
                  <td className='payment-method'>
                    {payment.paymentMethod === 'UPI' ? (
                      <MdQrCodeScanner className='payment-method-icon' />
                    ) : payment.paymentMethod === 'Card' ? (
                      <FaCreditCard className='payment-method-icon' />
                    ) : (
                      <GiCash className='payment-method-icon' />
                    )}
                    <span>{payment.paymentMethod}</span>
                  </td>
                  <td className={`payment-status payment-status-${payment.paymentStatus.toLowerCase()}`}>
                    {payment.paymentStatus}
                  </td>
                  <td className='amount'>₹{payment.amount.toFixed(2)}</td>
                  <td>{payment.date} / {payment.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#b6b5b5' }}>
                  No payments found for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className='payment-modal-overlay' onClick={() => setShowAddPaymentModal(false)}>
          <div className='payment-modal' onClick={(e) => e.stopPropagation()}>
            <div className='payment-modal-header'>
              <h2>Add Payment</h2>
              <button className='payment-modal-close' onClick={() => setShowAddPaymentModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className='payment-modal-body'>
              <div className='payment-form-group'>
                <label>Order ID *</label>
                <input
                  type="text"
                  value={addPaymentForm.orderId}
                  onChange={(e) => setAddPaymentForm(prev => ({ ...prev, orderId: e.target.value }))}
                  placeholder="Enter order ID"
                />
              </div>
              <div className='payment-form-group'>
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  value={addPaymentForm.amount}
                  onChange={(e) => setAddPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  step="0.01"
                />
              </div>
              <div className='payment-form-group'>
                <label>Payment Method *</label>
                <select
                  value={addPaymentForm.paymentMethod}
                  onChange={(e) => setAddPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className='payment-form-group'>
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={addPaymentForm.transactionId}
                  onChange={(e) => setAddPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="Enter transaction ID (optional)"
                />
              </div>
              <div className='payment-form-group'>
                <label>Notes</label>
                <textarea
                  value={addPaymentForm.notes}
                  onChange={(e) => setAddPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className='payment-modal-footer'>
              <button className='payment-modal-cancel' onClick={() => setShowAddPaymentModal(false)}>
                Cancel
              </button>
              <button className='payment-modal-submit' onClick={handleAddPayment}>
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payment
