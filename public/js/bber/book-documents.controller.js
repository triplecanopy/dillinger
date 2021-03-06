
'use strict';
module.exports =
  angular
  .module('bBer.controllers.bookDocuments', [
    'bBer.books',
    'diDocuments.export',
    'diDocuments.controllers',
    'ui.sortable'
  ])
  .controller('BookDocuments', function($scope, $timeout, $rootScope, $modal, userService, booksService) {

    // var vm = this;
    //
    // vm.status = {
    //   import:     true,
    //   save:       true,
    //   linkUnlink: true,
    //   document:   false
    // };

    $scope.saveDocument   = save;
    $scope.createDocument = createDocument;
    $scope.removeDocument = removeDocument;
    $scope.selectDocument = selectDocument;
    $rootScope.documents  = [];

    // $rootScope.editor.on('change', debounce(doAutoSave, 2000));
    // $rootScope.$on('autosave', doAutoSave);
    //
    // function initDocument() {
    //   var book = booksService.getCurrentBook();
    //   var item = book.getItemById($rootScope.currentDocument.id);
    //   book.setCurrentDocument(item);
    //   return $rootScope.$emit('document.refresh');
    // }


    function save(manuel) {
      if ($rootScope.blockUI) { return; }
      var book = booksService.getCurrentBook();
      var item = book.getCurrentDocument();
      item.body = $rootScope.editor.getSession().getValue();
      book.setCurrentDocument(item);
      return booksService.save(manuel);
    }

    function selectDocument(item) {
      var book = booksService.getCurrentBook();
      var item = book.getItem(item);
      book.setCurrentDocument(item);
      return $rootScope.$emit('document.refresh');
    }

    function removeDocument(item) {
      if ($rootScope.blockUI) { return; }
      var modalScope = $rootScope.$new();
      modalScope.item = item;
      // modalScope.wordCount = wordsCountService.count();

      $modal.open({
        template: require('raw!./modals/confirm-delete.modal.html'),
        scope: modalScope,
        controller: 'ConfirmDelete',
        windowClass: 'modal--dillinger'
      });
    }

    function createDocument(props) {
      if ($rootScope.blockUI) { return; }
      var settings = angular.extend({}, props);
      var book = booksService.getCurrentBook();
      var item = book.createItem(settings);
      book.addItem(item);
      book.setCurrentDocument(item);
      return $rootScope.$emit('document.refresh');
    }

    $rootScope.$on('document.insert', function(e, data) {
      createDocument(data);
    });

});
