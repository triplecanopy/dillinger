'use strict'
var editor = require('./index');

// editor is the express app
editor.listen(editor.settings.port, function(){
  console.log('listening on port' + editor.settings.port)
})
