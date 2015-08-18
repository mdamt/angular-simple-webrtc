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
    self.joinedRoom = '';
    self.videoList = [];
  };

  ngSimpleWebRTC.prototype.init = function(options) {
    var self = this;
    var URL = window.URL || window.webkitURL;
    self.options = options;
    self.webrtc = new SimpleWebRTC(options);
    self.webrtc.on('joinedRoom', function() {
      self.$rootScope.$broadcast('webrtc:joinedRoom', options.roomName);
      self.joinedRoom = options.roomName;
    });

    self.webrtc.on('readyToCall', function() {
      if (options.roomName) {
        self.webrtc.joinRoom(options.roomName);
      }
    });

    self.webrtc.on('localStream', function(stream) {
      var video = document.createElement('video');
      video.id = stream.id;
      video.src = URL.createObjectURL(stream);
      video.isRemote = false;
      video.play();
      self.videoList.push(video);
      self.$rootScope.$broadcast('webrtc:videoListChanged');
    });

    self.webrtc.on('videoAdded', function(video, peer) {
      var add = true;
      for (var i = 0; i < self.videoList.length; i ++) {
        var v = self.videoList[i];
        if (video.id === v.id) {
          add = false;
          break;
        }
      }
      if (add) {
        video.isRemote = true;
        self.videoList.push(video);
        self.$rootScope.$broadcast('webrtc:videoListChanged');
      }
    });

    self.webrtc.on('videoRemoved', function(video) {
      var added = false;
      for (var i = 0; i < self.videoList.length; i ++) {
        var v = self.videoList[i];
        if (video.id === v.id) {
          v = null;
          self.videoList.splice(i, 1);
          self.$rootScope.$broadcast('webrtc:videoListChanged');
          break;
        }
      }
    });
  }
  
  ngSimpleWebRTC.prototype.isInitialized = function() {
    var self = this;
    return (self.webrtc != null);
  }

  ngSimpleWebRTC.prototype.joinRoom = function(roomName) {
    var self = this;
    self.options.roomName = roomName;
    self.joinedRoom = '';
    self.webrtc.joinRoom(roomName);
  }

  ngSimpleWebRTC.prototype.pauseVideo = function() {
    var self = this;
    self.webrtc.pauseVideo();
  }

  ngSimpleWebRTC.prototype.resumeVideo = function() {
    var self = this;
    self.webrtc.resumeVideo();
  }

  ngSimpleWebRTCModule.service('$SimpleWebRTC', ngSimpleWebRTC);
});
