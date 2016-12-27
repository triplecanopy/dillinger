'use strict';

module.exports = angular
.module('bBer.book', ['bBer.documents'])
.factory('Book', function(BookDocuments) {
  return function(bookData) {
    angular.extend(this, {
      id: new Date().getTime(),
      title: 'Book Title',
      author: '',
      documents: BookDocuments()
    });
    return angular.extend(this, bookData);
  };
});
