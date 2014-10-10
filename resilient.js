var cluster = require('cluster')
var path = require('path')
var chokidar = require('chokidar')
var touch = require('touch')

module.exports = function(deps) {
  var flag = deps.restartFile();
  return {
    restart: function() {
      touch.sync(flag)
    },
    spawn: function (work) {
      if(cluster.isMaster){
        watcher = chokidar.watch(flag)

        cluster.on('online', function(worker) {
          console.log(worker.process.pid +' forked')
          watcher.removeAllListeners().on('change', function() {
            console.log('restart flag touched')
            worker.kill()
          })
        });

        cluster.on('exit', function(worker, code, signal) {
          console.log(worker.process.pid + ' died', code, signal);
          cluster.fork()
        });

        cluster.fork();
      } else {
        work()
      }
    }
  }
}