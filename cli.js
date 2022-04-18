const args = process.argv.slice(2);
const lib = require('./src/js/lib')

if (args[0] == "-js" || args[0] == "--js") {
  if (args[1] == "install" || args[1] == "i") {
    lib.get()
  } else if (args[1] == "uninstall") {
    lib.uninstall(args[1])
  } 
} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

  process.stdout.write(`
  Usage: flight [command] [flags]

  Displays help information.

  Options:
    -h, --help                          output usage information
    -js, --js                           install nodejs packages

  Commands:
    - install
    - uninstall

  Run flight --help COMMAND for more information on specific commands.\n`, )
}
