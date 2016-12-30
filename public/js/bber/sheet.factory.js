
'use strict';

module.exports =
  angular
  .module('bBer.sheet', [])
  .factory('BookSheet', function() {

  return function(sheetData) {

    angular.extend(this, {
      id: new Date().getTime(),
      title: 'section.md',
      body: ''
    });

    return angular.extend(this, sheetData);
  };

});
