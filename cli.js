#!/usr/bin/env node

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

const args = process.argv.slice(2);
const logger = require('./src/shared/logger');
const checks = require('./src/shared/checks')
const { help_menu, version } = require('./src/constants');
const lib_js = require('./src/js/libv2')
const lib_rs = require('./src/rs/lib')
const lib_luau = require('./src/luau/lib')
const lib_py = require('./src/py/lib')
const cp = require("child_process");
const { getVer } = require('./src/cmds/version');
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const frameworks = require('./src/cmds/create')
const frameworks_redwood = require('./src/packages/create-redwood-app/dist/collectInput')

Sentry.init({
  dsn: "https://cb13f8ff8b9f48c080396de10bcdfe29@o1255033.ingest.sentry.io/6423338",
  tracesSampleRate: 1.0,
});

const update = Sentry.startTransaction({
  op: "Update Error",
  name: "An error occured during a flight update installation/check.",
});

const commandfail = Sentry.startTransaction({
  op: "Command Error",
  name: "An error occured while a user ran a flight command.",
});


const checkserror = Sentry.startTransaction({
  op: "Checks Error",
  name: "An error occured during the initialization checks.",
});


// Catch errors during update process
setTimeout(() => {
  try {
    checks.install_updates()
  } catch (e) {
    Sentry.captureException(e);
    logger.error(e)
  } finally {
    update.finish();
  }
}, 99);


setTimeout(() => {
  try {
    checks.init()
  } catch (e) {
    Sentry.captureException(e);
    logger.error(e)
  } finally {
    checkserror.finish();
  }
}, 99);

try {
  if (args[0] == "-v" || args[0] == "--version") {
    console.log(getVer())
  }
  if (args[0] == "-js" || args[0] == "--js") {
    if (args[1] == "install" || args[1] == "i") {
      lib_js.install()
    } else if (args[1] == "uninstall") {
      lib_js.uninstall(args[1])
    } else if (args[1] == "publish") {
    if (process.platform == 'linux') {
        const child = cp.exec('./src/js/publisher/publish.sh', {stdio: "inherit"})
        child.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
  }

    if (process.platform == 'linux') {
        const child = cp.exec('./src/js/publisher/publish.bat', {stdio: "inherit"})
        child.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
  }

    child.stderr.on('data', (data) => {
      console.error(`ERROR:\n${data}`);
    });
  } else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

    console.log(help_menu)
  }
    } else if (args[0] == "-rs" || args[0] == "--rs") {
      if (args[1] == undefined) {
        console.log(help_menu)
      } else if (args[1] !== undefined) {
        lib_rs.run(args[1])

  }} else if (args[0] == "-lua" || args[0] == "--lua"|| args[0] == "--luau" || args[0] == "-luau") {
    if (args[1] == undefined) {
      console.log(help_menu)
    } else if (args[1] !== undefined) {
      lib_luau.run(args[1])

  }} else if (args[0] == undefined  || args[0] == "--help" || args[0] == "-h") {

    console.log(help_menu)
  }


  if (args[0] == "-py" || args[0] == "--py") {
    if (args[1] == "install" || args[1] == "i") {
      lib_py.install()
    }
  }

  if (args[0] == "create" || args[0] == "init") {
    if (args[1] == "next.js" || args[1] == "nextjs") {
      frameworks.create('nextjs')
    } else if (args[1] == "redwood" || args[1] == "redwoodjs") {
      frameworks_redwood.init() // Errors in compiled binary, works in testing.
    } else {
      logger.error('The requested framework is not supported by flight yet.')
    }
  }  


} catch(e) {
  logger.error('An error occurred when running the command requested.')
  checks.init(e)
  Sentry.captureException(e);
} finally {
  commandfail.finish();
}
