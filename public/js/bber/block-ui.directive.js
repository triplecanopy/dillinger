
'use strict';

module.exports =
  angular
  .module('bBer.directives.blockUI', [])
  .directive('blockUi', function ($rootScope) {
    function preventDefault(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
    var directive = {
      link: function (scope, el, attrs) {
        el.on('keydown keyup keypress', function(e) {
          if (attrs.blockUi !== 'true') {
            return false;
          }
        });
      }
    };

    return directive;
  });
