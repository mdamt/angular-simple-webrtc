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

  it('should be able to pause an audio stream', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('localStream', s);
    expect($SimpleWebRTC.isMuted()).toBe(false);
    $SimpleWebRTC.mute();
    expect($SimpleWebRTC.isMuted()).toBe(true);
  });

  it('should be able to pause and then resume an audio stream', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Blob(); 
    $SimpleWebRTC.webrtc.emit('localStream', s);
    expect($SimpleWebRTC.isMuted()).toBe(false);
    $SimpleWebRTC.mute();
    expect($SimpleWebRTC.isMuted()).toBe(true);
    $SimpleWebRTC.unmute();
    expect($SimpleWebRTC.isMuted()).toBe(false);
  });

  it('should be able to receive files', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    var e = 0;
    var progress;
    $rootScope.$on('webrtc:peerCreated', function(f) {
      expect(f.name).toBe('webrtc:peerCreated');
      e ++;
    });

    $rootScope.$on('webrtc:fileTransferStarted', function(f, v) {
      expect(f.name).toBe('webrtc:fileTransferStarted');
      expect(v.metadata.name).toBe(metadata.name);
      expect(v.metadata.size).toBe(metadata.size);
      e ++;
    });

    $rootScope.$on('webrtc:fileTransferProgress', function(f, v) {
      expect(f.name).toBe('webrtc:fileTransferProgress');
      expect(progress).toBe(v.byteReceived);
      expect(v.metadata.name).toBe(metadata.name);
      expect(v.metadata.size).toBe(metadata.size);
      e ++;
    });

    $rootScope.$on('webrtc:fileTransferDone', function(f, v) {
      expect(f.name).toBe('webrtc:fileTransferDone');
      expect(v.metadata.name).toBe(metadata.name);
      expect(v.metadata.size).toBe(metadata.size);
      e ++;
    });

    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Peer(); 
    var metadata = {
      name: 'abc',
      size: 512
    };
    var receiver = new Receiver();
    $SimpleWebRTC.webrtc.emit('createdPeer', s);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(1);
    s.emit('fileTransfer', metadata, receiver);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(2);
    progress = 10;
    receiver.emit('progress', progress);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(3);
    progress = 30;
    receiver.emit('progress', progress);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(4);
    progress = 512;
    var file = new Blob();
    receiver.emit('receivedFile', file, metadata);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(5);
  });

  it('should be able to get peers', function() {
    $SimpleWebRTC.init({roomName: 'room'});
    var peerList = $SimpleWebRTC.getPeers();
    expect(peerList.length).toBe(5);
  });

  it('should be able to send files', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    var e = 0;
    var progress;

    $rootScope.$on('webrtc:sentFileProgress', function(f, v) {
      expect(f.name).toBe('webrtc:sentFileProgress');
      expect(progress).toBe(v.byteSent);
      e ++;
    });

    $rootScope.$on('webrtc:sentFileDone', function(f, v) {
      expect(f.name).toBe('webrtc:sentFileDone');
      e ++;
    });

    $rootScope.$on('webrtc:sentFileReceived', function(f, v) {
      expect(f.name).toBe('webrtc:sentFileReceived');
      e ++;
    });

    $SimpleWebRTC.init({roomName: 'room'});
    var s = new Peer(); 
    var file = {
      name: 'abc',
      size: 512
    };

    var sender = $SimpleWebRTC.sendFile(s, file);
    progress = 10;
    sender.emit('progress', progress);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(1);
    progress = 30;
    sender.emit('progress', progress);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(2);
    sender.emit('sentFile', progress);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(3);
    sender.emit('complete', progress);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(4);
  });

  it('should be able to send text message', function() {
    spyOn($rootScope, '$broadcast').and.callThrough();
    var e = 0;
    var progress;

    $rootScope.$on('webrtc:textMessage', function(f, v) {
      expect(f.name).toBe('webrtc:textMessage');
      expect(message).toBe(v.message);
      expect(time).toBe(v.time);
      e ++;
    });

    var message = 'omama';
    $SimpleWebRTC.init({roomName: 'room'});
    var time = (new Date()).valueOf();
    $SimpleWebRTC.sendTextMessage(message);
    expect($rootScope.$broadcast).toHaveBeenCalled();
    expect(e).toBe(1);
  });




});
