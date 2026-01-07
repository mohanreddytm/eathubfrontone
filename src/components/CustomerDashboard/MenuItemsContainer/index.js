import ComplexCustomer from "../../../complexOneForCustomer";

import { useContext, useState, useEffect } from "react";
import './index.css'
import noImageFood from '../../../images/serving-dish_3651752.png'
import { MdAccessTime } from "react-icons/md";

import veg from '../../../images/veg.png'
import nonveg from '../../../images/nonveg.png'
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {PulseLoader} from 'react-spinners'

const MenuItemsContainer = (props) => {


    const navigate = useNavigate();

    const {filteredMenuItems} = props;
    // console.log(filteredMenuItems)
    const {updateCartItems, cartItems, reduceCartItem, menuItemsStatus} = useContext(ComplexCustomer);
    // console.log(cartItems)



    const onClickMenuItem = (item) => {
        const cartItem = {
            id:item.id,
            cart_item_image: item.image_url,
            cart_item_category: item.item_category,
            cart_item_name: item.item_name,
            cart_item_price: item.price,
            quantity: 1
        }

        updateCartItems(cartItem);
    }


    return (
        <ul className="customar-menu-items">
            {menuItemsStatus === "LOADING" && <div className="loading-cus-cont">
                <p className="loading-one">Loading</p><PulseLoader

                color="#952a88" size={10} />
                </div> }

            {menuItemsStatus === "FAILURE" && 
                <div className="no-food-items-available-cont failure-view-menu-items-cus">
                    <p><FaExclamationTriangle /> Something Went Wrong</p>
                    <button onClick={() => navigate(0)}>Retry</button>
                </div>}
            {filteredMenuItems.length === 0 && menuItemsStatus === "SUCCESS" && 
                <div className="no-food-items-available-cont">
                    <FaExclamationTriangle />
                    <p>Sorry, No Food Items Available</p>
                </div>}

            
            {filteredMenuItems.length > 0 && menuItemsStatus === "SUCCESS" && filteredMenuItems.map(item => (
                <li key={item.id}>
                    {item.item_category === "veg" && <img className="veg-icon-top" alt="veg" src={veg} /> }
                    {item.item_category === "non-veg" && <img className="veg-icon-top" src={nonveg} alt="non veg" />}
                    <div className="customar-menu-content-top-one">
                        <div className="customar-menu-left-content">
                            <h1 className="customar-menu-item-name">{item.item_name}</h1>
                            <p className="customar-menu-item-desc">{item.item_dec}</p>
                            <div className="customer-menu-time-cont">
                                <p className="preparation-time"><MdAccessTime />{item.preparation_time} m</p>
                                {/* <p className="preparation-time">{item.category_name}</p>
                                <p className="preparation-time">{item.item_category}</p> */}
                            </div>

                        </div>
                        {item.image_url == "" ? 
                        <div className="customar-no-image-cont">
                            <img src={noImageFood} alt="empty image" />
                        </div> : <img src={item.image_url} alt="food item"/>}
                    </div>
                    <div className="customar-menu-content-bottom-one">
                        <p className="price-value">₹{item.price}</p>
                        {cartItems.filter(one => item.id == one.id).length == 1 ? <div className="customer-add-item-button add-sub-items-quantityt"> <FaMinus onClick={() => reduceCartItem(item)} /> <p>{cartItems.filter(one => item.id == one.id)[0].quantity}</p> <FaPlus onClick={() => updateCartItems(item)} /> </div> : <button onClick={() => onClickMenuItem(item)} className="customer-add-item-button">Add Item</button>}
                    </div>


                </li>
            ))}

        </ul>
    )
}

export default MenuItemsContainer
