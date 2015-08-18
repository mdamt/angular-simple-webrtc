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

  it('should populate videoList with local stream', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('localStream', s);
    expect($SimpleWebRTC.videoList.length).toBe(1);
    expect($SimpleWebRTC.videoList[0].isRemote).toBe(false);
  });

  it('should populate videoList with remote streams', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('videoAdded', s);
    expect($SimpleWebRTC.videoList.length).toBe(1);
    expect($SimpleWebRTC.videoList[0].isRemote).toBe(true);
  });

  it('should populate videoList with remote streams and handles duplicates', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    s.id = 123;
    $SimpleWebRTC.webrtc.emit('videoAdded', s);
    $SimpleWebRTC.webrtc.emit('videoAdded', s);
    expect($SimpleWebRTC.videoList.length).toBe(1);
    expect($SimpleWebRTC.videoList[0].isRemote).toBe(true);
  });

  it('should remove an entry from videoList', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    s.id = 123;
    $SimpleWebRTC.webrtc.emit('videoAdded', s);
    var s = new Blob(); 
    s.id = 234;
    $SimpleWebRTC.webrtc.emit('videoAdded', s);
    var s = new Blob(); 
    s.id = 456;
    $SimpleWebRTC.webrtc.emit('videoAdded', s);
    expect($SimpleWebRTC.videoList.length).toBe(3);
    var s = new Blob(); 
    s.id = 234;
    $SimpleWebRTC.webrtc.emit('videoRemoved', s);
    expect($SimpleWebRTC.videoList.length).toBe(2);
    expect($SimpleWebRTC.videoList[0].id).toBe(123);
    expect($SimpleWebRTC.videoList[1].id).toBe(456);
  });




});
