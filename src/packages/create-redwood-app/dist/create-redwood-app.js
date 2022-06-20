#!/usr/bin/env node
// This downloads the latest release of Redwood from https://github.com/redwoodjs/create-redwood-app/
// and extracts it into the supplied directory.
//
// Usage:
// `$ flight create redwood-app ./path/to/new-project`
"use strict";
async function redwood_CLI(targetDir) {
  var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

  var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

  var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

  var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

  var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

  var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));

  var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

  var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

  var _child_process = require("child_process");

  var _path = _interopRequireDefault(require("path"));

  var _chalk = _interopRequireDefault(require("chalk"));

  var _checkNodeVersion = _interopRequireDefault(require("check-node-version"));

  var _execa = _interopRequireDefault(require("execa"));

  var _fsExtra = _interopRequireDefault(require("fs-extra"));

  var _listr = _interopRequireDefault(require("listr"));

  var _helpers = require("yargs/helpers");

  var _yargs = _interopRequireDefault(require("yargs/yargs"));

  var _package = require("../package");

  /**
   * To keep a consistent color/style palette between cli packages, such as
   * @redwood/create-redwood-app and @redwood/cli, please keep them compatible
   * with one and another. We'll might split up and refactor these into a
   * separate package when there is a strong motivation behind it.
   *
   * Current files:
   *
   * - packages/cli/src/lib/colors.js
   * - packages/create-redwood-app/src/create-redwood-app.js (this file)
   *
   */
  const style = {
    error: _chalk.default.bold.red,
    warning: _chalk.default.keyword('orange'),
    success: _chalk.default.greenBright,
    info: _chalk.default.grey,
    header: _chalk.default.bold.underline.hex('#e8e8e8'),
    cmd: _chalk.default.hex('#808080'),
    redwood: _chalk.default.hex('#ff845e'),
    love: _chalk.default.redBright,
    green: _chalk.default.green
  };
  const {
    _: args,
    'flight-install': flightInstall,
    typescript,
    overwrite,
    telemetry: telemetry,
    flight1
  } = (0, _yargs.default)((0, _helpers.hideBin)(process.argv)).scriptName(_package.name).usage('Usage: $0 <project directory> [option]').example('$0 newapp').option('flight-install', {
    default: true,
    type: 'boolean',
    describe: 'Skip flight install with --no-flight-install. Also skips version requirements check.'
  }).option('typescript', {
    alias: 'ts',
    default: false,
    type: 'boolean',
    describe: 'Generate a TypeScript project. JavaScript by default.'
  }).option('overwrite', {
    default: false,
    type: 'boolean',
    describe: "Create even if target directory isn't empty"
  }).option('telemetry', {
    default: true,
    type: 'boolean',
    describe: 'Enables sending telemetry events for this create command and all Redwood CLI commands https://telemetry.redwoodjs.com'
  }).option('flight1', {
    default: false,
    type: 'boolean',
    describe: 'Use flight 1. flight 3 by default'
  }).version(_package.version).parse();


  if (!targetDir) {
    console.error('Please specify the project directory');
    console.log(`  ${_chalk.default.cyan('flight create redwood-app')} ${_chalk.default.green('<project-directory>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${_chalk.default.cyan('flight create redwood-app')} ${_chalk.default.green('my-redwood-app')}`);
    process.exit(1);
  }

  const newAppDir = _path.default.resolve(process.cwd(), targetDir);

  const appDirExists = _fsExtra.default.existsSync(newAppDir);

  const templateDir = _path.default.resolve(__dirname, '../template');

  const createProjectTasks = ({
    newAppDir,
    overwrite
  }) => {
    return [{
      title: 'Checking node and flight compatibility',
      skip: () => {
        if (flightInstall === false) {
          return 'Warning: skipping check on request';
        }
      },
      task: () => {
        return new _promise.default((resolve, reject) => {
          const {
            engines
          } = require(_path.default.join(templateDir, 'package.json')); // this checks all engine requirements, including Node.js and flight


          (0, _checkNodeVersion.default)(engines, (_error, result) => {
            var _context, _context2;

            if (result.isSatisfied) {
              return resolve();
            }

            const logStatements = (0, _map.default)(_context = (0, _filter.default)(_context2 = (0, _keys.default)(result.versions)).call(_context2, name => !result.versions[name].isSatisfied)).call(_context, name => {
              const {
                version,
                wanted
              } = result.versions[name];
              return style.error(`${name} ${wanted} required, but you have ${version}`);
            });
            logStatements.push(style.header(`\nVisit requirements documentation:`));
            logStatements.push(style.warning(`/docs/tutorial/chapter1/prerequisites/#nodejs-and-flight-versions\n`));
            return reject(new Error(logStatements.join('\n')));
          });
        });
      }
    }, {
      title: `${appDirExists ? 'Using' : 'Creating'} directory '${newAppDir}'`,
      task: () => {
        if (appDirExists && !overwrite) {
          // make sure that the target directory is empty
          if (_fsExtra.default.readdirSync(newAppDir).length > 0) {
            console.error(style.error(`\n'${newAppDir}' already exists and is not empty\n`));
            process.exit(1);
          }
        } else {
          _fsExtra.default.ensureDirSync(_path.default.dirname(newAppDir));
        }

        _fsExtra.default.copySync(templateDir, newAppDir, {
          overwrite: overwrite
        }); // .gitignore is renamed here to force file inclusion during publishing


        _fsExtra.default.rename(_path.default.join(newAppDir, 'gitignore.template'), _path.default.join(newAppDir, '.gitignore'));
      }
    }, {
      title: 'Converting to flight 1',
      enabled: () => flight1,
      task: () => {
        // rm files:
        // - .flightrc.yml
        // - .flight
        _fsExtra.default.rmSync(_path.default.join(newAppDir, '.flightrc.yml'));

        _fsExtra.default.rmdirSync(_path.default.join(newAppDir, '.flight'), {
          recursive: true
        }); // rm after `.pnp.*`


        const gitignore = _fsExtra.default.readFileSync(_path.default.join(newAppDir, '.gitignore'), {
          encoding: 'utf-8'
        });

        const [flight1Gitignore, _flight3Gitignore] = gitignore.split('.pnp.*');

        _fsExtra.default.writeFileSync(_path.default.join(newAppDir, '.gitignore'), flight1Gitignore); // rm `packageManager` from package.json


        const packageJSON = _fsExtra.default.readJSONSync(_path.default.join(newAppDir, 'package.json'));

        delete packageJSON.packageManager;

        _fsExtra.default.writeJSONSync(_path.default.join(newAppDir, 'package.json'), packageJSON, {
          spaces: 2
        });
      }
    }];
  };

  const installNodeModulesTasks = ({
    newAppDir
  }) => {
    return [{
      title: "Running 'flight --js install'... (This could take a while)",
      skip: () => {
        if (flightInstall === false) {
          return 'skipped on request';
        }
      },
      task: () => {
        return (0, _execa.default)('flight --js install', {
          shell: true,
          cwd: newAppDir
        });
      }
    }];
  };

  const sendTelemetry = ({
    error
  } = {}) => {
    // send 'create' telemetry event, or disable for new app
    if (telemetry) {
      const command = process.argv; // make command show 'create redwood-app [path] --flags'

      (0, _splice.default)(command).call(command, 2, 0, 'create', 'redwood-app');
      command[4] = '[path]';
      let args = ['--root', newAppDir, '--argv', (0, _stringify.default)(command), '--duration', (0, _now.default)() - startTime, '--rwVersion', _package.version];

      if (error) {
        args = [...args, '--error', `"${error}"`];
      }

      (0, _child_process.spawn)(process.execPath, [_path.default.join(__dirname, 'telemetry.js'), ...args], {
        detached: process.env.REDWOOD_VERBOSE_TELEMETRY ? false : true,
        stdio: process.env.REDWOOD_VERBOSE_TELEMETRY ? 'inherit' : 'ignore'
      }).unref();
    } else {
      _fsExtra.default.appendFileSync(_path.default.join(newAppDir, '.env'), 'REDWOOD_DISABLE_TELEMETRY=1\n');
    }
  };

  const startTime = (0, _now.default)();
  new _listr.default([{
    title: 'Creating Redwood app',
    task: () => new _listr.default(createProjectTasks({
      newAppDir,
      overwrite
    }))
  }, {
    title: 'Installing packages',
    task: () => new _listr.default(installNodeModulesTasks({
      newAppDir
    }))
  }, {
    title: 'Convert TypeScript files to JavaScript',
    enabled: () => typescript === false && flightInstall === true,
    task: () => {
      return (0, _execa.default)('flight rw ts-to-js', {
        shell: true,
        cwd: newAppDir
      });
    }
  }, {
    title: 'Generating types',
    skip: () => flightInstall === false,
    task: () => {
      return (0, _execa.default)('flight rw-gen', {
        shell: true,
        cwd: newAppDir
      });
    }
  }], {
    collapse: false,
    exitOnError: true
  }).run().then(() => {
    var _context3;

    sendTelemetry() // zOMG the semicolon below is a real Prettier thing. What??
    // https://prettier.io/docs/en/rationale.html#semicolons
    ;
    (0, _map.default)(_context3 = ['', style.success('Thanks for trying out Redwood!'), '', ` ⚡️ ${style.redwood('Get up and running fast with this Quick Start guide')}: https://redwoodjs.com/docs/quick-start`, '', style.header('Join the Community'), '', `${style.redwood(' ❖ Join our Forums')}: https://community.redwoodjs.com`, `${style.redwood(' ❖ Join our Chat')}: https://discord.gg/redwoodjs`, '', style.header('Get some help'), '', `${style.redwood(' ❖ Get started with the Tutorial')}: https://redwoodjs.com/docs/tutorial`, `${style.redwood(' ❖ Read the Documentation')}: https://redwoodjs.com/docs`, '', style.header('Stay updated'), '', `${style.redwood(' ❖ Sign up for our Newsletter')}: https://www.redwoodjs.com/newsletter`, `${style.redwood(' ❖ Follow us on Twitter')}: https://twitter.com/redwoodjs`, '', `${style.header(`Become a Contributor`)} ${style.love('❤')}`, '', `${style.redwood(' ❖ Learn how to get started')}: https://redwoodjs.com/docs/contributing`, `${style.redwood(' ❖ Find a Good First Issue')}: https://redwoodjs.com/good-first-issue`, '', `${style.header(`Fire it up!`)} 🚀`, '', `${style.redwood(` > ${style.green(`cd ${targetDir}`)}`)}`, `${style.redwood(` > ${style.green(`flight dev`)}`)}`, '']).call(_context3, item => console.log(item));
    process.exit(0)
  }).catch(e => {
    console.log();
    console.log(e);
    sendTelemetry({
      error: e.message
    });

    if (_fsExtra.default.existsSync(newAppDir)) {
      console.log(style.warning(`\nWarning: Directory `) + style.cmd(`'${newAppDir}' `) + style.warning(`was created. However, the installation could not complete due to an error.\n`));
    }

    process.exit(1);
  });
}

module.exports = { redwood_CLI }