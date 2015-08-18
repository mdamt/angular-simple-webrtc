/*globals module */
describe('SimpleWebRTC', function() {
  'use strict';

  var $SimpleWebRTC, $rootScope;
  angular.module('test', ['SimpleWebRTCModule']);

  beforeEach(function() {
    module('test');
    inject(function(_$SimpleWebRTC_, _$rootScope_) {
      $SimpleWebRTC = _$SimpleWebRTC_;
      $rootScope = _$rootScope_;
    });
  });
  it('should be declared', function() {
    expect($SimpleWebRTC).toBeDefined();
  });

  it('should init webrtc object', function() {
    $SimpleWebRTC.init({});
    expect($SimpleWebRTC.isInitialized()).toBe(true);
  });

  it('should fire joinedRoom', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    $rootScope.$on('webrtc:joinedRoom', function(f) {
      expect(f.name).toBe('webrtc:joinedRoom');
    });
    $SimpleWebRTC.init({ roomName: 'room'});
    $SimpleWebRTC.webrtc.emit('readyToCall');
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect($SimpleWebRTC.joinedRoom).toBe('room');
  });

  it('should fire joinedRoom', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    $rootScope.$on('webrtc:joinedRoom', function(f) {
      expect(f.name).toBe('webrtc:joinedRoom');
    });
    $SimpleWebRTC.init({});
    $SimpleWebRTC.webrtc.emit('readyToCall');
    $SimpleWebRTC.joinRoom('room');
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect($SimpleWebRTC.joinedRoom).toBe('room');
  });

  it('should populate streamList with local stream', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('localStream', s);
    expect($SimpleWebRTC.streamList.length).toBe(1);
    expect($SimpleWebRTC.streamList[0].isRemote).toBe(false);
    expect($rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should populate streamList with remote streams', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    $SimpleWebRTC.init({roomName: 'room'});
    var s = {};
    $SimpleWebRTC.webrtc.emit('videoAdded', {}, s);
    expect($SimpleWebRTC.streamList.length).toBe(1);
    expect($SimpleWebRTC.streamList[0].isRemote).toBe(true);
    expect($rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should populate streamList with remote streams and handles duplicates', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    $SimpleWebRTC.init({roomName: 'room'});
    var s = {};
    s.id = 123;
    s.videoEl = { id: s.id };
    $SimpleWebRTC.webrtc.emit('videoAdded', {}, s);
    $SimpleWebRTC.webrtc.emit('videoAdded', {}, s);
    expect($SimpleWebRTC.streamList.length).toBe(1);
    expect($SimpleWebRTC.streamList[0].isRemote).toBe(true);
    expect($rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should remove an entry from streamList', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    s.id = 123;
    s.videoEl = { id: s.id };
    $SimpleWebRTC.webrtc.emit('videoAdded', {}, s);
    var s = new Blob(); 
    s.id = 234;
    s.videoEl = { id: s.id };
    $SimpleWebRTC.webrtc.emit('videoAdded', {}, s);
    var s = new Blob(); 
    s.id = 456;
    s.videoEl = { id: s.id };
    $SimpleWebRTC.webrtc.emit('videoAdded', {}, s);
    expect($SimpleWebRTC.streamList.length).toBe(3);
    var s = new Blob(); 
    s.id = 234;
    $SimpleWebRTC.webrtc.emit('videoRemoved', s);
    expect($SimpleWebRTC.streamList.length).toBe(2);
    expect($SimpleWebRTC.streamList[0].id).toBe(123);
    expect($SimpleWebRTC.streamList[1].id).toBe(456);
    expect($rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should be able to pause a video stream', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('localStream', s);
    expect($SimpleWebRTC.isLocalVideoEnabled()).toBe(true);
    $SimpleWebRTC.pauseVideo();
    expect($SimpleWebRTC.isLocalVideoEnabled()).toBe(false);
  });

  it('should be able to pause and then resume a video stream', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('localStream', s);
    expect($SimpleWebRTC.isLocalVideoEnabled()).toBe(true);
    $SimpleWebRTC.pauseVideo();
    expect($SimpleWebRTC.isLocalVideoEnabled()).toBe(false);
    $SimpleWebRTC.resumeVideo();
    expect($SimpleWebRTC.isLocalVideoEnabled()).toBe(true);
  });




});
