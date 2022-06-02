const child_prc = require('child_process');
const {
    rmSync, rmdirSync, unlink, createWriteStream
  } = require('fs');
  const fs = require('fs-extra')
const { fetch } = require('./fetcher/fetch')
const path = require('path');
const { stdout, emit } = require('process');
const { default: { stream } } = require("got");
const kleur = require('kleur');
const EventEmitter = require('events');

const finished = new EventEmitter();



const deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
          const curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
      }
  };
  
  try {
    fs.mkdirSync('.flight')
  } catch (e) {
    fs.emptyDirSync('.flight')
    fs.rmdirSync('.flight')
    fs.mkdirSync('.flight')
  }


async function install() {
        const reqs = fs.readFileSync('requirements.txt', 'UTF-8');


        const lines = reqs.split('\n');
        for(let i = 0;i < lines.length;i++){
            const dep_split = lines[i].split('==')
            const urlformat = `https://pypi.org/pypi/${dep_split[0]}/${dep_split[1]}/json`
            const metadata = await fetch(urlformat)
            const determine_filetype = metadata.split('.w')
            const filetype = 'w' + determine_filetype[1] // || 'tar.gz'
            if (filetype == 'whl') {
                const filename = metadata.split('/')
                const download = /* exec(`curl -o ./.flight/${dep_split[0]}-${dep_split[1]}.whl ${metadata}`) && finished.emit('finish') */ stream(metadata).pipe(createWriteStream(`./.flight/${filename[7]}`))
                download.on("finish", () => {
                    console.log(kleur.bold().green("Downloaded: ") + " " + dep_split[0] + " @ " + dep_split[1] + ".")
                    const child = process.env.FORCE_COLOR = true && child_prc.exec(`python -m pip install ./.flight/${filename[7]}`, { shell: true, stdio: 'inherit' })
                    child.stdout.on('data', (data) => {
                        console.log(`${data}`);
                      });
                      child.stderr.on('data', (data) => {
                        console.log(`${data}`);
                      });
                  rmSync(`./.flight/${filename[7]}`)
                  console.log(kleur.bold().magenta("Unzipped:    ") + " " + dep_split[0] + " @ " + dep_split[1] + ".")
                })
            }

        }  
        rmdirSync('.flight')

}

module.exports = { install }