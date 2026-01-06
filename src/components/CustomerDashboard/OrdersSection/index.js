import Footer from "../Footer"
import { FaCartArrowDown } from "react-icons/fa";
import ComplexCustomer from '../../../complexOneForCustomer';

import EmptyOrder from '../../../images/emptyorder.jpg'
import HeaderMini from '../HeaderMini'
import { useContext } from "react";

import { useNavigate } from "react-router-dom";
import './index.css'


const Orders = () => {
    const navigate = useNavigate()
    const {restaurantName, setCurrentSection, tableId, restaurantId} = useContext(ComplexCustomer)  
    // console.log("restaurantName",restaurantId)

    const emptyOrders = () => {
        return(
                
                <div className="main-order-content-con">
                    <div className="orders-empty-cont">
                        <img src={EmptyOrder} />
                        <h1>No Orders Found</h1>
                        <button>Explore Food Items</button>
                    </div>
                </div>
            
        )
    }

    const onClickLoginInOrders = () => {
        setCurrentSection("Profile");
        navigate(`/customerDashboard/${tableId}/${restaurantId}/profile`)
    }

    const loginRequried = () => {
        return(
            <div className="main-order-content-con">
                    <div className="orders-empty-cont">
                        <img src={EmptyOrder} />
                        <h1>Please Login To See Your Previous Orders</h1>
                        <button onClick={onClickLoginInOrders}>Login</button>
                    </div>
                </div>
        )
    }
    return(
        <div className="orders-initial-cont">
            <HeaderMini />
            <h1 className="main-orders-head">Orders</h1>
            {loginRequried()}
            <Footer />
        </div>
    )
}

export default Orders;