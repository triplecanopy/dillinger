
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
    'bBer.controllers.bookDocuments'
  ])
.controller('Base', function($scope, $rootScope, userService, booksService) {
  $scope.profile         = userService.profile;
  $rootScope.currentBook = booksService.getCurrentBook();
  $rootScope.currentDocument = $rootScope.currentBook.documents.getCurrentDocument();
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
    $rootScope.documents = $rootScope.currentBook.documents.getItems();
    updateDocument();
  };

  var updateDocument = function() {
    $rootScope.currentDocument = booksService.getCurrentBook().documents.getCurrentDocument();
    return $rootScope.editor.getSession().setValue($rootScope.currentDocument.body);
  };

  $scope.updateDocument = updateDocument;
  $scope.updateBook = updateBook;

  $rootScope.$on('document.refresh', updateDocument);
  $rootScope.$on('book.refresh', updateBook);
});
