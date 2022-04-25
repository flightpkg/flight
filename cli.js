#!/usr/bin/env node

const args = process.argv.slice(2);
const { help_menu } = require('./src/constants');
const lib_js = require('./src/js/lib')
const lib_rs = require('./src/rs/lib')
const lib_luau = require('./src/luau/lib')
const cp = require("child_process");

if (args[0] == "-js" || args[0] == "--js") {
  if (args[1] == "install" || args[1] == "i") {
    lib_js.get()
  } else if (args[1] == "uninstall") {
    lib_js.uninstall(args[1])
  } else if (args[1] == "publish") {
    const child = cp.exec('./src/js/publisher/publish.sh', {stdio: "inherit"})
    child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`ERROR:\n${data}`);
  });
} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  process.stdout.write(help_menu)
}
  } else if (args[0] == "-rs" || args[0] == "--rs") {
    if (args[1] == undefined) {
      process.stdout.write(help_menu)
    } else if (args[1] !== undefined) {
      lib_rs.run(args[1])

}} else if (args[0] == "-lua" || args[0] == "--lua"|| args[0] == "--luau" || args[0] == "-luau") {
  if (args[1] == undefined) {
    process.stdout.write(help_menu)
  } else if (args[1] !== undefined) {
    lib_luau.run(args[1])

}} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  process.stdout.write(help_menu)
}
