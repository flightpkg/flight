/*
 *
 *    Copyright 2022 flightpkg Contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
 
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
