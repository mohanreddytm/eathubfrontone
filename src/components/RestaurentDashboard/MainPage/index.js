import React from 'react'
import { useState, useEffect } from 'react'
import { FaLocationDot, FaIndianRupeeSign } from "react-icons/fa6";
import { FaCaretDown, FaAngleDown,FaRegBell , gleDoubleUp, FaThumbsUp, FaThumbsDown, FaRegCommentDots  } from "react-icons/fa";
import { CiHome } from "react-icons/ci";
import { BiSolidDish,BiFoodMenu } from "react-icons/bi"
import { FaAnglesLeft, FaAnglesRight  } from "react-icons/fa6";

import { MdOutlineTableRestaurant } from "react-icons/md";
import { GiLaptop } from "react-icons/gi";
import { IoMdPeople } from "react-icons/io";
import { RiReservedLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import error from '../../../images/error.jpg'
import Lottie from "lottie-react";

import orderReceived from '../orderReceived.json'

import MenuPage from '../Menu'

import './index.css'
import { useTheme } from '../../../contexts/ThemeContext'

import { useNavigate } from 'react-router-dom'

import Dashboard from '../Dashboard';
import Tables from '../Tables';
import Orders from '../Orders';
import WaiterRequest from '../WaiterRequest/index';
import POSPage from '../POS';
import Staff from '../Staff';
import Reservation from '../Reservation';
import Payment from '../Payment';
import Profile from '../Profile';
import Help from '../Help';
import Settings from '../Settings';

import {jwtDecode} from 'jwt-decode';

import Header from '../Header';

import AllInOne from '../../../complexOne/index'

import Footer from '../Footer'
import StaffChat from '../StaffChat'


import cookies from 'js-cookie'
import { preconnect } from 'react-dom';



const MenuItmes = [
  { id:1,
    content:<><CiHome className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Dashboard</h1> </>,

  },
  {
    id:2,
    content:<><BiSolidDish className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Orders</h1> </>,
  },
  {
    id:3,
    content:<><BiFoodMenu className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Menu</h1></>
  },
  {
    id:4,
    content:<><MdOutlineTableRestaurant className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Tables</h1></>
  },{
    id:5,
    content:<><FaRegBell className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Waiter Requests</h1></>
  },
  {
    id:6,
    content:<><GiLaptop className='menu-logos' /> <h1 className='dash-m-menu-items-head'>POS</h1></>
  },
  {
    id:7,
    content:<><IoMdPeople className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Staff</h1></>
  },{
    id:8,
    content:<><RiReservedLine className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Reservations</h1></>
  },{
    id:9,
    content:<><FaIndianRupeeSign className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Payments</h1></>
  },{
    id:10,
    content:<><IoSettingsOutline className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Settings</h1></>
  },{
    id:13,
    content:<><FaRegCommentDots className='menu-logos' /> <h1 className='dash-m-menu-items-head'>Messages</h1></>
  }
]

const statusOne = {
  INITIAL: "INITIAL",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  PENDING: "PENDING",
}

const API_BASE_URL = 'https://eathubbackend-1.onrender.com';



const RestaurantDashboard = () => {

  const navigate = useNavigate();
  const { setTheme } = useTheme();


    const [restaurantData, setRestaurantData] = useState('');
    const [dataStatus, setDataStatus] = useState(statusOne.INITIAL);
    const [userId, setUserId] = useState('');
    const [accountStatus, setAccountStatus] = useState({ isActive: true, isSuspended: false }); // Track account status 
    const [menuCategories, setMenuCategories] = useState('');
    const [menuCategoriesStatus, setMenuCategoriesStatus] = useState(statusOne.INITIAL);
    const [currentMenu, setCurrentMenu] = useState(1);
    const [menuData, setMenuData] = useState('');
    const [menuDataStatus, setMenuDataStatus] = useState(statusOne.INITIAL);
    const [tablesData, setTablesData] = useState('');
    const [tablesDataStatus, setTablesDataStatus] = useState(statusOne.INITIAL);
    const [areasData, setAreasData] = useState('');
    const [areasDataStatus, setAreasDataStatus] = useState(statusOne.INITIAL);
    const [openAddMenuForPOSInMenuPage, setOpenAddMenuForPOSInMenuPage] = useState(false);

    const [orders, setOrders] = useState([]);
    const [staffData, setStaffData] = useState([]);

    const [clickedOrder, setClickedOrder] = useState(null);
    const [staffStatus, setStaffStatus] = useState(statusOne.INITIAL);

    const [showMenu, setShowMenu] = useState(true);

    const [ordersStatus, setOrdersStatus] = useState(statusOne.INITIAL);

    const [newOrderReceived, setNewOrderReceived] = useState(false);

    // Call Waiter popup state
    const [showCallWaiterPopup, setShowCallWaiterPopup] = useState(false);
    const [availableWaiters, setAvailableWaiters] = useState([]);
    const [waitersLoading, setWaitersLoading] = useState(false);
    const [waitersError, setWaitersError] = useState('');
    const [selectedWaiterId, setSelectedWaiterId] = useState(null);


    const [updateNow, setUpdateNow] = useState(false);

    useEffect(() => {
      const one = setInterval(() => setUpdateNow(!updateNow), 10000);
      console.log("herer erererer")
      return () => clearInterval(one);
    }, [updateNow])

    useEffect(() => {
      if(newOrderReceived){
        const timeOut = setTimeout(() => (setNewOrderReceived(false)), 5000);
        return () => clearTimeout(timeOut);
      }
    } ,[newOrderReceived])

    useEffect(() => {
      const token = cookies.get('t_user');
      if(token === undefined){
        navigate('/login')
      }
    }, [navigate])

    const updateOrdersStatus = () => {
      setUpdateNow(!updateNow);
    }

    const sayHiOne = (data) => {
      const getTablesData = async () => {
        data.map(async each => {
            const getTablesDataInside = async () => {
                try{
                    const url = `https://eathubbackend-1.onrender.com/getTables/${each.id}`;
                    const response = await fetch(url);
                    if(response.ok){
                        const jsonOne = await response.json();
                        setTablesData(prev => [...prev, {
                            name: each.area_name,
                            tables: jsonOne
                        }]);
                        setTablesDataStatus(statusOne.SUCCESS);
                    }else{
                        setTablesDataStatus(statusOne.FAILED);
                    }
                }
                catch(error){
                    setTablesDataStatus(statusOne.FAILED);
                }
            }
            getTablesDataInside();
        })
      }
      getTablesData();
    }
  
  
    useEffect(() => 
    {
      const token = cookies.get("t_user");
      if(!token){
        navigate('/login')
      }
      setDataStatus(statusOne.PENDING);

      const data = jwtDecode(token);
      const restaurantId = data.userId;
      setUserId(restaurantId);
      const getRestaurantData = async () => {
        try{
          setDataStatus(statusOne.PENDING);
          const url  = `${API_BASE_URL}/restaurant/${restaurantId}`
          const response = await fetch(url);
    
          if(response.ok){
            const jsonOne = await response.json();
            const restaurantInfo = jsonOne[0];
            setRestaurantData(restaurantInfo);

            // Check account status
            const isActive = restaurantInfo.is_active !== false; // Default to true if not set
            const isSuspended = restaurantInfo.is_suspended === true;
            setAccountStatus({ isActive, isSuspended });

            setDataStatus(statusOne.SUCCESS);
            
            // Fetch and apply theme preference
            try {
              const themeResponse = await fetch(`${API_BASE_URL}/getDisplaySettings/${restaurantId}`);
              if (themeResponse.ok) {
                const themeData = await themeResponse.json();
                if (themeData.settings && themeData.settings.theme) {
                  setTheme(themeData.settings.theme);
                }
              }
            } catch (themeError) {
              console.error('Error fetching theme:', themeError);
            }
          }else{
            setDataStatus(statusOne.FAILED);
            // console.log('failed')
          }
        }
        catch(error){
          setDataStatus(statusOne.FAILED);
          // console.log('failed')
        }
      }
      getRestaurantData()

      const getMenuCategories = async () => {
        try{
          setMenuCategoriesStatus(statusOne.PENDING);
          const url = `${API_BASE_URL}/restaurant_details/getMenuCategory/${restaurantId}`;
          const response = await fetch(url);
          if(response.ok){
            const jsonOne = await response.json();
            console.log("menu categories x - old", jsonOne);
            setMenuCategories(jsonOne);
            setMenuCategoriesStatus(statusOne.SUCCESS);
          }else{
            setMenuCategoriesStatus(statusOne.FAILED);
          }
        }
        catch(error){
          setMenuCategoriesStatus(statusOne.FAILED);
        }
      }

      getMenuCategories();

    const fetchStaffDetails = async () => {
        setStaffStatus(statusOne.LOADING);
        try{
          const url = `${API_BASE_URL}/restaurant_details/getStaff/${restaurantId}`;
          const response = await fetch(url);
          if(response.ok){
              const data = await response.json();
              console.log(data)
              setStaffData(data.staff);
              setStaffStatus(statusOne.SUCCESS);
          }else{
              console.log('Failed to fetch staff details');
              setStaffStatus(statusOne.ERROR);
          }
        }catch(error){
          console.error('Error fetching staff details:', error);
          setStaffStatus(statusOne.ERROR);
        }
    }
    fetchStaffDetails();

      const getMenuData = async () => {
        try{
          setMenuDataStatus(statusOne.PENDING);
          const url = `${API_BASE_URL}/getMenuItems/${restaurantId}`;
          const response = await fetch(url);
          if(response.ok){
            const jsonOne = await response.json();
            setMenuData(jsonOne);
            setMenuDataStatus(statusOne.SUCCESS);
          }else{
            setMenuDataStatus(statusOne.FAILED);
          }
        } 
        catch(error){
          setMenuDataStatus(statusOne.FAILED);
        }
      }
      getMenuData();

      
      const fetchOrders = async () => {
        setOrdersStatus(statusOne.PENDING);
        try{
          const response = await fetch(`${API_BASE_URL}/getOrderRestaurant/${restaurantId}`)
          if(response.ok){
              const data = await response.json()
              console.log(data.order)
              setOrders(data.order)
              setOrdersStatus(statusOne.SUCCESS)
          }else{
            setOrdersStatus(statusOne.FAILED);
              console.log("Failed to fetch orders")
          }
        }catch(e){
          setOrdersStatus(statusOne.FAILED);
        }
      }
      fetchOrders();


      const getAreasData = async () => {
        try{
          setAreasDataStatus(statusOne.PENDING);
          const url = `${API_BASE_URL}/getAreas/${restaurantId}`;
          const response = await fetch(url);
          if(response.ok){
            const jsonOne = await response.json();
            sayHiOne(jsonOne);
            setAreasData(jsonOne);
            setAreasDataStatus(statusOne.SUCCESS);
          }else{
            setAreasDataStatus(statusOne.FAILED);
          }
        }
        catch(error){
          setAreasDataStatus(statusOne.FAILED);
        }
      }
      getAreasData();

    }, [])

    // Play notification sound
    const playNotificationSound = () => {
      try {
        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set sound properties (pleasant notification beep)
        oscillator.frequency.value = 800; // Higher pitch
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    };

    useEffect(() => {
      const fetchOrders = async () => {
        // setOrdersStatus(statusOne.PENDING);
        try{
          console.log(userId)
          const response = await fetch(`${API_BASE_URL}/getOrderRestaurant/${userId}`)
          if(response.ok){
              const data = await response.json()
              console.log(data.order)
              
              // Check if new order received
              const previousOrdersCount = orders.length;
              const newOrdersCount = data.order.length;
              
              if(previousOrdersCount < newOrdersCount){
                setNewOrderReceived(true)
                playNotificationSound(); // Play sound for new order
              }
              
              // Check if any order status changed
              if(previousOrdersCount > 0 && newOrdersCount > 0) {
                const statusChanged = data.order.some(newOrder => {
                  const oldOrder = orders.find(o => o.id === newOrder.id);
                  if(oldOrder && oldOrder.order_status !== newOrder.order_status) {
                    return true;
                  }
                  return false;
                });
                if(statusChanged) {
                  playNotificationSound(); // Play sound for status change
                }
              }
              
              setOrders(data.order)
              setOrdersStatus(statusOne.SUCCESS)
          }else{
            setOrdersStatus(statusOne.FAILED);
              console.log("Failed to fetch orders")
          }
        }catch(error){
          setOrdersStatus(statusOne.FAILED);
          console.error('Error fetching orders:', error);
        }
      }
      fetchOrders()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateNow])

    const dupeMenuCategory = (item) => {
      const newCategory = {
        id: item.menu_category_id,
        menu_category_name: item.menu_category_name,
        item_count:0
      };
      setMenuCategories(prevCategories => [...prevCategories, newCategory]);
    }
  

    const dupeAddMenuFun = (newItem) => {
      const convinceItem = {
        id: newItem.item_id,
        item_name: newItem.item_name,
        price: newItem.item_price,
        category_name: newItem.category_name,
        item_category: newItem.item_category,
        item_dec: newItem.item_dec,
        preparation_time: newItem.item_preparation_time,
        availability: newItem.item_availabiliy,
        image_url: newItem.item_url,
        menu_category_id: newItem.item_menu_category_id,
        restaurant_id: newItem.restaurant_id,
      }
      setMenuData(prevData => [...prevData, convinceItem]);
      setMenuDataStatus(statusOne.SUCCESS);
      setMenuCategories(prevCategories => {
        return prevCategories.map(each => {
          if(each.id === newItem.item_menu_category_id){
            return {
              ...each,
              item_count: JSON.parse(each.item_count) + 1
            }
          }
          return each;
        })
      })
    }

    const addArea = (one) => {
      const newArea = {
        id: one.area_id,
        area_name: one.area_name,
        restaurant_id: one.restaurant_id
      };
      setAreasData(prev => [...prev, newArea]);

      setTablesData(prev => [...prev, {name: one.area_name, tables: []}]);
    }

    const deleteArea = (id) => {
      setAreasData(prev => prev.filter(area => area.id !== id));
      const areaName = areasData.filter(each => each.id === id)[0].area_name;
      console.log(areaName);
      setTablesData(prev => prev.filter(table => table.name !== areaName));
    }

    const dupeUpdateMenuItem = (item, one) => {
      setMenuData(prevData => prevData.map(menuItem => menuItem.id === item.id ? item : menuItem));
      setMenuDataStatus(statusOne.SUCCESS);

      if(item.menu_category_id !== one){
        setMenuCategories(prevCategories => {
          return prevCategories.map(each => {
            if(each.id === item.menu_category_id){
              return {...each, item_count : JSON.parse(each.item_count) + 1}
            }
            else if(each.id === one){
              return {...each, item_count : JSON.parse(each.item_count) - 1}
            }
            else{
              return each;
            }
          })
        } )
      }
    }

    const updateMenuCategory = (updatedCategory) => {
      setMenuData(prevData => {
        return prevData.map(menuItem => {
          if(menuItem.menu_category_id === updatedCategory.id){
            return {...menuItem, category_name: updatedCategory.menu_category_name}
          }
          return menuItem;
        })
      });
      setMenuCategories(prevCategories => {
        return prevCategories.map(each => {
          if(each.id === updatedCategory.id){
            return {...each, menu_category_name: updatedCategory.menu_category_name}
          }
          return each;
        })
      })
    }

    const dupeDeleteMenuItem = (one, two) => {
      setMenuData(prevData => prevData.filter(menuItem => menuItem.id !== one));
      console.log(menuCategories)
      setMenuCategories(prevCategories => {
        return prevCategories.map(each => {
          if(each.id === two){
            return {...each, item_count : JSON.parse(each.item_count) - 1}
          }
          return each;
        })
      })
    }


    const onClickRetry = () => {
      setDataStatus(statusOne.PENDING);
      const getRestaurantData = async () => {
        try{
          const url = `https://eathubbackend-1.onrender.com/restaurant/${userId}`;
          const response = await fetch(url);
          if(response.ok){
            const jsonOne = await response.json();
            setRestaurantData(jsonOne[0]);
            setDataStatus(statusOne.SUCCESS);
          }else{
            setDataStatus(statusOne.FAILED);
          }
        }
        catch(error){
          setDataStatus(statusOne.FAILED);
        }
        }
      getRestaurantData();
    }

    const deleteTable = (id) => {
      setTablesData(prev => {
        return prev.map(each => {
          return {
            ...each,
            tables: each.tables.filter(table => table.id !== id)
          }
        })
      })
    }

    const deleteMenuCategory = (id) => {
      setMenuData(prevData => prevData.filter(menuItem => menuItem.menu_category_id !== id));
      setMenuCategories(prevCategories => prevCategories.filter(category => category.id !== id));
    }

    const addTableFromOne = (one) => {
      const areaname = areasData.filter(each => each.id === one.area_id)[0].area_name;
      const newTableData = {
        id: one.table_id,
        name: one.table_name,
        seat_capacity: one.table_capacity,
        area_id: one.area_id,
        restaurant_id: userId,
        is_active: one.table_status
      }

      console.log("area anem" , areaname)
      setTablesData((prev) => {
        return (prev || []).map(each => {
          if(each.name === areaname){
            return {...each, tables: [...each.tables, newTableData]};
          }
          return each;
        })
      })
    } 

    const addMenuInPOS = () =>{
      setCurrentMenu(3);
      setOpenAddMenuForPOSInMenuPage(true);
    } 

    const updateArea = (one, onEditAreaOldName) => {
      setTablesData(prev => {
        return prev.map(each => {
          if(each.name === onEditAreaOldName){
            return {...each, name: one.area_name}
          }
          return each;
        })
      })
      setAreasData(prev => {
        return prev.map(each => {
          if(each.id === one.area_id){
            return {...each, area_name: one.area_name}
          }
          return each;
        })
      })
    }

  const updateTable = (one, oldArea) => {

    if(one.area_id === oldArea){
      const updatedOne = tablesData.map(each => {
        return {
          ...each,
          tables: each.tables.map(table => {
            if (table.id === one.table_id) {
                return {
                  ...table,
                  name: one.table_name,
                  is_active: one.table_status,
                  seat_capacity: one.table_capacity
                };
            }
            return table;
          })
        };
      });
      setTablesData(updatedOne);
    }else{
      const oldAreaName = areasData.filter(each => each.id === oldArea)[0].area_name;
      // console.log(oldAreaName)
      const updatedTablesData = tablesData.map(area => {
        if (area.name === oldAreaName) {
          return {
            ...area,
            tables: area.tables.filter(table => table.id !== one.table_id)
          };
        }
        return area;
      });
      setTablesData(updatedTablesData);
      console.log('fnasdfnlaknl')
      console.log(one.area_id)
      const newAreaName = areasData.filter(each => each.id === one.area_id)[0].area_name;
      const newOne = {
        id:one.table_id,
        name: one.table_name,
        seat_capacity: one.table_capacity,
        restaurant_id:one.restaurant_id,
        is_active:one.table_status,
        area_id:one.area_id
      }
      setTablesData(prev => {
        return prev.map(each => {
          if(each.name === newAreaName){
            return{
              ...each,
              tables: [...each.tables, newOne]
            }
          }
          return each;
        })
      })
    }
  };

  const putStaffData = (data) => {
    setStaffData(data);
  }

  const updateCurrentMenu = (one) => {
    setCurrentMenu(one);
  }

    const onChangeTheMenuAddOne = (one) => {
        setOpenAddMenuForPOSInMenuPage(one);
    }

  const updateClickedOrder = (order) => {
    console.log(order)
    setClickedOrder(order);
  }

  // Fetch available waiters for Call Waiter popup
  const openCallWaiterPopup = async () => {
    if (!userId) {
      setWaitersError('Restaurant information not loaded yet.');
      setShowCallWaiterPopup(true);
      return;
    }

    setShowCallWaiterPopup(true);
    setWaitersLoading(true);
    setWaitersError('');
    setSelectedWaiterId(null);

    try {
      const res = await fetch(`https://eathubbackend-1.onrender.com/getWaitersWithStatus/${userId}`);
      if (!res.ok) {
        setWaitersError('Failed to load waiters. Please try again.');
        setAvailableWaiters([]);
        return;
      }

      const data = await res.json();
      const waiters = Array.isArray(data.waiters) ? data.waiters : [];

      // Show all waiters; status text will indicate availability
      setAvailableWaiters(waiters);
    } catch (error) {
      console.error('Error fetching waiters for popup:', error);
      setWaitersError('Something went wrong. Please check your connection.');
      setAvailableWaiters([]);
    } finally {
      setWaitersLoading(false);
    }
  };

  const closeCallWaiterPopup = () => {
    setShowCallWaiterPopup(false);
    setAvailableWaiters([]);
    setSelectedWaiterId(null);
    setWaitersError('');
  };

  const confirmCallWaiter = async () => {
    if (!selectedWaiterId) {
      return;
    }
    const selected = availableWaiters.find(w => w.id === selectedWaiterId);
    if (!selected) {
      return;
    }

    try {
      const callId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${selectedWaiterId}`;
      const payload = {
        id: callId,
        restaurant_id: userId,
        waiter_id: selected.id,
        waiter_name: selected.name,
        admin_id: userId,
        admin_name: restaurantData ? restaurantData.name : null,
        message: 'Admin is calling you to the counter.'
      };

      const res = await fetch('https://eathubbackend-1.onrender.com/createAdminCall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Successfully created admin call; close popup and let UI update via polling
        closeCallWaiterPopup();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to call waiter:', err);
      }
    } catch (error) {
      console.error('Error creating admin call:', error);
    }
  };

    // Check if account is inactive or suspended - show message and block access
    if(dataStatus === statusOne.SUCCESS && (!accountStatus.isActive || accountStatus.isSuspended)) {
      return (
        <div className='dash-initial-cont dash-error-cont' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: '#f5f5f5'}}>
          <div style={{textAlign: 'center', maxWidth: '600px', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>
              {!accountStatus.isActive ? '🚫' : '⛔'}
            </div>
            <h1 style={{fontSize: '32px', color: '#e74c3c', marginBottom: '20px', fontWeight: 'bold'}}>
              {!accountStatus.isActive ? 'Account Inactive' : 'Account Suspended'}
            </h1>
            <p style={{fontSize: '18px', color: '#555', marginBottom: '30px', lineHeight: '1.6'}}>
              {!accountStatus.isActive 
                ? 'Your restaurant account is currently inactive. Please contact customer care to proceed with account activation.'
                : 'Your restaurant account has been suspended. Please contact customer care to resolve this issue and proceed further.'}
            </p>
            <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px', marginBottom: '20px'}}>
              <p style={{fontSize: '16px', color: '#333', marginBottom: '10px', fontWeight: '600'}}>Contact Customer Care:</p>
              <p style={{fontSize: '16px', color: '#667eea', margin: '5px 0'}}>📧 Email: support@eathub.com</p>
              <p style={{fontSize: '16px', color: '#667eea', margin: '5px 0'}}>📞 Phone: +1-800-EATHUB</p>
            </div>
            <button 
              type='button' 
              onClick={() => {
                cookies.remove('t_user');
                navigate('/login');
              }} 
              style={{
                marginTop: '10px',
                padding: '12px 30px',
                fontSize: '16px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#5568d3'}
              onMouseOut={(e) => e.target.style.background = '#667eea'}
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }

    if(dataStatus === statusOne.FAILED){
        return(
          <div className='dash-initial-cont dash-error-cont'>
            <h1 className='dash-error-head'>ERR<span className='dash-error-head-o'>O</span>R</h1>
            <img src={error} alt="error" className='dash-error-img' />
            <p className='dash-error-p'>Something went wrong. Please Check Your Internect Connection.</p>
            <button type='button' onClick={onClickRetry} className='dash-error-button'>Retry</button>
          </div>
        )
      }

      const mainBox = () => {
        if(currentMenu === 1){
          return <Dashboard />
        }else if(currentMenu === 2){
          return <Orders />
        }else if(currentMenu === 3){
          return <MenuPage />
        }else if(currentMenu === 4){
          return <Tables />
        }else if(currentMenu === 5){
          return <WaiterRequest />
        }else if(currentMenu === 6){
          return <POSPage />
        }else if(currentMenu === 7){
          return <Staff />
        }else if(currentMenu === 8){
          return <Reservation />
        }else if(currentMenu === 9){
          return <Payment />
        }else if(currentMenu === 10){
          return <Settings />
        }else if(currentMenu === 11){
          return <Profile />
        }else if(currentMenu === 12){
          return <Help />
        }else if(currentMenu === 13){
          return <StaffChat />
        }
        return <Dashboard />

      }

  return (
    <AllInOne.Provider value = {{userId, clickedOrder, updateClickedOrder,staffData, updateOrdersStatus, staffDataStatus: staffStatus, currentMenu,updateCurrentMenu , newOrderReceived, ordersStatus, orders ,addMenuInPOS, fncOpenAddMenuForPOSInMenuPage:onChangeTheMenuAddOne, openAddMenuForPOSInMenuPage, restaurantDetails: restaurantData, menuData, menuDataStatus, tablesData, tablesDataStatus, areasData, areasDataStatus, menuCategories, menuCategoriesStatus, addingMenuFun: dupeAddMenuFun, updateMenuItem: dupeUpdateMenuItem, deleteMenuItem: dupeDeleteMenuItem, addMenuCategory:dupeMenuCategory, updateMenuCategory, deleteMenuCategory, addTable:addTableFromOne, updateTable, deleteTable, addArea, deleteArea, updateArea }}>
      <div className='dash-initial-cont'>
        <Header />
        {(dataStatus === statusOne.PENDING || menuDataStatus === statusOne.PENDING || tablesDataStatus === statusOne.PENDING || areasDataStatus === statusOne.PENDING) && (
          <div className='dash-header-loading-cont'>
            <div className='dash-header-loading-bar'>
              <div className='dash-header-loading-segment dash-header-loading-data' style={{width: dataStatus === statusOne.SUCCESS ? '25%' : '0%'}}></div>
              <div className='dash-header-loading-segment dash-header-loading-menu' style={{width: menuDataStatus === statusOne.SUCCESS ? '25%' : '0%'}}></div>
              <div className='dash-header-loading-segment dash-header-loading-tables' style={{width: tablesDataStatus === statusOne.SUCCESS ? '25%' : '0%'}}></div>
              <div className='dash-header-loading-segment dash-header-loading-areas' style={{width: areasDataStatus === statusOne.SUCCESS ? '25%' : '0%'}}></div>
            </div>
          </div>
        )}

        <div className='dash-m-main-c'>
          <div className={`dash-m-menu-main ${showMenu === false ? "menu-move-aside" : "menu-move-to-open"}`}>
            <p className={`close-one-menu  ${showMenu === false && "menu-show-outside"}`} onClick={() => setShowMenu(!showMenu)}><FaAnglesLeft  /> <p> Close</p></p>
            <div className='dash-m-menu-c'>
              {/* <div className='dash-m-menu-list-branch-one-only'>
                <button type='button' className='dash-m-menu-branch-one'><FaLocationDot /> Kurnool <FaCaretDown /> </button>
              </div> */}
              <ul className='dash-m-menu-list'>
                {MenuItmes.map(each => (
                  <li key={each.id} onClick={() => setCurrentMenu(each.id) } className={`dash-m-menu-items ${each.id === currentMenu ? "dash-current-one" : "dash-m-menu-items"}`}>
                    {each.content}
                  </li>
                ) )}
              </ul>
              <div className='dash-m-left-call-waiter-one'>
                <button type='button' onClick={openCallWaiterPopup}>Call Waiter</button>
              </div>
            </div>
          </div>
          {showMenu === false &&  <p onClick={() => setShowMenu(true)} className='outside-menu-bar-open'><p>Open</p><FaAnglesRight   /></p>
          }

          {newOrderReceived &&
            <div className='new-order-notificaiton'>
              <Lottie className='animation-right' animationData={orderReceived} loop={false} />
              <p>New Order Received</p>
            </div>
            }

          {mainBox()}

          {showCallWaiterPopup && (
            <div className='call-waiter-popup-overlay'>
              <div className='call-waiter-popup-card'>
                <div className='call-waiter-popup-header'>
                  <h2>Select Available Waiter</h2>
                  <button
                    type='button'
                    className='call-waiter-close-btn'
                    onClick={closeCallWaiterPopup}
                  >
                    ×
                  </button>
                </div>
                <div className='call-waiter-popup-body'>
                  {waitersLoading && (
                    <p className='call-waiter-info-text'>Loading waiters...</p>
                  )}
                  {!waitersLoading && waitersError && (
                    <p className='call-waiter-error-text'>{waitersError}</p>
                  )}
                  {!waitersLoading && !waitersError && availableWaiters.length === 0 && (
                    <p className='call-waiter-info-text'>
                      No available waiters right now.
                    </p>
                  )}
                  {!waitersLoading && !waitersError && availableWaiters.length > 0 && (
                    <ul className='call-waiter-waiter-list'>
                      {availableWaiters.map(waiter => (
                        <li
                          key={waiter.id}
                          className={`call-waiter-waiter-item ${
                            (waiter.status || '').toLowerCase().includes('busy') ||
                            (waiter.status || '').toLowerCase().includes('serving')
                              ? 'busy'
                              : 'available'
                          } ${selectedWaiterId === waiter.id ? 'selected' : ''}`}
                          onClick={() => setSelectedWaiterId(waiter.id)}
                        >
                          <span className='call-waiter-waiter-name'>{waiter.name}</span>
                          <span className='call-waiter-waiter-meta'>
                            {waiter.status || 'Available'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className='call-waiter-popup-footer'>
                  <button
                    type='button'
                    className='call-waiter-cancel-btn'
                    onClick={closeCallWaiterPopup}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className='call-waiter-confirm-btn'
                    onClick={confirmCallWaiter}
                    disabled={!selectedWaiterId}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        <Footer currentMenu={currentMenu} />
      </div>
    </AllInOne.Provider>

  )
}

export default RestaurantDashboard
