'use strict';

var Sender = function Sender() {
  this.handler = {};
  this.channel = {
    close: function() {
    }
  }
}

Sender.prototype.on = function(n, f) {
  var self = this;
  self.handler[n] = f;
}

Sender.prototype.emit = function(n, v1, v2) {
  var self = this;
  self.handler[n].call(this, v1, v2);
}

var Receiver = function Receiver() {
  this.handler = {};
  this.channel = {
    close: function() {
    }
  }
}

Receiver.prototype.on = function(n, f) {
  var self = this;
  self.handler[n] = f;
}

Receiver.prototype.emit = function(n, v1, v2) {
  var self = this;
  self.handler[n].call(this, v1, v2);
}

var Peer = function Peer() {
  this.handler = {};
}

Peer.prototype.on = function(n, f) {
  var self = this;
  self.handler[n] = f;
}

Peer.prototype.emit = function(n, v1, v2) {
  var self = this;
  self.handler[n].call(this, v1, v2);
}

Peer.prototype.sendFile = function(f) {
  return new Sender();
}

var SimpleWebRTCMock = function SimpleWebRTC(options) {
  var self = this;
  self.localStream = null;
  self.localStreamEnabled = true;
  self.localStreamAudioEnabled = true;

  this.S = new OriginalSimpleWebRTC(options);
}

SimpleWebRTCMock.prototype.emit = function(n, e, f) {
  var self = this;
  self.S.emit(n, e, f);
  if (n == "localStream") {
    self.localStream = e;
    self.localStream.getVideoTracks = function() {
      var obj = {
        enabled: self.localStreamEnabled
      }
      return [obj];
    }
    self.localStream.getAudioTracks = function() {
      var obj = {
        enabled: self.localStreamAudioEnabled
      }
      return [obj];
    }
  }
}

SimpleWebRTCMock.prototype.on = function(n, e) {
  var self = this;
  if (n == "createdPeer") {
    new Peer(e);
  }
  self.S.on(n, e);
}

SimpleWebRTCMock.prototype.joinRoom = function(r) {
  var self = this;
  self.S.emit('joinedRoom');
}

SimpleWebRTCMock.prototype.pauseVideo = function(r) {
  var self = this;
  self.localStreamEnabled = false;
}

SimpleWebRTCMock.prototype.resumeVideo = function(r) {
  var self = this;
  self.localStreamEnabled = true;
}

SimpleWebRTCMock.prototype.mute = function(r) {
  var self = this;
  self.localStreamAudioEnabled = false;
}

SimpleWebRTCMock.prototype.unmute = function(r) {
  var self = this;
  self.localStreamAudioEnabled = true;
}

SimpleWebRTCMock.prototype.getPeers = function(r) {
  var x = [];
  for (var i = 0; i < 5; i ++) {
    x.push(new Peer());
  }
  return x;
}

var OriginalSimpleWebRTC = SimpleWebRTC;
SimpleWebRTC = SimpleWebRTCMock;
