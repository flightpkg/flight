const fs = require('fs')
const Log = require('./logging')
const { spawnSync } = require('child_process')

const getNPMConfigFromEnv = (path) => {
  const key = path.join('_')
  const keyNoDashes = key.replace('-', '_')
  const npm_prefix = 'npm_config_'
  const package_config_prefix = 'npm_package_config_'
  const package_prefix = 'npm_package_'
  return process.env[npm_prefix + keyNoDashes] ||
    process.env[package_config_prefix + keyNoDashes] ||
    process.env[package_config_prefix + key] ||
    process.env[package_prefix + keyNoDashes] ||
    process.env[package_prefix + key]
}

const getNPMConfigFromPackageJson = (path) => {
  let packages = { config: {} }
  if (fs.existsSync(process.env['npm_package_json'])) {
    packages = require(process.env['npm_package_json'])
  }

  let obj = packages.config
  for (var i = 0, len = path.length; i < len; i++) {
    if (!obj) {
      return obj
    }
    obj = obj[path[i]]
  }
  return obj
}

const getNPMConfig = (path) => {
  return getNPMConfigFromEnv(path) || getNPMConfigFromPackageJson(path)
}


const getProjectVersion = (projectName) => {
  return getNPMConfig(['projects', projectName, 'tag']) || getNPMConfig(['projects', projectName, 'branch'])
}

const run = (cmd, args = [], options = {}) => {
  const { continueOnFail, ...cmdOptions } = options
  Log.command(cmdOptions.cwd, cmd, args)
  const prog = spawnSync(cmd, args, cmdOptions)
  if (prog.status !== 0) {
    if (!continueOnFail) {
      console.log(prog.stdout && prog.stdout.toString())
      console.error(prog.stderr && prog.stderr.toString())
      return null
    }
  }
  return prog
}


const runOutput = (cmd, args = [], options = {}) => {
  const { continueOnFail, ...cmdOptions } = options
  Log.command(cmdOptions.cwd, cmd, args)
  const prog = spawnSync(cmd, args, cmdOptions)
  console.log(prog.stdout && prog.stdout.toString())
  if (prog.status !== 0) {
    if (!continueOnFail) {
      console.log(prog.stdout && prog.stdout.toString())
      console.error(prog.stderr && prog.stderr.toString())
    }
  }
  return prog
}

const runGit = (repoPath, gitArgs, continueOnFail = false) => {
  let prog = run('git', gitArgs, { cwd: repoPath, continueOnFail })

  if (prog.status !== 0) {
    return null
  } else {
    return prog.stdout.toString().trim()
  }
}

module.exports = {
  getNPMConfig,
  getProjectVersion,
  run,
  runOutput,
  runGit
}