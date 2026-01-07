import React from 'react';

const ComplexCustomer = React.createContext({
    restaurantId: '',
    tableId:'',
    currentSection: '',
    setCurrentSection:() => {},
    restaurantName:'',
    menuItems:[],
    menuItemsStatus:'',
    cartItems:[],
    updateCartItems:() => {},
    reduceCartItem: () => {},
    tableName:'',
    tableNameStatus:'',
    menuCategoris:[],
    orderId:'',
    updateOrderId: () => {}
})


export default ComplexCustomer;
