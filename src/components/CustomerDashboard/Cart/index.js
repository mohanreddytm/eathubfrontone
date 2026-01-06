import { useContext, useState, useEffect } from 'react'
import ComplexCustomer from '../../../complexOneForCustomer'
import emptyone from '../../../images/empytplate.jpg'
import './index.css'
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom'
import { FaMinus, FaPlus } from "react-icons/fa";

import EmptyImage from '../../../images/noimage.png'
import { v4 as uuidv4 } from 'uuid';
import { addCustomerOrder } from '../../../utils/customerOrdersStorage';


const Cart = () => {
    const {restaurantName, menuItems,updateOrderId, tableId, restaurantId, setCurrentSection, updateCartItems, cartItems, reduceCartItem, tableName, clearCart} = useContext(ComplexCustomer);
    const navigate = useNavigate();

    // console.log(cartItems)

    const [menuItemsSub, setMenuItemsSub] = useState([]);
    const [isNoteOne, setIsNoteOne] = useState(false)

    const [isOrderConfirm, setIsOrderConfirm] = useState(false)

    useEffect(()=> {
        const one = new Set(cartItems.map(x => x.id));
        const filteredOne = menuItems.filter(item => !one.has(item.id));
        setMenuItemsSub(filteredOne)
    }, [menuItems, cartItems])

    const onClickGotoHome = () => 
    {
        navigate(`/customerDashboard/${tableId}/${restaurantId}/home`)
        setCurrentSection("Home")
    }


    const emptyCartView = () => {
        return(
            <div className='empty-cart-cont'>
                <img src={emptyone} alt='No Cart Item' />
                <p>Empty Plate. Add Food Items</p>
                <button onClick={onClickGotoHome}>Go to Home</button>
            </div>
        )
    }

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

    const onClickOrder = async () => {
        const url = "http://localhost:8000/addNewOrder"
        const orderOne = {
                id:uuidv4(),
                table_id:tableId,
                restaurant_id:restaurantId,
                items:JSON.stringify(cartItems),
                total_price:cartItems.reduce((sum, item) => sum + item.cart_item_price * item.quantity, 0),
                status:"Pending",
                order_status:"KOT",
                table_name:tableName
            };
        const options = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(orderOne)
        }

        const response = await fetch(url, options)
        if(response.ok){
            const responseData = await response.json();
            console.log("order added", responseData)

            // Store order ID in localStorage for customer tracking
            addCustomerOrder(orderOne.id);

            // Clear the cart after successful order
            clearCart();

            updateOrderId(orderOne.id)
            localStorage.setItem("orderId", orderOne.id);
            setIsOrderConfirm(true)
            navigate(`/customerDashboard/${tableId}/${restaurantId}/orderDetails`);
        }else{
            console.log("order failed")
        }
    }

    return(

        <div className='cart-initial-cont'>
            <div className='customer-main-title-cont'>
                <h1 className='customer-main-title'><span>A</span>{restaurantName}</h1>
            </div>
            <h1 className='cart-main-head'><FaArrowLeftLong onClick={() => navigate(-1)} />Mega Plate</h1>

            {cartItems.length > 0 ?
            <>
                <div>
                    <ul className='cart-items-cont'>
                    {cartItems.map(item => (
                    <li>
                        <img src={item.cart_item_image ? item.cart_item_image : EmptyImage} alt='Item Image' />
                        <div className='cart-item-content-cont'>
                            <div className='cart-item-one-cont'>
                                <h1>{item.cart_item_name}</h1>
                                <p>₹{item.cart_item_price * item.quantity}</p>
                            </div>
                            <div className='cart-item-two-cont'>
                                <p className='qantity-one-cart-item'>Qty:</p>
                                <div className="add-sub-items-quantityt"> <FaMinus onClick={() => reduceCartItem(item)} /> <p>{cartItems.filter(one => item.id == one.id)[0].quantity}</p> <FaPlus onClick={() => updateCartItems(item)} /> </div>
                            </div>

                    </div>
                </li>
                    ))}
            </ul>
            <div className='add-item-cont-cart'>
                <button onClick={onClickGotoHome} className='add-cart-item-button'>+ Add Item</button>
                <button onClick={() => setIsNoteOne(true)} className='note-for-cart-items'>Note</button>

            </div>
            {isNoteOne &&
            
                <div className='addon-of-cart-one add-node-cont'>
                    <h1>Add Note</h1>
                    <input type='text' className='note-input-cart' placeholder='Enter Node: Ex: Spicyyyyyyy.....' />
                    <button className='add-note-button-cart'>Add note</button>
                    <p onClick={() => setIsNoteOne(false)}>x</p>
                </div>  
            
            }

            <div className='addon-of-cart-one'>
                <h1>
                    Did you miss Something !
                </h1>
                <ul>
                    {menuItemsSub.length > 0 && menuItemsSub.map(each => 
                    {
                        return(
                            <li>
                                <img src={each.image_url ? each.image_url : EmptyImage} />
                                <h1>{each.item_name}</h1>
                                <p>₹{each.price}</p>
                                <FaPlus onClick={() => onClickMenuItem(each)} className='add-item-from-miss-some' />
                            </li>
                        )
                    }
                )}
                </ul>
            </div>
            </div>
                <div className='cart-amount-cont'>
                <h1>Order Summary</h1>
                <p className='cart-amount-items-count'>Items({cartItems.length})</p>
                <div>
                    <p>Sub Total</p>
                    <p>{cartItems.reduce((sum, item) => sum + item.cart_item_price * item.quantity, 0)}</p>
                </div>
                <div>
                    <p>GST</p>
                    <p>₹21</p>

                </div>
                <div>
                    <p>Service Charge</p>
                    <p>₹16</p>
                </div>
                <p className='cart-amount-grand-total'>Total: <span>₹{cartItems.reduce((sum, item) => sum + item.cart_item_price * item.quantity, 0) + 21 + 16}</span></p>
            </div>
            <div className='cart-order-cont'>
                <div className='cart-order-table-cont'>
                    <p>Table Name</p>
                    <h1>{tableName}</h1>
                </div>

                <button onClick={onClickOrder}>Order</button>
            </div>
            </>
             : emptyCartView()}


        </div>
    )
}

export default Cart