const {
  rmSync, rmdirSync, unlink
} = require('fs');
const fs = require('fs-extra')
const {
  Resolver,
  NpmHttpRegistry
} = require('./src/js/resolver/index.js')
const kleur = require('kleur');
var zlib = require('zlib');
var path = require('path');
var tar = require('tar');
const args = process.argv.slice(2);

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

              fs.mkdirSync(`./.flight/${name}/`)

              fs.createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
                .pipe(zlib.Unzip())
                .pipe(tar.extract({
                  C: `./.flight/${name}/`,
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

        /**
             const json2 = parsed.resDependencies
             for (let x in json2) {
                 const raw = x
                 const split = raw.split("@")
                 console.log(split)
                 //const json = JSON.parse(split)
                 const version = split[1]
                 const name = split[0]

                 const urlformat = `https://registry.npmjs.com/${name}/-/${name}-${version}.tgz`
                 console.log(urlformat)
                 const { default: { stream } } = require("got");
                 const { createWriteStream } = require("fs"); 
                 const { execSync } = require("child_process");
                 const start = () => {
                     const download = stream(urlformat).pipe(createWriteStream(`./.flight/${name}-${version}.tgz`));
                     download.on("finish", () => {
                         execSync("echo yes", { stdio: "inherit" });
                     });
                 };
                 
                 start();    
            
                 
              }
              */



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
        console.log(kleur.bold().red("Uninstalled ") + pkgname + " from the .flight directory.")
      } catch (e) {
        console.log(kleur.bold().red("Error: ") + pkgname + kleur.bold().red(" is not present in the flight packages directory."))
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


if (args[0] == "install" || args[0] == "i") {
  get()
} else if (args[0] == "uninstall") {
  uninstall(args[0])
} else {
  console.log(kleur.bold().bgGreen("Commands:"))
  console.log(kleur.green("install") + " - Install all dependencies from package.json.")
  console.log(kleur.green("uninstall [dep]") + " - Uninstall a dependency.")

}

/**
{
  appDependencies: {
    rxjs: {
      version: '5.5.12',
      dependencies: [Object],
      main: './Rx.js',
      typings: './Rx.d.ts'
    },
    'left-pad': {
      version: '1.3.0',
      dependencies: {},
      main: 'index.js',
      types: 'index.d.ts'
    },
    'zone.js': {
      version: '0.11.5',
      dependencies: [Object],
      main: './bundles/zone.umd.js',
      module: './fesm2015/zone.js',
      typings: './zone.d.ts'
    },
    '@angular/core': {
      version: '5.2.11',
      dependencies: [Object],
      main: './bundles/core.umd.js',
      module: './esm5/core.js',
      typings: './core.d.ts'
    }
  },
  resDependencies: {
    'symbol-observable@1.0.1': { dependencies: {}, typings: 'index.d.ts' },
    'tslib@2.3.1': {
      dependencies: {},
      main: 'tslib.js',
      module: 'tslib.es6.js',
      typings: 'tslib.d.ts'
    },
    'tslib@1.14.1': {
      dependencies: {},
      main: 'tslib.js',
      module: 'tslib.es6.js',
      typings: 'tslib.d.ts'
    }
  },
 */

//yes