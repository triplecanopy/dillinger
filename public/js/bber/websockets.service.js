
'use strict';
module.exports =
  angular
  .module('websockets.service', [])
  .factory('websocketsService', function ($timeout, $interval, $window, $document, userService, booksService, $modal, $rootScope) {

    var service = {
      init: init,
      post: add,
      patch: update,
      delete: remove
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

    function add(permissions) {
      booksService.setCurrentUser(userService.profile);
      userService.update(permissions, 1);
    }

    function update(permissions, status) {
      booksService.setCurrentUser(userService.profile);
      userService.update(permissions, status);
    }

    function remove(permissions) {}

    function setInactivityTimer() {
      var activityTimer = null
      var activityDebounce = null
      var activityCallback = function() {
        $timeout.cancel(activityDebounce)
        activityDebounce = $timeout(function() {
          checkActivity();
        }, 1);
      };
      function checkActivity() {
        console.log('setting ...')
        $timeout.cancel(activityTimer);
        activityTimer = $timeout(function() {
          var modalScope = $rootScope.$new();
          modalScope.onConfirm = function() { service.patch(0, 0); };
          modalScope.onReject = setTimer;
          $document.off('mousemove keydown', activityCallback);
          $modal.open({
            template: require('raw!./modals/confirm-logout.modal.html'),
            scope: modalScope,
            controller: 'ConfirmLogout',
            windowClass: 'modal--dillinger'
          });
        }, 200);
      }

      function setTimer() {
        $document.on('mousemove keydown', activityCallback);
        $document.trigger('mousemove');
      }

      setTimer();
    }

    return service;

  });
