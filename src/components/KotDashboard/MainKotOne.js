import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import complexKot from '../../complexKot';

const statusOne = {
  INITIAl: 'INITIAL',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

const MainKotOne = () => {
  const navigate = useNavigate();

  const [restaurantId, setRestaurantId] = useState('');
  const [chefId, setChefId] = useState('');

  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [restaurantDetailsStatus, setRestaurantDetailsStatus] = useState(statusOne.INITIAl);

  const [chefDetails, setChefDetails] = useState(null);
  const [chefDetailsStatus, setChefDetailsStatus] = useState(statusOne.INITIAl);

  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState(statusOne.INITIAl);

  useEffect(() => {
    const token = Cookies.get('k_user');
    if (!token) {
      navigate('/login');
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error('Invalid KOT token', error);
      Cookies.remove('k_user');
      navigate('/login');
      return;
    }

    const chefIdFromToken = decodedToken.userId;
    const restaurantIdFromToken = decodedToken.restaurantId;
    setChefId(chefIdFromToken);
    setRestaurantId(restaurantIdFromToken);

    const fetchRestaurantDetails = async () => {
      setRestaurantDetailsStatus(statusOne.PENDING);
      try {
        const url = `https://eathubbackend-1.onrender.com/restaurant/${restaurantIdFromToken}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setRestaurantDetails(json[0]);
          setRestaurantDetailsStatus(statusOne.SUCCESS);
        } else {
          setRestaurantDetailsStatus(statusOne.FAILURE);
        }
      } catch (error) {
        console.error('Error fetching restaurant details (KOT):', error);
        setRestaurantDetailsStatus(statusOne.FAILURE);
      }
    };

    const fetchChefDetails = async () => {
      setChefDetailsStatus(statusOne.PENDING);
      try {
        const url = `https://eathubbackend-1.onrender.com/waiterDetailsRestaurant/${chefIdFromToken}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setChefDetails(json.waiter && json.waiter.length > 0 ? json.waiter[0] : null);
          setChefDetailsStatus(statusOne.SUCCESS);
        } else {
          setChefDetailsStatus(statusOne.FAILURE);
        }
      } catch (error) {
        console.error('Error fetching chef details:', error);
        setChefDetailsStatus(statusOne.FAILURE);
      }
    };

    const fetchOrders = async () => {
      if (!restaurantIdFromToken) return;
      setOrdersStatus(statusOne.PENDING);
      try {
        const url = `https://eathubbackend-1.onrender.com/getOrdersKitchen/${restaurantIdFromToken}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const ordersWithParsedItems = (json.order || []).map((order) => ({
            ...order,
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
          }));
          setOrders(ordersWithParsedItems);
          setOrdersStatus(statusOne.SUCCESS);
        } else {
          setOrders([]);
          setOrdersStatus(statusOne.FAILURE);
        }
      } catch (error) {
        console.error('Error fetching KOT orders:', error);
        setOrders([]);
        setOrdersStatus(statusOne.FAILURE);
      }
    };

    fetchRestaurantDetails();
    fetchChefDetails();
    fetchOrders();

    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <complexKot.Provider
      value={{
        restaurantId,
        chefId,
        restaurantDetails,
        restaurantDetailsStatus,
        chefDetails,
        chefDetailsStatus,
        orders,
        ordersStatus,
      }}
    >
      <Outlet />
    </complexKot.Provider>
  );
};

export default MainKotOne;


