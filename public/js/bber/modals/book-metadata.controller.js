
'use strict';

module.exports =
  angular
  .module('bBer.modals.metadata', [])
  .controller('BookMetadata', function($scope, $modalInstance) {
  
  $scope.cancel = function() {
    return $modalInstance.dismiss('cancel');
  };


});
