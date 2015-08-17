'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine' ],

    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/simplewebrtc/simplewebrtc.bundle.js',
      'src/**/*.js',
      'tests/**/*Spec.js'
    ],

    reporters: [ 'dots' ],

    browsers: [ 'Chrome' ],

    logLevel: 'LOG_DEBUG',

    singleRun: false,
    autoWatch: true,

  });
};
