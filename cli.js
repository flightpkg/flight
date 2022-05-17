#!/usr/bin/env node

const args = process.argv.slice(2);
const logger = require('./src/shared/logger');
const { help_menu, version } = require('./src/constants');
const { check_for_updates_stable, check_for_updates_beta, check_for_updates_nightly } = require('./src/lib')
const lib_js = require('./src/js/libv2')
const lib_rs = require('./src/rs/lib')
const lib_luau = require('./src/luau/lib')
const lib_py = require('./src/py/lib')
const cp = require("child_process");
const { getVer } = require('./src/cmds/version');


async function install_updates() {
  check_for_updates_stable()
  .then((fetched_version) => {
    

    if (fetched_version !== version) {
      console.log('Newer version of flight available, automatically updating...')

      if (process.platform == "linux") {
        const child = cp.exec(`curl -qL https://github.com/flightpkg/flight/releases/download/${fetched_version}/install.sh | bash`, {stdio: "inherit"})
        child.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
    
      child.stderr.on('data', (data) => {
        console.error(`${data}`);
      });
  } else if (process.platform == "win32") {
      const child = cp.exec(`curl https://github.com/flightpkg/flight/releases/download/${fetched_version}/install.ps1 -O install.ps1 && powershell install.ps1`, {stdio: "inherit"})
      child.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`${data}`);
  });
  }    
}
})}

try {
  install_updates()
} catch(e) {
  logger.error(err)
}


if (args[0] == "-v" || args[0] == "--version") {
  console.log(getVer())
}
if (args[0] == "-js" || args[0] == "--js") {
  if (args[1] == "install" || args[1] == "i") {
    lib_js.get()
  } else if (args[1] == "uninstall") {
    lib_js.uninstall(args[1])
  } else if (args[1] == "publish") {
  if (process.platform == 'linux') {
      const child = cp.exec('./src/js/publisher/publish.sh', {stdio: "inherit"})
      child.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
}

  if (process.platform == 'linux') {
      const child = cp.exec('./src/js/publisher/publish.bat', {stdio: "inherit"})
      child.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
}

  child.stderr.on('data', (data) => {
    console.error(`ERROR:\n${data}`);
  });
} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  console.log(help_menu)
}
  } else if (args[0] == "-rs" || args[0] == "--rs") {
    if (args[1] == undefined) {
      console.log(help_menu)
    } else if (args[1] !== undefined) {
      lib_rs.run(args[1])

}} else if (args[0] == "-lua" || args[0] == "--lua"|| args[0] == "--luau" || args[0] == "-luau") {
  if (args[1] == undefined) {
    console.log(help_menu)
  } else if (args[1] !== undefined) {
    lib_luau.run(args[1])

}} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  console.log(help_menu)
}


if (args[0] == "-py" || args[0] == "--py") {
  if (args[1] == "install" || args[1] == "i") {
    lib_py.install()
  }
}
