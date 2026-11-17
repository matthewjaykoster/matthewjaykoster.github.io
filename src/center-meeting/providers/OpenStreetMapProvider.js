import { MapProvider } from './MapProvider';

export class RemoteRequestError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = 'RemoteRequestError';
        this.status = status;
        this.details = details;
    }
}

const TYPE_TAGS = {
    coffee: ['amenity=cafe', 'amenity=coffee_shop'],
    bar: ['amenity=bar', 'amenity=pub'],
    park: ['leisure=park', 'leisure=garden'],
    activity: ['leisure=playground', 'leisure=sports_centre', 'tourism=attraction', 'amenity=community_centre'],
    restaurant: ['amenity=restaurant', 'amenity=food_court', 'amenity=fast_food'],
    other: [],
};

function buildOverpassQuery(center, radiusMiles, preferredType) {
    const radiusMeters = Math.max(500, Math.round(radiusMiles * 1609.34));
    const tags = preferredType === 'other' ? [
        'amenity=cafe', 'amenity=coffee_shop', 'amenity=bar', 'amenity=pub',
        'leisure=park', 'leisure=garden', 'leisure=playground', 'leisure=sports_centre',
        'tourism=attraction', 'amenity=community_centre', 'amenity=restaurant', 'amenity=food_court', 'amenity=fast_food'
    ] : (TYPE_TAGS[preferredType] || TYPE_TAGS.coffee);
    const tagParts = tags.map((tag) => `node[${tag}](around:${radiusMeters},${center.latitude},${center.longitude});`).join('\n  ');

    return `
        [out:json][timeout:25];
        (
          ${tagParts}
        );
        out center tags;
    `.replace(/\s+/g, ' ').trim();
}

function normalizeType(value) {
    if (!value) {
        return 'coffee';
    }

    if (value.includes('cafe') || value.includes('coffee')) {
        return 'coffee';
    }
    if (value.includes('bar') || value.includes('pub')) {
        return 'bar';
    }
    if (value.includes('park') || value.includes('garden') || value.includes('nature')) {
        return 'park';
    }
    if (value.includes('restaurant') || value.includes('food')) {
        return 'restaurant';
    }
    return 'activity';
}

function parseNominatimResults(results) {
    if (!Array.isArray(results) || !results.length) {
        return null;
    }

    const match = results[0];
    if (!match || !Number.isFinite(Number(match.lat)) || !Number.isFinite(Number(match.lon))) {
        return null;
    }

    return {
        latitude: Number(match.lat),
        longitude: Number(match.lon),
        displayName: match.display_name,
    };
}

function parseOpenMeteoResults(data) {
    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) {
        return null;
    }

    const match = results.find((entry) => entry?.country_code === 'US') || results[0];
    if (!match || !Number.isFinite(Number(match.latitude)) || !Number.isFinite(Number(match.longitude))) {
        return null;
    }

    const parts = [match.name, match.admin1, match.country].filter(Boolean);
    return {
        latitude: Number(match.latitude),
        longitude: Number(match.longitude),
        displayName: parts.join(', '),
    };
}

function buildFallbackQueries(address) {
    const query = (address || '').trim();
    if (!query) {
        return [];
    }

    return [query];
}

export class OpenStreetMapProvider extends MapProvider {
    async geocodeAddress(address, signal) {
        const cleanAddress = (address || '').trim();
        if (!cleanAddress) {
            return null;
        }

        const candidateQueries = buildFallbackQueries(cleanAddress);
        const candidates = candidateQueries.map((query) => ({
            name: 'Nominatim',
            url: `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
            parse: parseNominatimResults,
            headers: { 'Accept-Language': 'en' },
        })).concat(candidateQueries.map((query) => ({
            name: 'Open-Meteo',
            url: `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
            parse: parseOpenMeteoResults,
            headers: { Accept: 'application/json' },
        })));

        let lastError = null;

        for (const candidate of candidates) {
            try {
                const response = await fetch(candidate.url, {
                    signal,
                    headers: candidate.headers,
                });

                if (!response.ok) {
                    lastError = new RemoteRequestError(
                        'Location lookup failed.',
                        response.status,
                        `${candidate.name} responded with ${response.status}`
                    );
                    continue;
                }

                const payload = await response.json();
                const parsed = candidate.parse(payload);
                if (parsed) {
                    return parsed;
                }
            } catch (error) {
                if (error?.name === 'AbortError') {
                    throw error;
                }

                lastError = new RemoteRequestError(
                    'The location service is temporarily unavailable.',
                    503,
                    error?.message || `${candidate.name} request failed while geocoding the address.`
                );
            }
        }

        if (lastError) {
            throw lastError;
        }

        return null;
    }

    async getNearbyVenues(center, radiusMiles, preferredType, signal) {
        const query = buildOverpassQuery(center, radiusMiles, preferredType);
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: query,
            signal,
        });

        if (!response.ok) {
            throw new RemoteRequestError('Nearby venue lookup failed.', response.status);
        }

        const data = await response.json();
        const elements = Array.isArray(data?.elements) ? data.elements : [];

        return elements
            .filter((entry) => entry.lat && entry.lon)
            .map((entry) => {
                const tags = entry.tags || {};
                const name = tags.name || tags['name:en'] || 'Nearby venue';
                const type = normalizeType(tags.amenity || tags.leisure || tags.tourism || tags.shop || '');
                const distanceMiles = Math.sqrt(
                    (entry.lat - center.latitude) ** 2 + (entry.lon - center.longitude) ** 2
                ) * 69;

                return {
                    id: `${name}-${entry.id}`,
                    name,
                    type,
                    latitude: entry.lat,
                    longitude: entry.lon,
                    distanceMiles,
                    source: 'OpenStreetMap',
                };
            })
            .filter((venue) => venue.distanceMiles <= radiusMiles)
            .sort((a, b) => a.distanceMiles - b.distanceMiles)
            .slice(0, 6);
    }
}
