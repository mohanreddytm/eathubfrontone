import { useState } from "react"
// import { MdOutlineDashboard } from "react-icons/md";
import { CiHome } from "react-icons/ci";
import { BiSolidDish,BiFoodMenu } from "react-icons/bi"
import { GiLaptop } from "react-icons/gi";
import { IoIosMore } from "react-icons/io";
import { useContext } from "react";
import { FaLocationDot, FaIndianRupeeSign } from "react-icons/fa6";

import {FaRegBell} from "react-icons/fa"
import { MdOutlineTableRestaurant } from "react-icons/md";
import { IoMdPeople } from "react-icons/io";
import { RiReservedLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";




import AllInOne from "../../../complexOne";

import './index.css'

const Footer = () => {
    // const {currentMenu} = props;
    const {currentMenu, updateCurrentMenu} = useContext(AllInOne)
    const [showAllOne, setShowAllOne] = useState(false);
    // console.log("Current one", currentMenu)
    const onClickMoreOfAll = (one) => {
        updateCurrentMenu(one)
        setShowAllOne(false)
    }
    return(
        <div className="footer-initial-cont">
            <ul className={`footer-more-cont ${showAllOne && "show-the-all-one"}`}>
            <li onClick={() => onClickMoreOfAll(4)} className={`${currentMenu === 4 && "show-highlight-rest-das"}`}>
                    <MdOutlineTableRestaurant />
                    <p>Tables</p>
                </li>
                <li onClick={() => onClickMoreOfAll(5)}  className={`${currentMenu === 5 && "show-highlight-rest-das"}`}>
                    <FaRegBell />
                    <p>Waiter Requests</p>
                </li>
                <li onClick={() => onClickMoreOfAll(7)}  className={`${currentMenu === 7 && "show-highlight-rest-das"}`} >
                    <IoMdPeople />
                    <p>Staff</p>
                </li>
                <li onClick={() => onClickMoreOfAll(8)}  className={`${currentMenu === 8 && "show-highlight-rest-das"}`} >
                    <RiReservedLine />
                    <p>Reservations</p>
                </li>
                <li  onClick={() => onClickMoreOfAll(9)}  className={`${currentMenu === 9 && "show-highlight-rest-das"}`}>
                    <FaIndianRupeeSign />
                    <p>Payment</p>
                </li>
                <li onClick={() => onClickMoreOfAll(10)}  className={`${currentMenu === 10 && "show-highlight-rest-das"}`}>
                    <IoSettingsOutline />
                    <p>Settings</p>
                </li>
            </ul>
            <ul>
                <li onClick={() => updateCurrentMenu(1)} className={`${currentMenu === 1 && "show-highlight-rest-das"}`}>
                    <CiHome />
                    <p>DashBoard</p>
                </li>
                <li onClick={() => updateCurrentMenu(3)}  className={`${currentMenu === 3 && "show-highlight-rest-das"}`}>
                    <BiFoodMenu />
                    <p>Menu</p>
                </li>
                <li onClick={() => updateCurrentMenu(6)}  className={`${currentMenu === 6 && "show-highlight-rest-das"}`} >
                    <GiLaptop />
                    <p>POS</p>
                </li>
                <li onClick={() => updateCurrentMenu(2)}  className={`${currentMenu === 2 && "show-highlight-rest-das"}`} >
                    <BiSolidDish />
                    <p>Orders</p>
                </li>
                <li onClick={() => setShowAllOne(!showAllOne)} className={`${(currentMenu === 4 || currentMenu === 5 || currentMenu > 6) && "show-highlight-rest-das"}`}>
                    <IoIosMore />
                    <p>More</p>
                </li>
            </ul>
        </div>
    )
}

export default Footer
