/*globals module */
describe('SimpleWebRTC', function() {

  describe('Module', function() {
    'use strict';
    
    var $SimpleWebRTC;
    angular.module('test', ['SimpleWebRTCModule']);

    beforeEach(function() {
      module('test');
      inject(function(_$SimpleWebRTC_) {
        $SimpleWebRTC = _$SimpleWebRTC_;
      });
    });
    it('should be declared', function() {
      expect($SimpleWebRTC).toBeDefined();
    });
  });
});
