/*
 *
 *    Copyright 2022 flightpkg Contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
 
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
