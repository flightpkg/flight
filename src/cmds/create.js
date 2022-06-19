const logger = require("../shared/logger")
const fs = require('fs-extra')
const path = require('path')
const zlib = require('zlib')
const tar = require('tar')
const lib = require('../packages/create-next-app/dist/index')

function run(command) {
    const cp = require("child_process");
    const child = cp.exec(`${command}`, { stdio: "inherit" })
}

function create(framework){
    if (framework == 'nextjs' || framework == 'next.js') {
        try {
            fs.mkdirSync('.flight/create-next-app')
          } catch (e) {
            fs.emptyDirSync('.flight/create-next-app')
            fs.rmdirSync('.flight/create-next-app')
            fs.mkdirSync('.flight/create-next-app')
          }
          // run('curl https://registry.npmjs.org/create-next-app/-/create-next-app-12.1.6.tgz >> .flight/create-next-app.tgz && tar -xvf .flight/create-next-app.tgz -C .flight/create-next-app')
          try {
            //run('node .flight/create-next-app/package/dist/index.js')
            lib.next_CLI()
          } catch(e) {
            logger.error('Failed to initialize framework, make sure you have the required runtimes installed.')
          }
          
    }
}


module.exports = { create }