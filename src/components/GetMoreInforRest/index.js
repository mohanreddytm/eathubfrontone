import React from 'react'

import { useState, useEffect  } from 'react';

import {jwtDecode} from 'jwt-decode';

import { v4 as uuidv4 } from 'uuid';
import { ClipLoader } from "react-spinners";
import FileImage from './style'
import { useNavigate} from 'react-router-dom';

import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

import { IoMdAdd } from "react-icons/io";

import { MdDeleteForever as MdDelete } from "react-icons/md";

import cookies from 'js-cookie'

import failure from '../../images/failure.jpg'

import veg from '../../images/veg.png'
import nonveg from '../../images/nonveg.png'

import './index.css'



const GetMoreInforRest = () => {
    const navigate = useNavigate();
    const [areas, setAreas] = useState([]);
    const [tables, setTables] = useState([]);
    const [menuCategories, setMenuCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    const [areaLoading, setAreasLoading] = useState(false);
    const [areaFailure, setAreaFailure] = useState(false);

    const [tablesLoading, setTablesLoading] = useState(false);
    const [tablesFailure, setTablesFailure] = useState(false);

    const [menuCategoryLoading, setMenuCategoryLoading] = useState(false)
    const [menuCategoryFailure, setMenuCategoryFailure] = useState(false)

    const [menuItemLoading, setMenuItemLoading] = useState(false);
    const [menuItemFailure, setMenuItemFailure] = useState(false);

    const [clickedSaveArea, setClickedSaveArea] = useState(false);
    const [clickedSaveTables, setClickedSaveTables] = useState(false);
    const [clickedSavMenuC, setClickedSaveMenuC] = useState(false);
    const [clickedSaveMenuT, setClickedSaveMenuT] = useState(false);

    const [areaOneInput, setAreaOneInput] = useState('');
    const [currentStep, setCurrentStep] = useState("area");
    const [menuCategoryInput, setMenuCategoryInput] = useState('');
    const [tableStatus, setTableStatus] = useState('active');
    const [tableName, setTableName] = useState('');
    const [seatingCapacity, setSeatingCapacity] = useState(0);
    const [selectedArea, setSelectedArea] = useState('');

    const [menuItemName, setMenuItemName] = useState('');
    const [itemDes, setItemDes] = useState('')
    const [itemMenuCategory, setTimeMenuCategory] = useState('')
    const [itemCategory, setItemCategory] = useState('')
    const [itemPreparationTime, setItemPreparationTime] = useState('')
    const [itemAvailability, setItemAvailability] = useState("Yes");
    const [imageUrl, setImageURL] = useState('')
    const [price, setPrice] = useState('')
    const [imageFile, setImageFile] = useState(null);   
    const [restaurantId, setRestaurantId] = useState('');

    const [menuImageLoading, setMenuImageLoading] = useState(false);

    useEffect(() => {
        const isAuth = cookies.get('t_user');
        if (!isAuth) {
            navigate('/login');
        }
    }, [ navigate]);

    useEffect(() => {
        const token = cookies.get('t_user');
        if(token){
            const data = jwtDecode(token);
            setRestaurantId(data.userId);
            console.log("restaurantId", data.userId)
            const preDefinedMenuCategories = [  
                {
                    menu_category_id: uuidv4(),
                    menu_category_name: "Starters",
                    restaurant_id: data.userId
                },
                {
                    menu_category_id: uuidv4(),
                    menu_category_name: "Main Course",
                    restaurant_id: data.userId
                },
                {
                    menu_category_id: uuidv4(),
                    menu_category_name: "Desserts",
                    restaurant_id: data.userId
                },
                {
                    menu_category_id: uuidv4(),
                    menu_category_name: "Beverages",
                    restaurant_id: data.userId
                },
                {
                    menu_category_id: uuidv4(),
                    menu_category_name: "Snacks",
                    restaurant_id: data.userId
                }
            ]
            console.log("preDefinedMenuCategories", preDefinedMenuCategories)
            setMenuCategories(preDefinedMenuCategories)
        }else{
            navigate('/login');
        }
    }, [])


    const onSubmitAddArea = (e) => {
        e.preventDefault();
        
        if (areaOneInput.trim() !== '') {
            const newArea = {
                area_id: uuidv4(),
                area_name: areaOneInput,
                restaurant_id:restaurantId
            }

            console.log(newArea)
            setAreas([...areas, newArea]);
            setAreaOneInput('');
        }
    }

    const onClickDeleteIcon = (area1) => {
        const updatedAreas = areas.filter(each => each.area_id !== area1);
        if(tables.length > 0){
            const filteredTables = tables.filter(each => each.area_id !== area1)
            setTables(filteredTables)
        }
        setAreas(updatedAreas);
    }

    const onChangeAreaInput = (e) => {
        setAreaOneInput(e.target.value);
    }

    const onClickSaveNxtAreas = async () => {
        if(areas.length > 0) {
            setAreasLoading(true)
            const url = "https://ttbackone-v48h.onrender.com/restaurant_details/addAreas"
            const options = {
                method: "POST",
                headers:{
                    "Content-type":"application/json",
                },
                body: JSON.stringify(areas)
            }
            const response = await fetch(url, options)
            if(response.ok){
                setCurrentStep("table");
                setClickedSaveArea(true);
            }else{
                setAreaFailure(true)
            }
            const json = await response.json()
            console.log(json);
            setAreasLoading(false);
        }
    }

    const onClickBackFromTable = () => {
        setCurrentStep("area");
    }
    const onClickTableDeleteIcon = (tableName) => {
        const updatedTables = tables.filter(table => table.table_name !== tableName);
        setTables(updatedTables);
    }

    

    const onSubmitMenuCategory = (e) => {
        e.preventDefault();
        if(menuCategoryInput.trim() !== ''){
            const newMenuCategory = {
                menu_category_id: uuidv4(),
                menu_category_name:menuCategoryInput,
                restaurant_id: restaurantId
            }
            setMenuCategories([...menuCategories, newMenuCategory])
            setMenuCategoryInput('');
        }else{
            setMenuCategoryInput('');
        }
    } 

    const onChangeFileName = async (event) => {
        setMenuImageLoading(true);
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "my_preset"); // <-- your unsigned upload preset name

        const res = await fetch(
        "https://api.cloudinary.com/v1_1/dbrwqjsl3/image/upload",
        { method: "POST", body: formData }
        );
        const data = await res.json();
        console.log(data.secure_url); // This is your image URL
        setImageURL(data.secure_url);
        console.log("data", data)
        setMenuImageLoading(false);
      };
    

    const onClickSaveAndNextTable = async () => {
        if(tables.length > 0) {
            setTablesLoading(true);
            const url = "https://ttbackone-v48h.onrender.com/restaurant_details/addTable"
            const options = 
            {
                method: "POST",
                headers:{
                    "Content-type": "application/json",
                },
                body:JSON.stringify(tables)
            }

            const response = await fetch(url, options);
            if(response.ok){
                setCurrentStep("menu");
                setClickedSaveTables(true)
            }else{
                setTablesFailure(true);
            }
            setTablesLoading(false);
            const jsondata = await response.json();
            console.log(jsondata)
        }
    }

    const onClickMenuNxtB = async () => {
        if(menuCategories.length > 0){
            setMenuCategoryLoading(true);
            const url = "https://ttbackone-v48h.onrender.com/restaurant_details/addMenuCategory"
            console.log("menuCategories - final", menuCategories)
            const options = 
            {
                method: "POST",
                headers:{
                    "Content-type": "application/json",
                },
                body:JSON.stringify(menuCategories)
            }

            console.log("menuCategories", menuCategories)

            const response = await fetch(url, options);
            if(response.ok){
                setCurrentStep("menuItems");
                setClickedSaveMenuC(true)
            }else{
                setMenuCategoryFailure(true);
            }
            setMenuCategoryLoading(false);
            const jsondata = await response.json();
            console.log(jsondata)
        }
    }

    const onClickTryAgainButtonArea = () => {
        setAreasLoading(false);
        setAreaFailure(false);
        setTablesFailure(false);
        setTablesLoading(false);
        setMenuItemFailure(false);
        setMenuCategoryLoading(false)
        setMenuItemLoading(false);
        setMenuCategoryFailure(false);
        window.location.reload();
    }

    const failureOne = () => (
            <>
                <img className='failure-image' src = {failure} alt="Failure" />
                <button type='button' onClick={onClickTryAgainButtonArea} className='failure-button'>Try Again</button>
            </>
    )


    const RestaurantAreasOne = () => {
        if(areaFailure){
            return (
                failureOne()
            )
        }
        return (
            <form onSubmit={onSubmitAddArea} className='gm-use-cont'>
                <h1 className='gm-use-title'>Set Up Your Restaurant Areas</h1>
                <p className='gm-use-description'>To be define about your restaurant areas, please provide the names of the areas you want to add.</p>
                <p className='gm-use-description'>Like Outdoor Seating, Indoor Seating and Rooftop etc. </p>
                <h1 className='gm-use-add-area-one'>Add Area</h1>
                <input
                    value={ areaOneInput}
                    onChange={onChangeAreaInput}
                    className='gm-input-area'
                    type='text'
                    placeholder='Ex: Outdoor Seating'
                    required
                    />

                <div className='gm-add-area-btn-cont'>
                    <button type='submit' className='gm-add-area-btn'>Add Area</button>
                    <button type='button' onClick={onClickSaveNxtAreas} className={`gm-next-btn ${areas.length > 0 && "gm-next-done-btn"}`}>
                        {areaLoading && 
                        <div className='inside-loader'>
                            <ClipLoader
                                color="#ffffff"
                                loading={areaLoading}
                                size={20}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                        }Save & Next</button>
                </div>
                <p className={`gm-skip ${areas.length > 0 && "gm-skip-none"}`} onClick={() => setCurrentStep("table")}>Skip for now <FaArrowRightLong className='gm-skip-icon' /> </p>
                <div>
                    <h1 className='gm-use-bottom-head'>Your Restaurant Areas</h1>
                    {areas.length > 0 ? (
                        <ul className='gm-use-bottom-ul'>
                            {areas.map((area) => (
                                <li key={area.area_id} className='gm-use-bottom-p'>{area.area_name} <MdDelete onClick={() => onClickDeleteIcon(area.area_id)} className='gm-delete-icon' /></li>
                            ))}
                        </ul>
                    ) : (
                            <p className='gm-use-bottom-p'>You have not added any areas yet.</p>
                        )}

                </div>
            </form>     
        )
    }

    const onSubmitOfTable = (e) => {
        e.preventDefault();
        if(tableName.trim() !== '' && seatingCapacity !== 0 && selectedArea.trim() !== ''){

            const newtable = {
                table_id: uuidv4(),
                table_name: tableName, 
                table_capacity: seatingCapacity, 
                table_status:tableStatus, 
                restaurant_id: restaurantId, 
                area_id: selectedArea
            }
            console.log(selectedArea);
            setTables([...tables, newtable]);
            setTableName('');
            setSeatingCapacity(0);
            setSelectedArea('');
            setTableStatus("active");
        }

    }


    const AddingTables = () => {
        if(tablesFailure){
            return (
                failureOne()
            )
        }
        return (
            <form onSubmit={onSubmitOfTable} className='gm-use-cont gm-use-table-cont'>
                <h1 className='gm-use-title'>Add Tables to Your Restaurant Areas</h1>
                <p className='gm-use-description'>To add tables to your restaurant areas, please provide the details of the tables you want to add.</p>

                <h1 className='gm-use-add-area-one'>Add Table</h1>
                <div className='gm-use-add-area-cont-mini'><h1 className='gm-use-add-area-one'>Select Area</h1> <button type='button' onClick={() => setCurrentStep("area")} className='gm-table-add-area-one-b'><IoMdAdd /> Add</button></div>
                <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className='gm-input-area' required>
                    <option>Select Area</option>
                    {areas.map((area) => (
                        <option key={area.area_id} value={area.area_id}>{area.area_name}</option>
                    ))}
                </select>
                <h1 className='gm-use-add-area-one'>Table Name</h1>
                <input value={tableName} onChange={(e) => setTableName(e.target.value)} className='gm-input-area' type='text' placeholder='Ex: T01' required />
                <h1 className='gm-use-add-area-one'>Seating Capacity</h1>
                <input value={seatingCapacity} onChange={(e) => setSeatingCapacity(e.target.value)} className='gm-input-area' type='number' placeholder='Number of Seats (Ex: 4)' required />
                <h1 className='gm-use-add-area-one'>Status</h1>
                <div>
                    <button type='button' onClick={() => setTableStatus("active")} className={`gm-active-btn ${tableStatus === "active" && "gm-active-true"}`}>Active</button>
                    <button type='button' onClick={() => setTableStatus("inactive")} className={`gm-inactive-btn ${tableStatus === "inactive" && "gm-inactive-true"}`}>Inactive</button>
                </div>
                <div className='gm-add-area-btn-cont'>
                    <button type='submit' className='gm-add-area-btn'>Add Table</button>
                    <button type='button' onClick={onClickSaveAndNextTable} className={`gm-next-btn ${tables.length > 0 && "gm-next-done-btn"}`}>
                        {tablesLoading && 
                            <div className='inside-loader'>
                                <ClipLoader
                                    color="#ffffff"
                                    loading={tablesLoading}
                                    size={20}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        }Save & Next
                    </button>
                </div>
                <div className='gm-skip-cont'>
                    <p className='gm-back' onClick={onClickBackFromTable}><FaArrowLeftLong className='gm-skip-icon' /> Go Back</p>
                    <p className={`gm-skip ${tables.length > 0 && "gm-skip-none"}`} onClick={() => setCurrentStep("menu")}>Skip for now <FaArrowRightLong className='gm-skip-icon' /> </p>
                </div>
                <div>
                    <h1 className='gm-use-bottom-head'>Your Restaurant Tables</h1>
                    {tables.length > 0 ? (
                        <ul className='gm-use-bottom-ul'>
                            {tables.map((table) => {
                                const area = areas.filter(each => each.area_id === table.area_id);
                                return(
                                <li key={table.table_id} className='gm-use-bottom-p gm-use-bottom-p-tables'>
                                    <div className='gm-table-details'>
                                        <h1 className='gm-tables-lines gm-table-main-p'>Area: <span className='gm-table-area-sp'>{area[0].area_name}</span></h1>
                                        <h1 className='gm-tables-lines'>Table Name: <span className='gm-table-name-sp'>{table.table_name}</span></h1>
                                        <h1 className='gm-tables-lines'>Seating Capacity: <span className='gm-table-seating-sp'>{table.table_capacity}</span></h1>
                                        <h1 className='gm-tables-lines'>Status: <span className={`${table.table_status === "active"  ? "gm-table-active-sp" :"gm-table-inactive-sp" }`}>{table.table_status}</span></h1>
                                    </div>
                                    <MdDelete onClick={() => onClickTableDeleteIcon(table.table_name)} className='gm-delete-icon gm-delete-table-p' />

                                </li>)
                                })}
                        </ul>
                    ) : (
                            <p className='gm-use-bottom-p'>You have not added any tables yet.</p>
                        )}
                </div>
            </form>
        )
    }

    const onClickMenuCategoryDeleteOne = (menuId) => {
        const filteredOne = menuCategories.filter(e => e.menu_category_id !== menuId);
        if(menuItems.length > 0){
            const menuItemsFilter = menuItems.filter(e => e.item_menu_category_id != menuId)
            setMenuItems(menuItemsFilter);
        }
        setMenuCategories(filteredOne)
    }

    const AddMenu = () => {
        if(menuCategoryFailure){
            return (
                failureOne()
            )
        }
        return (
            <form onSubmit={onSubmitMenuCategory} className='gm-use-cont gm-use-cont-menu'>
                <h1 className='gm-use-title'>Add a Menu Category</h1>
                <p className='gm-use-description'>
                Enter a category name for your restaurant menu — like Breakfast, Lunch, Drinks, Ice Creams, Desserts, or Fast Food.
                </p>
                <h1 className='gm-use-add-area-one'>Add Menu Category</h1>
                <input onChange={(e) => setMenuCategoryInput(e.target.value)} value={menuCategoryInput} className='gm-input-area' type='text' placeholder='Ex: Breakfast' required />
                <div className='gm-add-area-btn-cont'>
                    <button type='submit' className='gm-add-area-btn'>Add Menu</button>
                    <button type='button' onClick={onClickMenuNxtB} className={`gm-next-btn ${menuCategories.length > 0 && "gm-next-done-btn"}`}>
                        {menuCategoryLoading && 
                            <div className='inside-loader'>
                                <ClipLoader
                                    color="#ffffff"
                                    loading={menuCategoryLoading}
                                    size={20}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        }Save & Next
                    </button>
                </div>
                <div className='gm-skip-cont'>
                    <p className='gm-back' onClick={() => setCurrentStep("table")}><FaArrowLeftLong className='gm-skip-icon' /> Go Back</p>
                    <p className={`gm-skip ${menuCategories.length > 0 && "gm-skip-none"}`} onClick={() => setCurrentStep("menuItems")} >Skip for now <FaArrowRightLong className='gm-skip-icon' /> </p>
                </div>
                <div>
                    <h1 className='gm-use-bottom-head'>Your Menu Categories</h1>
                    {
                        menuCategories.length > 0 ? (
                            <ul className='gm-use-bottom-ul'>
                                {menuCategories.map((category) => (
                                    <li key={category.menu_category_id} className='gm-use-bottom-p'>{category.menu_category_name} <MdDelete onClick={() => onClickMenuCategoryDeleteOne(category.menu_category_id)} className='gm-delete-icon' /></li>
                                ))}
                            </ul>
                        ) : 
                        <p className='gm-use-bottom-p'>You have not added any menu categories yet.</p>
                    }
                </div>

            </form>
        )
    }

    const onClickSkipInLast = () => {
        navigate('/restaurantDashboard')
    }

    const onSubmitMenuItem = (e) => {
        e.preventDefault();
        console.log(menuImageLoading);
        if(menuImageLoading === true){
            return;
        }
        if(menuItemName.trim() != '' && itemDes.trim() != '' && itemMenuCategory.trim() != '' && itemCategory .trim() != '' && itemPreparationTime.trim() != '' && price.trim() != ''){
            const categoryOne = menuCategories.filter(each => {
                return each.menu_category_id === itemMenuCategory;
            })
            const newItem = {
                item_id: uuidv4(),
                item_name: menuItemName,
                item_dec:itemDes,
                item_menu_category_id: itemMenuCategory,
                item_category: itemCategory,
                item_preparation_time:itemPreparationTime,
                item_availabiliy:itemAvailability,
                item_price:price,
                item_url:imageUrl,
                restaurant_id:restaurantId,
                category_name:categoryOne[0].menu_category_name
            }
            setMenuItems([...menuItems, newItem])
            setMenuItemName('');
            setItemDes('');
            setTimeMenuCategory('');
            setItemCategory('');
            setItemPreparationTime('');
            setPrice('');
            setImageURL('');
            setItemAvailability("Yes");

        }
    } 

    const onClickSaveNxtMenuItems = async () => {
        if(menuItems.length > 0){
            setMenuItemLoading(true);
            console.log("menuItems", menuItems)
            const url = "https://ttbackone-v48h.onrender.com/restaurant_details/addMenuItems"
            const options = 
            {
                method: "POST",
                headers:{
                    "Content-type": "application/json",
                },
                body:JSON.stringify(menuItems)
            }

            const response = await fetch(url, options);
            console.log('not here')
            if(response.ok){
                setClickedSaveMenuT(true)
                return (
                    navigate('/restaurantDashboard')
                )
            }else{
                setMenuItemFailure(true);
            }
            setMenuItemLoading(false);
            const jsondata = await response.json();
            console.log(jsondata)
        }
    }

    const AddingMenuItems = () => {
        if(menuItemFailure){
            return (
                failureOne()
            )
        }

        return(
            <form onSubmit={onSubmitMenuItem} className='gm-use-cont gm-use-cont-menu-items'>
                    <h1 className='gm-use-title'>Add Menu Items</h1>
                    <p className='gm-use-description'>Please enter the details for the new menu item.</p>  
                    <h1 className='gm-use-add-area-one'>Add Menu Item</h1>
                    <h1 className='gm-use-add-area-one'>Item Name</h1>
                    <input value={menuItemName} onChange={(e) => setMenuItemName(e.target.value)} className='gm-input-area' type='text' placeholder='Ex: Pancakes' required />
                    <h1 className='gm-use-add-area-one'>Item description</h1>  
                    <textarea value={itemDes} onChange={(e) => setItemDes(e.target.value)} className='gm-input-area gm-textarea' placeholder='Ex: Delicious pancakes with maple syrup' required></textarea>
                    <h1 className='gm-use-add-area-one'>Choose Menu Category</h1>
                    <div className='gm-use-add-menu-i-cont'>
                        <select value={itemMenuCategory} onChange={(e) => setTimeMenuCategory(e.target.value)}  className='gm-input-area' required>
                            <option value="">Select Category</option>
                            {menuCategories.map((category) => (
                                <option key={category.menu_category_id} value={category.menu_category_id}>{category.menu_category_name}</option>
                            ))}
                        </select>
                        <button type='button' onClick={() => setCurrentStep("menu")} className='gm-table-add-area-one-b'><IoMdAdd /> Add</button>
                    </div>

                    <h1 className='gm-use-add-area-one'>Item Category</h1>
                    <select  value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className='gm-input-area' required>
                        <option value="">Select Item Category</option>
                        <option value="veg">Veg</option>
                        <option value="non-veg">Non-Veg</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten-free">Gluten-Free</option>
                        <option value="dairy-free">Dairy-Free</option>
                        <option value="other">Other</option>
                    </select>
                    <div className='gm-use-add-area-cont'>
                        <div className='gm-use-add-area-cont-one'>
                            <h1 className='gm-use-add-area-one'>Preparation Time (in minutes)</h1>
                            <input value={itemPreparationTime} onChange={(e) => setItemPreparationTime(e.target.value)} className='gm-input-area' type='number' placeholder='Ex: 15 minutes' required />
                        </div>
                        <div>
                            <h1 className='gm-use-add-area-one'>Is Available:</h1>
                            <div>
                                <button type='button' onClick={() => setItemAvailability("Yes")} className={`gm-normal-btn ${itemAvailability === "Yes" && "gm-yes-button"}`}>Yes</button>
                                <button type='button' onClick={() => setItemAvailability("No")} className={`gm-normal-btn ${itemAvailability === "No" && "gm-no-button"}`}>No</button>
                            </div>
                        </div>
                    </div>
                    <div className='gm-use-add-area-file-cont'>
                        <div className='gm-use-add-area-file-inner-cont'>
                            <h1 className='gm-use-add-area-one'>Item Image</h1>
                            <input value={imageFile} onChange={onChangeFileName} className='gm-input-area file-input' type='file' accept='image/*' />
                        </div>
                        <FileImage image={imageUrl} className='file-image'>
                            <ClipLoader
                                color="#ffffff"
                                loading={menuImageLoading}
                                size={20}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </FileImage>
                    </div>

                    <h1 className='gm-use-add-area-one'>Price</h1>
                    <input value={price} onChange={(e) => setPrice(e.target.value)} className='gm-input-area' type='number' placeholder='Ex: 10.99' required />
                    <div className='gm-add-area-btn-cont'>
                        <button type='submit' className='gm-add-area-btn'>Add Menu Item</button>
                        <button type='button' onClick={onClickSaveNxtMenuItems} className={`gm-next-btn ${menuItems.length > 0 && "gm-next-done-btn"}`}>
                            {menuItemLoading && 
                                <div className='inside-loader'>
                                    <ClipLoader
                                        color="#ffffff"
                                        loading={menuItemLoading}
                                        size={20}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                    />
                                </div>
                            }Save & Next
                        </button>
                    </div>

                    <div className='gm-skip-cont'>
                        <p className='gm-back' onClick={() => setCurrentStep("menu")}><FaArrowLeftLong className='gm-skip-icon' /> Go Back</p>
                        <p className={`gm-skip ${menuItems.length > 0 && "gm-skip-none"}`} onClick={onClickSkipInLast}>Skip for now <FaArrowRightLong className='gm-skip-icon' /> </p>
                    </div>
                    <div>
                        <h1 className='gm-use-bottom-head'>Your Menu Items</h1>
                        {
                            menuItems.length > 0 ? (
                                <ul className='gm-use-menu-item-details'>
                                    {menuItems.map((item) => {
                                        const categoryOne = menuCategories.filter(each => {
                                            console.log(each.menu_category_id, item.item_menu_category_id)
                                            return each.menu_category_id === item.item_menu_category_id;
                                        })
                                        console.log("one" , categoryOne)
                                        return(
                                        <FileImage image={item.item_url} key={item.item_id} className='gm-use-bottom-p gm-use-bottom-p-menu-items'>
                                            <h1 className='gm-menu-item-name'>{item.item_name}</h1>
                                            <div  className='gm-menu-item-details'>
                                                <p className='gm-menu-item-description'>{item.item_dec}</p>
                                                <p className='gm-menu-item-category'><span>Category:</span> {categoryOne[0].menu_category_name}</p>
                                                <p className='gm-menu-item-category-1'><span>Item Category:</span> {item.item_category} <span> <img className='item-cat-logo' src={item.item_category === "veg" ? veg : nonveg} /></span></p>
                                                <p className='gm-menu-item-preparation-time'><span>Preparation Time:</span> {item.item_preparation_time} minutes</p>
                                                <p className={`gm-menu-item-availability ${item.is_available === "Yes" ? "gm-available" : "gm-not-available"}`}><span>Available:</span> {item.item_availabiliy}</p>
                                                
                                            </div>
                                            <p className='gm-menu-item-price'>₹{item.item_price}</p>
                                            {/* {item.image_url && <img src={item.image_url} alt={item.name} className='gm-menu-item-image' />} */}
                                            <MdDelete onClick={() => setMenuItems(menuItems.filter(menuItem => menuItem.item_id !== item.item_id))} className='gm-delete-icon gm-menu-item-del' />
                                        </FileImage>
                                        )
                                    })}
                                </ul>
                            ) : 
                            <p className='gm-use-bottom-p'>You have not added any menu items yet.</p>
                        }   
                    </div>
                </form>
        )
    }

    const MainOne = () => {
        switch (currentStep) {
            case "area":
                return RestaurantAreasOne()
            case "table":
                return AddingTables()
            case "menu":
                return AddMenu()
            case "menuItems":
                return AddingMenuItems()
            default:
                return RestaurantAreasOne()
        }
    }

    // console.log(areas)

  return (
    <div className='gm-intial-cont'>
      <div className='gm-main-cont'>
        <h1 className='gm-main-title'>More Information About Your restaurant</h1>
        {MainOne()} 
      </div>
    </div>
  )
}

export default GetMoreInforRest
