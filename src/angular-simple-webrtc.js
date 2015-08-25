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
    self.streamList = [];
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

    self.webrtc.on('createdPeer', function(peer) {
      self.setupPeer(peer);
    });

    self.webrtc.on('localStream', function(stream) {
      var video = document.createElement('video');
      video.id = stream.id;
      video.src = URL.createObjectURL(stream);
      video.play();
      stream.videoEl = video;
      stream.isRemote = false;
      stream.isShown = true;
      self.streamList.push(stream);
      self.$rootScope.$broadcast('webrtc:streamListChanged');
    });

    self.webrtc.on('videoAdded', function(video, peer) {
      var add = true;
      for (var i = 0; i < self.streamList.length; i ++) {
        var v = self.streamList[i];
        if (peer.id === v.id) {
          add = false;
          break;
        }
      }
      if (add) {
        peer.isRemote = true;
        self.streamList.push(peer);
        self.$rootScope.$broadcast('webrtc:streamListChanged');
      }
    });

    self.webrtc.on('videoAdded', function(video, peer) {
      var add = true;
      var map = {};
      console.log(arguments);
      for (var i = 0; i < self.streamList.length; i ++) {
        var v = self.streamList[i];
        v.isShown = true;
        map[v.id] = map[v.id] || {};
        map[v.id][v.type] = v;
      }

      peer.isShown = true;
      var dupe = map[peer.id];
      if (dupe) {
        if (dupe['video'] && peer.type === 'screen') {
          dupe['video'].isShown = false; 
        } else if (dupe['video'].type === peer.type) {
          return;
        } else if (dupe['screen'].type === peer.type) {
          return;
        } else {
          peer.isShown = false;
        }
      } 
      peer.isRemote = true;
      self.streamList.push(peer);
      self.$rootScope.$broadcast('webrtc:streamListChanged');
    });


    self.webrtc.on('videoRemoved', function(video) {
      var added = false;
      var map = {};
      for (var i = 0; i < self.streamList.length; i ++) {
        var v = self.streamList[i];
        v.isShown = true;
        map[v.id] = map[v.id] || {};
        map[v.id][v.type] = v;
      }
      var dupe = map[video.id];
      if (dupe) {
        if (dupe['video']) {
          dupe.isShown = true;
        }
      }

      for (var i = 0; i < self.streamList.length; i ++) {
        var v = self.streamList[i];
        if (video.id === v.videoEl.id) {
          v = null;
          self.streamList.splice(i, 1);
          self.$rootScope.$broadcast('webrtc:streamListChanged');
          break;
        }
      }
    });

    self.webrtc.on('channelMessage', function(peer, label, data) {
      if (label === 'text-message' &&
          data.type === 'text/plain') {
          self.$rootScope.$broadcast('webrtc:textMessage', {
            peer: peer,
            message: data.payload.message,
            time: data.payload.time
          });
      }
    });
  }
  
  ngSimpleWebRTC.prototype.sendTextMessage = function(message) {
    var self = this;
    self.webrtc.sendDirectlyToAll("text-message", 
    "text/plain", 
    {
      message: message,
      time: (new Date()).valueOf()
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

  ngSimpleWebRTC.prototype.isLocalVideoEnabled = function() {
    var self = this;
    for (var i = 0; i < self.streamList.length; i ++) {
      var s = self.streamList[i];
      if (s.isRemote == false) {
        return s.getVideoTracks()[0].enabled;
      }
    }
  }

  ngSimpleWebRTC.prototype.pauseVideo = function() {
    var self = this;
    self.webrtc.pauseVideo();
  }

  ngSimpleWebRTC.prototype.resumeVideo = function() {
    var self = this;
    self.webrtc.resumeVideo();
  }

  ngSimpleWebRTC.prototype.mute = function() {
    var self = this;
    self.webrtc.mute();
  }

  ngSimpleWebRTC.prototype.unmute = function() {
    var self = this;
    self.webrtc.unmute();
  }

  ngSimpleWebRTC.prototype.isMuted = function() {
    var self = this;
    for (var i = 0; i < self.streamList.length; i ++) {
      var s = self.streamList[i];
      if (s.isRemote == false) {
        var audio = s.getAudioTracks();
        if (audio && audio.length > 0) {
          return !audio[0].enabled;
        }
      }
    }
  }

  ngSimpleWebRTC.prototype.getPeers = function() {
    var self = this;
    return self.webrtc.getPeers();
  }

  ngSimpleWebRTC.prototype.setupPeer = function(peer) {
    var self = this;
    peer.on('fileTransfer', function(metadata, receiver) {
      self.handleFileTransfer(peer, metadata, receiver);
    });
    self.$rootScope.$broadcast('webrtc:peerCreated', peer);
  }

  ngSimpleWebRTC.prototype.handleFileTransfer = function(peer, metadata, receiver) {
    var self = this;

    self.$rootScope.$broadcast('webrtc:fileTransferStarted', {
      peer: peer,
      metadata: metadata,
      receiver: receiver
    });
    receiver.on('progress', function(byteReceived) {
      self.$rootScope.$broadcast('webrtc:fileTransferProgress', {
        peer: peer,
        metadata: metadata,
        byteReceived: byteReceived
      });
    });
    receiver.on('receivedFile', function(file, metadata) {
      self.$rootScope.$broadcast('webrtc:fileTransferDone', {
        peer: peer,
        metadata: metadata,
        file: file
      });
      receiver.channel.close();
    });
  }

  ngSimpleWebRTC.prototype.sendFile = function(peer, file) {
    var self = this;
    
    var sender = peer.sendFile(file);
    sender.on('progress', function(byteSent) {
      self.$rootScope.$broadcast('webrtc:sentFileProgress', {
        peer: peer,
        byteSent: byteSent
      });
    });

    sender.on('sentFile', function(byteSent) {
      self.$rootScope.$broadcast('webrtc:sentFileDone', peer);
    });

    sender.on('complete', function(byteSent) {
      self.$rootScope.$broadcast('webrtc:sentFileReceived', peer);
    });
    return sender;
  }

  ngSimpleWebRTCModule.service('$SimpleWebRTC', ngSimpleWebRTC);
});
