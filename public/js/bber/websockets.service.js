
'use strict';

module.exports =
  angular
  .module('websockets.service', [
    'bBer.modals.logout'
  ])
  .factory('websocketsService', function ($timeout, $interval, $window, $document, userService, booksService, $modal, $rootScope, diNotify) {

    var ws;

    var service = {
      init: init,
      sendUserData: sendUserData,
      requestNewActiveUser: requestNewActiveUser,
      updateUserPermissions: updateUserPermissions,
      notifyPassiveUser: notifyPassiveUser
    };

    function requestNewActiveUser() {
      var modalScope = angular.extend(
        $rootScope.$new(),
        {
          onConfirm: function() {
            var user = booksService.getCurrentUser();
            ws.send(JSON.stringify({ action: 'registerNewUser', user: user }));
          },
          message: 'The user editing this document has left. Would you like to take over?',
          buttonOk: 'Yes',
          buttonCancel: 'No',
          onReject: function noop() {},
          timer: 0
        }
      );

      $modal.open({
        template: require('raw!./modals/confirm-logout.modal.html'),
        scope: modalScope,
        controller: 'ConfirmLogout',
        windowClass: 'modal--dillinger'
      });
    }

    function updateUserPermissions(data) {
      var permissions = angular.extend({}, { access: 0, status: 0 }, data.permissions);
      booksService.setCurrentUser(userService.profile);
      userService.update(permissions);
    }

    function sendUserData(data) {
      var token = data.token;
      var user = booksService.getCurrentUser();
      ws.send(JSON.stringify({ action: 'bindUserToSocket', token: token, user: user }));
    }

    function notifyPassiveUser() {
      $rootScope.$broadcast('modal.cancel');
      diNotify({
        message: 'Another user already editing this document. You can browse the files but will be unable to make changes until they logout.',
        duration: 4000
      });
    }

    function init(user) {
      booksService.setCurrentUser(userService.profile);

      ws = new WebSocket('ws://localhost:9000');
      ws.onopen = function () {
        ws.onmessage = function(e) {
          var data = JSON.parse(e.data);
          var action = data.action;
          if (service[action] && typeof service[action] === 'function') {
            service[action].call(this, data);
          }
        }

        $window.onbeforeunload = function () {
          ws.onclose = function () {}; // disable onclose handler first
          ws.close();
        };
      }

      verifyActiveUser();
    }


    function verifyActiveUser() {
      var activityTimer = null;
      var activityDebounce = null;
      var debounceSpeed = 500;

      // Dev
      // var maxTimeInactive = 1000;
      // var maxTimeModal = 1000;

      var maxTimeInactive = 1000 * 60 * 15; // 15mn before logout modal appears
      var maxTimeModal = 1000 * 60; // 1mn to wait for response before automatically logging user out

      var modalScope = angular.extend(
        $rootScope.$new(),
        {
          onConfirm: function() {
            service.updateUserPermissions({ permissions: { access: 0, status: 0 } });
            diNotify({
              message: 'You have been logged out. Refresh the page to continue editing.',
              duration: 0
            });
          },
          message: 'You will be logged out in one minute.',
          buttonOk: 'Logout',
          buttonCancel: 'Continue Editing',
          onReject: setTimer,
          timer: maxTimeModal
        }
      );

      // Check to see if there's been any movement on the page
      function checkActivity() {
        $timeout.cancel(activityDebounce);
        activityDebounce = $timeout(function() {
          notifyInactiveUser();
        }, debounceSpeed);
      };

      // The user is inactive, ask them if they want to logout.  After a
      // minute they're logged out automatically.
      function notifyInactiveUser() {
        $timeout.cancel(activityTimer);
        activityTimer = $timeout(function() {
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
