const { version, Sha256_Checksum } = require('../constants')

function getVer() {
    const buildid = Sha256_Checksum.slice(0, 5);
    const res = `Version: ${version}, Build ID: ${buildid}-${process.platform}`
    return res    
}

module.exports = { getVer }