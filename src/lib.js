const axios = require('axios')
const versions = 'https://updates.flightpkg.js.org/api/fetch'
const beta = 'https://updates.flightpkg.js.org/api/beta'
const nightly = 'https://updates.flightpkg.js.org/api/nightly'
const stable = 'https://updates.flightpkg.js.org/api/stable'    

async function check_for_updates_stable(){
    const fetch = await axios.get(stable)
    const data = fetch.data.stable
    return Promise.resolve(data)
}


async function check_for_updates_beta(){

    const fetch = await axios.get(stable)
    const data = fetch.data.beta
    return Promise.resolve(data)
}
  

async function check_for_updates_nightly(){

    const fetch = await axios.get(stable)
    const data = fetch.data.beta
    return Promise.resolve(data)
}

async function check_for_updates_versions(){

    const fetch = await axios.get(stable)
    const data = fetch.data
    return Promise.resolve(data)
}
  
  


module.exports = {
   check_for_updates_stable,
   check_for_updates_beta,
   check_for_updates_nightly,
   check_for_updates_versions
}
