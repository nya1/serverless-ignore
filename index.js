'use strict';
const ignore = require('ignore')
const fs = require('fs')

class ServerlessIgnore {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    // load service package object with a default so we can edit it later
    this.serverless.service.package = this.serverless.service.package || {}

    this.hooks = {
      // ignore file will be triggered on package:cleanup
      'package:cleanup': this.ignoreFiles.bind(this)
    };
  }

  ignoreFiles() {
    try {
      const config = (this.serverless.service.custom || {})['ignore'] || {};
      const configFound = typeof config.file !== 'undefined'
      const ignoreFilePath = configFound ? config.file : '.slsignore'
      const ignoreFile = fs.readFileSync(ignoreFilePath, 'utf8').toString()
      const filesToIgnore = ignore().add(ignoreFile)._rules
      this.serverless.cli.log('SERVERLESS-IGNORE: Loaded ' + ignoreFilePath)
      
      // set exclude dev
      if (!configFound || (configFound && config.excludeDev == true)) this.serverless.service.package.excludeDevDependencies = true
   
      if (typeof this.serverless.service.package.exclude === 'undefined') {
        this.serverless.service.package.exclude = []
      }
      filesToIgnore.forEach((file) => {
        if (file.negative == true) return
        const fileIgnore = file.origin
        this.serverless.cli.log("\t - " + fileIgnore);
        this.serverless.service.package.exclude.push(fileIgnore);
      })
    } catch (e) {
      console.error('\n Serverless Ignore Error --------------------------------------\n', '  ', e.message)
    }
  }
}

module.exports = ServerlessIgnore;
