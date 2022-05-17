const { Resolver, NpmHttpRegistry } = require('./resolver/index')
const fs = require('fs-extra')
const kleur = require('kleur')
const logger = require('../shared/logger')
const zlib = require('zlib');
const path = require('path');
const tar = require('tar');
const args = process.argv.slice(3);

const deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
        const curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
};


function resolve(dependencies) {
    const res = dependencies
    const resolver = new Resolver({
      registry: new NpmHttpRegistry({
        registryUrl: 'https://registry.yarnpkg.com/'
      })
    });
  
    return resolver.resolve(res);
  }
 
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

//  for (x in pkgjson["dependencies"]) {
//    pkgs = pkgjson["dependencies"]
//  }

//  const deps = pkgjson.split(',')

  
//  console.log(await readpkgJson())
/* 
  let res = await resolve(pkgs)
  fs.writeFile("flight.lock", res, (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
    }
  });
  */
/*
  resolve(pkgs).then(results => fs.writeFile('flight.lock', `${JSON.stringify(results, null, "\t")}`, function (err) {
    if (err === null) {
      console.log(("Lockfile successfully created."))
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
}}))
*/


resolve(pkgs)
.then(results => fs.writeFile('flight.lock', `${JSON.stringify(results, null, "\t")}`, function (err) {
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
          logger.download(name, version)
          const find = existsAsync('node_modules')

          if (find == true) {
            execSync(`cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
              stdio: "inherit"
            });
          }

          if (find == false) {
            
            fs.mkdirSync('node_modules')
          
         //   execSync(`cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`, {
         //     stdio: "inherit"
         //   });
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
                fs.rmSync(`./.flight/${name}-${version}.tgz`)
                logger.unzipped(name, version)
              })



          });
        };



        start();
    }
    // below org scope code is still pretty buggy (try fixing this if you can, the syntax for resDeps with org scope is @org/pkg)
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
    logger.error(pkgname + kleur.bold().red(" is not present in the  packages directory."))
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
}else{
logger.error('Please specify a package to uninstall.')
}
//    .then(results => fs.writeFile('flight.lock', `${JSON.stringify(results, null, "\t")}`))

//    resolve({
//      "rxjs": "~5.5.0",
//      "left-pad": "*",
//      "zone.js": "latest",
//      "@angular/core": "~5.2.0"
//    }).then(results => console.log(results))
}

module.exports = {
  resolve,
  install,
  uninstall
}