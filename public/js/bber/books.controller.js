
'use strict';

module.exports =
  angular
  .module('bBer.controllers.books', [
    'bBer.books',
    'diDocuments.export',
    'diDocuments.controllers',
    'bBer.modals.metadata',
    'bBer.modals.delete',
    'bBer.modals.response'
  ])
  .controller('Books', function($scope, $timeout, $rootScope, $modal, userService, booksService, debounce, $sce) {

  var vm = this;
  var ansi_up = require('ansi_up');

  vm.status = {
    import:     true,
    save:       true,
    linkUnlink: true,
    book:       true,
    document:   false,
  };

  $scope.profile            = userService.profile;
  $scope.saveBook           = saveBook;
  $scope.createBook         = createBook;
  $scope.removeBook         = removeBook;
  $scope.selectBook         = selectBook;
  $scope.editBookMetadata   = editBookMetadata;

  $rootScope.books = booksService.getItems();

  $rootScope.editor.on('change', debounce(doAutoSave, 2000));
  $rootScope.$on('autosave', doAutoSave);
  $rootScope.$on('server.response', showServerResponse);

  function saveBook(manual) {
    var book = booksService.getCurrentBook();
    var item = book.getCurrentDocument();
    item.body = $rootScope.editor.getSession().getValue();
    booksService.setCurrentBook(book);
    return booksService.save(manual);
  }

  // function initBook() {
  //   var item;
  //   item = booksService.getItemById($rootScope.currentBook.id);
  //   booksService.setCurrentBook(item);
  //   return $rootScope.$emit('book.refresh');
  // }

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


  function editBookMetadata(item) {
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

  function showServerResponse(e, resp) {
    var modalScope = $rootScope.$new();
    var data = resp.data.split('\n').join('<br>');
    var html = ansi_up.ansi_to_html(data);
    modalScope.response = $sce.trustAsHtml(html);
    $modal.open({
      template: require('raw!./modals/server-response.modal.html'),
      scope: modalScope,
      controller: 'ServerResponse',
      windowClass: 'modal--dillinger'
    });
  }

  $scope.$on('$destroy', function() {
    vm     = null;
    $scope = null;

    return false;
  });


});
