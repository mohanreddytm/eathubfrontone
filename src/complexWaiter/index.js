import React from 'react';

const ComplexCustomer = React.createContext({
    restaurantId:'',
    waiterId:'',
    restaurantDetails: '',
    restaurantDetailsStatus:'',
    waiterDetails: '',
    waiterDetailsStatus:'',
    tables:'',
    tablesStatus:'',
    areas:'',
    areasStatus:'',
    orders: '',
    ordersStatus: ''
})


export default ComplexCustomer;