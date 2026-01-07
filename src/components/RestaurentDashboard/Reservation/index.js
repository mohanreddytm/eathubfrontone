import React, { useState, useEffect, useContext } from 'react'
import './index.css'
import { FaPhone } from 'react-icons/fa6'
import { FaPlus, FaTimes } from 'react-icons/fa'
import { FaCalendar, FaClock, FaUsers, FaTable, FaEdit, FaTrash } from 'react-icons/fa'
import AllInOne from '../../../complexOne'
import { v4 as uuidv4 } from 'uuid'

const Reservation = () => {
  const { userId, tablesData } = useContext(AllInOne)
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [reservationForm, setReservationForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    tableId: '',
    notes: '',
    status: 'pending'
  })

  // Get all available tables
  const getAllTables = () => {
    if (!tablesData || !Array.isArray(tablesData)) return []
    const allTables = []
    tablesData.forEach(area => {
      if (area.tables && Array.isArray(area.tables)) {
        area.tables.forEach(table => {
          allTables.push({
            id: table.id,
            name: table.name || `T${table.id?.toString().padStart(2, '0') || '00'}`,
            areaName: area.name
          })
        })
      }
    })
    return allTables
  }

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`https://eathubbackend-1.onrender.com/getReservations/${userId}`)
        if (response.ok) {
          const data = await response.json()
          // Process reservations to include table name
          const processedReservations = (data.reservations || []).map(reservation => {
            const table = getAllTables().find(t => t.id === reservation.table_id)
            return {
              ...reservation,
              name: reservation.customer_name || reservation.name,
              table: table ? table.name : reservation.table_name || 'N/A',
              tableId: reservation.table_id || reservation.tableId
            }
          })
          setReservations(processedReservations)
        } else {
          console.error('Failed to fetch reservations')
          setReservations([])
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [userId, tablesData])

  // Filter reservations by status
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredReservations(reservations)
    } else {
      setFilteredReservations(reservations.filter(r => r.status === selectedStatus))
    }
  }, [reservations, selectedStatus])

  // Calculate statistics
  const stats = {
    total: reservations.length,
    success: reservations.filter(r => r.status === 'success').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  }

  // Handle form input change
  const handleFormChange = (field, value) => {
    setReservationForm(prev => ({ ...prev, [field]: value }))
  }

  // Reset form
  const resetForm = () => {
    setReservationForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '',
      tableId: '',
      notes: '',
      status: 'pending'
    })
    setEditingReservation(null)
  }

  // Handle add reservation
  const handleAddReservation = async () => {
    if (!reservationForm.name || !reservationForm.email || !reservationForm.phone || 
        !reservationForm.date || !reservationForm.time || !reservationForm.guests || !reservationForm.tableId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const newReservation = {
        id: uuidv4(),
        name: reservationForm.name,
        email: reservationForm.email,
        phone: reservationForm.phone,
        date: reservationForm.date,
        time: reservationForm.time,
        guests: parseInt(reservationForm.guests),
        tableId: reservationForm.tableId,
        table: getAllTables().find(t => t.id === reservationForm.tableId)?.name || 'N/A',
        notes: reservationForm.notes || 'No special requests',
        status: reservationForm.status,
        created_at: new Date().toISOString()
      }

      const response = await fetch('https://eathubbackend-1.onrender.com/addReservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newReservation.id,
          restaurant_id: userId,
          customer_name: newReservation.name,
          email: newReservation.email,
          phone: newReservation.phone,
          date: newReservation.date,
          time: newReservation.time,
          guests: newReservation.guests,
          table_id: newReservation.tableId,
          notes: newReservation.notes,
          status: newReservation.status
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const table = getAllTables().find(t => t.id === data.reservation.table_id)
        const processedReservation = {
          ...data.reservation,
          name: data.reservation.customer_name || data.reservation.name,
          table: table ? table.name : 'N/A',
          tableId: data.reservation.table_id || data.reservation.tableId
        }
        setReservations(prev => [processedReservation, ...prev])
        setShowAddModal(false)
        resetForm()
        alert('Reservation added successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to add reservation')
      }
    } catch (error) {
      console.error('Error adding reservation:', error)
      alert(`Failed to add reservation: ${error.message || 'Please try again.'}`)
    }
  }

  // Handle edit reservation
  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation)
    setReservationForm({
      name: reservation.customer_name || reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests.toString(),
      tableId: reservation.table_id || reservation.tableId || '',
      notes: reservation.notes || '',
      status: reservation.status
    })
    setShowEditModal(true)
  }

  // Handle update reservation
  const handleUpdateReservation = async () => {
    if (!editingReservation) return

    if (!reservationForm.name || !reservationForm.email || !reservationForm.phone || 
        !reservationForm.date || !reservationForm.time || !reservationForm.guests || !reservationForm.tableId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const updatedReservation = {
        ...editingReservation,
        name: reservationForm.name,
        email: reservationForm.email,
        phone: reservationForm.phone,
        date: reservationForm.date,
        time: reservationForm.time,
        guests: parseInt(reservationForm.guests),
        tableId: reservationForm.tableId,
        table: getAllTables().find(t => t.id === reservationForm.tableId)?.name || editingReservation.table,
        notes: reservationForm.notes || 'No special requests',
        status: reservationForm.status
      }

      const response = await fetch(`https://eathubbackend-1.onrender.com/updateReservation/${editingReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: reservationForm.name,
          email: reservationForm.email,
          phone: reservationForm.phone,
          date: reservationForm.date,
          time: reservationForm.time,
          guests: parseInt(reservationForm.guests),
          table_id: reservationForm.tableId,
          notes: reservationForm.notes || 'No special requests',
          status: reservationForm.status
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const table = getAllTables().find(t => t.id === data.reservation.table_id)
        const processedReservation = {
          ...data.reservation,
          name: data.reservation.customer_name || data.reservation.name,
          table: table ? table.name : 'N/A',
          tableId: data.reservation.table_id || data.reservation.tableId
        }
        setReservations(prev => prev.map(r => r.id === editingReservation.id ? processedReservation : r))
        setShowEditModal(false)
        resetForm()
        alert('Reservation updated successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to update reservation')
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Failed to update reservation. Please try again.')
    }
  }

  // Handle delete reservation
  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) {
      return
    }

    try {
      const response = await fetch(`https://eathubbackend-1.onrender.com/deleteReservation/${reservationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setReservations(prev => prev.filter(r => r.id !== reservationId))
        alert('Reservation deleted successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to delete reservation')
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert(`Failed to delete reservation: ${error.message || 'Please try again.'}`)
    }
  }

  // Format date for input
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Format time for input
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  if (loading) {
    return (
      <div className='reservation-page-main-cont menu-page-main-cont'>
        <div style={{ padding: '40px', textAlign: 'center', color: '#eeeded' }}>
          Loading reservations...
        </div>
      </div>
    )
  }

  return (
    <div className='reservation-page-main-cont menu-page-main-cont'>
        <div className='reservation-page-main-cont-one'>
            <div className='reservation-page-main-cont-one-search-cont'>
                <h1>Reservation</h1>
                <p>Manage your reservations here</p>
            </div>

            <div className='reservation-page-main-cont-one-stats-cont'>
                <div>
                    <h1>Total <br/> Reservations</h1>
            <p>{stats.total}</p>
                </div>
                <div>
                    <h1>Success</h1>
            <p>{stats.success}</p>
                </div>
                <div>
                    <h1>Pending</h1>
            <p>{stats.pending}</p>
            </div>
        </div>
      </div>

        <div className='reservation-page-main-cont-two'>
            <div>
                <div>
                    <p className='reservation-page-main-cont-two-div-p-one'></p>
                    <p>Success</p>
                </div>
                <div>
                    <p className='reservation-page-main-cont-two-div-p-one pending-p'></p>
                    <p>Pending</p>
                </div>
                <div>
                    <p className='reservation-page-main-cont-two-div-p-one cancelled-p'></p>
                    <p>Cancelled</p>
                </div>
            </div>
        <button 
          className='reservation-page-main-cont-one-button'
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
        >
          <FaPlus /> Add Reservation
        </button>
        </div>

        <div>
            <ul className='reservation-page-main-cont-three'>
          {filteredReservations.length > 0 ? (
            filteredReservations.map((item) => (
                    <li className={`reservation-page-main-cont-hex-li-${item.status}`} key={item.id}>
                        <div className='reservation-page-main-cont-three-li-div-one'>
                  <h1>{(item.customer_name || item.name || 'N')[0].toUpperCase()}</h1>
                            <div className='reservation-page-main-cont-three-li-div-two'>
                                <p>{item.customer_name || item.name || 'Unknown'}</p>
                                <p>| {item.email} |</p>
                            </div>
                        </div>
                <p className='reservation-page-main-cont-three-li-p-one'>
                  <FaPhone/>{item.phone}
                </p>
                <p className='reservation-page-main-cont-three-li-p-one'>
                  <FaCalendar/>{item.date}
                </p>
                <p className='reservation-page-main-cont-three-li-p-one'>
                  <FaClock/>{item.time}
                </p>
                <p className='reservation-page-main-cont-three-li-p-one'>
                  <FaUsers/>{item.guests}
                </p>
                <p className='reservation-page-main-cont-three-li-p-one'>
                  <FaTable/>{item.table || 'N/A'}
                </p>
                        <p className='reservation-page-main-cont-three-li-p-two'>{item.notes}</p>
                        <div className='reservation-page-main-cont-three-li-p-three'>
                  <button 
                    type='button'
                    onClick={() => handleEditReservation(item)}
                  >
                    <FaEdit/> Edit
                  </button>
                  <button 
                    type='button'
                    onClick={() => handleDeleteReservation(item.id)}
                  >
                    <FaTrash/> Delete
                  </button>
                        </div>
                    </li>
            ))
          ) : (
            <li style={{ 
              width: '100%', 
              textAlign: 'center', 
              padding: '40px', 
              color: '#b6b5b5',
              listStyle: 'none'
            }}>
              No reservations found
            </li>
          )}
            </ul>
        </div>

      {/* Add Reservation Modal */}
      {showAddModal && (
        <div className='reservation-modal-overlay' onClick={() => setShowAddModal(false)}>
          <div className='reservation-modal' onClick={(e) => e.stopPropagation()}>
            <div className='reservation-modal-header'>
              <h2>Add New Reservation</h2>
              <button className='reservation-modal-close' onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className='reservation-modal-body'>
              <div className='reservation-form-group'>
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={reservationForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className='reservation-form-group'>
                <label>Email *</label>
                <input
                  type="email"
                  value={reservationForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className='reservation-form-group'>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={reservationForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className='reservation-form-row'>
                <div className='reservation-form-group'>
                  <label>Date *</label>
                  <input
                    type="date"
                    value={reservationForm.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    min={getTodayDate()}
                  />
                </div>
                <div className='reservation-form-group'>
                  <label>Time *</label>
                  <input
                    type="time"
                    value={reservationForm.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                  />
                </div>
              </div>
              <div className='reservation-form-row'>
                <div className='reservation-form-group'>
                  <label>Number of Guests *</label>
                  <input
                    type="number"
                    value={reservationForm.guests}
                    onChange={(e) => handleFormChange('guests', e.target.value)}
                    placeholder="Enter number of guests"
                    min="1"
                  />
                </div>
                <div className='reservation-form-group'>
                  <label>Table *</label>
                  <select
                    value={reservationForm.tableId}
                    onChange={(e) => handleFormChange('tableId', e.target.value)}
                  >
                    <option value="">Select Table</option>
                    {getAllTables().map(table => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.areaName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='reservation-form-group'>
                <label>Status</label>
                <select
                  value={reservationForm.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className='reservation-form-group'>
                <label>Special Requests / Notes</label>
                <textarea
                  value={reservationForm.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Enter special requests or notes (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className='reservation-modal-footer'>
              <button className='reservation-modal-cancel' onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className='reservation-modal-submit' onClick={handleAddReservation}>
                Add Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reservation Modal */}
      {showEditModal && editingReservation && (
        <div className='reservation-modal-overlay' onClick={() => setShowEditModal(false)}>
          <div className='reservation-modal' onClick={(e) => e.stopPropagation()}>
            <div className='reservation-modal-header'>
              <h2>Edit Reservation</h2>
              <button className='reservation-modal-close' onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className='reservation-modal-body'>
              <div className='reservation-form-group'>
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={reservationForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className='reservation-form-group'>
                <label>Email *</label>
                <input
                  type="email"
                  value={reservationForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className='reservation-form-group'>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={reservationForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className='reservation-form-row'>
                <div className='reservation-form-group'>
                  <label>Date *</label>
                  <input
                    type="date"
                    value={reservationForm.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                  />
                </div>
                <div className='reservation-form-group'>
                  <label>Time *</label>
                  <input
                    type="time"
                    value={reservationForm.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                  />
                </div>
              </div>
              <div className='reservation-form-row'>
                <div className='reservation-form-group'>
                  <label>Number of Guests *</label>
                  <input
                    type="number"
                    value={reservationForm.guests}
                    onChange={(e) => handleFormChange('guests', e.target.value)}
                    placeholder="Enter number of guests"
                    min="1"
                  />
                </div>
                <div className='reservation-form-group'>
                  <label>Table *</label>
                  <select
                    value={reservationForm.tableId}
                    onChange={(e) => handleFormChange('tableId', e.target.value)}
                  >
                    <option value="">Select Table</option>
                    {getAllTables().map(table => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.areaName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='reservation-form-group'>
                <label>Status</label>
                <select
                  value={reservationForm.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className='reservation-form-group'>
                <label>Special Requests / Notes</label>
                <textarea
                  value={reservationForm.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Enter special requests or notes (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className='reservation-modal-footer'>
              <button className='reservation-modal-cancel' onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className='reservation-modal-submit' onClick={handleUpdateReservation}>
                Update Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservation
