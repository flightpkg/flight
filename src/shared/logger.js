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
  updateStatus,
  download
} 