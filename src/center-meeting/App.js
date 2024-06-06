import { useState } from 'react';
import { Location } from './Location';

/**
 * Creates a UI control which allows for viewing and editing a location.
 *
 * @param {*} location The location object managed by this component...but with an additional top-level property that has the same name as the property. For some reason.
 * @returns {*} A React Component which allows for viewing and editing a location.
 */
function LocationOptions( location ) {
    location = location.location; // For some reason, when I pass this as a prop via the React Component, the object gains a new Top-Level Property which has the same name as the property and contains the actual data I'm looking for.
    let locationEditor = (
        <>
            <b>Address:</b> {location.address}
        </>
    );

    if ( location.isLatLongMode() ) {
        locationEditor = (
            <>
                <b>Lat/Long:</b> [ {location.latitude}, {location.longitude} ]
            </>
        );
    }

    return (
        <>
            <div class="list-group-item py-3 lh-tight">
                <div class="d-flex w-100 align-items-center">
                    <strong class="col-8 mb-1 text-truncate" >{location.name}</strong>
                    <div class="offset-1 col-3 d-flex justify-content-end">
                        <button type="button" class="btn btn-default">
                            <small><i class="fa fa-pen"></i></small>
                        </button>
                        <button type="button" class="btn btn-default">
                            <small><i class="fa fa-trash"></i></small>
                        </button>
                    </div>
                </div>
                <div class="col-12 mb-1 small">
                    {locationEditor}
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
    const locations = [
        new Location( "Someplace", "12345 Some Ln, Somewhere City, AL 98765" ),
        new Location( "Random POI", null, 42.9777086, -85.6831788 ),
    ];

    // I have no idea why passing the location object via a prop here adds an additional Top-Level Property with the
    // same name as the property, but it does...
    const locationItems = locations.map( location => (
        <>
            <LocationOptions location={location} />
        </>
    ) );
    return (
        <>
            <div class="col-3 p-0">
                <div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-white">
                    <div class="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                        <span class="fs-5 fw-semibold">Locations</span>
                    </div>
                    <div id="location-list" class="list-group list-group-flush border-bottom scrollarea">
                        {locationItems}
                        <div class="list-group-item list-group-item-action py-3 lh-tight mouseover-action">
                            <div class="align-items-center">
                                <i class="fa fa-circle-plus"></i>
                                Add Location
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-1 p-0">
                <div class="b-divider"></div>
            </div>
            <div class="col">
                <img class="img-fluid" src="/dist/assets/img/under-construction.png" alt="..." />
            </div>
        </>
    );
}
