
'use strict';

module.exports =
  angular
  .module('bBer.modals.delete', ['bBer.books', 'diBase.factories'])
  .controller('ConfirmDelete', function($scope, $modalInstance, $rootScope, $timeout, booksService, documentsService, focus) {

    var item = $scope.item;
    var type = item.type;

    $scope.ok = function() {
      $timeout(function() {
        switch (type) {
          case ('image'):
          case ('font'):
          case ('audio'):
          case ('video'):
            booksService.removeAsset(item);
            $rootScope.deleteAsset(item);
            break;
          case ('md'):
            documentsService.removeItem(item);
            var next = documentsService.getItemByIndex(0);
            documentsService.setCurrentDocument(next);
            $rootScope.$emit('document.refresh');
            break;
          default:
            console.log('Unknown type, not deleting.');
            break;
        }

        // delete book
        // booksService.removeItem(item);
        // var next = booksService.getItemByIndex(0);
        // booksService.setCurrentBook(next);
        // $rootScope.$emit('book.refresh');

      }, 500);

      return $modalInstance.close();
    };

    $scope.cancel = function() {
      return $modalInstance.dismiss('cancel');
    };

    $timeout(function() {
      focus('deleteModalYes');
    }, 100);

});
