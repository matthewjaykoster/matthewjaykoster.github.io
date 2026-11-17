# Center Meeting Location

Center Meeting is a lightweight prototype for planning a meetup near the midpoint of several people’s home addresses. The app is intentionally small and experimental, designed to help people enter addresses, validate them, and then find a practical nearby meetup location.

## Current state

The app currently supports:

- entering one or more home/work/family addresses in the left sidebar
- validating whether an entered address looks complete enough to use
- debouncing requests so remote lookups do not fire on every keypress
- preventing computation until there are at least two valid addresses
- checking for remote provider failures and surfacing user-friendly error messages
- showing a suggestion card for a nearby meetup venue based on the computed midpoint

The app is still a prototype rather than a polished production tool. It is best understood as a lab experiment for location planning and UX iteration, not a finished consumer-facing service.

## Architecture notes

The app is built as a small React + webpack demo that is bundled into the lab’s static assets. It is intentionally isolated from the main portfolio site and meant to stay lightweight.

The current implementation uses a provider abstraction so geocoding and nearby-venue lookup can be swapped out as needed. The logic is currently centered around the address-entry flow, validation, rate-limited requests, and user-facing error handling.

## Development and build

From the repository root:

- `npm install`
- `npm run build:dev` for an unminified, readable development bundle
- `npm run build` for the production bundle
- `npm run build:debug` for a watched debug build

The app is served as part of the lab area and is not meant to be a standalone app beyond this experimental environment.

## Possible TODOs

- improve the actual map visualization so the midpoint and suggested venue are rendered more clearly
- add stronger address normalization and formatting for common U.S. address variations
- support a better provider strategy for production use, including a backend proxy or a reliable paid geocoding service
- add more explicit “provider unavailable” behavior when remote services are temporarily blocked or rate-limited
- improve venue scoring so the suggestion is more context-aware than simple distance-only selection
- add tests around validation, geocoding, and request debouncing to reduce regressions
- refine the interface for accessibility, mobile behavior, and readability
- consider whether the prototype should remain a pure browser-only demo or evolve into a small backend-backed service

## Notes

This app is intentionally exploratory. It should remain easy to understand and easy to modify, with functionality prioritized over production polish. The main goal right now is to validate the UX around address entry, midpoint calculation, and remote-provider failure states.
