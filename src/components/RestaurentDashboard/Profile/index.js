import React, { useContext, useState, useEffect } from 'react'
import './index.css'
import AllInOne from '../../../complexOne/index'
import { FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser, FaGlobe, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { MdRestaurant, MdBusiness } from 'react-icons/md'
import { HiOfficeBuilding } from 'react-icons/hi'

const Profile = () => {
  const { restaurantDetails, userId } = useContext(AllInOne)
  const [restaurantData, setRestaurantData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (restaurantDetails && Object.keys(restaurantDetails).length > 0) {
        setRestaurantData(restaurantDetails)
        setLoading(false)
      } else if (userId) {
        try {
          const url = `https://ttbackone-v48h.onrender.com/restaurant/${userId}`
          const response = await fetch(url)
          if (response.ok) {
            const json = await response.json()
            setRestaurantData(json[0])
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="restaurant-profile-container">
        <div className="restaurant-profile-loading">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!restaurantData) {
    return (
      <div className="restaurant-profile-container">
        <div className="restaurant-profile-error">
          <p>Failed to load restaurant details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-main-m">
      <div className="restaurant-profile-container">
      <div className="restaurant-profile-header">
        <div className="restaurant-profile-header-content">
          <div className="restaurant-profile-avatar">
            <MdRestaurant className="restaurant-profile-avatar-icon" />
          </div>
          <div className="restaurant-profile-header-info">
            <h1 className="restaurant-profile-name">{restaurantData.restaurentname || 'Restaurant Name'}</h1>
            <p className="restaurant-profile-subtitle">{restaurantData.branchname || 'Branch Name'}</p>
          </div>
        </div>
      </div>

      <div className="restaurant-profile-content">
        <div className="restaurant-profile-section">
          <h2 className="restaurant-profile-section-title">
            <FaBuilding className="restaurant-profile-section-icon" />
            Basic Information
          </h2>
          <div className="restaurant-profile-details">
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Restaurant Name:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.restaurentname || 'N/A'}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Branch Name:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.branchname || 'N/A'}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Owner Name:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.name || 'N/A'}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Restaurant ID:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.id || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="restaurant-profile-section">
          <h2 className="restaurant-profile-section-title">
            <FaMapMarkerAlt className="restaurant-profile-section-icon" />
            Location Information
          </h2>
          <div className="restaurant-profile-details">
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Branch Address:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.branchaddress || 'N/A'}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Country:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.country || 'N/A'}
                {restaurantData.countrycode && ` (${restaurantData.countrycode})`}
              </span>
            </div>
          </div>
        </div>

        <div className="restaurant-profile-section">
          <h2 className="restaurant-profile-section-title">
            <FaPhone className="restaurant-profile-section-icon" />
            Contact Information
          </h2>
          <div className="restaurant-profile-details">
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Phone Number:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.phonenumber || 'N/A'}
                {restaurantData.is_phonenumber_verified !== undefined && (
                  <span className="restaurant-profile-verification-badge">
                    {restaurantData.is_phonenumber_verified ? (
                      <><FaCheckCircle className="verified-icon" /> Verified</>
                    ) : (
                      <><FaTimesCircle className="unverified-icon" /> Not Verified</>
                    )}
                  </span>
                )}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Email:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.email || 'N/A'}
                {restaurantData.is_email_verified !== undefined && (
                  <span className="restaurant-profile-verification-badge">
                    {restaurantData.is_email_verified ? (
                      <><FaCheckCircle className="verified-icon" /> Verified</>
                    ) : (
                      <><FaTimesCircle className="unverified-icon" /> Not Verified</>
                    )}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="restaurant-profile-section">
          <h2 className="restaurant-profile-section-title">
            <HiOfficeBuilding className="restaurant-profile-section-icon" />
            Account Information
          </h2>
          <div className="restaurant-profile-details">
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Account Created:</span>
              <span className="restaurant-profile-detail-value">
                {formatDate(restaurantData.created_at)}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Email Verification:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.is_email_verified !== undefined ? (
                  restaurantData.is_email_verified ? (
                    <span className="restaurant-profile-status verified-status">
                      <FaCheckCircle /> Verified
                    </span>
                  ) : (
                    <span className="restaurant-profile-status unverified-status">
                      <FaTimesCircle /> Not Verified
                    </span>
                  )
                ) : 'N/A'}
              </span>
            </div>
            <div className="restaurant-profile-detail-item">
              <span className="restaurant-profile-detail-label">Phone Verification:</span>
              <span className="restaurant-profile-detail-value">
                {restaurantData.is_phonenumber_verified !== undefined ? (
                  restaurantData.is_phonenumber_verified ? (
                    <span className="restaurant-profile-status verified-status">
                      <FaCheckCircle /> Verified
                    </span>
                  ) : (
                    <span className="restaurant-profile-status unverified-status">
                      <FaTimesCircle /> Not Verified
                    </span>
                  )
                ) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Profile

