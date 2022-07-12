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
 
const fs = require('fs')
const logger = require('./logger')
const { version, Sha256_Checksum } = require('../constants')
const { check_for_updates_stable, check_for_updates_beta, check_for_updates_nightly } = require('../lib')


function init(e) {
    try {
    const fileContent = `
    {
        "debug": false,
        "installation": "${process.env.FLIGHT_INSTALLATION}",
        "version": "${version}",
        "SHA256": "${Sha256_Checksum}"
    }
    `

        if(!fs.existsSync(process.env.HOME + '/.config/flight.json')) {
            logger.status('Creating config file...')
            try {
                fs.writeFile(process.env.HOME + '/.config/flight.json', fileContent, (err) => {
                if (err) console.log();
                }); 
            } catch(e) {
                // logger.error('An error occured during the checks.')  
                fs.mkdir(process.env.HOME + '/.config')
                fs.writeFile(process.env.HOME + '/.config/flight.json', fileContent, (err) => {
                    if (err) logger.error('Failed to read/write to config file.');
                }); 
            }
        } else {
            const configs = JSON.parse(`${fs.readFileSync(process.env.HOME + '/.config/flight.json', { encoding:'utf8', flag:'r' })}`)
            if (configs.debug == true) {
                logger.status('Debug mode enabled.')
                const errorformat = `            
            PATH: 
                ${process.execPath}
            
            Installation: 
                ${configs.installation}     

            Flight version: 
                ${configs.version}
            
            Platform: 
                ${process.platform}            
            
            Lockfile:
                ${fs.readFileSync('flight.lock')} 
            
            
            Trace: 
                ${e}
                `
                fs.writeFile(`${process.cwd()}/flight-error.log`, errorformat, (err) => {
                    if (err) logger.error('Failed to save debug log.');
                }); 
            }
        }
    } catch(e) {
        logger.error('An error occured during the checks.')
    }
}


async function install_updates() {
    check_for_updates_stable()
    .then((fetched_version) => {
      
  
      if (fetched_version !== version) {
        console.log('Newer version of flight available, automatically updating...')
  
        if (process.platform == "linux") {
          const child = cp.exec(`curl -qL https://github.com/flightpkg/flight/releases/download/${fetched_version}/install.sh | bash`, {stdio: "inherit"})
          child.stdout.on('data', (data) => {
          console.log(`${data}`);
        });
      
        child.stderr.on('data', (data) => {
          console.error(`${data}`);
        });
    } else if (process.platform == "win32") {
        const child = cp.exec(`curl https://github.com/flightpkg/flight/releases/download/${fetched_version}/install.ps1 -O install.ps1 && powershell install.ps1`, {stdio: "inherit"})
        child.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
  
      child.stderr.on('data', (data) => {
        console.error(`${data}`);
    });
    }    
  }
  })}

module.exports = {
    init,
    install_updates
}
