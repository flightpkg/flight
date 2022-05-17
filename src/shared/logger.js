const os = require('os')
const kleur = require('kleur')
const logUpdate = require('log-update')

let divider
function setLineLength () {
  divider = Array(process.stdout.columns || 32).join('-')
}
setLineLength()
process.stdout.on('resize', setLineLength)

const progressStyle = kleur.bold().inverse
const errorStyle = kleur.black().bold().bgRed
const statusStyle = kleur.green().italic
const warningStyle = kleur.black().bold().bgYellow
const downloadStyle = kleur.blue().bold
const downloadedStyle = kleur.bold().green
const unzippedStyle = kleur.bold().magenta
const uninstalledStyle = kleur.bold().red

const cmdDirStyle = kleur.blue
const cmdCmdStyle = kleur.green
const cmdArrowStyle = kleur.magenta

function progress (message) {
  console.log(progressStyle("INFO") + ' ' + message)
}

function status (message) {
  console.log(statusStyle("INFO") + ' ' + message)
}

function error (message) {
  console.error(errorStyle("ERROR") + ' ' + message)
}

function warn (message) {
  console.warn(warningStyle("WARN") + ' ' + message)
}

function download (name, version) {
  console.log(downloadStyle("Downloading:") + ' ' + name + '@' + version + '.')
}

function downloaded (name, version) {
  console.log(downloadedStyle("Downloaded:") + ' ' + name + '@' + version + '.')
}

function unzipped (name, version) {
  console.log(unzippedStyle("Unzipped:") + ' ' + name + '@' + version + '.')
}

function uninstalled (pkgname) {
  console.log(uninstalledStyle("Uninstalled ") + pkgname + " from the packages directory.")
}

function pkgjsonremove (pkgname) {
  console.log(uninstalledStyle("Removed ") + pkgname + " from packages.json.")
}

function pkgjsonerr (pkgname) {
  console.log(uninstalledStyle('Package ') + pkgname + uninstalledStyle(' not found in package.json.'))
}


// function updateStatus (projectUpdateStatus) {
//  const statusLines = Object.values(projectUpdateStatus).map(entry =>
//    `${kleur.bold(entry.name)} (${entry.ref}): ${kleur.green().italic(entry.phase)}`
//  )
//  logUpdate(statusLines.join(os.EOL))
// }

function command (dir, cmd, args) {
  console.log(divider)
  if (dir)
    console.log(cmdDirStyle(dir))
  console.log(`${cmdArrowStyle('>')} ${cmdCmdStyle(cmd)} ${args.join(' ')}`)
}

module.exports = {
  progress,
  status,
  error,
  warn,
  command,
  download,
  downloaded,
  unzipped,
  uninstalled,
  pkgjsonremove,
  pkgjsonerr
} 