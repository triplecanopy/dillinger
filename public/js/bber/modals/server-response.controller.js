
'use strict';

module.exports =
  angular
  .module('bBer.modals.response', [])
  .controller('ServerResponse', function($scope, $modalInstance) {

  var response = $scope.response;

  $scope.close = function() {
    return $modalInstance.close();
  };

});
