import './index.css'
import { useState, useEffect, useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import AllInOne from '../../../complexOne';

const Orders = () => {

    // const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const {userId, orders, ordersStatus, updateClickedOrder, updateCurrentMenu} = useContext(AllInOne)

    const [todaysOrderNumber, setTodaysOrderNumber] = useState(1);

    const [filterThroughDate, setFilterThroughDate] = useState("Today");
    const [statusFilter, setStatusFilter] = useState("");
    const [useDateRange, setUseDateRange] = useState(false);

    const [filteredOrders, setFilteredOrders] = useState([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [date, setDate] = useState({
      from: today.toISOString().split('T')[0],
      to: endOfToday.toISOString().split('T')[0]
    });

    const handleDateChange = (e) => {
        setDate({
            ...date,
            [e.target.name]: e.target.value
        });
    };

    const handlePeriodChange = (e) => {
        const period = e.target.value;
        setFilterThroughDate(period);
        setUseDateRange(false);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleDateRangeSearch = () => {
        setUseDateRange(true);
        setFilterThroughDate("Custom");
    };

    useEffect(() => {
      if (ordersStatus !== "SUCCESS" || !orders) return;

      let filtered = [...orders];

      // Apply date filter
      if (useDateRange) {
        // Custom date range
        const fromDate = new Date(date.from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(date.to);
        toDate.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(each => {
          const orderDate = new Date(each.created_at);
          return orderDate >= fromDate && orderDate <= toDate;
        });
      } else {
        // Period filter
        const now = new Date();
        let startDate, endDate;

        switch (filterThroughDate) {
          case "Today":
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "Yesterday":
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "This Week":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "This Month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "Last Month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "This Year":
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "Last Year":
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.getFullYear() - 1, 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;
          default:
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
        }

        filtered = filtered.filter(each => {
          const orderDate = new Date(each.created_at);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter(each => {
          const orderStatus = each.order_status || each.status || '';
          return orderStatus.toLowerCase() === statusFilter.toLowerCase();
        });
      }

      // Sort by order number descending
      filtered = filtered.sort((a, b) => {
        return (b.order_number || 0) - (a.order_number || 0);
      });

      setFilteredOrders(filtered);
    }, [orders, ordersStatus, filterThroughDate, statusFilter, useDateRange, date]);



    const emptyOrdersOne = () => {
      return (
        <div className='empty-order-cont'>
        <p>Nothing To Show Here!</p>
          <button>Make a New Order</button>
        </div>
      )
    }
    const onClickOrderOne = (order) => {

      updateClickedOrder(order);
      updateCurrentMenu(6);
      
    }

    return(
        <div className="dash-orders-main-cont">
            <div className="dash-orders-main-head-cont">
                <div className="dash-orders-main-head-cont-left">
                    <h1 className="dash-orders-main-head">Orders ({filteredOrders.length})</h1>
                    <div className="dash-orders-main-head-auto-refresh">
                        <p className='dash-orders-main-head-auto-refresh-text'>auto refresh every 10 seconds</p>
                        <button type='button' className='dash-orders-main-head-new-order-button'>New Order</button>
                    </div>
                </div>
                <div className='dash-orders-main-head-cont-right'>
                    <select 
                        className="dash-orders-main-head-select" 
                        value={filterThroughDate}
                        onChange={handlePeriodChange}
                    >
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                        <option value="This Year">This Year</option>
                        <option value="Last Year">Last Year</option>
                    </select>
                    <div className='dash-orders-main-head-date-cont'>
                        <input value={date.from} onChange={handleDateChange} name='from' type="date" className="dash-orders-main-head-date-input" />
                        <p className='dash-orders-main-head-date-to'>to</p>
                        <input value={date.to} onChange={handleDateChange} name='to' type="date" className="dash-orders-main-head-date-input" />
                        <button type='button' className='dash-orders-main-head-date-button' onClick={handleDateRangeSearch}>Search</button>
                    </div>
                    <select 
                        className="dash-orders-main-head-select"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                    >
                        <option value="">Show All Orders</option>
                        <option value="KOT">KOT</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Billed">Billed</option>
                        <option value="Paid">Paid</option>
                        <option value="Served">Served</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                    </select>
                </div>

            </div>
            <div className='dash-orders-main-table-cont'>
                <ul className='dash-orders-main-table-list'>
                  {filteredOrders.length == 0 && ordersStatus === "SUCCESS" && emptyOrdersOne()}
                  {filteredOrders.length > 0 && ordersStatus=== "SUCCESS" && filteredOrders.map(each =>
                  {
                    const date = new Date(each.created_at);
                    let hours = date.getHours();
                    const ampm = hours >= 12 ? "PM" : "AM";
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    const minutes = date.getMinutes().toString().padStart(2, "0");

                    const time = `${hours}:${minutes} ${ampm}`;
                    return (
                    <li onClick={() => onClickOrderOne(each)} className='dash-orders-main-table-list-item' key={each.id}>
                    <div className='dash-orders-main-table-list-item-number-cont'>
                        <p className='dash-orders-main-table-list-item-number-cont-text'># {each.order_number}</p>
                    </div>

                    <div className='dash-middle-m-right-list-item-cont-one'>
                      <div className='dash-middle-m-right-list-item-cont'>
                        <h1 className='dash-middle-m-right-list-item-head'>{each.table_name ? each.table_name : "---"}</h1>
                        <p className='dash-middle-m-right-list-item-name'>{each.customer_name ? each.customer_name : "---"}</p>
                      </div>

                      <button type='button' className={`${each.order_status === "KOT" && "order-status-kot"}`}>{each.order_status}</button>

                    </div>
                    <div className='dash-middle-m-right-list-item-cont-two'>
                      <hr className='dash-middle-m-right-list-item-hr' />
                      <h1 className='dash-middle-m-right-list-item-button-text'>Order {each.status}</h1>
                      <hr className='dash-middle-m-right-list-item-hr' />
                    </div>
                    <div className='dash-middle-m-right-list-item-cont-three'>
                      <p className='dash-middle-m-right-list-item-cont-three-text'>{time}</p>
                      <p className='dash-middle-m-right-list-item-cont-three-text'>
                        <span className='dash-middle-m-right-list-item-cont-three-text-span'>
                          {Array.isArray(each.items) ? each.items.length : (typeof each.items === 'string' ? JSON.parse(each.items).length : 0)}
                        </span> Items
                      </p>
                    </div>
                    <hr className='dash-middle-m-right-list-item-hr' />
                    <div className='dash-middle-m-right-list-item-cont-four'>
                      <h1 className='dash-middle-m-right-list-item-cont-four-head'>₹ {each.total_price}</h1>
                      <p className='dash-middle-m-right-list-item-cont-four-text'>{each.waiter_name ? each.waiter_name : <button className='assign-waiter-btn-sp'>Assign Waiter</button>}</p>
                    </div>
                </li>)
                  }
                   )}
                    
                  
                </ul>
            </div>
        </div>
    )
}

export default Orders
