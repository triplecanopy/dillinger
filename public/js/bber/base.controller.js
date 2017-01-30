
/* global angular */

'use strict';

var ace = require('brace');

require('brace/mode/markdown');
require('../documents/theme-dillinger');

module.exports =
  angular
  .module('bBer', [
    'diBase.controllers.about',
    'diBase.directives.switch',
    'diBase.directives.documentTitle',
    'diBase.directives.menuToggle',
    'diBase.directives.settingsToggle',
    'diBase.directives.previewToggle',
    'diBase.directives.inputOnchange',
    'diBase.directives.preview',
    'bBer.controllers.books',
    'bBer.controllers.bookDocuments',
    'bBer.controllers.bookAssets',
    'bBer.dropbox',
    'bBer.localstore',
  ])
.controller('Base', function($scope, $rootScope, userService, booksService, Local, Book) {
  $scope.profile  = userService.profile;
  $rootScope.editor = ace.edit('editor');
  $rootScope.save = Local.saveBook;
  $rootScope.deleteAsset = Local.deleteAsset;
  $rootScope.bberCommand = Local.bberCommand;


  $rootScope.editor.getSession().setMode('ace/mode/markdown');
  $rootScope.editor.setTheme('ace/theme/dillinger');
  $rootScope.editor.getSession().setUseWrapMode(true);
  $rootScope.editor.setShowPrintMargin(false);
  $rootScope.editor.setOption('minLines', 50);
  $rootScope.editor.setOption('maxLines', 90000);


  var updateBooks = function(){
    $rootScope.books = booksService.getItems();
    return updateBook();
  };

  var updateBook = function() {
    $rootScope.currentBook = booksService.getCurrentBook();
    $rootScope.documents = $rootScope.currentBook.getItems();
    return updateDocument();
  };

  var updateDocument = function() {
    $rootScope.currentBook = booksService.getCurrentBook();
    $rootScope.currentDocument = $rootScope.currentBook.getCurrentDocument();
    return $rootScope.editor.getSession().setValue($rootScope.currentDocument.body);
  };

  var updateAssets = function() {
    $rootScope.assets = booksService.getAssets();
    return $rootScope.assets;
  };

  $scope.updateBooks = updateBooks;
  $scope.updateBook = updateBook;
  $scope.updateDocument = updateDocument;
  $scope.updateAssets = updateAssets;

  $rootScope.$on('books.refresh', updateBooks);
  $rootScope.$on('book.refresh', updateBook);
  $rootScope.$on('document.refresh', updateDocument);
  $rootScope.$on('assets.refresh', updateAssets);


  // initialize a book
  Local.loadBook().then(function(book) {
    // try to load from local server
    booksService.addItem(book);
    booksService.setCurrentBook(book);
    return $rootScope.$emit('books.refresh');
  }, function(err) {
    // otherwise create a blank one
    var book = new Book();
    booksService.addItem(book);
    booksService.setCurrentBook(book);
    return $rootScope.$emit('books.refresh');
  });

  // load book assets
  Local.loadAssets().then(function(data) {
    booksService.addAssets(data);
    return $rootScope.$emit('assets.refresh');
  });

});
