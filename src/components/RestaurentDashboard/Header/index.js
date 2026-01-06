import './index.css'

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import cookies from 'js-cookie'

import AllInOne from '../../../complexOne/index'
import ThemeToggle from '../../ThemeToggle'

import logo from '../../../images/dashlogo.png'
import { FaUser, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa'

const Header = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTableSelectModal, setShowTableSelectModal] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileHover = () => {
    setShowDropdown(true);
  };

  const handleProfileLeave = () => {
    // Delay to allow clicking on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.matches(':hover')) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const handleDropdownEnter = () => {
    setShowDropdown(true);
  };

  const handleDropdownLeave = () => {
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowDropdown(false);
  };

  const handleLogoutConfirm = () => {
    cookies.remove('t_user');
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <AllInOne.Consumer>
      {
        value => {
          const {userId, restaurantDetails, tablesData} = value;
          const {restaurentname} = restaurantDetails;
          
          const handleTableSelect = (table) => {
            setShowTableSelectModal(false);
            // Navigate to customer dashboard
            const customerDashboardUrl = `/customerDashboard/${table.id}/${userId}/home`;
            window.open(customerDashboardUrl, '_blank');
          };
          
          return (
            <>
              <header className='dash-header-initial-cont'>
                <div className='dash-header-main-c'>
                  <div className='dash-h-left-c'>
                    <img src={logo} className='dash-h-logo' alt='dashboard logo' />
                    <h1 className='dash-header-main-head'>{restaurentname}</h1>
                  </div>
                  {/* <div className='dash-h-middle-c'>
                    <button type='button'>Current Orders <span className='dash-h-btn-span'>3</span></button>
                    <button type='button'>Payment Issue <span className='dash-h-btn-span'>1</span></button>
                    <button type='button'>Waiter's Call <span className='dash-h-btn-span'>0</span></button>
                  </div> */}
                  <div className='dash-h-right-c'>
                    <button className='dash-h-btn' type='button' onClick={() => setShowTableSelectModal(true)}>Customer Dashboard</button>
                    <div 
                      className='dash-h-profile-container'
                      onMouseEnter={handleProfileHover}
                      onMouseLeave={handleProfileLeave}
                      ref={profileRef}
                    >
                      <h1 className='dash-h-profile'>MR</h1>
                      {showDropdown && (
                        <div 
                          className='dash-h-profile-dropdown'
                          onMouseEnter={handleDropdownEnter}
                          onMouseLeave={handleDropdownLeave}
                          ref={dropdownRef}
                        >
                          <button 
                            type='button' 
                            className='dash-h-dropdown-item'
                            onClick={() => {
                              setShowDropdown(false);
                              value.updateCurrentMenu(11);
                            }}
                          >
                            <FaUser className='dash-h-dropdown-icon' />
                            <span>Profile</span>
                          </button>
                          <button 
                            type='button' 
                            className='dash-h-dropdown-item'
                            onClick={() => {
                              setShowDropdown(false);
                              value.updateCurrentMenu(12);
                            }}
                          >
                            <FaQuestionCircle className='dash-h-dropdown-icon' />
                            <span>Help</span>
                          </button>
                          <button 
                            type='button' 
                            className='dash-h-dropdown-item dash-h-dropdown-item-logout'
                            onClick={handleLogoutClick}
                          >
                            <FaSignOutAlt className='dash-h-dropdown-icon' />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {showLogoutModal && (
                <div className='dash-logout-modal-overlay' onClick={handleLogoutCancel}>
                  <div className='dash-logout-modal' onClick={(e) => e.stopPropagation()}>
                    <h2 className='dash-logout-modal-title'>Confirm Logout</h2>
                    <p className='dash-logout-modal-message'>Are you sure you want to logout?</p>
                    <div className='dash-logout-modal-buttons'>
                      <button 
                        type='button' 
                        className='dash-logout-modal-btn dash-logout-modal-btn-cancel'
                        onClick={handleLogoutCancel}
                      >
                        Cancel
                      </button>
                      <button 
                        type='button' 
                        className='dash-logout-modal-btn dash-logout-modal-btn-confirm'
                        onClick={handleLogoutConfirm}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showTableSelectModal && (
                <div className='dash-logout-modal-overlay' onClick={() => setShowTableSelectModal(false)}>
                  <div className='dash-logout-modal' onClick={(e) => e.stopPropagation()}>
                    <h2 className='dash-logout-modal-title'>Select Table</h2>
                    <p className='dash-logout-modal-message'>Choose a table to view customer dashboard</p>
                    <div className='table-select-list' style={{ maxHeight: '400px', overflowY: 'auto', margin: '20px 0' }}>
                      {tablesData && tablesData.length > 0 ? (
                        tablesData.map((area) => (
                          <div key={area.name} style={{ marginBottom: '15px' }}>
                            <h3 style={{ color: 'var(--main-head-dark-c)', marginBottom: '10px', fontSize: '16px' }}>
                              {area.name}
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {area.tables && area.tables.length > 0 ? (
                                area.tables
                                  .filter(table => table.is_active === 'active')
                                  .map((table) => (
                                    <button
                                      key={table.id}
                                      type='button'
                                      className='dash-logout-modal-btn dash-logout-modal-btn-cancel'
                                      onClick={() => handleTableSelect(table)}
                                      style={{ 
                                        margin: '5px',
                                        padding: '10px 15px',
                                        cursor: 'pointer',
                                        minWidth: '80px'
                                      }}
                                    >
                                      {table.name}
                                    </button>
                                  ))
                              ) : (
                                <p style={{ color: 'var(--text-color)', fontSize: '14px' }}>No active tables</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-color)', textAlign: 'center', padding: '20px' }}>
                          No tables available
                        </p>
                      )}
                    </div>
                    <div className='dash-logout-modal-buttons'>
                      <button 
                        type='button' 
                        className='dash-logout-modal-btn dash-logout-modal-btn-cancel'
                        onClick={() => setShowTableSelectModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        }
      }
    </AllInOne.Consumer>

  )
}

export default Header
