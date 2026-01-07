import React from 'react'
import './index.css'

import cookies from 'js-cookie'
import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'


import { IoClose } from "react-icons/io5";

const RestaurantLogin = () => {

    const navigate = useNavigate();

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [selectedLogin, setSelectedLogin] = useState('restaurant');
    const [getError, setGetError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const isAuth = cookies.get('t_user');
        if (isAuth) {
            navigate('/restaurantDashboard');
        }
    }, [navigate]);

    const onClickCreateAccount = () => {
        navigate('/restaurantReg');
    }

    const onChangeLoginEmail = (e) => {
        setLoginEmail(e.target.value);
    }

    const onChangeLoginPassword = (e) => {
        setLoginPassword(e.target.value);
    }

    const onClickLoginButton = (e) => {
        e.preventDefault()
        if(selectedLogin === 'restaurant') {
            restaurantLogin();
        }else if(selectedLogin === 'waiter') {
            waiterLogin();
        }else if(selectedLogin === 'kod') {
            kotLogin();
        }
    }

    const waiterLogin = async () => {

        if(loginEmail && loginPassword) {
            setIsLoading(true);
            setGetError(false);
            const url = "https://eathubbackend-1.onrender.com/restaurant/waiterLogin"
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                }),
                credentials: 'include'
            }

            const response = await fetch(url, options);
            const jsonResponse = await response.json();

            console.log(jsonResponse);
            console.log(response.ok)
            setIsLoading(false);

            if(response.ok){
                if(jsonResponse.message === "Login successful"){
                    cookies.set('w_user', jsonResponse.token, { expires: 7 });
                    navigate(`/waiterDashboard`);
                    console.log(jsonResponse);
                }
            }else{
                setGetError(true);
                setErrorMessage(jsonResponse.error);
                setTimeout(() => {
                    setGetError(false);
                    setErrorMessage('');
                }, 5000);
            }
        }
    }

    const kotLogin = async () => {

        if(loginEmail && loginPassword) {
            setIsLoading(true);
            setGetError(false);
            const url = "https://eathubbackend-1.onrender.com/restaurant/kotLogin"
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                }),
                credentials: 'include'
            }

            const response = await fetch(url, options);
            const jsonResponse = await response.json();

            console.log(jsonResponse);
            console.log(response.ok)
            setIsLoading(false);

            if(response.ok){
                if(jsonResponse.message === "Login successful"){
                    cookies.set('k_user', jsonResponse.token, { expires: 7 });
                    navigate(`/kotDashboard`);
                    console.log(jsonResponse);
                }
            }else{
                setGetError(true);
                setErrorMessage(jsonResponse.error);
                setTimeout(() => {
                    setGetError(false);
                    setErrorMessage('');
                }, 5000);
            }
        }
    }

    const restaurantLogin = async () => {
        if(loginEmail && loginPassword) {
            setIsLoading(true);
            setGetError(false);
            const url = "https://eathubbackend-1.onrender.com/restaurantLogin"
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                }),
                credentials: 'include'
            }

            const response = await fetch(url, options);
            const jsonResponse = await response.json();

            console.log(jsonResponse);
            console.log(response.ok)
            setIsLoading(false);

            if(response.ok){
                if(jsonResponse.message === "Login successful"){
                    cookies.set('t_user', jsonResponse.token, { expires: 7 });
                    navigate(`/restaurantDashboard`);
                    console.log(jsonResponse);
                }
            }else{
                setGetError(true);
                setErrorMessage(jsonResponse.error);
                setTimeout(() => {
                    setGetError(false);
                    setErrorMessage('');
                }, 5000);
            }
        }
    }

  return (
    <div className='restaurant-login-container-initial-cont' >
        <div className='restaurant-login-container-main'>
            <div className='header-logo-cont header-logo-cont-login'>
                <div className='header-logo-mini-cont'>
                    <h1 className='header-logo-t'>E</h1>
                    <h1 className='header-logo-tt'>H</h1>
                </div>
                <p className='header-logo-text login-logo'>EatHub</p>
            </div>
            <form className='restaurant-login-form' onSubmit={onClickLoginButton}>
                <div className='restaurant-login-form-top'>
                    <h1 className={selectedLogin === 'restaurant' ? 'restaurant-login-form-top-selected' : ''} onClick={() => setSelectedLogin('restaurant')}>Restaurant Login</h1>
                    <h1 className={selectedLogin === 'waiter' ? 'restaurant-login-form-top-selected' : ''} onClick={() => setSelectedLogin('waiter')}>Waiter Login</h1>
                    <h1 className={selectedLogin === 'kod' ? 'restaurant-login-form-top-selected' : ''} onClick={() => setSelectedLogin('kod')}>KOD Login</h1>
                </div>
                <h1 className='restaurant-login-form-header'>Enter your Email</h1>
                <input value={loginEmail} onChange={onChangeLoginEmail} type='email' className='restaurant-login-form-input' placeholder='Email' required />
                <h1 className='restaurant-login-form-header'>Enter your Password</h1>
                <input value={loginPassword} onChange={onChangeLoginPassword} type='password' className='restaurant-login-form-input' placeholder='Password' required />
                <div className='restaurant-login-form-checkbox-cont'>
                    <div className='restaurant-login-form-checkbox-inner-cont'>
                        <input id='remember' type='checkbox' className='restaurant-login-form-checkbox' />
                        <label htmlFor='remember' className='restaurant-login-form-checkbox-label'>Remember me</label>
                    </div>
                    <br />
                    <a href='none' className='restaurant-login-form-forgot-password'>Forgot Password?</a>
                </div>
                <div className='restaurant-login-form-button-cont'>
                    <h1 className='restaurant-login-form-button-header'>Are you new here ? <br/> <span onClick={onClickCreateAccount}>Create an Account</span> </h1>
                    <button type="submit" className='restaurant-login-form-button'>Login</button>
                </div>
                <p onClick={() => navigate('/')} className='restaurant-login-form-footer'>Go to Home</p>
            </form>
        </div>
        {isLoading &&
            <div className="loader-cont">
                <div className="loader"></div>
            </div>
        }
        {getError && (
            <div className='account-error-cont'>
                <p className='account-error error-cont-login-style'>{errorMessage} <IoClose onClick={() => { setGetError(false); setErrorMessage(''); }} className="close-button-error" /></p>
            </div>
        )}
                    
    </div>
  )
}

export default RestaurantLogin;
