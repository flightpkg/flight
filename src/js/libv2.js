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
 
const {
  Resolver,
  NpmHttpRegistry
} = require('./resolver/index')
const fs = require('fs-extra')
const kleur = require('kleur')
const logger = require('../shared/logger')
const zlib = require('zlib');
const path = require('path');
const tar = require('tar');
const args = process.argv.slice(3);
const { deleteFolderRecursive } = require('../shared/extendedfs')

/**
 * Resolves dependencies using {@link Resolver}, and returns them in a JSON lockfile. 
 * @param {any} dependencies
 * @returns {any}
 */
function resolve(dependencies) {
  const res = dependencies
  const resolver = new Resolver({
      registry: new NpmHttpRegistry({
          registryUrl: 'https://registry.yarnpkg.com'
      })
  });

  return resolver.resolve(res);
}

/**
 * Main install function which installs resolved dependencies. 
 * @returns {any}
 */
async function install() {

  function readpkgJson() {
      return new Promise((resolve, reject) => {
          fs.readFile('./package.json', (err, data) => {
              if (err) {
                  reject(err)
              }
              resolve(JSON.parse(data).dependencies)
          })
      })
  }
  const pkgjson = fs.readFile('./package.json', (err) => {
      if (err) throw err;
  })

  let pkgs = await readpkgJson()

  resolve(pkgs)
      .then(results => fs.writeFile('flight.lock', `${JSON.stringify(results, null, "\t")}`, function(err) {
          if (err === null) {
              logger.status('Lockfile successfully created.')
              const lockfile = fs.readFileSync('./flight.lock')
              const parsed = JSON.parse(lockfile)
              const json = parsed.appDependencies

              try {
                  fs.mkdirSync('.flight')
              } catch (e) {
                  fs.emptyDirSync('.flight')
                  fs.rmdirSync('.flight')
                  fs.mkdirSync('.flight')
              }

              for (let x in json) {
                  const name = x
                  const version = json[x].version
                  const urlformat = `https://registry.yarnpkg.com/${name}/-/${name}-${version}.tgz`
                  logger.download(name, version)
                  const {
                      default: {
                          stream
                      }
                  } = require("got");
                  const {
                      createWriteStream
                  } = require("fs");
                  const {
                      execSync
                  } = require("child_process");
                  const existsSync = function(path) {
                      return new Promise(function(resolve, reject) {
                          fs.access(path, fs.F_OK, function(err) {
                              return resolve(err ? false : true)
                          })
                      })
                  }

                  const existsAsync = async function(path) {
                      const exists = await existsSync(path)
                  }

                  const start = () => {
                      const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
                      download.on("finish", () => {
                          logger.download(name, version)
                          const find = existsAsync('node_modules')

                          if (find == true) {
                              execSync(`cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
                                  stdio: "inherit"
                              });
                          }

                          if (find == false) {

                              fs.mkdirSync('node_modules')

                          }

                          if (!fs.existsSync(`./node_modules/${name}/`)) {
                              fs.mkdirSync(`./node_modules/${name}/`, {
                                  recursive: true
                              })
                          }

                          fs.createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
                              .pipe(zlib.Unzip())
                              .pipe(tar.extract({
                                  C: `./node_modules/${name}/`,
                                  strip: 1
                              }))
                              .on("finish", () => {
                                  fs.rmSync(`./.flight/${name}-${version}.tgz`)
                                  logger.unzipped(name, version)
                              })



                      });
                  };



                  start();
              }

              const json2 = parsed.resDependencies

              for (let x in json2) {
                  const raw = x
                  if (raw.startsWith("@") == false) {
                      const split = raw.split('@')
                      const name = split[0]
                      const version = split[1]
                      const urlformat = `https://registry.yarnpkg.com/${name}/-/${name}-${version}.tgz`
                      logger.download(name, version)
                      const {
                          default: {
                              stream
                          }
                      } = require("got");
                      const {
                          createWriteStream
                      } = require("fs");
                      const {
                          execSync
                      } = require("child_process");
                      const existsSync = function(path) {
                          return new Promise(function(resolve, reject) {
                              fs.access(path, fs.F_OK, function(err) {
                                  return resolve(err ? false : true)
                              })
                          })
                      }

                      const existsAsync = async function(path) {
                          const exists = await existsSync(path)
                      }

                      const start = () => {
                          const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
                          download.on("finish", () => {
                              logger.downloaded(name, version)
                              const find = existsAsync('node_modules')

                              if (find == true) {
                                  execSync(`cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
                                      stdio: "inherit"
                                  });
                              }

                              if (find == false) {
                                  execSync(`mkdir node_modules ; cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
                                      stdio: "inherit"
                                  });
                              }

                              if (!fs.existsSync(`./node_modules/${name}/`)) {
                                  fs.mkdirSync(`./node_modules/${name}/`, {
                                      recursive: true
                                  })
                              }

                              fs.createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
                                  .pipe(zlib.Unzip())
                                  .pipe(tar.extract({
                                      C: `./node_modules/${name}/`,
                                      strip: 1
                                  }))
                                  .on("finish", () => {
                                      fs.rmSync(`./.flight/${name}-${version}.tgz`)
                                      logger.unzipped(name, version)
                                  })



                          });
                      };



                      start();
                  }
                  if (raw.startsWith("@") == true) {
                      const split = raw.split('/')
                      const scope = split[0]
                      const pkg = split[1]
                      const version = pkg.split('@')[1]
                      const name = pkg.split('@')[0]
                      const urlformat = `https://registry.yarnpkg.com/${scope}/${name}/-/${name}-${version}.tgz`
                      logger.download(name, version)
                      const {
                          default: {
                              stream
                          }
                      } = require("got");
                      const {
                          createWriteStream
                      } = require("fs");
                      const {
                          execSync
                      } = require("child_process");
                      const existsSync = function(path) {
                          return new Promise(function(resolve, reject) {
                              fs.access(path, fs.F_OK, function(err) {
                                  return resolve(err ? false : true)
                              })
                          })
                      }

                      const existsAsync = async function(path) {
                          const exists = await existsSync(path)
                      }

                      const start = () => {
                          const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
                          download.on("finish", () => {
                              logger.downloaded(name, version)
                              const find = existsAsync('node_modules')

                            //   if (find == true) {
                            //       execSync(`cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
                            //           stdio: "inherit"
                            //       });
                            //   }

                            //   if (find == false) {
                            //       execSync(`mkdir node_modules ; cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
                            //           stdio: "inherit"
                            //       });
                            //   }

                              if (!fs.existsSync(`./node_modules/${name}/`)) {
                                  fs.mkdirSync(`./node_modules/${name}/`, {
                                      recursive: true
                                  })
                              }

                              fs.createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
                                  .pipe(zlib.Unzip())
                                  .pipe(tar.extract({
                                      C: `./node_modules/${name}/`,
                                      strip: 1
                                  }))
                                  .pipe(tar.extract({
                                    C: `~/.flight/.cache/${name}/`,
                                    strip: 1
                                }))
                                  .on("finish", () => {
                                      fs.rmSync(`./.flight/${name}-${version}.tgz`)
                                      logger.unzipped(name, version)
                                  })



                          });
                      };



                      start();
                  }
              }


          } else {
              logger.error(err)
          }
      }))
}

/**
 * Uninstall intalled packages.
 * @param {any} name
 * @returns {any}
 */
function uninstall(name) {
  let pkgjson = JSON.parse(fs.readFileSync('./package.json'))
  let pkgs = {}
  let pkgname = args[1]
  if (typeof args[1] !== 'undefined') {
      for (x in pkgjson["dependencies"]) {
          pkgs[x] = pkgjson["dependencies"][x]
      }

      if (typeof pkgs[pkgname] !== 'undefined') {
          try {
              deleteFolderRecursive(path.resolve(`./.flight/${pkgname}/`))
              deleteFolderRecursive(path.resolve(`./node_modules/${pkgname}/`))
              logger.uninstalled(pkgname)
          } catch (e) {
              logger.error(pkgname + kleur.bold().red(" is not present in the packages directory."))
          }

          delete pkgs[pkgname]
          pkgjson["dependencies"] = pkgs
          fs.writeJSONSync('./package.json', pkgjson, {
              spaces: 4,
              encoding: 'utf8',
          })
          logger.pkgjsonremove(pkgname)
      } else {
          logger.pkgjsonerr(pkgname)
      }
  } else {
      logger.error('Please specify a package to uninstall. (Flight or Node Package.)')
  }
}

module.exports = {
  resolve,
  install,
  uninstall
}
