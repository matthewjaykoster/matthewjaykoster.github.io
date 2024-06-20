# Center Meeting

Center Meeting is small Google Maps application which allows the user to find restaurants and activies at the center of several addresses or Lat/Long pairs. It is also a way for me to learn React JS in a contrived environment, so the app may not be as full-featured as you expect.

## Deployment

The JS files in this folder are meant to be bundled using webpack into the `dist/js/center-meeting` folder as `main.js`. Note the abnormal directory structure - due to deployment with GitHub pages, the root `index.html` file MUST be in the project's root directory, and not in the `dist` or `src` folder.

The command to do so is below:
`npm run build`

Or, if you prefer an unminified bundle for dev work:
`npm run build:dev`

Or, if you want a watched compilation:
`npm run build:debug`
