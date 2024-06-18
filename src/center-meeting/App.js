import { useState } from 'react';
import { Location } from './Location';

/**
 * Creates a UI control which allows for viewing and editing a location.
 *
 * @param {*} location The location object managed by this component.
 * @param {Function} handleDelete A function which will be called when the delete button is clicked.
 * @returns {*} A React Component which allows for viewing and editing a location.
 */
function LocationOptions( { location, handleAddressChange, handleDelete, handleNameChange } ) {
    // Local functions
    function handleEditClick() {
        swapEditMode();
    }

    function handleKeyDown( e ) {
        if ( e.key === "Enter" ) {
            swapEditMode();
        }
    }

    function swapEditMode() {
        if (location.address && location.name) {
            setIsEditMode( !isEditMode );
        }
    }

    // Local state
    const [ isEditMode, setIsEditMode ] = useState( isEmpty( location.name ) );

    // Component code
    let editButtonClass = "fa fa-pen";
    let addressEditor = (
        <>
            <b>Address:</b> {location.address}
        </>
    );
    let nameEditor = (
        <strong className="col-8 mb-1 text-truncate" >{location.name}</strong>
    );

    if ( isEditMode ) {
        editButtonClass = "fa fa-check";

        addressEditor = (
            <>
                <input name="location-address"
                    className="form-control"
                    type="text"
                    placeholder="Address"
                    value={location.address}
                    onChange={e => handleAddressChange( location, e )}
                    onKeyDown={handleKeyDown}></input>
            </>
        );

        nameEditor = (
            <>
                <input name="location-name"
                    className="form-control"
                    type="text"
                    placeholder="Name"
                    value={location.name}
                    onChange={e => handleNameChange( location, e )}
                    onKeyDown={handleKeyDown}></input>
            </>
        );
    }

    // Disable button if one of address or name is blank
    const isSaveDisabled = !location.address || !location.name;
    const saveButton = (
        <>
            <button type="button" className="btn btn-default disabled-red" onClick={handleEditClick} disabled={isSaveDisabled}>
                <small><i className={editButtonClass}></i></small>
            </button>
        </>
    );

    return (
        <>
            <div className="list-group-item py-3 lh-tight">
                <div className="d-flex mb-1 w-100 align-items-center">
                    {nameEditor}
                    <div className="offset-1 col-3 d-flex justify-content-end">
                        {saveButton}
                        <button type="button" className="btn btn-default" onClick={() => handleDelete( location )}>
                            <small><i className="fa fa-trash"></i></small>
                        </button>
                    </div>
                </div>
                <div className="col-12 mb-1 small">
                    {addressEditor}
                </div>
            </div>
        </>
    );
}

/**
 * Creates the React application.
 *
 * @export
 * @returns {*}
 */
export default function CenterMeetingApp() {
    // Local functions
    function handleAddLocation() {
        const newLocation = new Location();
        const nextLocations = locations.concat( newLocation );
        setLocations( nextLocations );
    }

    function handleAddressChange( locationToEdit, event ) {
        const editIndex = locations.findIndex( location => location.id === locationToEdit.id );
        const nextLocations = locations.slice();
        nextLocations[ editIndex ].address = event.target.value;
        setLocations( nextLocations );
    }

    function handleDeleteLocation( locationToDelete ) {
        const deleteIndex = locations.findIndex( location => location.id === locationToDelete.id );
        const nextLocations = locations.filter( ( location, index ) => index !== deleteIndex );
        setLocations( nextLocations );
    }

    function handleNameChange( locationToEdit, event ) {
        const editIndex = locations.findIndex( location => location.id === locationToEdit.id );
        const nextLocations = locations.slice();
        nextLocations[ editIndex ].name = event.target.value;
        setLocations( nextLocations );
    }

    // Local state
    const [ locations, setLocations ] = useState( [] );

    // Component code
    const locationItems = locations.map( location => (
        <>
            <LocationOptions location={location}
                handleAddressChange={handleAddressChange}
                handleDelete={handleDeleteLocation}
                handleNameChange={handleNameChange} />
        </>
    ) );
    return (
        <>
            <div className="col-3 p-0">
                <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white">
                    <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                        <span className="fs-5 fw-semibold">Locations</span>
                    </div>
                    <div id="location-list" className="list-group list-group-flush border-bottom scrollarea">
                        {locationItems}
                        <div className="list-group-item list-group-item-action py-3 lh-tight mouseover-action" onClick={handleAddLocation}>
                            <div className="d-flex align-items-center justify-content-center">
                                <i className="fa fa-plus"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-1 p-0">
                <div className="b-divider"></div>
            </div>
            <div className="col">
                <img className="img-fluid" src="/dist/assets/img/under-construction.png" alt="..." />
            </div>
        </>
    );
}

// "Private" functions
function isEmpty( value ) {
    return value === undefined || value === null || value === '';
}
