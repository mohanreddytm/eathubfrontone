// Utility to manage customer orders in localStorage with 1-day expiration

const STORAGE_KEY = 'customer_orders';
const EXPIRATION_DAYS = 1;

/**
 * Get all customer orders from localStorage
 * @returns {Array} Array of order IDs with timestamps
 */
export const getCustomerOrders = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const orders = JSON.parse(stored);
    const now = Date.now();
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    // Filter out expired orders
    const validOrders = orders.filter(order => {
      const orderTime = new Date(order.timestamp).getTime();
      return (now - orderTime) < expirationTime;
    });
    
    // Update localStorage with only valid orders
    if (validOrders.length !== orders.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validOrders));
    }
    
    return validOrders;
  } catch (error) {
    console.error('Error reading customer orders from localStorage:', error);
    return [];
  }
};

/**
 * Add a new order ID to localStorage
 * @param {string} orderId - The order ID to store
 */
export const addCustomerOrder = (orderId) => {
  try {
    const orders = getCustomerOrders();
    
    // Check if order already exists
    if (!orders.find(order => order.orderId === orderId)) {
      orders.push({
        orderId: orderId,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  } catch (error) {
    console.error('Error adding customer order to localStorage:', error);
  }
};

/**
 * Remove an order ID from localStorage
 * @param {string} orderId - The order ID to remove
 */
export const removeCustomerOrder = (orderId) => {
  try {
    const orders = getCustomerOrders();
    const filteredOrders = orders.filter(order => order.orderId !== orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredOrders));
  } catch (error) {
    console.error('Error removing customer order from localStorage:', error);
  }
};

/**
 * Check if an order ID belongs to the customer
 * @param {string} orderId - The order ID to check
 * @returns {boolean} True if order belongs to customer
 */
export const isCustomerOrder = (orderId) => {
  const orders = getCustomerOrders();
  return orders.some(order => order.orderId === orderId);
};

/**
 * Get array of customer order IDs
 * @returns {Array<string>} Array of order IDs
 */
export const getCustomerOrderIds = () => {
  return getCustomerOrders().map(order => order.orderId);
};

/**
 * Clear all expired orders (called on app initialization)
 */
export const cleanupExpiredOrders = () => {
  getCustomerOrders(); // This automatically removes expired orders
};

