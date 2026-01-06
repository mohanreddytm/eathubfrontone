import React, { useState, useContext, useEffect } from 'react'
import './index.css'
import AllInOne from '../../../complexOne/index'
import { useTheme } from '../../../contexts/ThemeContext'
import { 
  FaCog, 
  FaUser, 
  FaBell, 
  FaLock, 
  FaCreditCard, 
  FaPalette,
  FaShieldAlt,
  FaPlug,
  FaGlobe,
  FaPrint,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus
} from 'react-icons/fa'
import { MdRestaurant, MdNotifications, MdSecurity, MdPayment } from 'react-icons/md'
import { HiOfficeBuilding } from 'react-icons/hi'

const Settings = () => {
  const { restaurantDetails, userId } = useContext(AllInOne)
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('restaurant')
  const [restaurantData, setRestaurantData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  // Restaurant Settings
  const [restaurantSettings, setRestaurantSettings] = useState({
    restaurentname: '',
    branchname: '',
    branchaddress: '',
    country: '',
    countrycode: '',
    phonenumber: '',
    email: ''
  })

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    name: ''
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    paymentNotifications: true,
    reservationNotifications: true,
    staffNotifications: true,
    soundEnabled: true
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    taxRate: 10,
    currency: 'INR',
    paymentMethods: {
      cash: true,
      card: true,
      upi: true,
      online: false
    },
    autoGenerateBill: false,
    printAutomatically: false,
    upi_ids: []
  })
  
  const [newUPI, setNewUPI] = useState({ name: '', upi_id: '' })

  // Display Settings
  const [displaySettings, setDisplaySettings] = useState({
    theme: theme,
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    itemsPerPage: 20
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    requirePasswordChange: false,
    loginAlerts: true
  })

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    timezone: 'Asia/Kolkata',
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365
  })

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (restaurantDetails && Object.keys(restaurantDetails).length > 0) {
        setRestaurantData(restaurantDetails)
        setRestaurantSettings({
          restaurentname: restaurantDetails.restaurentname || '',
          branchname: restaurantDetails.branchname || '',
          branchaddress: restaurantDetails.branchaddress || '',
          country: restaurantDetails.country || '',
          countrycode: restaurantDetails.countrycode || '',
          phonenumber: restaurantDetails.phonenumber || '',
          email: restaurantDetails.email || '',
          name: restaurantDetails.name || ''
        })
        setLoading(false)
      } else if (userId) {
        try {
          const url = `https://ttbackone-v48h.onrender.com/restaurant/${userId}`
          const response = await fetch(url)
          if (response.ok) {
            const json = await response.json()
            const data = json[0]
            setRestaurantData(data)
            setRestaurantSettings({
              restaurentname: data.restaurentname || '',
              branchname: data.branchname || '',
              branchaddress: data.branchaddress || '',
              country: data.country || '',
              countrycode: data.countrycode || '',
              phonenumber: data.phonenumber || '',
              email: data.email || '',
              name: data.name || ''
            })
            setAccountSettings(prev => ({ ...prev, name: data.name || '' }))
          }
        } catch (error) {
          console.error('Error fetching restaurant details:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchRestaurantDetails()
  }, [restaurantDetails, userId])

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:8000/getPaymentSettings/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setPaymentSettings(prev => ({
              ...prev,
              ...data.settings,
              upi_ids: data.settings.upi_ids || []
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      }
    };
    fetchPaymentSettings();
  }, [userId])

  // Fetch display settings
  useEffect(() => {
    const fetchDisplaySettings = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:8000/getDisplaySettings/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setDisplaySettings(prev => ({
              ...prev,
              ...data.settings
            }));
            if (data.settings.theme) {
              setTheme(data.settings.theme);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching display settings:', error);
      }
    };
    fetchDisplaySettings();
  }, [userId, setTheme])

  const handleRestaurantSettingsChange = (field, value) => {
    setRestaurantSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleAccountSettingsChange = (field, value) => {
    setAccountSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationSettingsChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentSettingsChange = (field, value) => {
    setPaymentSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentMethodChange = (method, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      paymentMethods: { ...prev.paymentMethods, [method]: value }
    }))
  }

  const handleDisplaySettingsChange = (field, value) => {
    setDisplaySettings(prev => ({ ...prev, [field]: value }))
    if (field === 'theme') {
      setTheme(value)
      // Save theme to backend
      if (userId) {
        fetch(`http://localhost:8000/updateDisplaySettings/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme: value })
        }).catch(err => console.error('Error saving theme:', err))
      }
    }
  }

  const handleSecuritySettingsChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  const handleGeneralSettingsChange = (field, value) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (section) => {
    setSaveStatus('saving')
    try {
      if (section === 'payment') {
        // Validate UPI IDs if online payment is enabled
        if (paymentSettings.paymentMethods.online && (!paymentSettings.upi_ids || paymentSettings.upi_ids.length === 0)) {
          alert('Please add at least one UPI ID to enable online payment');
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(null), 3000);
          return;
        }
        
        const response = await fetch(`http://localhost:8000/updatePaymentSettings/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentSettings)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save payment settings');
        }
      } else if (section === 'display') {
        const response = await fetch(`http://localhost:8000/updateDisplaySettings/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(displaySettings)
        });
        if (!response.ok) {
          throw new Error('Failed to save display settings');
        }
        // Update theme immediately
        setTheme(displaySettings.theme)
      } else {
        // Simulate API call for other sections
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error')
      // Show error message to user
      alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleAddUPI = () => {
    if (!newUPI.name || !newUPI.upi_id) {
      alert('Please fill in both name and UPI ID');
      return;
    }
    setPaymentSettings(prev => ({
      ...prev,
      upi_ids: [...prev.upi_ids, { name: newUPI.name, upi_id: newUPI.upi_id }]
    }));
    setNewUPI({ name: '', upi_id: '' });
  }

  const handleRemoveUPI = (index) => {
    setPaymentSettings(prev => ({
      ...prev,
      upi_ids: prev.upi_ids.filter((_, i) => i !== index)
    }));
  }

  const settingsTabs = [
    { id: 'restaurant', label: 'Restaurant', icon: <MdRestaurant /> },
    { id: 'account', label: 'Account', icon: <FaUser /> },
    { id: 'notifications', label: 'Notifications', icon: <MdNotifications /> },
    { id: 'payment', label: 'Payment', icon: <MdPayment /> },
    { id: 'display', label: 'Display', icon: <FaPalette /> },
    { id: 'security', label: 'Security', icon: <MdSecurity /> },
    { id: 'general', label: 'General', icon: <FaCog /> }
  ]

  if (loading) {
    return (
      <div className="dash-main-m">
        <div className="settings-container">
          <div className="settings-loading">
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-main-m">
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-header-icon">
              <FaCog className="settings-header-icon-svg" />
            </div>
            <div className="settings-header-info">
              <h1 className="settings-header-title">Settings</h1>
              <p className="settings-header-subtitle">Manage your restaurant preferences and configurations</p>
            </div>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <div className="settings-tabs">
              {settingsTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="settings-tab-icon">{tab.icon}</span>
                  <span className="settings-tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-main">
            {saveStatus && (
              <div className={`settings-save-status ${saveStatus}`}>
                {saveStatus === 'success' ? (
                  <><FaCheckCircle /> Settings saved successfully!</>
                ) : saveStatus === 'error' ? (
                  <><FaTimesCircle /> Failed to save settings. Please try again.</>
                ) : (
                  <><FaSave /> Saving...</>
                )}
              </div>
            )}

            {/* Restaurant Settings */}
            {activeTab === 'restaurant' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <MdRestaurant className="settings-section-icon" />
                  Restaurant Information
                </h2>
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      value={restaurantSettings.restaurentname}
                      onChange={(e) => handleRestaurantSettingsChange('restaurentname', e.target.value)}
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Branch Name *</label>
                    <input
                      type="text"
                      value={restaurantSettings.branchname}
                      onChange={(e) => handleRestaurantSettingsChange('branchname', e.target.value)}
                      placeholder="Enter branch name"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Branch Address *</label>
                    <textarea
                      value={restaurantSettings.branchaddress}
                      onChange={(e) => handleRestaurantSettingsChange('branchaddress', e.target.value)}
                      placeholder="Enter branch address"
                      rows="3"
                    />
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Country *</label>
                      <input
                        type="text"
                        value={restaurantSettings.country}
                        onChange={(e) => handleRestaurantSettingsChange('country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                    <div className="settings-form-group">
                      <label>Country Code</label>
                      <input
                        type="text"
                        value={restaurantSettings.countrycode}
                        onChange={(e) => handleRestaurantSettingsChange('countrycode', e.target.value)}
                        placeholder="e.g., +91"
                      />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={restaurantSettings.phonenumber}
                        onChange={(e) => handleRestaurantSettingsChange('phonenumber', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="settings-form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={restaurantSettings.email}
                        onChange={(e) => handleRestaurantSettingsChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('restaurant')}>
                    <FaSave /> Save Restaurant Settings
                  </button>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <FaUser className="settings-section-icon" />
                  Account Settings
                </h2>
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Owner Name *</label>
                    <input
                      type="text"
                      value={accountSettings.name}
                      onChange={(e) => handleAccountSettingsChange('name', e.target.value)}
                      placeholder="Enter owner name"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Current Password</label>
                    <div className="settings-password-input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={accountSettings.currentPassword}
                        onChange={(e) => handleAccountSettingsChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="settings-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={accountSettings.newPassword}
                      onChange={(e) => handleAccountSettingsChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={accountSettings.confirmPassword}
                      onChange={(e) => handleAccountSettingsChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('account')}>
                    <FaSave /> Save Account Settings
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <MdNotifications className="settings-section-icon" />
                  Notification Preferences
                </h2>
                <div className="settings-form">
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>Email Notifications</label>
                        <p>Receive notifications via email</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => handleNotificationSettingsChange('emailNotifications', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>SMS Notifications</label>
                        <p>Receive notifications via SMS</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => handleNotificationSettingsChange('smsNotifications', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>Order Notifications</label>
                        <p>Get notified when new orders arrive</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.orderNotifications}
                          onChange={(e) => handleNotificationSettingsChange('orderNotifications', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>Payment Notifications</label>
                        <p>Get notified about payment updates</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.paymentNotifications}
                          onChange={(e) => handleNotificationSettingsChange('paymentNotifications', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>Reservation Notifications</label>
                        <p>Get notified about table reservations</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.reservationNotifications}
                          onChange={(e) => handleNotificationSettingsChange('reservationNotifications', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>Staff Notifications</label>
                        <p>Get notified about staff activities</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.staffNotifications}
                          onChange={(e) => handleNotificationSettingsChange('staffNotifications', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <label>Sound Alerts</label>
                        <p>Play sound for notifications</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.soundEnabled}
                          onChange={(e) => handleNotificationSettingsChange('soundEnabled', e.target.checked)}
                        />
                        <span className="settings-slider"></span>
                      </label>
                    </div>
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('notifications')}>
                    <FaSave /> Save Notification Settings
                  </button>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <MdPayment className="settings-section-icon" />
                  Payment & Billing Settings
                </h2>
                <div className="settings-form">
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Tax Rate (%)</label>
                      <input
                        type="number"
                        value={paymentSettings.taxRate}
                        onChange={(e) => handlePaymentSettingsChange('taxRate', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="settings-form-group">
                      <label>Currency</label>
                      <select
                        value={paymentSettings.currency}
                        onChange={(e) => handlePaymentSettingsChange('currency', e.target.value)}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div className="settings-form-group">
                    <label>Accepted Payment Methods</label>
                    <div className="settings-checkbox-group">
                      <label className="settings-checkbox">
                        <input
                          type="checkbox"
                          checked={paymentSettings.paymentMethods.cash}
                          onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
                        />
                        <span>Cash</span>
                      </label>
                      <label className="settings-checkbox">
                        <input
                          type="checkbox"
                          checked={paymentSettings.paymentMethods.card}
                          onChange={(e) => handlePaymentMethodChange('card', e.target.checked)}
                        />
                        <span>Card</span>
                      </label>
                      <label className="settings-checkbox">
                        <input
                          type="checkbox"
                          checked={paymentSettings.paymentMethods.upi}
                          onChange={(e) => handlePaymentMethodChange('upi', e.target.checked)}
                        />
                        <span>UPI</span>
                      </label>
                      <label className="settings-checkbox">
                        <input
                          type="checkbox"
                          checked={paymentSettings.paymentMethods.online}
                          onChange={(e) => handlePaymentMethodChange('online', e.target.checked)}
                        />
                        <span>Online Payment</span>
                      </label>
                    </div>
                  </div>
                  
                  {(paymentSettings.paymentMethods.upi || paymentSettings.paymentMethods.online) && (
                    <div className="settings-form-group">
                      <label>UPI Payment IDs</label>
                      <p className="settings-help-text">Add UPI IDs that customers can use to make payments</p>
                      <div className="settings-upi-list">
                        {paymentSettings.upi_ids && paymentSettings.upi_ids.length > 0 ? (
                          paymentSettings.upi_ids.map((upi, index) => (
                            <div key={index} className="settings-upi-item">
                              <div className="settings-upi-info">
                                <span className="settings-upi-name">{upi.name}</span>
                                <span className="settings-upi-id">{upi.upi_id}</span>
                              </div>
                              <button
                                type="button"
                                className="settings-upi-remove"
                                onClick={() => handleRemoveUPI(index)}
                              >
                                <FaTimesCircle />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="settings-no-upi">No UPI IDs added yet</p>
                        )}
                      </div>
                      <div className="settings-form-row">
                        <div className="settings-form-group" style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={newUPI.name}
                            onChange={(e) => setNewUPI(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="UPI Name (e.g., Restaurant UPI)"
                          />
                        </div>
                        <div className="settings-form-group" style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={newUPI.upi_id}
                            onChange={(e) => setNewUPI(prev => ({ ...prev, upi_id: e.target.value }))}
                            placeholder="UPI ID (e.g., restaurant@paytm)"
                          />
                        </div>
                        <button
                          type="button"
                          className="settings-add-upi-btn"
                          onClick={handleAddUPI}
                        >
                          <FaPlus /> Add
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                      <label>Auto Generate Bill</label>
                      <p>Automatically generate bill when order is completed</p>
                    </div>
                    <label className="settings-switch">
                      <input
                        type="checkbox"
                        checked={paymentSettings.autoGenerateBill}
                        onChange={(e) => handlePaymentSettingsChange('autoGenerateBill', e.target.checked)}
                      />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                      <label>Auto Print</label>
                      <p>Automatically print bills and KOTs</p>
                    </div>
                    <label className="settings-switch">
                      <input
                        type="checkbox"
                        checked={paymentSettings.printAutomatically}
                        onChange={(e) => handlePaymentSettingsChange('printAutomatically', e.target.checked)}
                      />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('payment')}>
                    <FaSave /> Save Payment Settings
                  </button>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <FaPalette className="settings-section-icon" />
                  Display & Appearance
                </h2>
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Theme</label>
                    <select
                      value={displaySettings.theme}
                      onChange={(e) => handleDisplaySettingsChange('theme', e.target.value)}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div className="settings-form-group">
                    <label>Language</label>
                    <select
                      value={displaySettings.language}
                      onChange={(e) => handleDisplaySettingsChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Date Format</label>
                      <select
                        value={displaySettings.dateFormat}
                        onChange={(e) => handleDisplaySettingsChange('dateFormat', e.target.value)}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="settings-form-group">
                      <label>Time Format</label>
                      <select
                        value={displaySettings.timeFormat}
                        onChange={(e) => handleDisplaySettingsChange('timeFormat', e.target.value)}
                      >
                        <option value="24h">24 Hour</option>
                        <option value="12h">12 Hour</option>
                      </select>
                    </div>
                  </div>
                  <div className="settings-form-group">
                    <label>Items Per Page</label>
                    <select
                      value={displaySettings.itemsPerPage}
                      onChange={(e) => handleDisplaySettingsChange('itemsPerPage', parseInt(e.target.value))}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('display')}>
                    <FaSave /> Save Display Settings
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <MdSecurity className="settings-section-icon" />
                  Security Settings
                </h2>
                <div className="settings-form">
                  <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                      <label>Two-Factor Authentication</label>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="settings-switch">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => handleSecuritySettingsChange('twoFactorAuth', e.target.checked)}
                      />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                  <div className="settings-form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value) || 30)}
                      min="5"
                      max="120"
                    />
                  </div>
                  <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                      <label>Require Password Change</label>
                      <p>Force password change on next login</p>
                    </div>
                    <label className="settings-switch">
                      <input
                        type="checkbox"
                        checked={securitySettings.requirePasswordChange}
                        onChange={(e) => handleSecuritySettingsChange('requirePasswordChange', e.target.checked)}
                      />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                      <label>Login Alerts</label>
                      <p>Get notified when someone logs into your account</p>
                    </div>
                    <label className="settings-switch">
                      <input
                        type="checkbox"
                        checked={securitySettings.loginAlerts}
                        onChange={(e) => handleSecuritySettingsChange('loginAlerts', e.target.checked)}
                      />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('security')}>
                    <FaSave /> Save Security Settings
                  </button>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <h2 className="settings-section-title">
                  <FaCog className="settings-section-icon" />
                  General Settings
                </h2>
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Timezone</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => handleGeneralSettingsChange('timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>
                  <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                      <label>Auto Backup</label>
                      <p>Automatically backup your data</p>
                    </div>
                    <label className="settings-switch">
                      <input
                        type="checkbox"
                        checked={generalSettings.autoBackup}
                        onChange={(e) => handleGeneralSettingsChange('autoBackup', e.target.checked)}
                      />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                  {generalSettings.autoBackup && (
                    <div className="settings-form-group">
                      <label>Backup Frequency</label>
                      <select
                        value={generalSettings.backupFrequency}
                        onChange={(e) => handleGeneralSettingsChange('backupFrequency', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                  <div className="settings-form-group">
                    <label>Data Retention (days)</label>
                    <input
                      type="number"
                      value={generalSettings.dataRetention}
                      onChange={(e) => handleGeneralSettingsChange('dataRetention', parseInt(e.target.value) || 365)}
                      min="30"
                      max="3650"
                    />
                  </div>
                  <button className="settings-save-btn" onClick={() => handleSave('general')}>
                    <FaSave /> Save General Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

