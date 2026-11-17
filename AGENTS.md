# AGENTS.md

## Repository context

This repository hosts the personal website and portfolio for Matt Koster, built to be deployed via GitHub Pages. The site is primarily a static resume/portfolio with a small experimental “lab” area for side projects and learning.

The project should remain lightweight, easy to maintain, and mainly static. The main site should prioritize clarity, content maintainability, and fast deployment. The lab is intentionally separate and exploratory.

## Primary purpose

- Public-facing portfolio/resume site
- Showcase experience, projects, education, certifications, and contact information
- Provide a lightweight personal web presence suitable for GitHub Pages
- Offer an isolated experimental area (`/lab`) for small side projects

## Important assumptions

- This is not a large application and should not evolve into a heavy frontend app.
- The main portfolio site should remain static HTML/CSS/asset-based where possible.
- GitHub Pages hosting is the deployment target.
- The lab area may contain small experiments using React or other lightweight tooling, but those should be isolated and not coupled to the main site.
- Maintainability matters more than framework complexity.

## Repository structure

```text
/
├── index.html                 # Main portfolio site
├── lab/                       # Public experimental area (lab landing page + experiments)
│   └── index.html
├── dist/                      # Built/static output assets (generated or bundled)
├── src/                       # Source files for lab experiments
│   └── center-meeting/
│       ├── App.js
│       ├── index.js
│       ├── Location.js
│       └── README.md
├── scripts/                   # Build/dev automation
│   ├── start.js
│   └── start-debug.js
├── readme-assets/             # README preview assets
├── package.json               # Node project config / scripts
├── webpack.config.js          # Current bundling config for lab JS
├── README.md                  # Repo overview and usage notes
├── AGENTS.md                  # AI / contributor context
└── LICENSE
```

## Current architecture

### Main site

The main site is a static HTML page in the repository root (`index.html`). It contains:

- biography/about section
- experience timeline
- project list
- education and certifications
- resume PDF link
- social links

This is the core public-facing content and should remain simple and maintainable.

### Lab area

The lab is a secondary section intended for experiments and side projects. The project in `src/center-meeting` is a React-based demo related to location management and center-finding. It is not core portfolio content.

This code should be treated as an isolated prototype area rather than as a core or production application.

### Build setup

The repo uses Node + webpack + Babel + Bootstrap + BrowserSync. This is functional for a small app and local browsing, but for a GitHub Pages static portfolio it is heavier than necessary.

The main site does not require the complexity of a full bundler unless there is a real need. Prefer simple static assets for the portfolio and keep anything experimental inside the lab.

## Improvement approach for this repo

### 1. Keep the main site static and lightweight

The root portfolio should remain a static HTML site with CSS and asset files. Avoid introducing a heavy frontend framework or large build pipeline for the main site.

Preferred:

- plain HTML
- plain CSS
- minimal JS
- easy static hosting

### 2. Separate content from presentation

Right now the main site content is embedded in `index.html`, which is workable but becomes harder to maintain as content grows. A cleaner approach is to move the resume data into structured data files (for example JSON or Markdown) and generate the HTML from that.

Good direction:

- `data/profile.json`
- `data/experience.json`
- `data/projects.json`
- `data/education.json`

Use a small script to render pages from those files if needed.

### 3. Keep lab experiments isolated

The lab should remain clearly separated from the main portfolio. It should be easy to tell whether code belongs to the public-facing site or the exploratory area.

Rules:

- Page content in `/lab` should not be mixed into the main site layout.
- Lab-specific scripts, CSS, and dependencies should not leak into the main portfolio.
- If a project is incomplete, it should remain clearly labeled as experimental.

### 4. Simplify tooling

For the primary site, prefer minimal tooling. Avoid webpack-heavy patterns unless absolutely necessary.

Recommended baseline:

- `npm run dev` for local preview
- `npm run build` for static output generation
- no large runtime framework for the portfolio page itself

### 5. Keep the portfolio polished but intentional

The site should feel personal and professional, not like a generic resume template. The design should be cleaner and more intentionally branded, with fewer template-heavy assumptions.

Focus on:

- typography
- whitespace
- clarity
- legibility
- consistent hierarchy

## Working conventions for future changes

When editing this repo:

- Prefer simple HTML/CSS solutions for the main portfolio.
- Treat the lab as experimental and isolated.
- Do not make the main site dependent on React unless there is a strong reason.
- Keep GitHub Pages compatibility in mind at all times.
- Favor maintainability over cleverness.
- Remove unnecessary complexity when working on the main site.

## Commands

From the repo root:

```bash
npm install
npm start
npm run build
npm run build:dev
npm run build:debug
```

Notes:

- `npm start` launches the local preview workflow.
- `npm run build` currently compiles JS for the lab area via webpack.
- This repo may evolve toward a more static portfolio setup, but the current project structure should still be respected while working on the lab.

## Files to read first

When making changes, start with:

1. `README.md` — repo overview and usage notes
2. `index.html` — main site content and structure
3. `package.json` — scripts and dependencies
4. `src/center-meeting/README.md` — lab app context
5. `webpack.config.js` — current build pipeline

## Decision guidance

If a change is for the main portfolio site, prefer:

- static HTML/CSS
- small content/data changes
- simple deployment-friendly patterns

If a change is for the lab, prefer:

- isolated experiments
- custom demo behavior
- prototyping without affecting the main resume site

## Summary

This repository should be treated as a small personal portfolio website with a lightweight lab attached. The main site is the product. The lab is optional exploration. The long-term goal should be to keep the main site static, clean, and easy to maintain while allowing the lab to remain a sandbox for experiments.
