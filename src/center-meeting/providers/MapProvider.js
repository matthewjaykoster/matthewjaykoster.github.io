export class MapProvider {
    async geocodeAddress(address) {
        throw new Error('MapProvider.geocodeAddress must be implemented by a provider.');
    }

    async getNearbyVenues(center, radiusMiles, preferredType) {
        throw new Error('MapProvider.getNearbyVenues must be implemented by a provider.');
    }
}
