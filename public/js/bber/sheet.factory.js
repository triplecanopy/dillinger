
/* global angular */

'use strict';

module.exports =
  angular
  .module('bBer.sheet', [])
  .factory('BookSheet', function() {

    return function(sheetData) {
      angular.extend(this, {
        id: new Date().getTime() + Math.random(1000),
        title: 'section.md',
        body: '',
        type: 'md'
      });

      return angular.extend(this, sheetData);
    };

});
