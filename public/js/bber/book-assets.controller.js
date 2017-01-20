
/* global angular */

'use strict';

module.exports =
  angular
  .module('bBer.controllers.bookAssets', [
    'bBer.books',
    // 'diDocuments.export',
    // 'diDocuments.controllers',
    'ui.sortable'
  ])
  .controller('BookAssets', function($scope, $timeout, $rootScope, booksService /* , $modal, userService,  */) {

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
      if (confirm('This action will permanently delete' + item.name + '.')) {
        booksService.removeAsset(item);
        $rootScope.deleteAsset(item);
      }
    }

    function selectAsset(item) {}

});
