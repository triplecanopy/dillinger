
/* global angular */

'use strict';

module.exports =
  angular
  .module('bBer.controllers.bookAssets', [
    'bBer.books',
    'ui.sortable'
  ])
  .controller('BookAssets', function($scope, $timeout, $rootScope, booksService, diNotify /* , $modal, userService,  */) {

    $scope.toggleSelect = toggleSelect;
    $scope.createAsset = createAsset;
    $scope.removeAsset = removeAsset;
    $scope.selectAsset = selectAsset;

    function createAsset(e) {
      angular.forEach(e.target.files, function(item) {
        booksService.importFile(item);
      });
    }

    function toggleSelect() {
      angular.element('.file-input__assets').click();
    }

    function removeAsset(item) {
      diNotify({
        message: 'This action will permanently delete "' + item.name + '".',
        duration: 0,
        confirm: function() {
          booksService.removeAsset(item);
          $rootScope.deleteAsset(item);
        }
      });
    }

    function selectAsset(item) {}

});
