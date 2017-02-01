
'use strict';

module.exports =
  angular
  .module('diFileImport.directives.dnd', [])
  .directive('fileImportDropTarget', function($rootScope, booksService) {

    function createDropTarget(scope, elem) {
      elem.on({
        dragover: function(e) {
          if ($rootScope.blockUI) { return; }
          elem.addClass('dragover');
          e.originalEvent.dataTransfer.dropEffect = 'copy';
          e.preventDefault();
        },
        drop: function(e) {
          if ($rootScope.blockUI) { return; }
          elem.removeClass('dragover');
          e.preventDefault();
          var file = e.originalEvent.dataTransfer.files[0];
          booksService.importFile(file);
        },
        dragleave: function(e) {
          elem.removeClass('dragover');
        }
      });
    }

    var directive = {
      restrict: 'A',
      link: createDropTarget
    };

    return directive;
});
