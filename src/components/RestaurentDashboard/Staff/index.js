import React, { use } from 'react'
import { useState, useEffect, useContext } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaEdit, FaTrash, FaUserTag, FaCheckCircle, FaPhone } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { CiMail } from "react-icons/ci";

import { FaEye, FaEyeSlash  } from "react-icons/fa";

import { v4 as uuidv4 } from 'uuid';

import {PulseLoader} from 'react-spinners'

import { FcRating } from "react-icons/fc";
import AllInOne from '../../../complexOne'

import errorImage from '../../../images/404error.jpg'

import './index.css'

    const role = [
        {
            id: 1,
            name: 'Manager',
        },
        {
            id: 2,
            name: 'Waiter',
        },
        {
            id: 3,
            name: 'Chef',
        },
        {
            id: 4,
            name: 'Cashier',
        },
        {
            id: 5,
            name: 'Cleaner',
        },
        {
            id: 6,
            name: 'Security',
        },
        {
            id: 7,
            name:"Others"
        }
        
    ]

const istatus = {
    INITIAL: 'INITIAL',
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
}

const Staff = () => {

    const [refreshOne, setRefreshOne] = useState(false);
    const {staffData, staffDataStatus, userId} = useContext(AllInOne);
    const [addNewStaff, setAddNewStaff] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const [addStaffName, setAddStaffName] = useState('');
    const [addStaffEmail, setAddStaffEmail] = useState('');
    const [addStaffRole, setAddStaffRole] = useState('');
    const [addStaffPhone, setAddStaffPhone] = useState('');
    const [addStaffStatus, setAddStaffStatus] = useState('');
    const [addStaffJoinedDate, setAddStaffJoinedDate] = useState(new Date().toISOString().split('T')[0]);
    const [addStaffSalary, setAddStaffSalary] = useState('');
    const [addStaffShiftTiming, setAddStaffShiftTiming] = useState('');
    const [addStaffAddress, setAddStaffAddress] = useState('');
    const [addStaffProfileImage, setAddStaffProfileImage] = useState(null);

    const [showPassword, setShowPassword] = useState(false);

    const [addStaffPassword, setAddStaffPassword] = useState('');
    const [editingStaff, setEditingStaff] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);


    const addStaffFun = async (e) => {
        e.preventDefault();
        if(addStaffName && addStaffEmail && addStaffRole && addStaffPhone && addStaffPassword){
            setSubmitting(true);
            const newStaff = {
                staff_id: uuidv4(),
                staff_name: addStaffName,
                staff_email: addStaffEmail,
                staff_role: addStaffRole,
                staff_phone: addStaffPhone,
                staff_status: addStaffStatus || null,
                staff_salary: addStaffSalary || null,
                staff_shift_timing: addStaffShiftTiming || null,
                staff_address: addStaffAddress || null,
                staff_image: null, // Can be implemented later for image upload
                password: addStaffPassword,
                restaurant_id: userId,
            }
            const url = 'http://localhost:8000/restaurant_details/addStaff';
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStaff),
            }

            try {
                const response = await fetch(url, options);
                const data = await response.json();
                if(response.ok){
                    console.log('Staff added successfully:', data);
                    // Reset form
                    setAddStaffName('');
                    setAddStaffEmail('');
                    setAddStaffRole('');
                    setAddStaffPhone('');
                    setAddStaffPassword('');
                    setAddStaffStatus('');
                    setAddStaffSalary('');
                    setAddStaffShiftTiming('');
                    setAddStaffAddress('');
                    setAddNewStaff(false);
                    // Refresh staff list
                    window.location.reload(); // Simple refresh for now
                }else{
                    console.error('Failed to add staff:', data);
                    alert(`Failed to add staff: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error adding staff:', error);
                alert('Failed to add staff. Please try again.');
            } finally {
                setSubmitting(false);
            }
        } else {
            alert('Please fill in all required fields (Name, Email, Role, Phone, Password)');
        }
    }

    const onClickEditStaff = (staff) => {
        setEditingStaff(staff);
        setIsEditing(true);
        setAddStaffName(staff.name || '');
        setAddStaffEmail(staff.email || '');
        setAddStaffRole(staff.role || '');
        setAddStaffPhone(staff.phone_number || '');
        setAddStaffStatus(staff.status || '');
        setAddStaffSalary(staff.salary || '');
        setAddStaffShiftTiming(staff.shift_timing || '');
        setAddStaffAddress(staff.address || '');
        setAddStaffPassword(''); // Don't pre-fill password
        setAddNewStaff(true);
    }

    const onClickDeleteStaff = async (staffId) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) {
            return;
        }

        setDeleting(staffId);
        try {
            const url = `http://localhost:8000/restaurant_details/deleteStaff/${staffId}/${userId}`;
            const options = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetch(url, options);
            const data = await response.json();
            
            if(response.ok){
                console.log('Staff deleted successfully:', data);
                // Refresh staff list
                window.location.reload();
            }else{
                console.error('Failed to delete staff:', data);
                alert(`Failed to delete staff: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Failed to delete staff. Please try again.');
        } finally {
            setDeleting(null);
        }
    }

    const updateStaffFun = async (e) => {
        e.preventDefault();
        if(!editingStaff) return;

        if(addStaffName && addStaffEmail && addStaffRole && addStaffPhone){
            setSubmitting(true);
            const updatedStaff = {
                staff_id: editingStaff.id,
                staff_name: addStaffName,
                staff_email: addStaffEmail,
                staff_role: addStaffRole,
                staff_phone: addStaffPhone,
                staff_status: addStaffStatus || '',
                staff_salary: addStaffSalary || null,
                staff_shift_timing: addStaffShiftTiming || '',
                staff_address: addStaffAddress || '',
                staff_image: editingStaff.staff_image || null,
                staff_experience: editingStaff.experience || null,
                staff_ratings: editingStaff.ratings || null,
                waiter_total_orders_served: editingStaff.total_orders_served || null,
                waiter_assigned_tables: editingStaff.assigned_tables || null,
                password: addStaffPassword || null, // Include password if provided (optional for updates)
                restaurant_id: userId,
            }
            
            const url = 'http://localhost:8000/restaurant_details/updateStaff';
            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedStaff),
            }

            try {
                const response = await fetch(url, options);
                const data = await response.json();
                if(response.ok){
                    console.log('Staff updated successfully:', data);
                    // Reset form
                    setAddStaffName('');
                    setAddStaffEmail('');
                    setAddStaffRole('');
                    setAddStaffPhone('');
                    setAddStaffPassword('');
                    setAddStaffStatus('');
                    setAddStaffSalary('');
                    setAddStaffShiftTiming('');
                    setAddStaffAddress('');
                    setEditingStaff(null);
                    setIsEditing(false);
                    setAddNewStaff(false);
                    // Refresh staff list
                    window.location.reload();
                }else{
                    console.error('Failed to update staff:', data);
                    alert(`Failed to update staff: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error updating staff:', error);
                alert('Failed to update staff. Please try again.');
            } finally {
                setSubmitting(false);
            }
        } else {
            alert('Please fill in all required fields (Name, Email, Role, Phone)');
        }
    }

    const handleCloseForm = () => {
        setAddNewStaff(false);
        setIsEditing(false);
        setEditingStaff(null);
        setAddStaffName('');
        setAddStaffEmail('');
        setAddStaffRole('');
        setAddStaffPhone('');
        setAddStaffPassword('');
        setAddStaffStatus('');
        setAddStaffSalary('');
        setAddStaffShiftTiming('');
        setAddStaffAddress('');
    }

    const addStaffPopOne = () => {
        return (
            <div className='add-staff-popup'>
                <div className='add-staff-popup-content'>
                    <h1 className='add-staff-popup-title'>{isEditing ? 'Edit Staff' : 'Add Staff'}</h1>
                    <form onSubmit={isEditing ? updateStaffFun : addStaffFun}>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='name'>Name: </label>
                            <input required value={addStaffName} onChange={(e) => setAddStaffName(e.target.value)} id='name' type="text" placeholder="Name" />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='email'>Email</label>
                            <input required value={addStaffEmail} onChange={(e) => setAddStaffEmail(e.target.value)} id='email' type="email" placeholder="Email" />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='role'>Role: </label>
                            <select required value={addStaffRole} onChange={(e) => setAddStaffRole(e.target.value)} id='role' className='add-staff-popup-input-select'>
                                <option value="">Select Role</option>
                                {role.map((role) => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='password'>
                                Password {isEditing && <span>(leave blank to keep current password)</span>}
                            </label>
                            <div className='password-input-container'>
                                <input 
                                    required={!isEditing}
                                    value={addStaffPassword} 
                                    onChange={(e) => setAddStaffPassword(e.target.value)} 
                                    id='password'  
                                    type={showPassword ? "text" : "password"} 
                                    placeholder={isEditing ? "Enter new password (optional)" : "Password"} 
                                />
                                {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
                            </div>
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='phone'>Phone</label>
                            <input required value={addStaffPhone} onChange={(e) => setAddStaffPhone(e.target.value)} id='phone'  type="text" placeholder="Phone" />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='status'>Status: <br/> <span>( optional )</span> </label>
                            <input value={addStaffStatus} onChange={(e) => setAddStaffStatus(e.target.value)} id='status' type="text" placeholder="Status" />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='joined'>Joined Date: </label>
                            <input value={addStaffJoinedDate} onChange={(e) => setAddStaffJoinedDate(e.target.value)} id='joined' type="date" placeholder="Joined Date" />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='salary'>Salary: <br /> <span>( optional )</span> </label>
                            <input value={addStaffSalary} onChange={(e) => setAddStaffSalary(e.target.value)} id='salary' type='number' placeholder='salary'/>
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='shift-timing'>Shift Timing: <br/> <span>( optional )</span> </label>
                            <input value={addStaffShiftTiming} onChange={(e) => setAddStaffShiftTiming(e.target.value)} id='shift-timing' type='text' placeholder='shift-timing' />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='address'>Address: <br/> <span>( optional )</span> </label>
                            <input value={addStaffAddress} onChange={(e) => setAddStaffAddress(e.target.value)} id='address' type='text' placeholder='address' />
                        </div>
                        <div className='add-staff-popup-input-group'>
                            <label htmlFor='profile-image'>Profile Image: <br/> <span>( optional )</span> </label>
                            <input type='file' placeholder='profile-image' />
                        </div>
                        <div className='add-staff-popup-btn-group'>
                            <button 
                                className='add-staff-popup-close-btn' 
                                type='button' 
                                onClick={handleCloseForm}
                                disabled={submitting}
                            >
                                Close
                            </button>
                            <button 
                                type="submit" 
                                className='add-staff-popup-submit-btn'
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <PulseLoader color='#fff' size={8} /> {isEditing ? 'Updating...' : 'Adding...'}
                                    </>
                                ) : (
                                    isEditing ? 'Update Staff' : 'Add Staff'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

  return (
    <div className='menu-page-main-cont staff-container'>
        {addNewStaff && addStaffPopOne()}
        <div className='staff-header-container'>
            <h1>Staff Members</h1>
            <button onClick={() => setAddNewStaff(true)}>Add Staff</button>
        </div>
        <div>

            <div className='staff-roles-header'>
                <h1 className='staff-roles-title'>Staff Roles</h1>
            </div>
            <ul className='staff-role-container'>
                {role.map((roleItem) => (
                    <li 
                        key={roleItem.id}
                        className={`staff-role-item ${selectedRole === roleItem.name ? 'staff-role-item-active' : ''}`}
                        onClick={() => {
                            if (selectedRole === roleItem.name) {
                                setSelectedRole(null); // Deselect if already selected
                            } else {
                                setSelectedRole(roleItem.name); // Select the role
                            }
                        }}
                    >
                        <h1>{roleItem.name}</h1>
                    </li>
                ))}
            </ul>


        </div>



        <div className='staff-list-container'>
            <ul className='staff-list-item'>
                {staffDataStatus === istatus.LOADING && (
                    <li className='staff-loading-item'>
                        <div className='staff-loading-container'> 
                            <div className='staff-loading-spinner'></div>
                            <p>Loading staff members...</p>
                        </div>
                    </li>
                )}
                {staffDataStatus === istatus.ERROR && (
                    <li className='staff-error-item'>
                        <div className='staff-error-container'>
                            <div className='staff-error-icon'>⚠️</div>
                            <h2>Error Loading Staff</h2>
                            <p>Something went wrong while loading staff members. Please try again.</p>
                            <button 
                                className='staff-error-retry-btn' 
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </div>
                    </li>
                )}
                {staffData.length > 0 && staffDataStatus === istatus.SUCCESS && staffData
                    .filter(staff => {
                        // Filter by selected role if one is selected
                        if (selectedRole) {
                            return staff.role && staff.role.toLowerCase() === selectedRole.toLowerCase();
                        }
                        return true; // Show all if no role is selected
                    })
                    .map((staff) => (

                    <li>
                        <div className='staff-list-item-profile'>
                            <CgProfile className='staff-list-item-profile-icon' />
                            <h1>{staff.name}</h1>
                        </div>
                        <p><CiMail className='staff-list-item-icon' />{staff.email}</p>
                        <p><FaUserTag className='staff-list-item-icon' />{staff.role}</p>
                        <p><FaPhone className='staff-list-item-icon' />{staff.phone_number}</p>
                        <p className="staff-list-item-role status-style">{staff.status}</p>
                        <p><FaCalendarAlt className='staff-list-item-icon' />{staff.joined_at}</p>
                        <div className='staff-list-item-ratings-container'>
                            <div className='staff-list-item-ratings'>
                                <FcRating />
                                <p>{staff.ratings}</p>
                            </div>
                            <div className='staff-list-item-btn-container'>
                                <button 
                                    className='staff-list-item-edit-btn' 
                                    onClick={() => onClickEditStaff(staff)}
                                    disabled={deleting !== null}
                                >
                                    <FaEdit />
                                </button>
                                <button 
                                    className='staff-list-item-delete-btn' 
                                    onClick={() => onClickDeleteStaff(staff.id)}
                                    disabled={deleting === staff.id || deleting !== null}
                                >
                                    {deleting === staff.id ? (
                                        <PulseLoader color='#fff' size={6} />
                                    ) : (
                                        <FaTrash />
                                    )}
                                </button>
                            </div>
                        </div>

                    </li>
                ))}

                {staffDataStatus === istatus.SUCCESS && staffData.length === 0 && <div className='no-staff-container'>
                    <p>No Staff Found. Please add staff.</p>
                    </div>}
                
            </ul>
        </div>
    </div>
  )
}

export default Staff