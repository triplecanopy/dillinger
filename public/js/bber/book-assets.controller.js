
/* global angular */

'use strict';

module.exports =
  angular
  .module('bBer.controllers.bookAssets', [
    'bBer.books',
    'ui.sortable'
  ])
  .controller('BookAssets', function($scope, $timeout, $rootScope, booksService, diNotify) {

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
      diNotify({
        message: 'This action will permanently delete "' + item.name + '".',
        confirm: function() {
          booksService.removeAsset(item);
          $rootScope.deleteAsset(item);
        }
      });
    }

    function directiveString(item) {
      var type = item.type.substring(0, item.type.indexOf('/'));
      switch (type) {
        case 'image': return '+ image url "' + item.name + '"\n';
        case 'audio': return '+ audio url "' + item.name + '"\n';
        case 'video': return '+ video url "' + item.name + '"\n';
        default: return '';
      }
    }

    function insertAsset(item) {
      var str = directiveString(item);
      if (str) { $rootScope.editor.insert(str); }
    }

    function selectAsset(item) {}

});
