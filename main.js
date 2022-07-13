const workerFarm = require('worker-farm')
const service = workerFarm(require.resolve('./cli.js'))


service('main', function (err, output) {
  console.log(output)
})

module.exports = (input, callback) => {
  callback(null, input + ' ' + world)
}