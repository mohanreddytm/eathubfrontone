import React, { useEffect } from 'react'
import { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import Header from '../Header'
import { FaArrowRight } from "react-icons/fa";

import { BsQrCodeScan } from "react-icons/bs";
import { GrInsecure } from "react-icons/gr";
import { CgProfile } from "react-icons/cg";
import { HiCalculator } from "react-icons/hi2";
import { BsLayersFill } from "react-icons/bs";
import { HiTicket } from "react-icons/hi2";
import { IoIosPrint } from "react-icons/io";
import { TfiStatsUp } from "react-icons/tfi";
import { TiTick } from "react-icons/ti";
import { GoDash } from "react-icons/go";
import { FaRegCopyright } from "react-icons/fa6";
import { FaArrowUp } from "react-icons/fa";import { IoCloseOutline } from "react-icons/io5";


import Cookies from "js-cookie";

import resimage from '../../../images/restaurantmainimage.jpg'
import qrcodephoto from '../../../images/qrcodephoto.png'
import menuphoto from '../../../images/menuphoto.png'
import orders from '../../../images/orders.png'



import './index.css'

let pricingList = [
    {
        id:1,
        rates:[
            {name:"Inventory", isOk: 1},
            {name:"Menu", isOk: 1},
            {name:"Menu Item", isOk:1},
            {name:"Item Category", isOk:1},
            {name:"Area", isOk: 1},
            {name:"Table", isOk: 1},
            {name:"Reservation", isOk:1},
            {name:"KOT", isOk:1},
            {name:"Order", isOk: 1},
            {name:"Customer", isOk: 1},
            {name:"Staff", isOk:1},
            {name:"Payment", isOk:1},
            {name:"Report", isOk: 1},
            {name:"Settings", isOk: 1},
            {name:"Delivery Executive", isOk:1},
            {name:"Waiter Request", isOk:1},
            
            {name:"Expenses", isOk:1},
            {name:"Change Branch", isOk:0},
            {name:"Export Report", isOk: 0},
            {name:"Table Reservation", isOk: 0},
            {name:"Payment Gateway Integration", isOk:0},
            {name:"Theme Setting", isOk:0}
        ]
    },{
        id:2,
        rates:[
                        {name:"Inventory", isOk: 1},
            {name:"Menu", isOk: 1},
            {name:"Menu Item", isOk:1},
            {name:"Item Category", isOk:1},
            {name:"Area", isOk: 1},
            {name:"Table", isOk: 1},
            {name:"Reservation", isOk:1},
            {name:"KOT", isOk:1},
            {name:"Order", isOk: 1},
            {name:"Customer", isOk: 1},
            {name:"Staff", isOk:1},
            {name:"Payment", isOk:1},
            {name:"Report", isOk: 1},
            {name:"Settings", isOk: 1},
            {name:"Delivery Executive", isOk:1},
            {name:"Waiter Request", isOk:1},
            
            {name:"Expenses", isOk:1},
            {name:"Change Branch", isOk:1},
            {name:"Export Report", isOk:1},
            {name:"Table Reservation", isOk:1},
            {name:"Payment Gateway Integration", isOk:1},
            {name:"Theme Setting", isOk:1}
        ]
    }
]

const featuresList  = [
    {
        id:1,
        logo:<BsQrCodeScan className='home-main-features-item-logo' />,
        name:"QR code menu",
        desc:"Contactless Ordering Made Easy"
    },{
        id:2,
        logo:<GrInsecure className='home-main-features-item-logo' />,
        name:"Payment Gateway Integration",
        desc:"Fast, Secure, and Flexible Payments using Stripe and Razorpay"
    },{
        id:3,
        logo:<CgProfile className='home-main-features-item-logo' />,
        name:"Staff Management",
        desc:"Separate login for every staff role with different permissions."
    },{
        id:4,
        logo:<HiCalculator className='home-main-features-item-logo' />,
        name:"POS (Point of Sale)",
        desc:"Complete POS Integration"
    },{
        id:5,
        logo:<BsLayersFill className='home-main-features-item-logo' />,
        name:"Custom Floor Plans",
        desc:"Design Your Restaurant's Layout"
    },{
        id:6,
        logo:<HiTicket className='home-main-features-item-logo' />,
        name:"Kitchen Order Tickets (KOT)",
        desc:"Efficient Kitchen Workflow"
    },{
        id:7,
        logo:<IoIosPrint  className='home-main-features-item-logo' />,
        name:"Bill Printing",
        desc:"Quick and Accurate Billing"
    },{
        id:8,
        logo:<TfiStatsUp className='home-main-features-item-logo' />,
        name:"Reports",
        desc:"Data-Driven Decisions"
    }
]

const Home = () => {

    const [on, setOn] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("t_user");
        if (token) {
            navigate("/restaurantDashboard");
        }
    }, []);

    const [showQrDetail, setShowQrDetail] = useState(false);
    const [showMenuDetail, setShowMenuDetail] = useState(false);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [laptopView, setLaptopView] = useState(true);
    const [showAllPricing, setShowAllPricing] = useState(false);

    useEffect(() => {
        const checkWidth = () => {
            setLaptopView(window.innerWidth > 768)
        }

        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
  }, [])



    const onClickQrClose = () => {
        setShowQrDetail(false);
        setShowMenuDetail(false)
        setShowOrderDetail(false)
        document.body.style.overflow = 'auto';
    }

    const onClickViewDetailsQrCode = () => {
        setShowQrDetail(true);
        document.body.style.overflow = 'hidden';
    }

    const onClickMenuOne = () => {
        setShowMenuDetail(true);
        document.body.style.overflow = 'hidden';
    }

    const onClickOrderOne = () =>{
        setShowOrderDetail(true);
        document.body.style.overflow = 'hidden';
    }

    const orderDetails = () => {
        return (
            <div className={`home-detailed-infor-cont ${showOrderDetail ? "show-qr-details" : "hide-qr-details"}`}>

            <div className='home-detailed-inner-cont home-order-detailed-one'>
                <IoCloseOutline onClick={onClickQrClose} className='home-detailed-inner-into' />
                <h1 className='home-detailed-infor-main-head'><span>Statistics & Orders</span> – Track, Analyze, and Grow Smarter</h1>
                <p className='home-detailed-infor-desc'>Get complete visibility over your restaurant’s performance and customer behavior — all in one place.</p>
                <h1 className='home-detailed-infor-head'>Benefits</h1>
                <ul className='home-detailed-infor-first-list'>
                    <li>
                        Make data-driven decisions
                    </li>
                    <li>
                        Improve kitchen and staff performance
                    </li>
                    <li>
                        Spot trends early and adjust strategy
                    </li>
                    <li>
                        Maximize customer satisfaction and profits
                    </li>
                </ul>
                <div className='home-detailed-infor-cont-one'>
                    <div>
                        <h1 className='home-detailed-infor-head'>Order Management</h1>
                        <ul className='home-detailed-infor-second-list'>
                            <li><p><span >Live Order Tracking</span> <GoDash className='go-dash-detailed' /> Monitor every order from placement to delivery – dine-in, takeout, or delivery.</p></li>
                            <li><p><span >Order History & Reordering</span> <GoDash className='go-dash-detailed' /> Access detailed order logs with timestamps, table numbers, and item breakdowns.</p></li>
                            <li><p><span >Status Control</span> <GoDash className='go-dash-detailed' /> Update order statuses (e.g., Preparing, Ready to Serve, Completed) in real-time for better coordination between kitchen and staff.</p></li>
                            <li><p><span >Automatic Bill Generation</span> <GoDash className='go-dash-detailed' /> Orders are automatically calculated and billed – ready for instant payment or splitting.</p></li>
                        </ul>
                    </div>   
                    <div>
                        <h1 className='home-detailed-infor-head advanced-statistics'>Advanced Statistics</h1>
                        <ul className='home-detailed-infor-second-list'>
                            <li><p><span >Sales Dashboard</span> <GoDash className='go-dash-detailed' /> Visualize daily, weekly, and monthly sales trends at a glance.</p></li>
                            <li><p><span >Top-Selling Items</span> <GoDash className='go-dash-detailed' /> Identify your most popular dishes to plan inventory and marketing.</p></li>
                            <li><p><span >Table Turnover Rates</span> <GoDash className='go-dash-detailed' /> Identify your most popular dishes to plan inventory and marketing.</p></li>
                            <li><p><span >Peak Hours Insight</span> <GoDash className='go-dash-detailed' /> Know your busiest hours and days to prepare staffing and kitchen flow.</p></li>
                        </ul>
                    </div>       




                </div>
                    <div className='home-detailed-infor-button-cont'>
                    <button className='home-detailed-get-started-button'>Get Started</button>
                </div>

            </div>
            </div>
        )
    }


    const menuDetails = () => {
        return (
            <div className={`home-detailed-infor-cont ${showMenuDetail ? "show-qr-details" : "hide-qr-details"}`}>

            <div className='home-detailed-inner-cont'>
                <IoCloseOutline onClick={onClickQrClose} className='home-detailed-inner-into' />
                <h1 className='home-detailed-infor-main-head'><span>Menu Management</span> – Control Your Menu with Ease</h1>
                <p className='home-detailed-infor-desc'>Simplify and streamline how you manage your restaurant’s menu, all from one dashboard.</p>
                <h1 className='home-detailed-infor-head'>Benefits</h1>
                <ul className='home-detailed-infor-first-list'>
                    <li>
                        Save time with centralized control
                    </li>
                    <li>
                        Reduce order errors and confusion
                    </li>
                    <li>
                        Improve customer experience with clean, visual menus
                    </li>
                    <li>
                        React instantly to stock changes or specials
                    </li>
                </ul>
                <h1 className='home-detailed-infor-head'>Key Features</h1>
                <ul className='home-detailed-infor-second-list'>
                    <li><p><span className='menu-special-home-detail'>Real-Time Menu Updates</span> <GoDash className='go-dash-detailed' /> Add, remove, or edit dishes instantly — changes reflect across all customer devices in real-time.</p></li>
                    <li><p><span className='menu-special-home-detail'>Category-wise Organization</span> <GoDash className='go-dash-detailed' /> Organize items by category (starters, mains, desserts, beverages) for a smooth browsing experience.</p></li>
                    <li><p><span className='menu-special-home-detail'>Dynamic Availability</span> <GoDash className='go-dash-detailed' /> Mark items as available, unavailable, or out of stock anytime — no need to inform staff manually.</p></li>
                    <li><p><span className='menu-special-home-detail'>Custom Pricing & Variants</span> <GoDash className='go-dash-detailed' /> Set different prices for portion sizes, add-ons, or meal combos with ease.</p></li>
                    <li><p><span className='menu-special-home-detail'>Photos & Descriptions</span> <GoDash className='go-dash-detailed' /> Add high-quality images and descriptions to help customers choose better and faster.</p></li>
                </ul>
                  <div className='home-detailed-infor-button-cont'>
                    <button className='home-detailed-get-started-button'>Get Started</button>
                </div>

            </div>
            </div>
        )
    }

    const qrcodeDetails = () => {
        return (
            <div className={`home-detailed-infor-cont ${showQrDetail ? "show-qr-details" : "hide-qr-details"}`}>

            <div className='home-detailed-inner-cont'>
                <IoCloseOutline onClick={onClickQrClose} className='home-detailed-inner-into' />
                <h1 className='home-detailed-infor-main-head'><span>QR Code Table</span> Scanning – Fast, Contactless, and Smart</h1>
                <p className='home-detailed-infor-desc'>Upgrade your dining experience with the power of QR technology. Our app enables instant interactions between customers and tables through seamless scanning.</p>
                <h1 className='home-detailed-infor-head'>How It Works</h1>
                <ul className='home-detailed-infor-first-list'>
                    <li>
                        Each table has a unique QR code linked to its ID in the system.
                    </li>
                    <li>
                        Customers or staff simply scan the code using the in-app scanner or phone camera.
                    </li>
                    <li>
                        The app instantly pulls up the table’s details — status, orders, service requests, and more.
                    </li>
                </ul>
                <h1 className='home-detailed-infor-head'>Key Benefits</h1>
                <ul className='home-detailed-infor-second-list'>
                    <li><p><span>Contactless Interaction</span> <GoDash className='go-dash-detailed' /> No need to touch shared menus or devices.</p></li>
                    <li><p><span>Instant Access</span> <GoDash className='go-dash-detailed' /> View menu, order food, request service, or pay bills directly from your phone.</p></li>
                    <li><p><span>Smart Assignment</span> <GoDash className='go-dash-detailed' /> Staff can quickly identify and manage specific tables without confusion.</p></li>
                    <li><p><span>Speed & Accuracy</span> <GoDash className='go-dash-detailed' /> No manual input; reduces errors and saves time.</p></li>
                    <li><p><span>Hygienic and Modern</span> <GoDash className='go-dash-detailed' /> Perfect for post-COVID expectations and tech-savvy customers.</p></li>
                </ul>
                <h1 className='home-detailed-infor-head'>Secure & Unique:</h1>
                <p className='home-detailed-infor-last-desc'>Each QR code is securely mapped to its respective table. Codes are tamper-proof and can be reissued anytime.</p>
                <div className='home-detailed-infor-button-cont'>
                    <button className='home-detailed-get-started-button'>Get Started</button>
                </div>

            </div>
            </div>
        )
    }

  return (
    <div className='home-initial-cont'>
      <Header />
      <div className='home-main-cont'>
        <h1 id="home" className='home-main-head'>Smart Dining Starts Here – Track Your Table,<br/> Enjoy the Experience</h1>
        <p className='home-main-text'>Easily manage orders, menus, and tables in one place. Save time, reduce errors, and grow your business <br/> faster</p>
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <button className='start-trail-button'>Start 30 Days Trail <FaArrowRight className='home-right-arrow' /></button>
          <button 
            className='start-trail-button' 
            style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
            onClick={() => navigate('/superAdminLogin')}
          >
            Super Admin <FaArrowRight className='home-right-arrow' />
          </button>
        </div>
        <div className='home-res-cont'>
            <img className='res-image' alt='res image' src={resimage} />
            <div className='home-res-content-cont'>
                <h1 className='home-res-content-head'>Unique Features of TableTrack – Redefining Restaurant Experience</h1>
                <ul className='home-res-content-list-cont'>
                    <li>Live Table Status Sync</li>
                    <li>Smart Queue with Time Estimates</li>
                    <li>QR-Based Table Identification</li>
                    <li>Auto-Assign Tables for Efficiency</li>
                    <li>Customer Notifications & Alerts</li>
                </ul>
                <div className='home-res-button-cont'>
                    <p className='home-res-quote'>Get Started with the New<br/>  Era of Smart Dining!</p>
                    <p className='home-res-quote'>-</p>
                    <button className='get-started-home-res'>Get Started</button>

                </div>
            </div>
        </div>
        <h1 className='home-main-head-rest'>Take Control of Your Restaurant</h1>
        <div className='home-main-content-cont'>
            <img src={qrcodephoto} alt='qr code one' className='qrcode-photo' />
            <div className='home-main-content-cont-details'>
                <h1 className='home-main-content-cont-details-head'>QR Code Table Scanning – Fast, Contactless, and Smart</h1>
                <p className='home-main-content-cont-details-para'>Upgrade your dining experience with the power of QR technology. Our app enables instant interactions between customers and tables through seamless scanning.</p>
                <button className='home-main-content-cont-details-button' onClick={onClickViewDetailsQrCode}>View Details <FaArrowRight className='home-right-arrow-rest'/></button>
            </div>
        </div>
        {qrcodeDetails()}
        {menuDetails()}
        {orderDetails()}
        <div className='home-main-content-cont'>
            <img src={menuphoto} alt='qr code one' className='qrcode-photo menu-manage-order' />
            <div className='home-main-content-cont-details'>
                <h1 className='home-main-content-cont-details-head'>Menu Management – Control Your Menu with Ease</h1>
                <p className='home-main-content-cont-details-para'>Simplify and streamline how you manage your restaurant’s menu, all from one dashboard.Add, remove, or edit dishes instantly — changes reflect across all customer devices in real-time.</p>
                <button className='home-main-content-cont-details-button home-main-content-cont-details-button-right-side' onClick={onClickMenuOne}>View Details <FaArrowRight className='home-right-arrow-rest'/></button>
            </div>
        </div>
        <div className='home-main-content-cont'>
            <img src={orders} alt='qr code one' className='qrcode-photo' />
            <div className='home-main-content-cont-details'>
                <h1 className='home-main-content-cont-details-head'>Statistics & Orders – Track, Analyze, and Grow Smarter</h1>
                <p className='home-main-content-cont-details-para'>Get complete visibility over your restaurant’s performance and customer behavior — all in one place Monitor every order from placement to delivery – dine-in, takeout, or delivery.</p>
                <button className='home-main-content-cont-details-button' onClick={onClickOrderOne}>View Details <FaArrowRight className='home-right-arrow-rest'/></button>
            </div>
        </div>
        <h1 id='powerfulFeatures' className='home-main-power-heading'>Powerful Features Built to Elevate Your Restaurant Operations</h1>
        <ul className='home-main-features-cont'>
            {featuresList.map(each => (
                <li className='home-main-features-item'>
                    {each.logo}
                    <h1 className='home-main-features-item-head'>{each.name}</h1>
                    <p className='home-main-features--item-desc'>{each.desc}</p>
                </li>
            ))}
        </ul>
        <h1 id='pricing' className="home-main-power-heading">Choose a Plan That Fits Your Restaurant</h1>
        <p className='home-main-power-desc'>Get everything you need to manage your restaurant with one affordable plan.</p>
        <div className='monthly-annual-plan-cont'> 
            <p className='monthly-text'>Pay Monthly</p>
            <label className="switch">
                <input type="checkbox" checked={on} onChange={() => setOn(!on)} />
                <span className="slider"></span>
            </label>
            <p className='monthly-text'>Pay Annually</p>
        </div>
        <div className='price-cont-heads'>
            <div>
            </div>
            <div className='price-cont-item-one price-cont-item-one-sp'>
                <h1 className='price-cont-item-one-head'>Subscription Package</h1>
                <div className='price-cont-item-one-div'>
                    <h1 className='price-cont-item-one-price'>{on ? "₹ 2000" : "₹ 200"}</h1>
                    <p className='price-cont-item-one-pay-month'>Pay {on ? "Annually" : "Monthly"}</p>
                </div>
                <button className='home-header-get-started-button home-header-get-started-button-home'>Get Started</button>
            </div>
            <div className='price-cont-item-one'>
                <h1 className='price-cont-item-one-head'>Life Time</h1>
                <div className='price-cont-item-one-div'>
                    <h1 className='price-cont-item-one-price'>₹5000</h1>
                    <p className='price-cont-item-one-pay-month'>Pay One Time</p>
                </div>
                <button className='home-header-get-started-button home-header-get-started-button-home'>Get Started</button>
            </div>
        </div>
        <div className='pricing-list-cont'>
            <ul className='pricing-list-items-cont'>
                {laptopView ? pricingList[0].rates.map(each => 
                    <li key={each.id} className='pricing-list-item'>
                        <p className='pricing-list-items-sp'>{each.name}</p>
                    </li>
                ) : pricingList[0].rates.slice(0, 5).map(each => 
                    <li key={each.id} className='pricing-list-item'>
                        <p>{each.name}</p>
                    </li>
                ) }

                {showAllPricing && pricingList[0].rates.slice(5).map(each => 
                    <li key={each.id} className='pricing-list-item'>
                        <p>{each.name}</p>
                    </li>) 
                }
                
            </ul>
            <ul className='pricing-list-items-middle-cont'>
                {laptopView ? pricingList[0].rates.map(each => 
                    <li key={each.id} className='pricing-list-item-is-ok'>
                        <p>{each.isOk ? <TiTick className='tick-one' /> : <GoDash className='dash-one' /> }</p>
                    </li>
                ) :
                pricingList[0].rates.slice(0,5).map(each => 
                    <li key={each.id} className='pricing-list-item-is-ok'>
                        <p>{each.isOk ? <TiTick className='tick-one' /> : <GoDash className='dash-one' /> }</p>
                    </li>
                ) }
                {showAllPricing && pricingList[0].rates.slice(5).map(each => 
                    <li key={each.id} className='pricing-list-item-is-ok'>
                        <p>{each.isOk ? <TiTick className='tick-one' /> : <GoDash className='dash-one' /> }</p>
                    </li>
                ) }
                
            </ul>
            <ul className='pricing-list-items-middle-cont'>
                {laptopView ? pricingList[1].rates.map(each => 
                    <li key={each.id} className='pricing-list-item-is-ok'>
                        <p>{each.isOk ? <TiTick className='tick-one' /> : <GoDash className='dash-one' /> }</p>
                    </li>
                ) : pricingList[1].rates.slice(0,5).map(each => 
                    <li key={each.id} className='pricing-list-item-is-ok'>
                        <p>{each.isOk ? <TiTick className='tick-one' /> : <GoDash className='dash-one' /> }</p>
                    </li>
                ) }

                {showAllPricing && pricingList[1].rates.slice(5).map(each => 
                    <li key={each.id} className='pricing-list-item-is-ok'>
                        <p>{each.isOk ? <TiTick className='tick-one' /> : <GoDash className='dash-one' /> }</p>
                    </li>
                ) }
                
            </ul>
        </div>
        <p className='pricing-show-more' onClick={() => setShowAllPricing(!showAllPricing)}>Show {showAllPricing ? "Less" : "More"} ...</p>
        <div className='copy-right-home'>
            <h1><FaRegCopyright className='copy-right-one' /> 2025 TableTrack. All Rights Reserved.</h1>
            <FaArrowUp className='copy-right-up-arrow' onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })} />
        </div>
      </div>
      
    </div>
  )
}

export default Home
