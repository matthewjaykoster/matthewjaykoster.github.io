import { useEffect, useMemo, useRef, useState } from 'react';
import { Location } from './Location';
import { RemoteRequestError } from './providers/OpenStreetMapProvider';
import { CenterMeetingService } from './services/CenterMeetingService';

const CATEGORY_META = {
    activity: { label: 'Activity', icon: '🎯' },
    bar: { label: 'Bar', icon: '🍻' },
    coffee: { label: 'Coffee', icon: '☕' },
    other: { label: 'Other', icon: '📍' },
    park: { label: 'Park', icon: '🌳' },
    restaurant: { label: 'Restaurant', icon: '🍽️' },
};

const CATEGORY_ORDER = ['coffee', 'activity', 'bar', 'park', 'restaurant', 'other'];
const centerMeetingService = new CenterMeetingService();
const VALIDATION_DELAY_MS = 500;
const COMPUTE_REQUEST_DELAY_MS = 1000;

function createLocation(name, address, type, latitude, longitude) {
    const nextLocation = new Location();
    nextLocation.name = name;
    nextLocation.address = address;
    nextLocation.type = type;
    nextLocation.latitude = latitude ?? null;
    nextLocation.longitude = longitude ?? null;
    return nextLocation;
}

function buildSampleLocations() {
    const baseLocations = [
        createLocation('Home', '', 'coffee', null, null),
        createLocation('Work', '', 'restaurant', null, null),
    ];

    return baseLocations;
}

function getTypeLabel(type) {
    return CATEGORY_META[type]?.label ?? 'Location';
}

function getTypeIcon(type) {
    return CATEGORY_META[type]?.icon ?? '📍';
}

function isLocationAddressValid(location) {
    return Boolean(location.address && location.address.trim().length > 0 && location.address.trim() !== 'Add a home address');
}

function getLocationError(location, resultGeocodeErrors = {}) {
    if (resultGeocodeErrors[location.id]) {
        return resultGeocodeErrors[location.id];
    }

    if (!location.address || !location.address.trim()) {
        return 'Please add a street address.';
    }

    if (location.address.trim() === 'Add a home address') {
        return 'Please enter a real address.';
    }

    return null;
}

function LocationEditor({ location, onDelete, onChange, hasError, isPendingValidation, errorMessage }) {
    return (
        <div className={`location-card ${hasError ? 'location-card-invalid' : ''}`}>
            <div className="location-card-header">
                <span className="type-badge" title={hasError ? 'Address needs attention' : 'Valid address'}>{hasError ? '⚠️' : '📍'}</span>
                <button type="button" className="delete-button" onClick={() => onDelete(location.id)} aria-label="Delete location">
                    Remove
                </button>
            </div>

            <label className="field-group">
                <span>Name</span>
                <input
                    type="text"
                    value={location.name || ''}
                    placeholder="Home, Work, Parents..."
                    onChange={(event) => onChange(location.id, 'name', event.target.value)}
                />
            </label>

            <label className="field-group">
                <span>Address</span>
                <input
                    className={hasError ? 'input-invalid' : ''}
                    type="text"
                    value={location.address || ''}
                    placeholder="123 Main St, City, State"
                    onChange={(event) => onChange(location.id, 'address', event.target.value)}
                />
                {isPendingValidation && !hasError && <small className="field-pending">Checking address…</small>}
                {hasError && <small className="field-error">{errorMessage || 'Please enter a valid address.'}</small>}
            </label>
        </div>
    );
}

function getUserFriendlyRemoteError(error) {
    if (error instanceof RemoteRequestError) {
        if (error.status === 429) {
            return {
                title: 'Too many requests',
                message: 'The location service is temporarily busy. Please wait a moment and try again.',
            };
        }

        if (error.status >= 500) {
            return {
                title: 'Service temporarily unavailable',
                message: 'We could not reach the location service right now. Please try again in a moment.',
            };
        }

        if (error.status === 403 || error.status === 401) {
            return {
                title: 'Location access is blocked',
                message: 'The location service is not allowing requests right now. Please try again later.',
            };
        }

        return {
            title: 'We could not refresh the map data',
            message: 'Please try again in a moment.',
        };
    }

    if (!navigator.onLine) {
        return {
            title: 'You are offline',
            message: 'Please reconnect to the internet and try again.',
        };
    }

    return {
        title: 'Something went wrong',
        message: 'We could not refresh the meetup suggestions. Please try again in a moment.',
    };
}

export default function CenterMeetingApp() {
    const [locations, setLocations] = useState(() => buildSampleLocations());
    const [preferredType, setPreferredType] = useState('coffee');
    const [radius, setRadius] = useState(3);
    const [suggestion, setSuggestion] = useState({
        name: 'Calculating midpoint…',
        detail: 'Finding the best meetup nearby.',
        type: preferredType,
        distance: '—',
        center: { latitude: 42.96, longitude: -85.67 },
    });
    const [nearbyVenues, setNearbyVenues] = useState([]);
    const [remoteError, setRemoteError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAddressIds, setPendingAddressIds] = useState([]);
    const [resultGeocodeErrors, setResultGeocodeErrors] = useState({});
    const latestRequestIdRef = useRef(0);
    const abortControllerRef = useRef(null);
    const validationTimersRef = useRef({});
    const validLocations = useMemo(
        () => locations.filter((location) => isLocationAddressValid(location)),
        [locations]
    );
    const hasNonEmptyInvalidLocations = useMemo(
        () => locations.some((location) => Boolean(location.address && location.address.trim()) && !isLocationAddressValid(location)),
        [locations]
    );
    const readyToCompute = useMemo(
        () => validLocations.length >= 2 && !hasNonEmptyInvalidLocations,
        [validLocations, hasNonEmptyInvalidLocations]
    );
    const hasInvalidLocations = useMemo(
        () => locations.some((location) => !isLocationAddressValid(location)),
        [locations]
    );

    useEffect(() => {
        Object.keys(validationTimersRef.current).forEach((locationId) => {
            const location = locations.find((entry) => entry.id.toString() === locationId);
            if (!location || isLocationAddressValid(location)) {
                clearTimeout(validationTimersRef.current[locationId]);
                delete validationTimersRef.current[locationId];
            }
        });

        locations.forEach((location) => {
            if (!location.address || location.address.trim() === '' || location.address.trim() === 'Add a home address') {
                if (!validationTimersRef.current[location.id]) {
                    validationTimersRef.current[location.id] = setTimeout(() => {
                        setPendingAddressIds((current) => current.filter((id) => id !== location.id));
                    }, VALIDATION_DELAY_MS);
                    setPendingAddressIds((current) => [...new Set([...current, location.id])]);
                }
                return;
            }

            if (validationTimersRef.current[location.id]) {
                clearTimeout(validationTimersRef.current[location.id]);
                delete validationTimersRef.current[location.id];
            }
            setPendingAddressIds((current) => current.filter((id) => id !== location.id));
        });

        return () => {
            Object.values(validationTimersRef.current).forEach((timer) => clearTimeout(timer));
            validationTimersRef.current = {};
        };
    }, [locations]);

    useEffect(() => {
        if (!readyToCompute) {
            if (validLocations.length < 2) {
                abortControllerRef.current?.abort();
                setNearbyVenues([]);
                setIsLoading(false);
                setRemoteError(null);
                setSuggestion({
                    name: 'Need 2 valid addresses',
                    detail: 'Add at least two complete addresses before calculating the meetup midpoint.',
                    type: preferredType,
                    distance: '—',
                    center: { latitude: 42.96, longitude: -85.67 },
                });
                return undefined;
            }

            if (hasNonEmptyInvalidLocations) {
                abortControllerRef.current?.abort();
                setNearbyVenues([]);
                setIsLoading(false);
                setRemoteError(null);
                setSuggestion({
                    name: 'Fix the highlighted address',
                    detail: 'The location service could not use one of the entered addresses yet. Please review the highlighted entry before calculating the meetup midpoint.',
                    type: preferredType,
                    distance: '—',
                    center: { latitude: 42.96, longitude: -85.67 },
                });
                return undefined;
            }
        }

        const requestId = ++latestRequestIdRef.current;
        const timeoutId = setTimeout(async () => {
            const controller = new AbortController();
            abortControllerRef.current?.abort();
            abortControllerRef.current = controller;
            setIsLoading(true);
            setRemoteError(null);

            console.log('Center Meeting compute request triggered', {
                validLocationsCount: validLocations.length,
                readyToCompute,
                addresses: validLocations.map((location) => ({
                    name: location.name,
                    address: location.address,
                })),
            });

            try {
                const result = await centerMeetingService.getSuggestedMeetup(validLocations, preferredType, radius, controller.signal);

                if (requestId !== latestRequestIdRef.current) {
                    return;
                }

                const center = result?.center || { latitude: 42.96, longitude: -85.67 };
                setResultGeocodeErrors(result?.geocodeErrors || {});

                if (result?.geocodeErrors && Object.keys(result.geocodeErrors).length > 0) {
                    setSuggestion({
                        name: 'Address needs attention',
                        detail: 'One or more addresses could not be confirmed. Please review the highlighted entries and try again.',
                        type: preferredType,
                        distance: '—',
                        center,
                    });
                    setNearbyVenues([]);
                    return;
                }

                setSuggestion({
                    name: result.suggestion.name,
                    detail: `${getTypeLabel(result.suggestion.type)} meetup near the midpoint of the group, with room to gather and talk.`,
                    type: result.suggestion.type,
                    distance: result.suggestion.distance,
                    center,
                });
                setNearbyVenues(result.venues || []);
            } catch (error) {
                if (error?.name === 'AbortError' || requestId !== latestRequestIdRef.current) {
                    return;
                }

                const friendlyError = getUserFriendlyRemoteError(error);
                console.error('Center Meeting remote request failed:', {
                    message: error?.message,
                    status: error?.status,
                    name: error?.name,
                    preferredType,
                    radius,
                    validLocationsCount: validLocations.length,
                    locations: validLocations.map((location) => ({
                        name: location.name,
                        address: location.address,
                    })),
                    error,
                });
                setRemoteError(friendlyError);
                setSuggestion({
                    name: 'Could not resolve locations',
                    detail: friendlyError.message,
                    type: preferredType,
                    distance: '—',
                    center: { latitude: 42.96, longitude: -85.67 },
                });
                setNearbyVenues([]);
            } finally {
                if (requestId === latestRequestIdRef.current) {
                    setIsLoading(false);
                }
            }
        }, COMPUTE_REQUEST_DELAY_MS);

        return () => {
            latestRequestIdRef.current += 1;
            clearTimeout(timeoutId);
            abortControllerRef.current?.abort();
        };
    }, [readyToCompute, validLocations, hasNonEmptyInvalidLocations, preferredType, radius]);

    const venueList = useMemo(() => nearbyVenues.slice(0, 3), [nearbyVenues]);

    function handleAddLocation() {
        const nextLocation = createLocation('New address', '', preferredType, null, null);
        setLocations((current) => [...current, nextLocation]);
    }

    function handleDeleteLocation(id) {
        setLocations((current) => current.filter((location) => location.id !== id));
    }

    function handleLocationChange(id, field, value) {
        setLocations((current) => current.map((location) => {
            if (location.id !== id) {
                return location;
            }
            const nextLocation = {
                ...location,
                [field]: value,
            };

            if (field === 'address') {
                setResultGeocodeErrors((currentErrors) => {
                    const updatedErrors = { ...currentErrors };
                    delete updatedErrors[id];
                    return updatedErrors;
                });
            }

            return nextLocation;
        }));
    }

    const geocodeErrorsByLocation = resultGeocodeErrors;

    return (
        <div className="center-meeting-layout">
            <aside className="locations-panel">
                <div className="sidebar-header">
                    <div>
                        <p className="eyebrow">Group meetup</p>
                        <h2>Addresses</h2>
                    </div>
                    <button type="button" className="primary-button" onClick={handleAddLocation}>Add</button>
                </div>

                <div className="locations-list">
                    {locations.length === 0 ? (
                        <div className="empty-state">
                            Add a few addresses to start calculating a shared meetup spot.
                        </div>
                    ) : (
                        locations.map((location) => (
                            <LocationEditor
                                key={location.id}
                                location={location}
                                onChange={handleLocationChange}
                                onDelete={handleDeleteLocation}
                                hasError={!isLocationAddressValid(location) || Boolean(geocodeErrorsByLocation[location.id])}
                                isPendingValidation={pendingAddressIds.includes(location.id)}
                                errorMessage={getLocationError(location, geocodeErrorsByLocation)}
                            />
                        ))
                    )}
                </div>
            </aside>

            <main className="suggestion-panel">
                <header className="meeting-header">
                    <div>
                        <p className="eyebrow">Smart meetup planning</p>
                        <h1>Center Meeting</h1>
                    </div>
                    <div className="header-badge">{locations.length} addresses</div>
                </header>

                {remoteError && (
                    <div className="remote-error-banner" role="alert">
                        <span className="remote-error-icon" aria-hidden="true">⚠️</span>
                        <div>
                            <strong>{remoteError.title}</strong>
                            <p>{remoteError.message}</p>
                        </div>
                    </div>
                )}

                <section className="controls-card">
                    <div className="field-group compact">
                        <span>Preferred venue</span>
                        <select value={preferredType} onChange={(event) => setPreferredType(event.target.value)}>
                            {CATEGORY_ORDER.map((value) => (
                                <option key={value} value={value}>{getTypeLabel(value)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field-group compact">
                        <span>Search radius</span>
                        <input
                            type="range"
                            min="0.5"
                            max="25"
                            step="0.5"
                            value={radius}
                            onChange={(event) => setRadius(Number(event.target.value))}
                        />
                        <strong>{radius} mi</strong>
                    </div>
                </section>

                <section className="result-card">
                    <div className="map-preview">
                        <img src="/dist/assets/img/under-construction.png" alt="Map preview under construction" />
                    </div>

                    <div className="result-copy">
                        <div className="result-kicker">
                            <span className="result-icon">{getTypeIcon(suggestion.type)}</span>
                            <span>{isLoading ? 'Searching…' : 'Suggested meetup'}</span>
                        </div>

                        <h3>{suggestion.name}</h3>
                        <p>{suggestion.detail}</p>

                        <div className="stats-grid">
                            <div>
                                <label>Center</label>
                                <strong>{suggestion.center ? `${suggestion.center.latitude.toFixed(3)}, ${suggestion.center.longitude.toFixed(3)}` : '—'}</strong>
                            </div>
                            <div>
                                <label>Distance</label>
                                <strong>{suggestion.distance}</strong>
                            </div>
                            <div>
                                <label>Venue type</label>
                                <strong>{getTypeLabel(suggestion.type)}</strong>
                            </div>
                            <div>
                                <label>Nearby</label>
                                <strong>{venueList.length} options</strong>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
