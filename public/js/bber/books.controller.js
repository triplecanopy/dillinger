
'use strict';
module.exports =
  angular
  .module('bBer.controllers.books', [
    'bBer.books',
    'diDocuments.export',
    'diDocuments.controllers',
  ])
  .controller('Books', function($scope, $timeout, $rootScope, $modal, userService, booksService, debounce) {

  var vm = this;

  vm.status = {
    import:     true,
    save:       true,
    linkUnlink: true,
    document:   false
  };

  $scope.profile        = userService.profile;
  $scope.saveDocument   = save;
  $scope.createBook     = createBook;
  $scope.removeBook     = removeBook;
  $scope.selectBook     = selectBook;

  $rootScope.books = booksService.getItems();

  $rootScope.editor.on('change', debounce(doAutoSave, 2000));
  $rootScope.$on('autosave', doAutoSave);

  function save(manuel) {
    var book = booksService.getCurrentBook();
    var item = book.documents.getCurrentDocument();
    item.body = $rootScope.editor.getSession().getValue();
    booksService.setCurrentBook(book);
    return booksService.save(manuel);
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
    modalScope.wordCount = wordsCountService.count();

    $modal.open({
      template: require('raw!../documents/delete-modal.directive.html'),
      scope: modalScope,
      controller: 'DeleteDialog',
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
      return save();
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
