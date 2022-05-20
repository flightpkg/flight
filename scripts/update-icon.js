const rcedit = require('rcedit')

async function update() { 
  rcedit("../bin/cli-win.exe", {
  icon: "../assets/app.ico"
})}


await update()
