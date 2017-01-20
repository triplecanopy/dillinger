
'use strict';

module.exports =
  angular
  .module('bBer.modals.response', [])
  .controller('ServerResponse', function($scope, $modalInstance) {

  $scope.canExecCmd = function() {
    return 'execCommand' in document;
  };

  $scope.close = function() {
    return $modalInstance.close();
  };

  $scope.copy = function() {
    var range = document.createRange();
    var elem = document.querySelector('.server-response');
    window.getSelection().removeAllRanges();
    range.setStartBefore(elem.firstChild);
    range.setEndAfter(elem.lastChild);
    window.getSelection().addRange(range);
    document.execCommand('copy');
  };

});
