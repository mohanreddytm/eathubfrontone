import React, { useEffect, useContext, useState, useRef } from "react";
import './index.css';
import AllInOne  from "../../../complexOne";
import noImage from '../../../images/noimage.png'
import waiterlogo from '../../../images/waiter.png';
import { BiError } from "react-icons/bi";
import orderReceived from '../orderReceived.json'

import Lottie from "lottie-react";
import { CiMemoPad } from "react-icons/ci";
import { GiConfirmed } from "react-icons/gi";
import { PiCookingPotFill } from "react-icons/pi";
import { BiSolidDish } from "react-icons/bi";

import { FaArrowRightLong } from "react-icons/fa6";
import { v4 as uuidv4 } from 'uuid';


import { MdNoteAlt, MdDiscount, MdDeleteForever } from "react-icons/md";
const POSPage = () => {

    const {tablesData, updateOrdersStatus, menuData, menuCategories, userId, addMenuInPOS, staffData, clickedOrder} = useContext(AllInOne);
    const [menuDataInPOS, setMenuDataInPOS] = useState([]);

    // Play notification sound function
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

    // console.log("waiters one : ", staffData)

    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [order, setOrder] = useState([]);

    const [showSelectedOne, setShowSelectedOne] = useState("all");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [showSelectTable, setShowSelectTable] = useState(false);
    const [showAssignPopup, setShowAssignPopup] = useState(false);
    const [orderItems, setOrderItems] = useState([]);

    const [selectedWaiter, setSelectedWaiter] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);

    const [madeForItemsError, setMadeForItemsError] = useState(false);

    const [isOpenNoteOne, setIsOpenNoteOne] = useState(false);
    const [noteText, setNoteText] = useState('');

    const [kotClicked, setKotClicked] = useState(false);
    const [showKotSuccess, setShowKotSuccess] = useState(false);

    const [isOpenPopupDiscount, setIsOpenPopupDiscount] = useState(false);
    const [finalDiscountNumber, setFinalDiscountNumber] = useState('');
    const [finalDiscountType, setFinalDiscountType] = useState('Percentage');
    
    const [isOpenPopupTax, setIsOpenPopupTax] = useState(false);
    const [finalTaxNumber, setFinalTaxNumber] = useState('');
    const [finalTaxType, setFinalTaxType] = useState('Percentage');

    useEffect(() => {
        if(menuData.length > 0){
            const one = menuData.filter(item => item.availability === "Yes");
            setMenuDataInPOS(one);
        }
    }, [menuData]);

    // Auto-hide success message after 2 seconds
    useEffect(() => {
        if(showKotSuccess) {
            const timer = setTimeout(() => {
                setShowKotSuccess(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showKotSuccess]);


    const onClickItem = (item) => {
        const requiredDetails = {
            id: item.id,
            name: item.item_name,
            price: item.price,
            quantity: 1
        }
        const isItemAlreadyInOrder = orderItems.some(orderItem => orderItem.id === item.id);    
        if(isItemAlreadyInOrder){
            setOrderItems(orderItems.map(orderItem => orderItem.id === item.id ? {...orderItem, quantity: orderItem.quantity + 1} : orderItem));
        }else{
            setOrderItems([...orderItems, requiredDetails]);
        }
    }

    const onClickDeleteItem = (id) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    }

    const onClickResetBtn = () => {
        setSearch('');
        setShowSelectedOne('all');
    }

    const onClickWaiter = (waiter) => {
        setSelectedWaiter(waiter);
        setShowAssignPopup(false);
    }

    const assignPopup = () => {
        const waitersData = staffData.filter(staff => staff.role.toLowerCase().includes("waiter"));
        return (
            <div className={`select-table-popup-in-pos ${showAssignPopup ? "show-table-popup-one" : ""}`}>
                <div className="select-table-popup-content select-waiter-popup-addone">
                    <h1 className="main-head-select-tables">Assign Waiter</h1>
                    <ul className="select-table-popup-list-assign-waiter">
                        {waitersData.map((waiter) => (
                            <li onClick={() => onClickWaiter(waiter)} key={waiter.id}>
                                <img src={waiterlogo} alt="waiter" />
                                {waiter.name}
                                 <p>- {waiter.status}</p>
                            </li>
                        ))}
                    </ul>
                    <button className="select-table-popup-cancel-button" onClick={() => setShowAssignPopup(false)}>Cancel</button>
                </div>
            </div>
        )
    }

    const onClickTable = (table) => {
        setSelectedTable(table);
        setShowSelectTable(false)
    }

    const selectTablePopUp = () => {
        return <div className={`select-table-popup-in-pos ${showSelectTable ? "show-table-popup-one" : ""}`}>
            <div className="select-table-popup-content">
                <h1 className="main-head-select-tables">Select Table</h1>
                <ul className="select-table-popup-list">
                    {tablesData.length > 0 && tablesData.map((each) => (
                        each.tables.length > 0 && <li key={each.name}>
                            <h1 className="main-head-select-tables-inner">{each.name} - {each.tables.length}</h1>
                            <ul className="select-table-popup-list-inner">
                                {each.tables.map((table) => (
                                    <li onClick={() => onClickTable(table)} key={table.id}>
                                        <h1 className="main-head-select-tables-inner">{table.name}</h1>
                                        <p className="main-head-select-tables-inner-seat-capacity"><span>{table.seat_capacity}</span> Seats</p>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
                <button className="select-table-popup-cancel-button" onClick={() => setShowSelectTable(false)}>Cancel</button>
            </div>
        </div>
    }

    const onClickApplyDiscount = (a,b) => {
        setFinalDiscountNumber(a)
        setFinalDiscountType(b)
        setIsOpenPopupDiscount(false)
    }

    const onClickApplyTax = (a,b) => {
        setFinalTaxNumber(a)
        setFinalTaxType(b)
        setIsOpenPopupTax(false)
    }

    const DiscountFuc = () => 
    {
        const [discountNumber, setDiscountNumber] = useState("");
        const [discountType, setDiscountType] = useState("Percentage");
        return (
            <div className={`discount-popup ${isOpenPopupDiscount ? "show-table-popup-one" : ""}`}>
                <div className="discount-popup-content">
                    <h1>Discount</h1>
                    <p>Apply a discount code to get a special offer!</p>
                    <div>
                        <input value={discountNumber} onChange={(e) => setDiscountNumber(e.target.value)} className="discount-input" type="number" placeholder="Enter discount amount"  />
                        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="discount-select">
                            <option id="percentage">Percentage</option>
                            <option id="fixed-amount">Fixed Amount</option>
                        </select>
                    </div>
                    <div className="discount-popup-actions">
                        <button onClick={() => setIsOpenPopupDiscount(false)} className="discount-cancel-button">Cancel</button>
                        <button onClick={() => onClickApplyDiscount(discountNumber, discountType)} className="discount-apply-button">Apply</button>
                    </div>

                </div>

            </div>
        )
    }

    const TaxFuc = () => 
    {
        const [taxNumber, setTaxNumber] = useState("");
        const [taxType, setTaxType] = useState("Percentage");
        return (
            <div className={`discount-popup tax-popup ${isOpenPopupTax ? "show-table-popup-one" : ""}`}>
                <div className="discount-popup-content">
                    <h1>Tax Settings</h1>
                    <p>Configure tax for this order!</p>
                    <div>
                        <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className="discount-input" type="number" placeholder="Enter tax amount"  />
                        <select value={taxType} onChange={(e) => setTaxType(e.target.value)} className="discount-select">
                            <option id="percentage">Percentage</option>
                            <option id="fixed-amount">Fixed Amount</option>
                        </select>
                    </div>
                    <div className="discount-popup-actions">
                        <button onClick={() => setIsOpenPopupTax(false)} className="discount-cancel-button">Cancel</button>
                        <button onClick={() => onClickApplyTax(taxNumber, taxType)} className="discount-apply-button">Apply</button>
                    </div>

                </div>

            </div>
        )
    }


    useEffect(() => {
        if(menuData.length > 0) {
            const filteredOne = menuData.filter(item => {
                const isAvailable = item.availability === "Yes";
                const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase());
                const filterName = showSelectedOne === "all" || item.menu_category_id === showSelectedOne;
                return isAvailable && matchesSearch && filterName;
            });
            setMenuDataInPOS(filteredOne);
        }
    }, [showSelectedOne, menuData, search]);


    const onClickMinusMenuItem = (id) => {
        return () => {
            setOrderItems(orderItems.map(item => item.id === id ? {...item, quantity: Math.max(1, item.quantity - 1)} : item));


        }
    }

    const onClickPlusMenuItem = (id) => {
        return () => {
            setOrderItems(orderItems.map(item => item.id === id ? {...item, quantity: item.quantity + 1} : item));
        }
    }

    const onClickAssignTable = () => {
        setShowSelectTable(true);
    }

    const onClickKot = async () => {
        if(orderItems.length === 0){
            if(!madeForItemsError){
                setMadeForItemsError(true)
            }
            return;
        }
        
        if(kotClicked) return; // Prevent multiple clicks
        
        setMadeForItemsError(false);
        setKotClicked(true);
        
        try {
            const url = "https://eathubbackend-1.onrender.com/addNewOrder";
            const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            // Calculate discount
            const discount = finalDiscountType === "Percentage" && finalDiscountNumber
                ? subtotal * parseFloat(finalDiscountNumber) / 100
                : finalDiscountType === "Fixed Amount" && finalDiscountNumber
                ? parseFloat(finalDiscountNumber)
                : 0;
            
            // Calculate tax
            const tax = finalTaxType === "Percentage" && finalTaxNumber
                ? subtotal * parseFloat(finalTaxNumber) / 100
                : finalTaxType === "Fixed Amount" && finalTaxNumber
                ? parseFloat(finalTaxNumber)
                : 0;
            
            const orderItem = {
                id: uuidv4(),
                table_id: selectedTable ? selectedTable.id : null,
                restaurant_id: userId,
                items: JSON.stringify(orderItems),
                total_price: subtotal,
                discount_amount: discount > 0 ? discount.toString() : null,
                tax_amount: tax > 0 ? tax.toString() : null,
                status: "Pending",
                order_status: "KOT",
                table_name: selectedTable ? selectedTable.name : null,
                customer_name: null,
                waiter_name: selectedWaiter ? selectedWaiter.name : null,
                note: noteText || null,
                waiter_id: selectedWaiter ? selectedWaiter.id : null,
            };
            
            // console.log("order item : ", orderItem);
            
            const options = {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(orderItem)
            };

            const response = await fetch(url, options);
            
            if(response.ok){
                const responseData = await response.json();
                // console.log("Order created successfully:", responseData);
                
                // Play notification sound for POS order
                playNotificationSound();
                
                // Update table status if table is selected
                if(selectedTable && selectedTable.id){
                    try {
                        const tableOptions = {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json"
                            },
                            body: JSON.stringify({tableId: selectedTable.id, status: "use"})
                        };
                        const tableResponse = await fetch("https://eathubbackend-1.onrender.com/restaurant_details/updatedTableStatus", tableOptions);
                        if(tableResponse.ok){
                            console.log("Table status updated successfully");
                        }
                    } catch (tableError) {
                        console.error("Error updating table status:", tableError);
                    }
                }

                // Show success message
                setShowKotSuccess(true);
                
                // Reset form after 1 second
                setTimeout(() => {
                    setOrderItems([]);
                    setSelectedTable(null);
                    setSelectedWaiter(null);
                    setDiscountAmount(0);
                    setNoteText('');
                    setFinalDiscountNumber('');
                    setFinalDiscountType('Percentage');
                    setFinalTaxNumber('');
                    setFinalTaxType('Percentage');
                    setIsOpenNoteOne(false);
                    setMadeForItemsError(false);
                    setKotClicked(false);
                    updateOrdersStatus();
                }, 1000);
                
            } else {
                const errorData = await response.json();
                console.error("Order creation failed:", errorData);
                setKotClicked(false);
                alert(`Failed to create order: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error creating order:", error);
            setKotClicked(false);
            alert("Failed to create order. Please check your connection and try again.");
        }
    }

    const onClickMoveToStatusOne =  async (status) => {
        try{
            const newStatus = status === "Pending" ? "Confirmed" : status === "Confirmed" ? "Preparing" : status === "Preparing" ? "Ready" : "";
            const url = `https://eathubbackend-1.onrender.com/updateStatus/${clickedOrder.id}/${newStatus}`;
            const response = await fetch(url, {
                method: "PUT",
            });
            if(response.ok){
                console.log("Order status updated successfully");
                window.location.reload(false);
                // setClickedOrder({...clickedOrder, status: newStatus});
                // updateOrdersStatus();
            }else{
                const errorData = await response.json();
                console.error("Failed to update order status:", errorData);
                alert("Failed to update order status. Please check your connection and try again.");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update order status. Please check your connection and try again.");
        }
    }


        const posEditOrder = () => {
            // console.log("clickedOrder - one : ", clickedOrder);
            return(
                <div className="pos-page-main-cont-two">
                {/* need to do for the width adapt */}
                <h1 className="pos-page-main-cont-two-h1">Order #{clickedOrder.order_number}</h1>
                <div className="pos-page-main-cont-two-h1-two" >
                        <button onClick={onClickAssignTable} className="pos-page-main-cont-two-h1-two-button">{clickedOrder.table_name === null ? "Assign Table" : clickedOrder.table_name}</button>
                        <div className="tooltip-container">
                        <MdNoteAlt onClick={() => setIsOpenNoteOne(true)} className="pos-page-main-cont-two-h1-two-button-icon"  />
                        <span className="tooltip">note</span>
                    </div>
                    <button className="pos-page-main-cont-two-h1-two-button-two" onClick={() => setShowAssignPopup(true)}>{clickedOrder.waiter_name === null ? "Assign Waiter" : clickedOrder.waiter_name}</button>
                    <div className={`pos-page-main-cont-two-note-cont ${isOpenNoteOne ? 'open-note-input-one' : ''}`}>
                        <input type="text" placeholder="Enter Note Here" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                        <button>Add Note</button>
                        <p onClick={() => setIsOpenNoteOne(false)}>x</p>
                    </div>
                </div>
                <div className="pos-page-main-cont-two-set-order-status">
                    <h1>Set Order Status</h1>

                        <ul>
                            <li className={clickedOrder.status === "Pending" ? "active-order-status" : ""}>
                                <CiMemoPad className="order-status-icon" />
                                <p>Order <br /> Pending</p>
                            </li>
                            <li className={clickedOrder.status === "Confirmed" ? "active-order-status" : ""}>
                                <GiConfirmed className="order-status-icon" />
                                <p>Order <br /> Confirmed</p>
                            </li>
                            <li className={clickedOrder.status === "Preparing" ? "active-order-status" : ""}>
                                <PiCookingPotFill className="order-status-icon" />
                                <p>Order <br /> Preparing</p>
                            </li>
                            <li className={clickedOrder.status === "Ready" ? "active-order-status" : ""}>
                                <BiSolidDish className="order-status-icon" />
                                <p>Order <br /> Ready</p>
                            </li>
                        </ul>
                    

                    <button className="move-to-confirmed-button" onClick={() => onClickMoveToStatusOne(clickedOrder.status)}>Move to - {clickedOrder.status === "Pending" ? "Confirmed" : clickedOrder.status === "Confirmed" ? "Preparing" : clickedOrder.status === "Preparing" ? "Ready" : ""} <FaArrowRightLong /></button>
                </div>
                <table className="pos-page-main-cont-two-table">
                    <thead >
                        <tr className="pos-page-main-cont-two-table-thead-tr">
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clickedOrder.items.map((item) => {
                            // console.log("item - one : ", item);
                            return(
                                <tr className="pos-page-main-cont-two-table-tbody-tr"  key={item.id}>
                                    <td><p className="pos-page-main-cont-two-table-tbody-tr-name">{item.cart_item_name}</p></td>
                                    <td><div className="pos-page-main-cont-two-table-tbody-tr-qty pos-edit-sp">
                                        {/* <p onClick={onClickMinusMenuItem(item.id)}>-</p> */}
                                        {item.quantity}
                                        {/* <p onClick={onClickPlusMenuItem(item.id)}>+</p> */}
                                        </div></td>
                                    <td>₹ {item.cart_item_price}</td>
                                    <td>₹ {item.cart_item_price * item.quantity}</td>
                                    <td><button onClick={() => onClickDeleteItem(item.id)} className="pos-page-main-cont-two-table-tbody-tr-button"><MdDeleteForever /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {clickedOrder.items.length === 0 && <div className={`pos-page-main-cont-two-table-tbody-div ${madeForItemsError ? 'blink-for-error' : ''}`}>
                    {madeForItemsError ?<p>Select an item from the menu <br/> to proceed with KOT</p>
                 :  <p>Please select an item to add <br/> to the order !</p>}
                </div>   }
 
                <div className="pos-page-main-cont-two-table-tbody">
                    <div className="pos-page-main-cont-two-table-tbody-button-cont-one">
                        <button onClick={() => setIsOpenPopupDiscount(true)} className="pos-page-main-cont-two-table-tbody-button"><MdDiscount /> Add Discount</button>
                        <button onClick={() => setIsOpenPopupTax(true)} className="pos-page-main-cont-two-table-tbody-button">Tax Mode</button>
                    </div>
                    <div>
                        <p>Item(s)</p>
                        <p>{clickedOrder.items.length}</p>
                    </div>
                    <div>
                        <p>Subtotal</p>
                        <p>₹ {clickedOrder.items.reduce((acc, item) => acc + (item.cart_item_price || item.price) * item.quantity, 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <p>Discount</p>
                        <p className="special-dicount-style"> - ₹ {(() => {
                            if (clickedOrder.discount_amount) {
                                const discount = typeof clickedOrder.discount_amount === 'string' 
                                    ? parseFloat(clickedOrder.discount_amount) 
                                    : clickedOrder.discount_amount;
                                return discount.toFixed(2);
                            }
                            return '0.00';
                        })()}</p>
                    </div>
                    <div>
                        <p>Tax</p>
                        <p>₹ {(() => {
                            const subtotal = clickedOrder.items.reduce((acc, item) => acc + (item.cart_item_price || item.price) * item.quantity, 0);
                            if (finalTaxNumber && finalTaxType === "Percentage") {
                                return (subtotal * parseFloat(finalTaxNumber) / 100).toFixed(2);
                            } else if (finalTaxNumber && finalTaxType === "Fixed Amount") {
                                return parseFloat(finalTaxNumber).toFixed(2);
                            } else if (clickedOrder.tax_amount) {
                                const tax = typeof clickedOrder.tax_amount === 'string' 
                                    ? parseFloat(clickedOrder.tax_amount) 
                                    : clickedOrder.tax_amount;
                                return tax.toFixed(2);
                            }
                            return '0.00';
                        })()}</p>
                    </div>
                    <div className="pos-page-main-cont-two-table-tbody-button-cont-two-total">
                        <p>Total</p>
                        <p>₹ {(() => {
                            const subtotal = clickedOrder.items.reduce((acc, item) => acc + (item.cart_item_price || item.price) * item.quantity, 0);
                            const discount = clickedOrder.discount_amount 
                                ? (typeof clickedOrder.discount_amount === 'string' 
                                    ? parseFloat(clickedOrder.discount_amount) 
                                    : clickedOrder.discount_amount)
                                : 0;
                            let tax = 0;
                            if (finalTaxNumber && finalTaxType === "Percentage") {
                                tax = subtotal * parseFloat(finalTaxNumber) / 100;
                            } else if (finalTaxNumber && finalTaxType === "Fixed Amount") {
                                tax = parseFloat(finalTaxNumber);
                            } else if (clickedOrder.tax_amount) {
                                tax = typeof clickedOrder.tax_amount === 'string' 
                                    ? parseFloat(clickedOrder.tax_amount) 
                                    : clickedOrder.tax_amount;
                            }
                            return (subtotal + tax - discount).toFixed(2);
                        })()}</p>
                    </div>
                </div>
                <div className="pos-edit-order-button-cont">
                    <button className="pos-edit-order-button-KOT">New KOT</button>
                    <button className="pos-edit-order-button-bill">BILL</button>
                    <button className="pos-edit-order-button-b-p">BILL & PRINT</button>
                    <button className="pos-edit-order-button-b-p2">BILL & PAYMENT</button>
                    <button className="pos-edit-order-button-delete">Delete Order</button>
                </div>
                

            </div>
            )

        }

        const posNewOrder = () => {
            return(
                <div className="pos-page-main-cont-two">
                {/* need to do for the width adapt */}
                <h1 className="pos-page-main-cont-two-h1">New Order</h1>
                {showKotSuccess && (
                    <div className="kot-success-message">
                        <p>KOT Generated Successfully!</p>
                    </div>
                )}
                <div className="pos-page-main-cont-two-h1-two" >
                        <button onClick={onClickAssignTable} className="pos-page-main-cont-two-h1-two-button">{selectedTable === null ? "Assign Table" : selectedTable.name}</button>
                        <div className="tooltip-container">
                        <MdNoteAlt onClick={() => setIsOpenNoteOne(true)} className="pos-page-main-cont-two-h1-two-button-icon"  />
                        <span className="tooltip">note</span>
                    </div>
                    <button className="pos-page-main-cont-two-h1-two-button-two" onClick={() => setShowAssignPopup(true)}>{selectedWaiter === null ? "Assign Waiter" : selectedWaiter.name}</button>
                    <div className={`pos-page-main-cont-two-note-cont ${isOpenNoteOne ? 'open-note-input-one' : ''}`}>
                        <input type="text" placeholder="Enter Note Here" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                        <button>Add Note</button>
                        <p onClick={() => setIsOpenNoteOne(false)}>x</p>
                    </div>
                </div>
                <table className="pos-page-main-cont-two-table">
                    <thead >
                        <tr className="pos-page-main-cont-two-table-thead-tr">
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item) => {
                            return(
                                <tr className="pos-page-main-cont-two-table-tbody-tr"  key={item.id}>
                                    <td><p className="pos-page-main-cont-two-table-tbody-tr-name">{item.name}</p></td>
                                    <td><div className="pos-page-main-cont-two-table-tbody-tr-qty">
                                        <p onClick={onClickMinusMenuItem(item.id)}>-</p>
                                        {item.quantity}
                                        <p onClick={onClickPlusMenuItem(item.id)}>+</p>
                                        </div></td>
                                    <td>₹ {item.price}</td>
                                    <td>₹ {item.price * item.quantity}</td>
                                    <td><button onClick={() => onClickDeleteItem(item.id)} className="pos-page-main-cont-two-table-tbody-tr-button"><MdDeleteForever /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {orderItems.length === 0 && <div className={`pos-page-main-cont-two-table-tbody-div ${madeForItemsError ? 'blink-for-error' : ''}`}>
                    {madeForItemsError ?<p>Select an item from the menu <br/> to proceed with KOT</p>
                 :  <p>Please select an item to add <br/> to the order !</p>}
                </div>   }
 
                <div className="pos-page-main-cont-two-table-tbody">
                    <div className="pos-page-main-cont-two-table-tbody-button-cont-one">
                        <button onClick={() => setIsOpenPopupDiscount(true)} className="pos-page-main-cont-two-table-tbody-button"><MdDiscount /> Add Discount</button>
                        <button onClick={() => setIsOpenPopupTax(true)} className="pos-page-main-cont-two-table-tbody-button">Tax Mode</button>
                    </div>
                    <div>
                        <p>Item(s)</p>
                        <p>{orderItems.length}</p>
                    </div>
                    <div>
                        <p>Subtotal</p>
                        <p>₹ {orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <p>Discount</p>
                        <p className="special-dicount-style"> - ₹ {(() => {
                            const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                            if (finalDiscountType === "Percentage" && finalDiscountNumber) {
                                return (subtotal * parseFloat(finalDiscountNumber) / 100).toFixed(2);
                            } else if (finalDiscountType === "Fixed Amount" && finalDiscountNumber) {
                                return parseFloat(finalDiscountNumber).toFixed(2);
                            }
                            return '0.00';
                        })()}</p>
                    </div>
                    <div>
                        <p>Tax</p>
                        <p>₹ {(() => {
                            const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                            if (finalTaxType === "Percentage" && finalTaxNumber) {
                                return (subtotal * parseFloat(finalTaxNumber) / 100).toFixed(2);
                            } else if (finalTaxType === "Fixed Amount" && finalTaxNumber) {
                                return parseFloat(finalTaxNumber).toFixed(2);
                            }
                            return '0.00';
                        })()}</p>
                    </div>
                    <div className="pos-page-main-cont-two-table-tbody-button-cont-two-total">
                        <p>Total</p>
                        <p>₹ {(() => {
                            const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                            const discount = finalDiscountType === "Percentage" && finalDiscountNumber
                                ? subtotal * parseFloat(finalDiscountNumber) / 100
                                : finalDiscountType === "Fixed Amount" && finalDiscountNumber
                                ? parseFloat(finalDiscountNumber)
                                : 0;
                            const tax = finalTaxType === "Percentage" && finalTaxNumber
                                ? subtotal * parseFloat(finalTaxNumber) / 100
                                : finalTaxType === "Fixed Amount" && finalTaxNumber
                                ? parseFloat(finalTaxNumber)
                                : 0;
                            return (subtotal + tax - discount).toFixed(2);
                        })()}</p>
                    </div>
                </div>
                
                <div className="pos-page-main-cont-two-table-tbody-button-cont">
                    <button onClick={onClickKot}>KOT</button>
                    <button>KOT & Print</button>
                    <button>KOT , Bill & Print</button>
                </div>
                <div className="pos-page-main-cont-two-table-tbody-button-cont-two">

                    <button className="pos-page-b-c-two">Bill & Print</button>
                    <button className="pos-page-b-c-one">Bill</button>
                    <button className="pos-page-b-c-two">Bill & Payment</button>

                </div>

            </div>
            )
        }

    const posMainOne = () => {
        if(clickedOrder != null){
            return posEditOrder();
        }
        
        return posNewOrder();
        
        
    }

    return (
        <div className="menu-page-main-cont pos-page-main-cont">
            {selectTablePopUp()}
            {assignPopup()}
            {DiscountFuc()}
            {TaxFuc()}
            <div className="pos-page-main-cont-one">
                <div className="pos-page-main-cont-one-search-cont">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search" className="pos-page-main-cont-one-search-input" />
                    <button type="button" className="pos-page-main-cont-one-search-button" onClick={onClickResetBtn}>Reset</button>
                </div>
                <ul className="pos-page-main-cont-one-search-ul">
                    <li onClick={() => setShowSelectedOne("all")} className={showSelectedOne === "all" ? "present-one" : ""}>Show All</li>
                    {menuCategories.length > 0 && menuCategories.map((category) => (
                        <li onClick={() => setShowSelectedOne(category.id)} className={showSelectedOne === category.id ? "present-one" : ""} key={category.id}>{category.menu_category_name}</li>
                    ))}
                </ul>
                <ul className="pos-page-main-cont-one-search-ul-two">
                    {menuDataInPOS.length > 0 ? menuDataInPOS.map((item) => {
                        let imageone = item.image_url;
                        if(!imageone){
                            imageone = noImage;
                        }
                        
                        return( 
                            <li key={item.id} onClick={() => onClickItem(item)}>
                                <img className="pos-page-main-cont-one-search-ul-img" src={imageone} alt={item.name} />
                                <h1 className="pos-page-main-cont-one-search-ul-h1">{item.item_name}</h1>
                                <p className="pos-page-main-cont-one-search-ul-p">₹ {item.price}</p>
                                <p className="pos-page-main-cont-one-search-ul-p-two">Add</p>
                            </li>
                        )
                    }): <div className="pos-page-main-cont-one-search-ul-no-items">
                            <h1>No Items Found</h1>
                            <button onClick={addMenuInPOS}>Add Item</button>
                        </div>
                        }      
                </ul>
            </div>
            
            {posMainOne()}
        </div>
    )
}

export default POSPage;
