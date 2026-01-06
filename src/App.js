import React from 'react'
import {Routes, Route} from 'react-router-dom'

import Home from './components/HomePage/Home'
import './App.css'


import RegisterMainRoute from './components/HomePage/RegisterMainRoute/index'

import RestaurantLogin from './components/RestaurentLogin'

import RestaurantDashboard from './components/RestaurentDashboard/MainPage'
import GetMoreInforRest from './components/GetMoreInforRest/'

import MenuPage from './components/RestaurentDashboard/Menu'

import CustomerDashboard from './components/CustomerDashboard/MainPage'
import Orders from './components/CustomerDashboard/OrdersSection'
import Cart from './components/CustomerDashboard/Cart'

import Profile from './components/CustomerDashboard/Profile'
import OrdersOne from './components/CustomerDashboard/OrderOne'

import WaiterMain from './components/WaiterDashboard/MainPage'

import InternetStatusBanner from './OfflineOne'
import CustomerDashboardWrapper from './components/CustomerDashboard/CustomerMainRoute'

import MainWaiterOne from './components/WaiterDashboard/MainWaiterOne'
import MainKotOne from './components/KotDashboard/MainKotOne'
import KotMainPage from './components/KotDashboard/MainPage'
import SuperAdminLogin from './components/SuperAdminLogin'
import SuperAdminDashboard from './components/SuperAdminDashboard/MainPage'

import PageNotFoundOne from './components/PageNotFoundOne'
import './App.css'

const App = () => {
  return (
    <>
    <InternetStatusBanner />
    <Routes>
      
      <Route exact path='/' element={<Home />} />
      <Route exact path='/login' element={<RestaurantLogin />} />
      <Route exact path='/superAdminLogin' element={<SuperAdminLogin />} />
      <Route exact path='/superAdminDashboard' element={<SuperAdminDashboard />} />
      <Route exact path='/restaurantReg' element={<RegisterMainRoute />} />
      <Route exact path='/getMoreInforRest' element={<GetMoreInforRest />} />
      <Route exact path='/restaurantDashboard' element={<RestaurantDashboard />} />
      <Route
        path="/customerDashboard/:tableId/:restaurantId/*"
        element={
          <CustomerDashboardWrapper>
            <Routes>
              <Route path="home" element={<CustomerDashboard />} />
              <Route path="filter" element={<CustomerDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="loved" element={<CustomerDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="cart" element={<Cart />} />
              <Route path="orderDetails" element={<OrdersOne />} />
            </Routes>
          </CustomerDashboardWrapper>
        }
      />

      <Route path="/waiterDashboard/*" element={<MainWaiterOne />}>
        <Route path='' element={<WaiterMain />} />
      </Route>

      <Route path="/kotDashboard/*" element={<MainKotOne />}>
        <Route path='' element={<KotMainPage />} />
      </Route>

      <Route exact path='/menu' element={<MenuPage />} />

      <Route path='*' element={<PageNotFoundOne />} />
    </Routes>
    </>
    
  )
}

export default App
