import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { IoClose } from "react-icons/io5";
import './index.css';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true); // Track verification state
    const [getError, setGetError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Verify authentication by calling protected endpoint
        // Check for token in cookie (non-HttpOnly) and verify with backend
        const verifyTokenAndRedirect = async () => {
            setIsVerifying(true);
            try {
                // Get token from cookie (non-HttpOnly version set by frontend)
                const clientToken = Cookies.get('sa_user');
                
                // If no token exists, user is not logged in
                if (!clientToken) {
                    setIsVerifying(false);
                    return;
                }

                // Verify token with backend by calling protected endpoint
                const verifyResponse = await fetch('https://eathubbackend-1.onrender.com/superAdmin/getAllRestaurants', {
                    method: 'GET',
                    credentials: 'include', // Send HttpOnly cookie if it exists
                    headers: {
                        'Authorization': `Bearer ${clientToken}` // Send token from cookie
                    }
                });

                if (verifyResponse.ok) {
                    // Token is valid - redirect to dashboard immediately
                    navigate('/superAdminDashboard', { replace: true });
                    return; // Exit early after redirect
                } else if (verifyResponse.status === 401 || verifyResponse.status === 403) {
                    // Token is invalid or expired - clear cookie
                    Cookies.remove('sa_user');
                    // Stay on login page
                } else {
                    // Other error - clear cookie and stay on login page
                    Cookies.remove('sa_user');
                }
            } catch (error) {
                // Network error or other issue - clear cookie
                console.error('Token verification error:', error);
                Cookies.remove('sa_user');
                // Stay on login page
            } finally {
                setIsVerifying(false);
            }
        };

        // Run verification immediately when component mounts
        verifyTokenAndRedirect();
    }, [navigate]);

    const onClickLoginButton = async (e) => {
        e.preventDefault();
        if (email && password) {
            setIsLoading(true);
            setGetError(false);
            const url = "https://eathubbackend-1.onrender.com/superAdminLogin";
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                credentials: 'include'
            };

            try {
                const response = await fetch(url, options);
                const jsonResponse = await response.json();
                setIsLoading(false);

                if (response.ok) {
                    if (jsonResponse.message === "Login successful") {
                        // Store token in cookie for client-side header use (server also sets httpOnly cookie)
                        // Store in both cookie (for client access) and the server sets httpOnly cookie
                        if (jsonResponse.token) {
                            Cookies.set('sa_user', jsonResponse.token, { expires: 7, sameSite: 'lax' });
                        }
                        // Small delay to ensure cookie is set before navigation
                        setTimeout(() => {
                            navigate('/superAdminDashboard');
                        }, 100);
                    }
                } else {
                    setGetError(true);
                    setErrorMessage(jsonResponse.error || 'Login failed');
                    setTimeout(() => {
                        setGetError(false);
                        setErrorMessage('');
                    }, 5000);
                }
            } catch (error) {
                setIsLoading(false);
                setGetError(true);
                setErrorMessage('Network error. Please try again.');
                setTimeout(() => {
                    setGetError(false);
                    setErrorMessage('');
                }, 5000);
            }
        } else {
            setGetError(true);
            setErrorMessage('Please enter both email and password');
            setTimeout(() => {
                setGetError(false);
                setErrorMessage('');
            }, 3000);
        }
    };

    // Show loading state while verifying token
    if (isVerifying) {
        return (
            <div className='super-admin-login-container'>
                <div className="loader-cont">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div className='super-admin-login-container'>
            <div className='super-admin-login-main'>
                <div className='header-logo-cont header-logo-cont-login'>
                    <div className='header-logo-mini-cont'>
                        <h1 className='header-logo-t'>E</h1>
                        <h1 className='header-logo-tt'>H</h1>
                    </div>
                    <p className='header-logo-text login-logo'>EatHub - Super Admin</p>
                </div>
                <form className='super-admin-login-form' onSubmit={onClickLoginButton}>
                    <h1 className='super-admin-login-form-header-main'>Super Admin Login</h1>
                    <p className='super-admin-login-form-subtitle'>Access the admin control panel</p>
                    <div className='super-admin-login-form-group'>
                        <label htmlFor='email'>Email</label>
                        <input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            type='email' 
                            className='super-admin-login-form-input' 
                            placeholder='Enter super admin email' 
                            required 
                        />
                    </div>
                    <div className='super-admin-login-form-group'>
                        <label htmlFor='password'>Password</label>
                        <input 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            type='password' 
                            className='super-admin-login-form-input' 
                            placeholder='Enter password' 
                            required 
                        />
                    </div>
                    <div className='super-admin-login-form-button-cont'>
                        <button type="submit" className='super-admin-login-form-button' disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <p onClick={() => navigate('/')} className='super-admin-login-form-footer'>Go to Home</p>
                    </div>
                </form>
            </div>
            {isLoading && (
                <div className="loader-cont">
                    <div className="loader"></div>
                </div>
            )}
            {getError && (
                <div className='account-error-cont'>
                    <p className='account-error error-cont-login-style'>
                        {errorMessage} 
                        <IoClose onClick={() => { setGetError(false); setErrorMessage(''); }} className="close-button-error" />
                    </p>
                </div>
            )}
        </div>
    );
};

export default SuperAdminLogin;

