
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
    'diBase.directives.preview',
    'bBer.controllers.books',
    'bBer.controllers.bookDocuments',
    'bBer.dropbox'
  ])
.controller('Base', function($scope, $rootScope, userService, booksService, Dropbox) {
  $rootScope.testDropbox = function(){
    //Dropbox.listBooks().then(function(resp){console.log(resp);});
    Dropbox.loadBook()
  }
  $rootScope.authenticationUrl = Dropbox.authenticationUrl;
  $scope.profile         = userService.profile;
  $rootScope.currentBook = booksService.getCurrentBook();
  $rootScope.currentDocument = $rootScope.currentBook.getCurrentDocument();
  $rootScope.editor      = ace.edit('editor');

  $rootScope.editor.getSession().setMode('ace/mode/markdown');
  $rootScope.editor.setTheme('ace/theme/dillinger');
  $rootScope.editor.getSession().setUseWrapMode(true);
  $rootScope.editor.setShowPrintMargin(false);
  $rootScope.editor.getSession().setValue($rootScope.currentDocument.body);
  $rootScope.editor.setOption('minLines', 50);
  $rootScope.editor.setOption('maxLines', 90000);


  var updateBook = function() {
    $rootScope.currentBook = booksService.getCurrentBook();
    console.log($rootScope.currentBook);
    $rootScope.documents = $rootScope.currentBook.getItems();
    updateDocument();
  };

  var updateDocument = function() {
    $rootScope.currentDocument = booksService.getCurrentBook().getCurrentDocument();
    return $rootScope.editor.getSession().setValue($rootScope.currentDocument.body);
  };

  $scope.updateDocument = updateDocument;
  $scope.updateBook = updateBook;

  $rootScope.$on('document.refresh', updateDocument);
  $rootScope.$on('book.refresh', updateBook);
});
