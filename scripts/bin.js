const fs = require('fs');
const Log = require('../lib/logging');
const path = require('path');
const util = require('../lib/util');
const { execSync } = require("child_process");

Log.progress('Cloning flightpkg/flight...')

const CoreDir = path.resolve(__dirname, '..', 'src', 'flight-setup')
const CoreRef = 'flightpkg/flight'

if (!fs.existsSync(path.join(CoreDir, '.git'))) {
  Log.status(`Cloning core [${CoreRef}] into ${CoreDir}...`)
  fs.mkdirSync(CoreDir)
  util.runGit(CoreDir, ['clone', 'https://github.com/flightpkg/flight.git', '.'])
}


const CoreSha = '8125f2cee1a29632c5ee2eac460b9f2a5c6377d9'
Log.progress(`Resetting core to "${CoreSha}"...`)
let checkoutResult = util.runGit(CoreDir, ['checkout', CoreSha], true)
// Handle checkout failure
if (checkoutResult === null) {
  Log.error('Could not checkout: ' + CoreSha)
}
// Checkout was successful
Log.progress(`...flight is now at commit ID ${CoreSha}`)

let npmCommand = 'npm'
if (process.platform === 'win32') {
  npmCommand += '.cmd'
}

if (process.platform === 'linux') {
execSync(`cd ${CoreDir}/dist/js ; rm -rf cli-macos cli-win.exe ; mv cli-linux flight ; mv flight ..`)
execSync(`export FLIGHT_DIR='export FLIGHT_HOME="${CoreDir}/dist"' ; echo $FLIGHT_DIR >> ~/.bashrc ; . ~/.bashrc ; echo 'export PATH=$FLIGHT_HOME:$PATH' >> ~/.bashrc`, {
  stdio: "inherit"
}) 
}

if (process.platform === 'win32') {
  execSync(`cd ${CoreDir}/dist/js ; del cli-macos cli-linux ; rename cli-windows.exe flight.exe ; move flight.exe ..`)
  execSync(`setx FLIGHT_DIR=${CoreDir}/dist ; setx PATH=%FLIGHT_DIR%;%PATH%`, {
    stdio: "inherit"
  }) 
  }

Log.progress("Successfully installed flight!")
