
'use strict';
module.exports =
  angular
  .module('bBer.controllers.books', [
    'bBer.books',
    'diDocuments.export',
    'diDocuments.controllers',
    'bBer.modals.metadata',
    'bBer.modals.delete'
  ])
  .controller('Books', function($scope, $timeout, $rootScope, $modal, userService, booksService, debounce) {

  var vm = this;

  vm.status = {
    import:     true,
    save:       true,
    linkUnlink: true,
    book:       true,
    document:   false,
  };

  $scope.profile        = userService.profile;
  $scope.saveBook       = saveBook;
  $scope.createBook     = createBook;
  $scope.removeBook     = removeBook;
  $scope.selectBook     = selectBook;
  $scope.editBookMetadata = editBookMetadata;

  $rootScope.books = booksService.getItems();

  $rootScope.editor.on('change', debounce(doAutoSave, 2000));
  $rootScope.$on('autosave', doAutoSave);

  function saveBook(manual) {
    var book = booksService.getCurrentBook();
    var item = book.getCurrentDocument();
    item.body = $rootScope.editor.getSession().getValue();
    booksService.setCurrentBook(book);
    return booksService.save(manual);
  }

  function initBook() {
    var item;
    item = booksService.getItemById($rootScope.currentBook.id);
    booksService.setCurrentBook(item);
    return $rootScope.$emit('book.refresh');
  }

  function selectBook(item) {
    item = booksService.getItem(item);
    booksService.setCurrentBook(item);
    return $rootScope.$emit('book.refresh');
  }

  function removeBook(item) {
    var modalScope = $rootScope.$new();
    modalScope.item = item;
    $modal.open({
      template: require('raw!./modals/confirm-delete.modal.html'),
      scope: modalScope,
      controller: 'ConfirmDelete',
      windowClass: 'modal--dillinger'
    });
  }


  function editBookMetadata(item){
    var modalScope = $rootScope.$new();
    modalScope.book = item;
    $modal.open({
      template: require('raw!./modals/book-metadata.modal.html'),
      scope: modalScope,
      controller: 'BookMetadata',
      windowClass: 'modal--dillinger'
    });
  }



  function createBook() {
    var item;
    item = booksService.createItem();
    booksService.addItem(item);
    booksService.setCurrentBook(item);
    return $rootScope.$emit('book.refresh');
  }

  function doAutoSave() {
    if ($scope.profile.enableAutoSave) {
      return saveBook();
    }
    return false;
  }

  $scope.$on('$destroy', function() {
    vm     = null;
    $scope = null;

    return false;
  });

  initBook();

});
