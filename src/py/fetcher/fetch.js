const axios = require('axios')

async function fetch(uri){

    const fetch = await axios.get(uri)
    const data = fetch.data
    return Promise.resolve(data.urls[0].url)
}

module.exports = {
    fetch
}