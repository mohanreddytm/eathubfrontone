import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ComplexCustomer from '../../complexOneForCustomer';

const statusOne = {
  INITIAL:"INITIAL",
  LOADING:"LOADING",
  SUCCESS:"SUCCESS",
  FAILURE:"FAILURE"
}


const CustomerDashboardWrapper = ({ children }) => {
  const { restaurantId, tableId } = useParams();
  const [restaurantDetails, setRestaurantDetails] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [oneState, setOneState] = useState("Home")
  const [cartItems, setCartItems] = useState([]);
  const [tableName, setTableName] = useState("");
  const [menuItemsStatus, setMenuItemsStatus] = useState(statusOne.INITIAL)
  const [menuCategoris, seMenuCategoris] = useState([])
  const [orderId, setOrderId] = useState("");

  const [tableNameStatus, setTableNameStatus] = useState(statusOne.INITIAL)

  useEffect(() => {
    const fetchMenuItems = async () => {
      setMenuItemsStatus(statusOne.LOADING)
      const url = `https://eathubbackend-1.onrender.com/getMenuItems/${restaurantId}`;
      const res = await fetch(url);
      if (res.ok){
        setMenuItems(await res.json())
        setMenuItemsStatus(statusOne.SUCCESS)
      }else{
        setMenuItemsStatus(statusOne.FAILURE)
      }
    };

    const fetchRestaurantDetails = async () => {
      const url = `https://eathubbackend-1.onrender.com/restaurant/${restaurantId}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setRestaurantDetails(json[0].restaurentname);
      }
    };

    const fetchTableName = async () => {
      console.log("fetching table name", tableId)
      setTableNameStatus(statusOne.LOADING)
      const url = `https://eathubbackend-1.onrender.com/getTableName/${tableId}/`;
      const response = await fetch(url);
      if(response.ok){
        setTableNameStatus(statusOne.SUCCESS)
        const json = await response.json();
        if(json.length > 0){
          setTableName(json[0].name);
        }
      }else{
        setTableNameStatus(statusOne.FAILURE)
        const json = await response.json();
        console.log("error", json)
      }
    }

    const getMenuCategoris = async () => {
      const url = `https://eathubbackend-1.onrender.com/restaurant_details/getMenuCategory/${restaurantId}`;
      const response = await fetch(url);
      if(response.ok){
        const json = await response.json();
        seMenuCategoris(json)
      }
    }

    getMenuCategoris();

    fetchMenuItems();
    fetchRestaurantDetails();
    fetchTableName();
  }, [restaurantId]);

  const setOneCartItems = (newone) => {
    const isAlreadyOne = cartItems.filter(item => item.id == newone.id);
    if(isAlreadyOne.length > 0){
      setCartItems(prev => {
        return(
          prev.map(item => {
            if(item.id == newone.id){
              return {...item, quantity : item.quantity + 1};
            }
            return item;
          })
        ) 
      })
    }else{
      setCartItems(prev => [...prev, newone])
    }

  }

  const reduceCartItem = (one) => {
    // console.log(one)
    setCartItems(prev => {
      const quantity = prev.filter(each => each.id == one.id)[0].quantity;
      if(quantity == 1){
        return prev.filter(each => each.id != one.id);
      }

      return(
        prev.map(each => {
          if(each.id == one.id){
            return {...each, quantity: each.quantity - 1};
          }
          return each;
        })
      )
    })
  } 

  const clearCart = () => {
    setCartItems([]);
  }

  const updateOrderId = (id) => {
    console.log("updating order id", id)
    setOrderId(id);
  }

  const updateCurrentState = (one) => {
    setOneState(one);
  }

  return (
    <ComplexCustomer.Provider value={{
      restaurantId,
      tableId,
      restaurantName: restaurantDetails,
      menuItems,
      currentSection: oneState,
      setCurrentSection: updateCurrentState,
      cartItems,
      updateCartItems:setOneCartItems,
      tableName,
      reduceCartItem,
      clearCart,
      menuItemsStatus,
      menuCategoris,
      orderId,
      updateOrderId,
      tableNameStatus
    }}>
      {children}
    </ComplexCustomer.Provider>
  );
};

export default CustomerDashboardWrapper;
