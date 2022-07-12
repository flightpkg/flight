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
