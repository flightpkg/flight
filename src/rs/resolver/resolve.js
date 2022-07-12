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
 
const toml = require('toml');
// const fs = require('fs');
const kleur = require('kleur');
const zlib = require('zlib');
const fs = require('fs-extra');
const { default: { stream } } = require("got");
const { createWriteStream } = require("fs");
const cargotoml = fs.readFileSync('./cargo.toml')
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
        var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse 
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
};
const data = toml.parse(cargotoml);
//console.dir(data);
const deps = data.dependencies

for (const x in data.dependencies) {
    try {
      fs.mkdirSync('.flight')
    } catch (e) {
      fs.emptyDirSync('.flight')
      fs.rmdirSync('.flight')
      fs.mkdirSync('.flight')
    }
    const name = x
    const version = deps[`${x}`]
    if (version == '^0') {
      console.log('Please mention the exact version of your package instead of a relative one in your cargo.toml')
  } else {
      try {
      const urlformat = `https://crates.io/api/v1/crates/${name}/${version}/download`
      console.log(urlformat)
      const start = () => {
        const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
        download.on("finish", () => {
          console.log(kleur.bold().green("Downloaded: ") + " " + name + " @ " + version + ".")
          /**
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

          if(!fs.existsSync(`./node_modules/${name}/`)){
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
              rmSync(`./.flight/${name}-${version}.tgz`)
              console.log(kleur.bold().magenta("Unzipped:    ") + " " + name + " @ " + version + ".")
            })


  */
        });
      };


      start();
    } catch(e) {
      const urlformat = `https://crates.io/api/v1/crates/${name}/${version}.0/download`
      console.log(urlformat)
      const start = () => {
        const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
        download.on("finish", () => {
          console.log(kleur.bold().green("Downloaded: ") + " " + name + " @ " + version + ".")
        });
      };
    }
          /**
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
          if(!fs.existsSync(`./node_modules/${name}/`)){
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
              rmSync(`./.flight/${name}-${version}.tgz`)
              console.log(kleur.bold().magenta("Unzipped:    ") + " " + name + " @ " + version + ".")
            })
        });
      };
      start();
    }
  }
  
}


/** const {
    rmSync, rmdirSync, unlink
  } = require('fs');
  const fs = require('fs-extra')
  const kleur = require('kleur');
  var zlib = require('zlib');
  var path = require('path');
  const toml = require('toml');
  var tar = require('tar');
  
  var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
          var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
      }
  };
  
  
  async function get() {
  
    let cargotoml = toml.parse(fs.readFileSync('./cargo.toml'))
    let pkgs = {}
  
    for (x in cargotoml["dependencies"]) {
      pkgs[x] = cargotoml["dependencies"][x]
    }
  
        const err = null
        if (err === null) {
          console.log(kleur.bold().green("Lockfile successfully created."))
          const lockfile = fs.readFileSync('./flight.lock')
          const parsed = toml.parse(lockfile)
          const toml = toml.parse(fs.readFileSync('./cargo.toml'))
  
          try {
            fs.mkdirSync('.flight')
          } catch (e) {
            fs.emptyDirSync('.flight')
            fs.rmdirSync('.flight')
            fs.mkdirSync('.flight')
          }
  
          for (let x in toml) {
            const raw = toml.split(': ')
            console.log(raw)
            const name = x
            const version = json[x].version
            const urlformat = `https://crates.io/api/v1/crates/${name}/${version}/download`
            console.log(kleur.bold().blue("Downloading:") + " " + name + " @ " + version + ".");
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
            const existsSync = function (path) {
              return new Promise(function (resolve, reject) {
                fs.access(path, fs.F_OK, function (err) {
                  return resolve(err ? false : true)
                })
              })
            }
  
            const existsAsync = async function (path) {
              const exists = await existsSync(path)
            }
  
            const start = () => {
              const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
              download.on("finish", () => {
                console.log(kleur.bold().green("Downloaded: ") + " " + name + " @ " + version + ".")
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
  
                if(!fs.existsSync(`./node_modules/${name}/`)){
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
                    rmSync(`./.flight/${name}-${version}.tgz`)
                    console.log(kleur.bold().magenta("Unzipped:    ") + " " + name + " @ " + version + ".")
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
              console.log(kleur.bold().blue("Downloading:") + " " + name + " @ " + version + ".");
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
              const existsSync = function (path) {
                return new Promise(function (resolve, reject) {
                  fs.access(path, fs.F_OK, function (err) {
                    return resolve(err ? false : true)
                  })
                })
              }
  
              const existsAsync = async function (path) {
                const exists = await existsSync(path)
              }
  
              const start = () => {
                const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
                download.on("finish", () => {
                  console.log(kleur.bold().green("Downloaded: ") + " " + name + " @ " + version + ".")
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
  
                  if(!fs.existsSync(`./node_modules/${name}/`)){
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
                      rmSync(`./.flight/${name}-${version}.tgz`)
                      console.log(kleur.bold().magenta("Unzipped:    ") + " " + name + " @ " + version + ".")
                    })
  
  
  
                });
              };
  
  
  
              start();
          }
          // below org scope code is still pretty buggy (try fixing this if you can, the syntax for resDeps with org scope is @org/pkg)
          if (raw.startsWith("@") == true) {
            const split = raw.split('/')
            const scope = split[0]
            console.log(scope)
            const pkg = split[1]
            const version = pkg.split('@')[1]
            const name = pkg.split('@')[0]
            console.log(version)
            const urlformat = `https://registry.yarnpkg.com/${scope}/${name}/-/${name}-${version}.tgz`
            console.log(kleur.bold().blue("Downloading:") + " " + name + " @ " + version + ".");
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
            const existsSync = function (path) {
              return new Promise(function (resolve, reject) {
                fs.access(path, fs.F_OK, function (err) {
                  return resolve(err ? false : true)
                })
              })
            }
  
            const existsAsync = async function (path) {
              const exists = await existsSync(path)
            }
  
            const start = () => {
              const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
              download.on("finish", () => {
                console.log(kleur.bold().green("Downloaded: ") + " " + name + " @ " + version + ".")
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
  
                if(!fs.existsSync(`./node_modules/${name}/`)){
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
                    rmSync(`./.flight/${name}-${version}.tgz`)
                    console.log(kleur.bold().magenta("Unzipped:    ") + " " + name + " @ " + version + ".")
                  })
  
  
  
              });
            };
  
  
  
            start();
        }        
        }
  
  
        }
      }
  
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
          console.log(kleur.bold().red("Uninstalled ") + pkgname + " from the packages directory.")
        } catch (e) {
          console.log(kleur.bold().red("Error: ") + pkgname + kleur.bold().red(" is not present in the  packages directory."))
        }
  
        delete pkgs[pkgname]
        pkgjson["dependencies"] = pkgs
        fs.writeJSONSync('./package.json', pkgjson, {
          spaces: 4,
          encoding: 'utf8',
        })
        console.log(kleur.bold().red("Removed ") + pkgname + " from packages.json.")
       } else {
        console.log(kleur.bold().red('Package ') + pkgname + kleur.bold().red(' not found in package.json.'))
      }
    }else{
      console.log(kleur.bold().red("Please specify a package to uninstall."))
    }
  }
  
  get()
  */
}}
