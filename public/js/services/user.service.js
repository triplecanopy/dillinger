
'use strict';
module.exports =
  angular
  .module('diUser.service', [])
  .factory('userService', function($rootScope) {

  var
    defaults = {

      // _id, _permissions, and _status are used by websockets to allow/disallow
      // document editing.
      // _permissions: 0 -> can view
      // _permissions: 1 -> can edit
      // _status: 0 -> passive (hasn't interacted with the document in 5mn)
      // _status: 1 -> active (has interacted with the document in the last 5mn)

      _id: Math.round(new Date().getTime() + Math.random(1000)),
      _status: 0,
      _permissions: 0,
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

  function update(permissions, status) {
    service.profile = angular.extend({}, service.profile, {
      permissions: permissions,
      status: status
    })
    $rootScope.$emit('user.refresh');
    return service.profile;
  }

});
