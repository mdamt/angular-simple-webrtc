'use strict';
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

var OriginalSimpleWebRTC = SimpleWebRTC;
SimpleWebRTC = SimpleWebRTCMock;
