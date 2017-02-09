
'use strict';

module.exports =
  angular
  .module('bBer.modals.logout', ['bBer.books', 'diBase.factories'])
  .controller('ConfirmLogout', function($scope, $modalInstance, $rootScope, $timeout, booksService, documentsService, focus) {

    $scope.ok = function() {
      $timeout(function() {
        $scope.onConfirm();
      }, 500);

      return $modalInstance.close();
    };

    $scope.cancel = function() {
      $scope.onReject();
      return $modalInstance.dismiss('cancel');
    };

    $timeout(function() {
      focus('confirmModalYes');
    }, 100);

    if ($scope.timer) {
      $timeout(function() {
        $scope.ok();
      }, $scope.timer);
    }

    $scope.$on('modal.cancel', function() {
      return $scope.cancel();
    });
});
