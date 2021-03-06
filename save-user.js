'use strict';

module.exports = function(deps) {
  var createUser = require('./create-user')(deps);
  var Upgrade = deps.upgrade()
    , Config = deps.models().Config

  function saveUser(email, password, admin, force) {
    Upgrade.isFreshDb(function (err, isFresh) {
      if (isFresh) {
        Upgrade.needConfigObj(function (err, needsConfig) {
          if (needsConfig) {
            var c = new Config();

            c.version = Config.SCHEMA_VERSION;

            c.save(function () {
              createUser(email, password, admin, force);
            });
          } else {
            createUser(email, password, admin, force);
          }
        });
      } else {
        Upgrade.ensure(Config.SCHEMA_VERSION, function () {
          createUser(email, password, admin, force);
        });
      }
    });
  }

  return saveUser;
}
