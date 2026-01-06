import ComplexCustomer from '../../../complexOneForCustomer';
import { FaCartArrowDown } from "react-icons/fa";
import { useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../ThemeToggle';

import './index.css'

const HeaderMini = () => {
    const {restaurantName, tableId, restaurantId, cartItems} = useContext(ComplexCustomer)
    const navigate = useNavigate()
    return (
        <div className='customer-main-title-cont'>
            <h1 className='customer-main-title'><span>A</span>{restaurantName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ThemeToggle />
                <div className='cart-item-logo-cont'>
                    <FaCartArrowDown onClick={() => navigate(`/customerDashboard/${tableId}/${restaurantId}/cart`)} />
                    <p>{cartItems.length}</p>
                </div>
            </div>
      </div>
    )
}

export default HeaderMini