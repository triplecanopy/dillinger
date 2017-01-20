'use strict';

module.exports = angular.module('bBer.localstore', ['bBer.book'])
  .factory('Local', function ($http, $q, $rootScope, Book, BookSheet) {

    return {
      listBooks: listBooks,
      loadBook: loadBook,
      saveBook: saveBook,
      bberCommand: bberCommand
    }

    function listBooks() {}

    function saveBook(book) {
      return $http.post('/bber/book', book).then(function (resp) {
        console.log(resp);
      })
    }

    function loadBook() {
      return $http.get('/bber/book').then(function (resp) {
        if (!angular.isDefined(resp.data.files)) {
          resp.data.files = [];
        }
        // convert files into BookSheet objects
        resp.data.files = resp.data.files.map(function (f) {
          return new BookSheet(f);
        });
        var n = new Book(resp.data);
        console.log(n);
        return n
      })
    }

    function bberCommand(cmd) {
      return $http.post('/bber/command', { cmd: cmd }).then(function (resp) {
        $rootScope.$emit('server.response', resp);
        return resp;
      });
    }
  });
