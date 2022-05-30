const fs = require('fs')
const logger = require('./logger')
const { version, Sha256_Checksum } = require('../constants')



function init() {
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
                Arguments: 
                /usr/local/bin/node /usr/local/Cellar/yarn/1.3.2/libexec/bin/yarn.js
            
            PATH: 
                /Users/luke/go/src/github.com/meta-network/go-meta/bin:/Users/luke/go/bin/geth:/Users/luke/go/bin/swarm:/Users/luke/go/bin/geth:/Users/luke/go/bin/swarm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/luke/go/bin:/usr/local/go/bin
            
            Flight version: 
                ${configs.version}
            
            Platform: 
                ${process.platform}            
            
            
            Lockfile:
                ${fs.readFileSync('flight.lock')} 
            
            
            Trace: 
                ${e}
                `
                fs.writeFile(process.cwd() + 'flight-error.log', errorformat, (err) => {
                    if (err) logger.error('Failed to save debug log.');
                }); 
            }
        }
    } catch(e) {
        logger.error('An error occured during the checks.')
    }
}

module.exports = {
    init
}