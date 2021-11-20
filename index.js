'use strict';
const ignore = require('ignore')
const fs = require('fs')

class ServerlessIgnore {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    // load service package object so we can edit it later
    this.serverless.service.package = this.serverless.service.package || {}

    this.hooks = {
      // bind hook with our own function
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
      
      // using package.patterns as suggested for 2+ sls versions
      // ref https://www.serverless.com/framework/docs/deprecations#new-way-to-define-packaging-patterns
      if (typeof this.serverless.service.package.patterns === 'undefined') {
        this.serverless.service.package.patterns = []
      }
      filesToIgnore.forEach((file) => {
        if (file.negative == true) return
        var fileIgnore = file.origin
        this.serverless.cli.log("\t - " + fileIgnore);
        this.serverless.service.package.patterns.push(fileIgnore);
      })
    } catch (e) {
      console.error('\n Serverless Ignore Error --------------------------------------\n', '  ', e.message)
    }
  }
}

module.exports = ServerlessIgnore;
