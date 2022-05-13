const child = require('child_process')
const isWin = process.platform === "win32";
const isDarwin = process.platform === "darwin";
const isLinux = process.platform === "linux";


function run(command) {
    const cp = require("child_process");
    if (isWin == true) {
        const child = cp.exec(`./luau-install-win64 ${command}`, {stdio: "inherit"})
        child.stdout.on('data', (data) => {
            console.log(`${data}`);
          });
        
          child.stderr.on('data', (data) => {
            console.error(`${data}`);
          });
    }
    if (isDarwin == true) {
        const child = cp.exec(`./luau-install-macos ${command}`, {stdio: "inherit"})
        child.stdout.on('data', (data) => {
            console.log(`${data}`);
          });
        
          child.stderr.on('data', (data) => {
            console.error(`${data}`);
          });
    }
    if (isLinux == true) {
        const child = cp.exec(`./luau-install-linux ${command}`, {stdio: "inherit"})
        child.stdout.on('data', (data) => {
            console.log(`${data}`);
          });
        
          child.stderr.on('data', (data) => {
            console.error(`${data}`);
          });
    }
}

module.exports = {
    run
}