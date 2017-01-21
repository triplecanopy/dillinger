
'use strict';

module.exports =
  angular
  .module('diBase.directives.inputOnchange', [])
  .directive('inputOnchange', function() {

    var directive = {
      restrict: 'A',
      link: function(scope, el, attrs) {
        var onChangeHandler = scope.$eval(attrs.inputOnchange);
        el.bind('change', onChangeHandler);
      }
    };

    return directive;
});
