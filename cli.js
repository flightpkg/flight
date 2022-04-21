#!/usr/bin/env node

const args = process.argv.slice(2);
const { help_menu } = require('./src/constants');
const lib = require('./src/js/lib')
const { exec } = require("child_process");

if (args[0] == "-js" || args[0] == "--js") {
  if (args[1] == "install" || args[1] == "i") {
    lib.get()
  } else if (args[1] == "uninstall") {
    lib.uninstall(args[1])
  } else if (args[1] == "publish") {
    exec("./bin/wrapper-js.js npm publish", (error, stdout, stderr) => {
      if (error) {
          console.log(`ERROR: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`${stderr}`);
          return;
      }
      console.log(`${stdout}`);
    });
  } 
} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  process.stdout.write(help_menu)
}

