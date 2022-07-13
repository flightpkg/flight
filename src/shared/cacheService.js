// Copy all contents from the node_modules directory to the ~/.flight/.cache directory
// This is used to cache the results of the node_modules. This is useful for
// speeding up the development process.

const fs = require('fs-extra');
const { error } = require('./logger');

async function main() {
    const configs = await fs.readFile("~/.config/flight/config.json", "utf8", (err, data) => {
        if (err) {
            error('Failed to read from cache configs.');
        }
    }).then(r => JSON.parse(r))

    await fs.cp('./node_modules/', configs.cache, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

main();
