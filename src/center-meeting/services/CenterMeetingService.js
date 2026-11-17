import { OpenStreetMapProvider, RemoteRequestError } from '../providers/OpenStreetMapProvider';

function getGeocodeFailureMessage(address) {
    const trimmedAddress = (address || '').trim();
    if (!trimmedAddress) {
        return 'Please add a street address before calculating the meetup.';
    }

    return `We could not confirm "${trimmedAddress}". Please check the street address, city, and ZIP code and try again.`;
}

function getRemoteGeocodeFailureMessage(error, address) {
    if (error instanceof RemoteRequestError) {
        if (error.status === 429) {
            return 'The location service is temporarily busy. Please wait a moment and try again.';
        }

        if (error.status === 403 || error.status === 401) {
            return 'The location service is temporarily blocked. Please try again in a moment.';
        }

        if (error.status >= 500) {
            return 'The location service is temporarily unavailable. Please try again in a moment.';
        }
    }

    return getGeocodeFailureMessage(address);
}

export class CenterMeetingService {
    constructor(provider = new OpenStreetMapProvider()) {
        this.provider = provider;
    }

    async resolveCoordinatesForLocations(locations, signal) {
        const resolved = [];

        for (const location of locations) {
            if (signal?.aborted) {
                throw new DOMException('Request aborted', 'AbortError');
            }

            if (!location.address || !location.address.trim()) {
                resolved.push({
                    ...location,
                    geocodeError: 'Please add a street address before calculating the meetup.',
                });
                continue;
            }

            try {
                const geocoded = await this.provider.geocodeAddress(location.address.trim(), signal);
                if (signal?.aborted) {
                    throw new DOMException('Request aborted', 'AbortError');
                }

                if (geocoded) {
                    resolved.push({
                        ...location,
                        latitude: geocoded.latitude,
                        longitude: geocoded.longitude,
                        geocodedLabel: geocoded.displayName,
                        geocodeError: null,
                    });
                } else {
                    resolved.push({
                        ...location,
                        geocodeError: getGeocodeFailureMessage(location.address),
                    });
                }
            } catch (error) {
                if (error?.name === 'AbortError') {
                    throw error;
                }

                resolved.push({
                    ...location,
                    geocodeError: getRemoteGeocodeFailureMessage(error, location.address),
                });
            }
        }

        return resolved;
    }

    computeCenter(locations) {
        if (!Array.isArray(locations)) {
            return null;
        }

        const validLocations = locations.filter((location) => Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude));
        if (validLocations.length < 2) {
            return null;
        }

        let latSum = 0;
        let longSum = 0;

        validLocations.forEach((location) => {
            latSum += location.latitude;
            longSum += location.longitude;
        });

        return {
            latitude: latSum / validLocations.length,
            longitude: longSum / validLocations.length,
        };
    }

    async getSuggestedMeetup(locations, preferredType, radiusMiles, signal) {
        const resolvedLocations = await this.resolveCoordinatesForLocations(locations, signal);
        const geocodeErrors = resolvedLocations.reduce((errors, location) => {
            if (location.geocodeError) {
                errors[location.id] = location.geocodeError;
            }
            return errors;
        }, {});

        const validResolvedLocations = resolvedLocations.filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude));

        if (Object.keys(geocodeErrors).length > 0) {
            return {
                center: this.computeCenter(validResolvedLocations),
                suggestion: {
                    name: 'Address needs attention',
                    type: preferredType,
                    distance: '—',
                },
                venues: [],
                geocodeErrors,
            };
        }

        if (validResolvedLocations.length < 2) {
            return {
                center: this.computeCenter(validResolvedLocations),
                suggestion: {
                    name: 'Need 2 valid addresses',
                    type: preferredType,
                    distance: '—',
                },
                venues: [],
                geocodeErrors,
            };
        }

        const center = this.computeCenter(validResolvedLocations);
        const nearbyVenues = await this.provider.getNearbyVenues(center, radiusMiles, preferredType, signal);

        if (signal?.aborted) {
            throw new DOMException('Request aborted', 'AbortError');
        }

        const bestVenue = nearbyVenues[0] || {
            name: 'No local venue found',
            type: preferredType,
            distanceMiles: 0,
            latitude: center.latitude,
            longitude: center.longitude,
        };

        return {
            center,
            suggestion: {
                name: bestVenue.name,
                type: bestVenue.type || preferredType,
                distance: bestVenue.distanceMiles
                    ? `${bestVenue.distanceMiles.toFixed(1)} miles away`
                    : 'approx. at the center',
                latitude: bestVenue.latitude,
                longitude: bestVenue.longitude,
            },
            venues: nearbyVenues,
            geocodeErrors,
        };
    }
}
