'use strict';
const ignore = require('ignore')
const fs = require('fs')

class ServerlessSLSIgnore {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.pluginName = "slsignore";

    this.serverless.service.package = this.serverless.service.package || {}

    this.commands = {
      deploy: {
        lifecycleEvents: [
          'package'
        ]
      },
    };

    this.hooks = {
      'package:cleanup': this.ignoreFiles.bind(this)
    };
  }

  ignoreFiles() {
    try {
      var config = typeof this.serverless.service.custom !== 'undefined' ? this.serverless.service.custom['ignore'] : {};
      var configFound =  config !== undefined && typeof config.file !== 'undefined'
      var ignoreFilePath = configFound ? config.file : '.slsignore'
      var ignoreFile = fs.readFileSync(ignoreFilePath, 'utf8').toString()
      var filesToIgnore = ignore().add(ignoreFile)._rules
      this.serverless.cli.log(this.pluginName + ': Loaded ' + ignoreFilePath)
      
      // set exclude dev
      if (!configFound || (configFound && config.excludeDev == true)) this.serverless.service.package.excludeDevDependencies = true
      
      if (typeof this.serverless.service.package.exclude === 'undefined') {
        this.serverless.service.package.exclude = []
      }
      let c =0;
      filesToIgnore.forEach((file) => {
        if (file.negative == true) return
        var fileIgnore = file.origin
        this.serverless.service.package.exclude.push(fileIgnore);
        c+=1;
      })
        this.serverless.cli.log(this.pluginName + ": files ignored: " + c);
    } catch (e) {
      console.error('\n Serverless Ignore Error --------------------------------------\n', '  ', e.message)
    }
  }
}

module.exports = ServerlessSLSIgnore;
