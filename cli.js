#!/usr/bin/env node

const args = process.argv.slice(2);
const { help_menu } = require('./src/constants');
const lib = require('./src/js/lib')
const { exec } = require("child_process");
const cp = require("child_process");

if (args[0] == "-js" || args[0] == "--js") {
  if (args[1] == "install" || args[1] == "i") {
    lib.get()
  } else if (args[1] == "uninstall") {
    lib.uninstall(args[1])
  } else if (args[1] == "publish") {
    const child = cp.exec('./src/js/publisher/publish.sh', {stdio: "inherit"})
    child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`ERROR:\n${data}`);
  });
  } 
} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  process.stdout.write(help_menu)
}

