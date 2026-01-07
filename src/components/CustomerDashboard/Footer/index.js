import { MdFavoriteBorder, MdOutlineFavorite  } from "react-icons/md";
import { IoMdMenu } from "react-icons/io";
import { IoHomeOutline,IoMenu, IoHome  } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { BiSolidDish, BiDish } from "react-icons/bi";

import { useState } from "react";

import { MdOutlineFiberManualRecord } from "react-icons/md";


import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ComplexCustomer from "../../../complexOneForCustomer";
import { IoPersonCircleOutline, IoPersonCircleSharp } from "react-icons/io5";

import { FaFilter } from "react-icons/fa";

import './index.css'

const Footer = () => {

    const {restaurantId, tableId, restaurantName, currentSection, setCurrentSection} = useContext(ComplexCustomer)
    const navigate = useNavigate();

    const [showLoginRequired, setShowLoginRequired] = useState(false)

    const onClickIcon = (a, b) => {    
        setCurrentSection(a)
        navigate(`/customerDashboard/${tableId}/${restaurantId}/${b}`);
    }

    const onClickLoved = () => {
        setShowLoginRequired(true)
        setTimeout(() => setShowLoginRequired(false), 2000)
    }

    // const currentSection = "Home"
    // console.log(currentSection, "fslkhdlf")

    return (
        <footer>
            <div className={`warning-for-login-for-love ${showLoginRequired ? "show-login-required" : "hide-login-required"}`}>
                <p>Need Login For It</p>
            </div>

            <div className={`${currentSection === "Home" && "highlight-footer-icon"}`} onClick={() => onClickIcon("Home", "home")}>
                {currentSection === "Home" ? <IoHome /> : <IoHomeOutline  />  }
                <p>Home</p>
            </div>
            <div className={`${currentSection === "Filter" && "highlight-footer-icon"}`} onClick={() => onClickIcon("Filter", "filter")}>
                {currentSection === "Filter" ? <MdOutlineFiberManualRecord /> : <MdOutlineFiberManualRecord /> }
                <p>Live</p>
            </div>
                        
            <div className={`${currentSection === "Orders" && "highlight-footer-icon"}`} onClick={() => onClickIcon("Orders", "orders")}>
                {currentSection === "Orders" ? <BiSolidDish /> : <BiDish /> }
                <p>orders</p>           
            </div>
            <div className={`${currentSection === "Loved" && "highlight-footer-icon"}`} onClick={onClickLoved}>
                {currentSection === "Loved" ? <MdOutlineFavorite /> : <MdFavoriteBorder /> }
                <p>Loved</p>
            </div>
            <div className={`${currentSection === "Profile" && "highlight-footer-icon"}`} onClick={() => onClickIcon("Profile", "profile")}>
                {currentSection === "Profile" ? <IoPersonCircleSharp  /> : <IoPersonCircleOutline  /> }
                <p>Profile</p>
            </div>
                
        </footer>
    )
}



export default Footer;
