(function(root, factory) {
'use strict';
  if(typeof define === 'function' && define.amd) {                    // AMD
    define(['SimpleWebRTC'], function(SimpleWebRTC) {
      factory(root.angular, SimpleWebRTC);
    });
  } else if(typeof exports === 'object' || typeof global === 'object') {
    var angular = root.angular || (window && window.angular);
    module.exports = factory(angular, require('simplewebrtc')); // Node/Browserify
  } else {
    factory(root.angular, root.SimpleWebRTC);                        // Browser
  }
})(this, function(angular, SimpleWebRTC, undefined) {
  'use strict';

  var ngSimpleWebRTCModule = angular.module('SimpleWebRTCModule', ['ng']);
  
  var ngSimpleWebRTC = function($rootScope) {
    var self = this;
    self.webrtc = null;
    self.$rootScope = $rootScope;
  };

  ngSimpleWebRTC.prototype.init = function(options) {
    var self = this;
    self.webrtc = new SimpleWebRTC(options);
    self.webrtc.on('joinedRoom', function() {
      self.$rootScope.$broadcast('webrtc:joinedRoom', options.roomName);
    });

    self.webrtc.on('readyToCall', function() {
      if (options.roomName) {
        self.webrtc.joinRoom(options.roomName);
      }
    });
  }
  
  ngSimpleWebRTC.prototype.isInitialized = function() {
    var self = this;
    return (self.webrtc != null);
  }

  ngSimpleWebRTCModule.service('$SimpleWebRTC', ngSimpleWebRTC);
});
