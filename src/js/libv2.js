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

  let pkgs = {}

//  for (x in pkgjson["dependencies"]) {
//    pkgs = pkgjson["dependencies"]
//  }

//  const deps = pkgjson.split(',')

  
//  console.log(await readpkgJson())

  resolve({
    "async": '^2.6.4',
    "axios": '^0.27.2',
    'create-docusaurus': '^2.0.0-beta.18',
    "dotenv": '^16.0.0',
    'fs-extra': '^10.0.1',
    "got": '11.8.1',
    "graphlib": '^2.1.8',
    "kleur": '^4.1.4',
    'log-update': '4.0.0',
    'npm-package-arg': '^9.0.2',
    "superagent": '^7.1.2',
    "tar": '^6.1.11',
    "toml": '^3.0.0'
  }).then(console.log)
//    .then(results => fs.writeFile('flight.lock', `${JSON.stringify(results, null, "\t")}`))

//    resolve({
//      "rxjs": "~5.5.0",
//      "left-pad": "*",
//      "zone.js": "latest",
//      "@angular/core": "~5.2.0"
//    }).then(results => console.log(results))
}

install()