import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaSignOutAlt, FaQuestionCircle, FaTimes } from 'react-icons/fa';
import complexKot from '../../../complexKot';
import './index.css';

const KotMainPage = () => {
  const navigate = useNavigate();
  const { restaurantDetails, chefDetails, orders, ordersStatus, restaurantId } = useContext(complexKot);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`http://localhost:8000/updateOrderStatus/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_status: newStatus }),
      });
      if (!res.ok) {
        console.error('Failed to update order status');
      }
      // Polling in MainKotOne will refresh orders automatically
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getOrderStatusBadge = (status) => {
    const value = (status || '').toUpperCase();
    if (value === 'KOT') return { label: 'New', className: 'kot-badge kot-badge-new' };
    if (value === 'PREPARING') return { label: 'Cooking', className: 'kot-badge kot-badge-preparing' };
    if (value === 'READY') return { label: 'Ready', className: 'kot-badge kot-badge-ready' };
    return { label: value || 'Unknown', className: 'kot-badge' };
  };

  const handleLogout = () => {
    Cookies.remove('k_user');
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = () => {
    handleLogout();
  };

  const activeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="kot-main-container">
      <header className="kot-header">
        <div>
          <h1 className="kot-header-title">
            {restaurantDetails ? restaurantDetails.restaurentname : 'Restaurant'} – KOT Dashboard
          </h1>
          <p className="kot-header-subtitle">Only chefs can manage and update cooking orders here.</p>
        </div>
        <div className="kot-header-right">
          <ThemeToggle />
          <div className="kot-header-user">
            <span className="kot-header-user-role">Chef</span>
            <span className="kot-header-user-name">{chefDetails && chefDetails.name}</span>
          </div>
          <div className="kot-header-actions">
            <button className="kot-header-action-btn kot-help-btn" onClick={() => setShowHelpModal(true)} title="Help">
              <FaQuestionCircle />
            </button>
            <button className="kot-header-action-btn kot-logout-btn" onClick={handleLogoutClick} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <section className="kot-orders-section">
        <h2 className="kot-section-title">Orders to Cook</h2>
        {ordersStatus === 'PENDING' && <p className="kot-info-text">Loading orders...</p>}
        {ordersStatus === 'FAILURE' && (
          <p className="kot-error-text">Failed to load orders. Please refresh or try again.</p>
        )}
        {ordersStatus === 'SUCCESS' && activeOrders.length === 0 && (
          <p className="kot-info-text">No pending orders to cook right now.</p>
        )}

        {activeOrders.length > 0 && (
          <ul className="kot-orders-list">
            {activeOrders.map((order) => {
              const statusInfo = getOrderStatusBadge(order.order_status);
              const itemsArray = Array.isArray(order.items) ? order.items : [];

              return (
                <li key={order.id} className="kot-order-card">
                  <div className="kot-order-card-header">
                    <div>
                      <h3 className="kot-order-number">Order #{order.order_number}</h3>
                      {order.table_name && <p className="kot-order-table">Table: {order.table_name}</p>}
                    </div>
                    <div className="kot-order-status">
                      <span className={statusInfo.className}>{statusInfo.label}</span>
                      <span className="kot-order-time">
                        {order.created_at &&
                          new Date(order.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </span>
                    </div>
                  </div>

                  <div className="kot-order-body">
                    <ul className="kot-order-items">
                      {itemsArray.map((item, idx) => (
                        <li key={idx}>
                          <span className="kot-item-name">{item.name}</span>
                          <span className="kot-item-qty">x {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="kot-order-footer">
                    <div className="kot-order-total">
                      <span>Total:</span>
                      <span>₹{order.total_price}</span>
                    </div>
                    <div className="kot-order-actions">
                      {(order.order_status || '').toUpperCase() === 'KOT' && (
                        <button
                          type="button"
                          className="kot-btn kot-btn-primary"
                          onClick={() => updateOrderStatus(order.id, 'Preparing')}
                          disabled={updatingOrderId === order.id}
                        >
                          Start Cooking
                        </button>
                      )}
                      {(order.order_status || '').toUpperCase() === 'PREPARING' && (
                        <button
                          type="button"
                          className="kot-btn kot-btn-success"
                          onClick={() => updateOrderStatus(order.id, 'Ready')}
                          disabled={updatingOrderId === order.id}
                        >
                          Mark Ready
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="kot-modal-overlay" onClick={handleLogoutCancel}>
          <div className="kot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kot-modal-header">
              <h2>Confirm Logout</h2>
              <button className="kot-modal-close" onClick={handleLogoutCancel}>
                <FaTimes />
              </button>
            </div>
            <div className="kot-modal-body">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="kot-modal-footer">
              <button className="kot-btn kot-btn-secondary" onClick={handleLogoutCancel}>
                Cancel
              </button>
              <button className="kot-btn kot-btn-danger" onClick={handleLogoutConfirm}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="kot-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="kot-modal kot-help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kot-modal-header">
              <h2>KOT Dashboard Help</h2>
              <button className="kot-modal-close" onClick={() => setShowHelpModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="kot-modal-body kot-help-content">
              <div className="kot-help-section">
                <h3>How to Use the KOT Dashboard</h3>
                <p>The KOT (Kitchen Order Ticket) Dashboard helps you manage cooking orders efficiently.</p>
              </div>

              <div className="kot-help-section">
                <h3>Order Statuses</h3>
                <ul className="kot-help-list">
                  <li>
                    <strong>New (KOT):</strong> New orders that need to be cooked. Click "Start Cooking" to begin preparing.
                  </li>
                  <li>
                    <strong>Cooking (Preparing):</strong> Orders currently being prepared. Click "Mark Ready" when the food is ready to serve.
                  </li>
                  <li>
                    <strong>Ready:</strong> Orders that are ready and will be removed from your dashboard automatically.
                  </li>
                </ul>
              </div>

              <div className="kot-help-section">
                <h3>Features</h3>
                <ul className="kot-help-list">
                  <li><strong>Real-time Updates:</strong> Orders are automatically refreshed every 10 seconds.</li>
                  <li><strong>Order Details:</strong> View order number, table name, items, quantities, and total price.</li>
                  <li><strong>Status Management:</strong> Update order status as you progress through cooking.</li>
                </ul>
              </div>

              <div className="kot-help-section">
                <h3>Tips</h3>
                <ul className="kot-help-list">
                  <li>Always check the order time to prioritize older orders first.</li>
                  <li>Update order status promptly to keep the front-of-house informed.</li>
                  <li>If you encounter any issues, contact your restaurant administrator.</li>
                </ul>
              </div>
            </div>
            <div className="kot-modal-footer">
              <button className="kot-btn kot-btn-primary" onClick={() => setShowHelpModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KotMainPage;


