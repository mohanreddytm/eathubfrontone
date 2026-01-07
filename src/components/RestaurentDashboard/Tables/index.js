import './index.css'
import AllInOne from '../../../complexOne'
import { useContext, useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode';
import { BsQrCodeScan, BsDownload } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { v4 as uuidv4 } from 'uuid'
import { FaEdit } from 'react-icons/fa'
import { ClipLoader, PacmanLoader } from "react-spinners";
import { MdDone } from "react-icons/md";

import { FaTrash } from 'react-icons/fa'

const statusOne = {
    INITIAL: "INITIAL",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    PENDING: "PENDING",
  }

const Tables = () => {
    const {areasData, areasDataStatus, tablesData, tablesDataStatus, userId, addTable, updateTable, deleteTable, addArea, deleteArea, updateArea} = useContext(AllInOne);
    const [qrCodes, setQrCodes] = useState({});
    const [addTableLoading, setAddTableLoading] = useState(false);
    const [newTable, setNewTable] = useState(false);
    const [editTable, setEditTable] = useState(false);
    const [editTableId, setEditTableId] = useState(null);
    const [newTableName, setNewTableName] = useState('');
    const [newTableCapacity, setNewTableCapacity] = useState('0');
    const [totalTables, setTotalTables] = useState(0);
    const [newTableArea, setNewTableArea] = useState('');
    const [newTableStatus, setNewTableStatus] = useState("ACTIVE");
    const [loadingAddArea, setLoadingAddArea] = useState(false);
    const [deleteAreaId, setDeleteAreaId] = useState(null); 
    const [deleteAreaLoading, setDeleteAreaLoading] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [onEditAreaLoading, setOnEditAreaLoading] = useState(false);

    const [onEditAreaOne, setOnEditAreaOne] = useState(null);
    const [onEditAreaOldName, setOnEditAreaOldName] = useState('');


    const [updateAreaMade, setUpdateAreaMade] = useState(false);
    const [deleteMade, setDeleteMade] = useState(false);
    const dropdownRef = useRef(null);
    const [oldTableEdit, setOldEditTable] = useState('')

    useEffect(() => {
        function handleClickOutside(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setDeleteMade(false);
            setUpdateAreaMade(false);
        }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
        if(tablesDataStatus === "SUCCESS" && tablesData.length === areasData.length){
            let count = 0;
            tablesData.map(each => {
                count += each.tables.length;
                return {
                    ...each
                }
            })
            setTotalTables(count);
        }
    },[tablesData, tablesDataStatus])

    const generateQRCode = async (table) => {
        if (qrCodes[table.id]) return;
        
        try {
            const tableData = {
                tableId: table.id,
                tableName: table.name,
                areaName: table.area_name || 'Main Area',
                seatCapacity: table.seat_capacity,
                restaurantId: table.restaurant_id,
                timestamp: new Date().toISOString(),
                type: 'table_qr'
            };

            const trasnforUrl = `https://eathubfrontone.vercel.app/customerDashboard/${tableData.tableId}/${tableData.restaurantId}/home`;
            
            // const qrData = JSON.stringify(tableData);
            const url = await QRCode.toDataURL(trasnforUrl, {
                width: 128,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            setQrCodes(prev => ({ ...prev, [table.id]: url }));
            
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
        
    };

    const downloadQRCode = (table) => {
        if (!qrCodes[table.id]) return;
        
        const link = document.createElement('a');
        link.download = `qr-code-${table.name}.png`;
        link.href = qrCodes[table.id];
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    useEffect(() => {
        if(tablesDataStatus === statusOne.SUCCESS && tablesData.length > 0){
        tablesData.map((each) => {
            each.tables.map((eachTable) => {
                    generateQRCode(eachTable);
                })
            })
        }
    }, [tablesData]);

    const onClickEditTableBtn = (table) => {
        // setEditTable(table);
        setEditTableId(table.id);
        setNewTableName(table.name);
        setNewTableCapacity(table.seat_capacity);
        setNewTableArea(table.area_id);
        setNewTableStatus(table.is_active === "active" ? "ACTIVE" : "INACTIVE");
        setNewTable(true);
        setEditTable(true);
        setOldEditTable(table.area_id);
    }

    const onSubmitAddTablePopup = async (e) => {
        e.preventDefault();
        setAddTableLoading(true);
        if(editTable){
            if(newTableName.trim() !== ''  && newTableArea.trim() !== '' && newTableCapacity != '') {
                const updatedTableData = {
                    table_id: editTableId,
                    restaurant_id: userId, 
                    table_name: newTableName,
                    table_capacity:newTableCapacity,
                    area_id: newTableArea,
                    table_status: newTableStatus === 'ACTIVE' ? "active" : "inactive",
                };

                console.log(updatedTableData)

                const url = "https://eathubbackend-1.onrender.com/restaurant_details/updateTable";
                const options = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTableData),
                };

                const response = await fetch(url, options);
                const data = await response.json();
                console.log(data)
                setAddTableLoading(false);

                if(response.ok){
                    updateTable(updatedTableData, oldTableEdit);   
                    setNewTable(false);
                    setNewTableName('');
                    setNewTableCapacity(0);
                    setNewTableArea('');
                    setNewTableStatus('ACTIVE');
                }else{
                    console.log("error in table")
                }
            }
        }else{
            if(newTableName.trim() !== ''  && newTableArea.trim() !== '' && newTableCapacity != '') {
                const newTableData = [{
                    table_id: uuidv4(),
                    restaurant_id: userId, 
                    table_name: newTableName,
                    table_capacity:newTableCapacity,
                    area_id: newTableArea,
                    table_status: newTableStatus === 'ACTIVE' ? "active" : "inactive",
                }];

                console.log(newTableData)

                const url = "https://eathubbackend-1.onrender.com/restaurant_details/addTable";
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newTableData),
                };

                const response = await fetch(url, options);
                const data = await response.json();
                console.log(data)
                setAddTableLoading(false);
                if(response.ok){
                    addTable(newTableData[0]);
                    setNewTable(false);
                    setNewTableName('');
                    setNewTableCapacity(0);
                    setNewTableArea('');
                    setNewTableStatus('ACTIVE');
                }else{
                    console.log("error in table")
                }
            }
        }
    }

    const onClickClosepopup = () => {
        setNewTable(false);
        if(editTable){
            setEditTable(false);
            setNewTableName('');
            setNewTableCapacity(0);
            setNewTableArea('');
            setNewTableStatus('ACTIVE');
        }
    }

    const onClickDeleteBtn = async (one) => {
        const url = `https://eathubbackend-1.onrender.com/deleteTable/${one.id}/${one.restaurant_id}`;
        const options = {
            method:"DELETE"
        }
        const response = await fetch(url, options);
        if(response.ok){
            deleteTable(one.id);
        }else{
            console.log("error in deleting")
        }
    }

    const addTablePopupCont = () => {
        return(
            <div className={`add-table-popup ${newTable && 'add-table-popup-cont-active'}`}>
                <form onSubmit={onSubmitAddTablePopup}>
                    {addTableLoading &&
                        <div className='add-table-popup-loader'>
                            <ClipLoader loading={true} color="#6c68dcff" size={20}  />
                        </div>
                    }

                    <h1>{editTable ? 'Edit' : 'Add'} Table</h1>
                    <h1 className='add-table-popup-head'>Table Name</h1>
                    <input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} required type="text" placeholder="Table Name" />
                    <h1 className='add-table-popup-head'>Seat Capacity</h1>
                    <input value={newTableCapacity} onChange={(e) => setNewTableCapacity(e.target.value)} required type="number" placeholder="Seat Capacity" />

                    <div className='add-table-popup-area-status-cont'>
                        <div className='add-table-popup-area-cont'>
                            <h1 className='add-table-popup-head'>Area</h1>
                            <select value={newTableArea} onChange={(e) => setNewTableArea(e.target.value)} required>
                                <option value="">Select Area</option>
                                {areasDataStatus === statusOne.SUCCESS && areasData.map((each) => {
                                    return <option key={each.id} value={each.id}>{each.area_name}</option>
                                })}
                            </select>
                        </div>
                        <div>
                            <h1 className='add-table-popup-head'>Status</h1>
                            <button type='button' onClick = {() => setNewTableStatus('ACTIVE')} className={`add-table-btn ${newTableStatus === 'ACTIVE' ? 'active-table-btn' : ''}`}>Active</button>
                            <button type='button' onClick = {() => setNewTableStatus('INACTIVE')} className={`add-table-btn ${newTableStatus === 'INACTIVE' ? 'inactive-table-btn' : ''}`}>Inactive</button>
                        </div>
                    </div>

                    <button type='submit' className='add-btn-table-btn'>{editTable ? 'Edit' : 'Add'} Table</button>
                    <IoMdClose onClick={onClickClosepopup} className='add-btn-table-close-btn' />
                </form>
            </div>
        )
    }

    const onClickAreaBtn = async () => {
        if(newAreaName.trim() !== ''){
            setLoadingAddArea(true);
            const newAreaData = [{
                area_id: uuidv4(),
                area_name: newAreaName,
                restaurant_id: userId
            }];

            const url = "https://eathubbackend-1.onrender.com/restaurant_details/addAreas";
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAreaData),
            };

            const response = await fetch(url, options);
            setLoadingAddArea(false);
            if(response.ok){
                addArea(newAreaData[0]);
                setNewAreaName(''); 
            }else{
                console.log("got error in adding area")
            }
        }
    }

    const onClickDeleteArea = async () => {
        if(deleteAreaId !== null){
            setDeleteAreaLoading(true);
            const url = `https://eathubbackend-1.onrender.com/deleteArea/${deleteAreaId.area.id}/${userId}`;
            const options = {
                method: 'DELETE'
            };

            const response = await fetch(url, options);
            setDeleteAreaLoading(false);
            if(response.ok){
                // Remove the deleted area from the state
                deleteArea(deleteAreaId.area.id);
                setDeleteAreaId(null);
            }else{
                console.log("got error in deleting area")
            }
        }
    }


    const onClickEditAreaFun = async () => {
        if(onEditAreaOne !== null){
            setOnEditAreaLoading(true);
            const areaOne = {
                area_id: onEditAreaOne.id,
                area_name: onEditAreaOne.area_name,
                restaurant_id: onEditAreaOne.restaurant_id
            };
            console.log(areaOne)
            const url = `https://eathubbackend-1.onrender.com/restaurant_details/updateArea`;
            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(areaOne),
            };

            const response = await fetch(url, options);
            setOnEditAreaLoading(false);
            const json = await response.json()
            console.log(json)

            if(response.ok){
                updateArea(areaOne, onEditAreaOldName);
                setOnEditAreaOne(null);
            }else{
                console.log("got error in updating area")
            }
        }
    }

    const onClickEditOneArea = (area) => {
        setOnEditAreaOne(area);
        setOnEditAreaOldName(area.area_name);
    }

    const onClickEditAreaMade = () => {
        setUpdateAreaMade(true);
        setDeleteMade(false);
    }

    const onClickDeleteAreaMade = () =>{
        setDeleteMade(true);
        setUpdateAreaMade(false);
    }

    return(
        <>
            {deleteAreaId !== null && (
                <div className='tables-page-main-confirmation-delete'>
                    <div className='tables-page-main-confirmation-delete-inner delete-one-warning'>
                        <h1 className='tables-page-main-confirmation-delete-inner-head'>Do You Want To Delete This Area?</h1>
                        <div className='tables-page-main-confirmation-delete-inner-head-cont'>
                        <h1 className='tables-page-main-confirmation-delete-inner-head-1'>{deleteAreaId.area.area_name}</h1>
                        <p className='tables-page-main-confirmation-delete-inner-head-2'>{deleteAreaId.count}</p>
                    </div>
                    <div className='tables-page-main-confirmation-delete-inner-button-cont'>
                        <button onClick={() => setDeleteAreaId(null)} className="tables-page-main-confirmation-delete-inner-button">Cancel</button>
                        <button onClick={() => onClickDeleteArea(deleteAreaId.area.area_id)} className="tables-page-main-cont-three-li-button-delete">Delete
                            {deleteAreaLoading && (
                                <div className='add-table-popup-loader'>
                                    <ClipLoader loading={deleteAreaLoading} color="#6c68dcff" size={16}  />
                                </div>
                            )}
                        </button>
                    </div>
                </div>

            </div>
            )}
            <div className="tables-page-main-cont">
                <div className="tables-page-main-cont-one">
                    <h1 className="tables-page-main-cont-one-head">Tables</h1>
                    <button onClick={() => setNewTable(true)} className="tables-page-main-cont-one-button">Add Table</button>
                </div>
                <div className="tables-page-main-cont-two-main-cont">
                    <div className="tables-page-main-cont-two">
                        <div className="tables-page-main-cont-two-head-cont">
                            <h1 className="tables-page-main-cont-two-head">Areas</h1>
                            <div className="tables-page-main-cont-two-input-cont">
                                <PacmanLoader className='pacman-loader-one' size={10} loading={loadingAddArea} color='#fff' />
                                <input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} type="text" placeholder="Enter Area Name" className="tables-page-main-cont-two-input" />
                                <button onClick={onClickAreaBtn} className="tables-page-main-cont-two-input-button">Add Area</button>
                            </div>
                        </div>
                        <div className='tables-page-main-cont-two-ul-cont'>
                            <ul className='tables-page-main-cont-two-ul'>
                                <li>{totalTables}</li>
                                {areasDataStatus === statusOne.PENDING && <li>Loading...</li>}
                                {areasDataStatus === statusOne.SUCCESS && areasData.map((each) => {

                                    let tablesCount = 0;
                                    if(tablesDataStatus === "SUCCESS" && tablesData.length === areasData.length){
                                        tablesCount = tablesData?.filter(table => table.name === each.area_name)[0].tables.length;
                                    }
                                    return (
                                        <li key={each.id}>{each.area_name} - {tablesCount}</li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className='tables-page-main-cont-three-li-name-edit-and-del' ref={dropdownRef}>
                            <div className='tables-page-main-cont-three-li-name-edit-and-del-inner'>
                                <p onClick={onClickEditAreaMade}>Edit</p>
                                <hr className='tables-page-main-cont-three-li-name-edit-and-del-hr' />   
                                <p onClick={onClickDeleteAreaMade}>Delete</p>
                            </div>
                            {updateAreaMade &&
                            <div className='tables-page-main-cont-three-li-name-edit-and-del-inner-2'>
                                <div>
                                    <p className='tables-page-main-cont-three-li-name-edit-and-del-inner-2-text'>Click To Edit the Area</p>
                                    </div>
                                    {areasDataStatus === statusOne.SUCCESS && areasData.map((area) => {
                                        return (
                                            <div onClick={() => onClickEditOneArea(area)} className='tables-page-main-cont-three-li-name-edit-and-del-inner-2-text-cont' key={area.id}>
                                                {onEditAreaOne !== null && onEditAreaOne.id === area.id ? 
                                                <div className='tables-page-main-cont-three-li-edit-area-input-cont'>
                                                    <input value={onEditAreaOne.area_name} onChange={(e) => setOnEditAreaOne({...onEditAreaOne, area_name: e.target.value})} type='text' className='tables-page-main-update-area-input' />  
                                                {onEditAreaLoading ? <ClipLoader size={14} color='#fff' className='tables-page-main-text-cont-done-icon' /> : <MdDone onClick={onClickEditAreaFun} className='tables-page-main-text-cont-done-icon' /> }</div> : 
                                                <p className='tables-page-main-cont-three-li-name-edit-and-del-inner-2-text-cont tables-edit-name-modifier' >{area.area_name}</p>}
                                            </div>
                                        )
                                    })}

                            </div>
                            }
                            {deleteMade &&
                                <div className='tables-page-main-cont-three-li-name-edit-and-del-inner-2'>
                                    <div>
                                        <p className='tables-page-main-cont-three-li-name-edit-and-del-inner-2-text'>Click To Delete the Area</p>
                                    </div>
                                    {areasDataStatus === statusOne.SUCCESS && areasData.map((area) => {
                                        let tablesCount = 0;
                                        if(tablesDataStatus === "SUCCESS" && tablesData.length === areasData.length){
                                            tablesCount = tablesData?.filter(table => table.name === area.area_name)[0].tables.length;
                                        }
                                        return (
                                            <div className='tables-page-main-cont-three-li-name-edit-and-del-inner-2-text-cont' key={area.id}>
                                                <p className='tables-page-main-cont-three-li-name-edit-and-del-inner-2-text-cont' onClick={() => setDeleteAreaId({area, count:tablesCount})}>{area.area_name}  <span>{tablesCount}</span></p>
                                            </div>
                                        )
                                    })}
                                </div>
                            } 
                            
                        </div>
                    </div>
                </div>
                <div className="tables-page-main-cont-three">
                    {tablesDataStatus === statusOne.PENDING && <li>Loading...</li>}
                    {tablesDataStatus === statusOne.SUCCESS && tablesData.map((each) => {
                        if(each.tables.length === 0) return null;
                        return (
                        <div>
                            <h1 className='tables-page-main-cont-three-h1'>{each.name}</h1>
                            <ul className='tables-page-main-cont-three-ul'>
                                {each.tables.map((eachTable) =>{
                                    return (
                                        <li className={`tables-page-main-cont-three-li ${eachTable.is_active === "active" ? 'tables-page-main-cont-three-li-active' : 'tables-page-main-cont-three-li-inactive'}`} key={eachTable.id}>
                                            <div className='tables-page-main-cont-three-li-div'>
                                                <h1 className='tables-page-main-cont-three-li-h1'>{eachTable.name}</h1>
                                                <p className='tables-page-main-cont-three-li-p'>{eachTable.seat_capacity}</p>
                                            </div>
                                            <div>
                                                {qrCodes[eachTable.id] ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                                        <img 
                                                            src={qrCodes[eachTable.id]} 
                                                            alt={`QR Code for ${eachTable.name}`}
                                                            style={{ width: '164px', height: '164px' }}
                                                        />
                                                        <div className='tables-page-main-cont-three-li-button-group'>
                                                            <button 
                                                                onClick={() => downloadQRCode(eachTable)}
                                                                className='tables-page-main-cont-three-li-button'
                                                            >
                                                                <BsDownload />
                                                                Download
                                                            </button>
                                                            <button onClick={() => onClickEditTableBtn(eachTable)} className='tables-page-main-cont-three-li-button edit-table-btn'>
                                                                <FaEdit />
                                                            </button>
                                                            <button onClick={() => onClickDeleteBtn(eachTable)} className='tables-page-main-cont-three-li-button delete-table-btn'>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>

                                        </li>
                                    );
                                })}
                            </ul>
                        </div>)
                    })}
                </div>

            </div>
            {addTablePopupCont()}


        </>
    )
}

export default Tables;
