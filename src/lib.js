const axios = require('axios')
const versions = 'https://updates-server-two.vercel.app/api'
const beta = 'https://updates-server-two.vercel.app/api/beta'
const nightly = 'https://updates-server-two.vercel.app/api/nightly'
const stable = 'https://updates-server-two.vercel.app/api/stable'    

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
