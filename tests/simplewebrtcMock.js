'use strict';
var SimpleWebRTCMock = function SimpleWebRTC(options) {
  var self = this;

  this.S = new OriginalSimpleWebRTC(options);
}

SimpleWebRTCMock.prototype.emit = function(n, e, f) {
  var self = this;
  self.S.emit(n, e, f);
}

SimpleWebRTCMock.prototype.on = function(n, e) {
  var self = this;
  self.S.on(n, e);
}

SimpleWebRTCMock.prototype.joinRoom = function(r) {
  var self = this;
  self.S.emit('joinedRoom');
}

var OriginalSimpleWebRTC = SimpleWebRTC;
SimpleWebRTC = SimpleWebRTCMock;
