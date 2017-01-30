
'use strict';
module.exports =
  angular
  .module('websockets.service', [
    'bBer.modals.logout'
  ])
  .factory('websocketsService', function ($timeout, $interval, $window, $document, userService, booksService, $modal, $rootScope, diNotify) {

    var defaults = { access: 0, status: 0 };

    var service = {
      init: init,
      post: _post,
      patch: _patch,
      delete: _delete
    };

    function init(user) {
      var ws = new WebSocket('ws://localhost:9000');
      ws.onopen = function () {
        ws.send('New user arrived');
        ws.onmessage = function (e) {
          var data = JSON.parse(e.data);
          service[data.action].call(this, data.permissions);
        };
      }
      $window.onbeforeunload = function () {
        ws.onclose = function () {}; // disable onclose handler first
        ws.send('User left');
        ws.close()
      };
      setInactivityTimer();
    }


    function _post(permissions) {
      booksService.setCurrentUser(userService.profile);
      userService.update(permissions);
    }

    function _patch(options) {
      var permissions = angular.extend({}, defaults, options);
      booksService.setCurrentUser(userService.profile);
      userService.update(permissions);
    }

    function _delete(user) {}

    function setInactivityTimer() {
      var activityTimer = null;
      var activityDebounce = null;
      var debounceSpeed = 1000;
      // var maxTimeInactive = 1000;
      // var maxTimeModal = 1000;
      var maxTimeInactive = 1000 * 60 * 5; // time before modal appears
      var maxTimeModal = 1000 * 60; // time before automatically logging user out

      var modalScope = $rootScope.$new();

      modalScope.onConfirm = function() {
        service.patch({ access: 0, status: 0 });
        diNotify({
          message: 'You have been logged out. Refresh the page to continue editing.',
          duration: 0
        });
      };
      modalScope.onReject = setTimer;
      modalScope.timer = maxTimeModal;

      // Check to see if there's been any movement on the page
      function checkActivity() {
        $timeout.cancel(activityDebounce);
        activityDebounce = $timeout(function() {
          console.log('user active');
          notifyInactiveUser();
        }, debounceSpeed);
      };

      // The user is inactive, ask them if they want to logout.  After a
      // minute they're logged out automatically.
      function notifyInactiveUser() {
        console.log('is inactive ...')
        $timeout.cancel(activityTimer);
        activityTimer = $timeout(function() {
          console.log('max time reached')
          $document.off('mousemove keydown', checkActivity);
          $modal.open({
            template: require('raw!./modals/confirm-logout.modal.html'),
            scope: modalScope,
            controller: 'ConfirmLogout',
            windowClass: 'modal--dillinger'
          });
        }, maxTimeInactive);
      }

      function setTimer() {
        $document.on('mousemove keydown', checkActivity);
        $document.trigger('mousemove');
      };

      setTimer();
    }

    return service;

  });
