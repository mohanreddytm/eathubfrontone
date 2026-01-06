import React, { use } from 'react'

import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom'
import complexWaiter from '../../complexWaiter'

import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const statusOne = {
  INITIAl:"INITIAL",
  PENDING:"PENDING",
  SUCCESS:"SUCCESS",
  FAILURE:"FAILURE"
}



const MainWaiterOne = () => {
    const navigate = useNavigate();
    const [restaurantId, setRestaurantId] = useState('');
    const [waiterId, setWaiterId] = useState('');

    const [restaurantDetails, setRestaurantDetails] = useState('');
    const [restaurantDetailsStatus, setRestaurantDetailsStatus] = useState(statusOne.INITIAl);

    const [waiterDetails, setWaiterDetails] = useState('');
    const [waiterDetailsStatus,setWaiterDetailsStatus] = useState(statusOne.INITIAl);

    const [areas, setAreas] = useState([])
    const [areasStatus, setAreasStatus] = useState(statusOne.INITIAl);

    const [tables, setTables] = useState([])
    const [tablesStatus, setTablesStatus] = useState(statusOne.INITIAl);

    const [orders, setOrders] = useState([]);
    const [ordersStatus, setOrdersStatus] = useState(statusOne.INITIAl);

    // Admin call state
    const [adminCalls, setAdminCalls] = useState([]);
    const [adminCallsStatus, setAdminCallsStatus] = useState(statusOne.INITIAl);


    useEffect(() => {
      const token = Cookies.get("w_user");
      if(!token){
        navigate("/login")
        return;
      }

      const decodedToken = jwtDecode(token);
      const waiterId = decodedToken.userId;
      const restaurantId = decodedToken.restaurantId;
      setWaiterId(waiterId);
      setRestaurantId(restaurantId);

      const fetchOrdersDetails = async() => 
      {
        setOrdersStatus(statusOne.PENDING)
        // Fetch orders assigned to this specific waiter
        const url = `http://localhost:8000/getOrdersWaiter/${waiterId}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            setOrdersStatus(statusOne.SUCCESS);
            const json = await res.json();
            // Parse items if they are JSON strings
            const ordersWithParsedItems = json.order.map(order => ({
              ...order,
              items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
            }));
            setOrders(ordersWithParsedItems);
          }else{
            setOrdersStatus(statusOne.FAILURE);
            setOrders([]);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          setOrdersStatus(statusOne.FAILURE);
          setOrders([]);
        }
      }

      fetchOrdersDetails()

      const fetchRestaurantDetails = async () => {
        setRestaurantDetailsStatus(statusOne.PENDING);
        const url = `https://ttbackone-v48h.onrender.com/restaurant/${restaurantId}`;
        const res = await fetch(url);
        if (res.ok) {
          setRestaurantDetailsStatus(statusOne.SUCCESS);
          const json = await res.json();
          setRestaurantDetails(json[0]);
        }else{
          setRestaurantDetailsStatus(statusOne.FAILURE);
        }
      };

      fetchRestaurantDetails();

      const fetchWaiterDetails = async () => {
        setWaiterDetailsStatus(statusOne.PENDING)
        const url = `http://localhost:8000/waiterDetailsRestaurant/${waiterId}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            setWaiterDetailsStatus(statusOne.SUCCESS)
            const json = await res.json();
            // API returns { waiter: [...] }, so get first item from waiter array
            setWaiterDetails(json.waiter && json.waiter.length > 0 ? json.waiter[0] : null);
          }else{
            setWaiterDetailsStatus(statusOne.FAILURE)
            console.log("not getting waiter details")
          }
        } catch (error) {
          console.error("Error fetching waiter details:", error);
          setWaiterDetailsStatus(statusOne.FAILURE);
        }
      }



      fetchWaiterDetails()

      const fetchAreas = async () => {
        setAreasStatus(statusOne.PENDING)
        try {
          const res = await fetch(`https://ttbackone-v48h.onrender.com/getAreas/${restaurantId}`);
          if(res.ok){
            const json = await res.json();
            const areasData = Array.isArray(json) ? json : [];
            setAreas(areasData)
            setAreasStatus(statusOne.SUCCESS)
            console.log('Areas loaded:', areasData)
            
            // After areas are loaded, fetch tables for each area
            if(areasData.length > 0) {
              fetchTablesForAreas(areasData);
            } else {
              setTablesStatus(statusOne.SUCCESS);
              setTables([]);
            }
          }else{
            setAreasStatus(statusOne.FAILURE)
            setAreas([])
            setTablesStatus(statusOne.FAILURE);
            setTables([]);
          }
        } catch (error) {
          console.error("Error fetching areas:", error);
          setAreasStatus(statusOne.FAILURE)
          setAreas([])
          setTablesStatus(statusOne.FAILURE);
          setTables([]);
        }
      }

      const fetchTablesForAreas = async (areasData) => {
        setTablesStatus(statusOne.PENDING);
        try {
          const allTables = [];
          
          // Fetch tables for each area
          const tablePromises = areasData.map(async (area) => {
            try {
              const tablesRes = await fetch(`https://ttbackone-v48h.onrender.com/getTables/${area.id}`);
              if(tablesRes.ok) {
                const tables = await tablesRes.json();
                return Array.isArray(tables) ? tables : [];
              }
              return [];
            } catch (error) {
              console.error(`Error fetching tables for area ${area.id}:`, error);
              return [];
            }
          });
          
          const tablesArrays = await Promise.all(tablePromises);
          tablesArrays.forEach(tables => {
            if(Array.isArray(tables)) {
              allTables.push(...tables);
            }
          });
          
          setTables(allTables);
          setTablesStatus(statusOne.SUCCESS);
          console.log('Tables loaded:', allTables);
        } catch (error) {
          console.error("Error fetching tables:", error);
          setTablesStatus(statusOne.FAILURE);
          setTables([]);
        }
      }

      fetchAreas()

      // Poll for admin calls for this waiter
      const pollAdminCalls = async () => {
        if (!waiterId) {
          return;
        }
        try {
          setAdminCallsStatus(statusOne.PENDING);
          const res = await fetch(`http://localhost:8000/getPendingAdminCallsWaiter/${waiterId}`);
          if (res.ok) {
            const json = await res.json();
            setAdminCalls(Array.isArray(json.calls) ? json.calls : []);
            setAdminCallsStatus(statusOne.SUCCESS);
          } else {
            setAdminCalls([]);
            setAdminCallsStatus(statusOne.FAILURE);
          }
        } catch (error) {
          console.error("Error fetching admin calls:", error);
          setAdminCalls([]);
          setAdminCallsStatus(statusOne.FAILURE);
        }
      };

      pollAdminCalls();
      const intervalId = setInterval(pollAdminCalls, 10000);

      return () => {
        clearInterval(intervalId);
      };
      
    }, [])





  return (
    <complexWaiter.Provider value={{restaurantId
    ,areas
    , tables
    , waiterId
    , restaurantDetails
    , waiterDetails,
    restaurantDetailsStatus,
    waiterDetailsStatus,
    areasStatus,
    tablesStatus,
    orders,
    ordersStatus,
    adminCalls,
    adminCallsStatus
    }}>
      <Outlet />
    </complexWaiter.Provider>
  )
}

export default MainWaiterOne
