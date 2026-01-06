import React from 'react'
import { IoMenu } from "react-icons/io5";

import { Link, useNavigate } from 'react-router-dom'

import './index.css'


const Header = () => {
  const [currentOne, setCurrentOne] = React.useState(0);
  const [mobileNav, setMobileNav] = React.useState(false);

  const navigate = useNavigate();

  const onClickLoginOne = () => {
    navigate('/login');
  }

  const onClickAppLogo = () => {
      navigate('/');
  }

  return (
    <div className='header-initial-cont'>
      <div className='header-logo-cont' onClick={onClickAppLogo}>
        <div className='header-logo-mini-cont'>
            <h1 className='header-logo-t'>E</h1>
            <h1 className='header-logo-tt'>H</h1>
        </div>

        <p className='header-logo-text'>EatHub</p>
      </div>
      <nav>
        <a 
         className={'home-nav-two' + (currentOne === "home" ? " home-nav-active" : "")}
         href='#home'  onClick={(e) => {

            e.preventDefault();
            setCurrentOne("home")
              document.getElementById("home")?.scrollIntoView({ behavior: "smooth"});
            }}
        >Home</a>
        <a className={'home-nav-two' + (currentOne === "powerfulFeatures" ? " home-nav-active" : "")} href='#powerfulFeatures' onClick={(e) => {
            e.preventDefault();
            setCurrentOne("powerfulFeatures")
              document.getElementById("powerfulFeatures")?.scrollIntoView({ behavior: "smooth"});
            }}>Features</a>
         <a className={'home-nav-two' + (currentOne === "pricing" ? " home-nav-active" : "")} href='#pricing' onClick={(e) => {
            e.preventDefault();
            setCurrentOne("pricing")
              document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth"});
            }}>Pricing</a>

      </nav>
      <div className='header-login-cont'>
        <button onClick={onClickLoginOne} className='home-header-login-button'>Login</button>
        <button className='home-header-menu-button' onClick={() => {setMobileNav(!mobileNav)}}>
          <IoMenu className='home-header-menu-icon' />
        </button>



        <button className='home-header-get-started-button' onClick={() => navigate('/restaurantReg')}>Get Started</button>

      </div>
      <div className={`header-mobile-nav ${mobileNav ? "active" : ""}`}>
        <h1>Home</h1>
        <h1>Features</h1>
        <h1>Pricing</h1>

          <button onClick={() => navigate('/restaurantReg')} className='home-header-login-button'>Get Started</button>
        </div>
    </div>
  )
}

export default Header;
