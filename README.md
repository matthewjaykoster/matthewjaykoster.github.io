# Matt Koster

Live site: https://matthewjaykoster.github.io

This repository hosts the public portfolio and experimental lab for Matt Koster.

The main site is intentionally lightweight and static so it works cleanly with GitHub Pages. The lab is kept separate for smaller experiments and prototypes, and it is not part of the main resume experience.

## Repository layout

- `index.html` — generated public portfolio page
- `data/` — structured content for the site (`profile`, `experience`, `projects`, etc.)
- `scripts/render-site.js` — builds the main portfolio page from the JSON content files
- `dist/css/site.css` — active styling for the main portfolio
- `dist/css/lab.css` — styling for lab pages and prototypes
- `lab/` — experimental projects and prototype pages
- `src/center-meeting/` — React demo used in the lab

## Local development

Install dependencies:

```bash
npm install
```

Run the main portfolio locally:

```bash
npm run dev
```

Run the lab locally:

```bash
npm run dev:lab
```

If you want to rebuild the static portfolio without starting the local preview server:

```bash
npm run build:site
```

If you want to rebuild the lab bundle only:

```bash
npm run build:lab
```

## Production build and deployment

Build the portfolio and lab bundle together:

```bash
npm run build
```

This script runs the site builder first, then compiles the lab JavaScript bundle. The generated output remains static and suitable for a GitHub Pages deployment.

Once GitHub Pages is configured for the repository, the deployment flow is simple:

1. Commit your changes to the repository.
2. Push the branch connected to your GitHub Pages configuration.
3. Let GitHub Pages publish the repository root as the site.
4. Confirm the live site reflects the latest build output.

For this repository, the public site is served directly from the repository contents, so the important rules are:

- keep the main portfolio in the repo root and ensure generated static output is committed or published as expected by your GitHub Pages setup
- keep lab files under `lab/` and separate from the portfolio layout
- avoid introducing framework dependencies into the public portfolio unless absolutely necessary
- update `data/*.json` for content changes instead of editing generated HTML directly

If GitHub Pages is already configured to use the repository root, there is typically no extra deployment script required beyond pushing the updated code and allowing GitHub to build the static site.

## Notes

- The primary portfolio is static and should remain easy to maintain.
- Lab work is intentionally isolated and may be incomplete or experimental.
- The site content should be updated through the structured data files in `data/`, not by hand-editing the generated output in `index.html`.
