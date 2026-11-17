const concurrently = require('concurrently');
const upath = require('upath');

const browserSyncPath = upath.resolve(upath.dirname(__filename), '../node_modules/.bin/browser-sync');

concurrently([
    {
        command: `"${browserSyncPath}" --server --files "lab/**" --no-online`,
        name: 'LAB_BROWSER_SYNC',
        prefixColor: 'bgMagenta.bold',
    }
], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
}).then(success, failure);

function success() {
    console.log('Lab preview started');
}

function failure() {
    console.log('Lab preview failed');
}
