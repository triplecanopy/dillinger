
/* global angular */

'use strict';

module.exports = angular.module('bBer.localstore', ['bBer.book'])
  .factory('Local', function ($http, $q, $rootScope, Book, BookSheet) {

    return {
      listBooks: listBooks,
      loadBook: loadBook,
      loadAssets: loadAssets,
      deleteAsset: deleteAsset,
      saveBook: saveBook,
      bberCommand: bberCommand
    };

    function listBooks() {}

    function saveBook(book) {
      if ($rootScope.blockUI) { return; }
      return $http.post('/bber/book', book).then(function (resp) {
        console.log(resp);
      });
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
        return n;
      });
    }

    function loadAssets() {
      return $http.get('/bber/assets').then(function (resp) {
        return resp.data;
      });
    }

    function deleteAsset(item) {
      return $http({
        method: 'DELETE',
        url: '/bber/assets',
        data: item,
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      }).then(function(resp) {
        return resp;
      });
    }

    function bberCommand(cmd) {
      if ($rootScope.blockUI) { return; }
      return $http.post('/bber/command', { cmd: cmd }).then(function (resp) {
        $rootScope.$emit('server.response', resp);
        return resp;
      });
    }
  });
