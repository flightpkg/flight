const {
  rmSync
} = require('fs');
const fs = require('fs-extra')
const {
  Resolver,
  NpmHttpRegistry
} = require('./src/js/resolver/index.js')
const kleur = require('kleur');


function resolve(dependencies) {
  // const resolver = new Resolver(); // For server-side usage, uses https://registry.npmjs.org which doesn't have CORS enabled
  var res = dependencies
  const resolver = new Resolver({
    registry: new NpmHttpRegistry({
      registryUrl: 'https://registry.yarnpkg.com/'
    })
  });

  return resolver.resolve(res);
}

async function get() {

  let pkgjson = JSON.parse(fs.readFileSync('./package.json'))
  let pkgs = {}

  for (x in pkgjson["dependencies"]) {
    pkgs[x] = pkgjson["dependencies"][x]
  }

  resolve(pkgs)
    .then(results => fs.writeFile('flight.lock', `${JSON.stringify(results)}`, function (err) {

      if (err === null) {
        console.log("Generated lockfile.")
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
          console.log(kleur.bold().blue("Downloading:") + " " + name + " @ " + version + "...");
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

            });
          };



          start();
        }

  
             const json2 = parsed.resDependencies
             for (let x in json2) {
                 const raw = x
                 const split = raw.split("@")
                 //const json = JSON.parse(split)
                 const version = split[1]
                 const name = split[0]

                 const urlformat = `https://registry.yarnpkg.com/${name}/-/${name}-${version}.tgz`
                 const { default: { stream } } = require("got");
                 const { createWriteStream } = require("fs"); 
                 const { execSync } = require("child_process");
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
      
                  });
                };
      
                 
                 start();    
            
                 
              }
              



      }
    }))
}

get()