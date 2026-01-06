import React from 'react'
import { useNavigate } from 'react-router-dom'
// import { FaHome } from "react-icons/fa6";
import './index.css'

const PageNotFoundOne = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className='page-not-found-cont'>
      <div className='page-not-found-inner-cont'>
        <h1 className='page-not-found-main-head'>4<span>0</span>4</h1>
        <p className='page-not-found-sub-head'>Page Not Found</p>
        <button onClick={handleGoHome} className='page-not-found-button'>Go Home</button>
      </div>
    </div>
  )
}

export default PageNotFoundOne
