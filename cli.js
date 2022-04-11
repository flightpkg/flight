const fs = require('fs')
const { Resolver, NpmHttpRegistry } = require('./src/js/resolver/index.js')
//const urlformat = `https://registry.npmjs.com/${name}/-/${name}-${version}.tgz`

function resolve(dependencies){
  // const resolver = new Resolver(); // For server-side usage, uses https://registry.npmjs.org which doesn't have CORS enabled

  const resolver = new Resolver({
    registry: new NpmHttpRegistry({ registryUrl: 'https://registry.yarnpkg.com/' })
  });

  return resolver.resolve(dependencies);
}

async function get() {
await resolve({
  "express": "latest",
}).then(results => fs.writeFile('flight.lock', `${JSON.stringify(results)}`, function(err) {
  if (err === null) {
    console.log("Generated lockfile.")
    // below code doesnt work
    const lockfile = fs.readFileSync('./flight.lock')
    const json = JSON.parse(lockfile)
    for (var i=0; i<json.jsonData.length; i++) {
      for (var key in json.jsonData[i]) {
          for (var j= 0; j<json.jsonData[i][key].length; j++) {
              console.log(json.jsonData[i][key][j])
          }
      }
    }


  }
}))
}

get()

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