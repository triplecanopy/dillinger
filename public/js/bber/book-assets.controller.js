
/* global angular */

'use strict';

module.exports =
  angular
  .module('bBer.controllers.bookAssets', [
    'bBer.books',
    'bBer.modals.delete'
  ])
  .controller('BookAssets', function($scope, $timeout, $rootScope, $modal, booksService) {

    $scope.toggleSelect = toggleSelect;
    $scope.createAsset = createAsset;
    $scope.removeAsset = removeAsset;
    $scope.insertAsset = insertAsset;
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
      if ($rootScope.blockUI) { return; }
      var modalScope = $rootScope.$new();
      modalScope.item = item;
      $modal.open({
        template: require('raw!./modals/confirm-delete.modal.html'),
        scope: modalScope,
        controller: 'ConfirmDelete',
        windowClass: 'modal--dillinger'
      });
    }

    function directiveString(item) {
      switch (item.type) {
        case 'image': return '+ image url "' + item.name + '"\n';
        case 'audio': return '+ audio url "' + item.name + '"\n';
        case 'video': return '+ video url "' + item.name + '"\n';
        default: return '';
      }
    }

    function insertAsset(item) {
      if ($rootScope.blockUI) { return; }
      var str = directiveString(item);
      if (str) { $rootScope.editor.insert(str); }
    }

    function selectAsset(item) {}

});
