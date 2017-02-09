
'use strict';
module.exports =
  angular
  .module('diUser.service', [])
  .factory('userService', function($rootScope, $document) {

  var
    defaults = {

      // id, access, and_status are used by websockets to allow/disallow
      // document editing.
      // access: 0 -> can view
      // access: 1 -> can edit
      //_status: 0 -> passive (hasn't interacted with the document in 5mn)
      //_status: 1 -> active (has interacted with the document in the last 5mn)

      id: Math.round(new Date().getTime() + Math.random(1000)),
      permissions: {
        access: 0,
        status: 0
      },
      enableAutoSave: true,
      enableWordsCount: true,
      enableScrollSync: false,
      enableNightMode: false,
      enableGitHubComment: true
    },
    service = {
      profile: {},
      save: save,
      restore: restore,
      update: update,
    };

  service.restore();

  return service;

  //////////////////////////////

  function save(obj) {
    localStorage.setItem('profileV3', angular.toJson(obj || service.profile));
  }

  function restore() {
    service.profile = angular.fromJson(localStorage.getItem('profileV3')) || defaults;
    return service.profile;
  }

  function update(permissions) {
    service.profile.permissions = angular.extend({}, service.profile.permissions, permissions);
    $rootScope.$emit('user.refresh');
    return service.profile;
  }

});
