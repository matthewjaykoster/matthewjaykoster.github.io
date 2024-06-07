/**
 * A simple location which holds either a geogrpahic lat/long pair or an address. If it holds both, the address is preferred in all cases.
 *
 * @export
 * @class Location
 * @typedef {Location}
 */
export class Location {

    /**
     * Creates an instance of Location.
     *
     * @constructor
     * @param {string} [id] The location's unique identifier. If unspecified, set using the current UTC timestamp.
     * @param {string} [name] The location's name
     * @param {string} [address] The location's address
     * @param {number} [latitude] The location's latitude
     * @param {number} [longitude] The location's longitude
     */
    constructor(id, name, address, latitude, longitude) {
        this.id = id ?? new Date().getTime();
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    isLatLongMode() {
        return this.latitude !== null && this.latitude !== undefined &&
            this.longitude !== null && this.longitude !== undefined;
    }

    /**
     * Returns the location as a string, preferring the address.
     *
     * @returns {string} The location as a string.
     */
    toString() {
        if (this.address) {
            return this.address;
        }

        if (this.latitude !== null && this.longitude !== null) {
            return `[${this.latitude}, ${this.longitude}]`;
        }

        return "";
    }
}
