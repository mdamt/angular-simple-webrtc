/*globals module */
describe('SimpleWebRTC', function() {

  describe('Module', function() {
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
    });


  });
});
