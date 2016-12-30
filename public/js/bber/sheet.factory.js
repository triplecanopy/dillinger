
'use strict';

module.exports =
  angular
  .module('bBer.sheet', [])
  .factory('BookSheet', function() {

  return function(sheetData) {

    angular.extend(this, {
      id: new Date().getTime()+Math.random(1000) ,
      title: 'section.md',
      body: ''
    });

    return angular.extend(this, sheetData);
  };

});
