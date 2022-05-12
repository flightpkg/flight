const { Resolver, NpmHttpRegistry } = require('./resolver/index')
const fs = require('fs')


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
  let pkgjson = JSON.parse(fs.readFileSync('./package.json'))
  let pkgs = {}

  for (x in pkgjson["dependencies"]) {
    pkgs[x] = pkgjson["dependencies"][x]
  }

  resolve(pkgs)
    .then(results => fs.writeFile('flight.lock', `${JSON.stringify(results, null, "\t")}`, function (err) {

      if (err === null) {
        console.log(kleur.bold().green("Lockfile successfully created."))
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
    }))
}
install()