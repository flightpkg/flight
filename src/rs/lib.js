function run(command) {
    const cp = require("child_process");
    const child = cp.exec(`./rust-install ${command}`, {stdio: "inherit"})
    child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
}

module.exports = {
    run
}