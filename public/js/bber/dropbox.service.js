'use strict';

var Dropbox = require('dropbox');
var clientId = 'ljtx86cpvhwyafo';

module.exports = angular.module('bBer.dropbox',[])
.factory('Dropbox', function($location, $q) {

  return {
    authenticationUrl: getAuthenticationUrl(),
    isAuthenticated:   isAuthenticated,
    listBooks:         listBooks,
    loadBook:          loadBook,
    saveBook:          saveBook
  };


  function getAuthenticationUrl(){
    var dbx =  new Dropbox({clientId: clientId });
    return dbx.getAuthenticationUrl('http://localhost:3000');
  }

  function isAuthenticated(){
    return angular.isDefined(accessToken());
  }

  function accessToken(){
    return  parseQueryString($location.hash()).access_token;
  }

  function getClient(){
    return new Dropbox({ accessToken: accessToken() });
  }


  function saveBook(book){
    var dbx = getClient();
    var book_path = '/' + book.folderName;

    //delete existing markdown, if it exists
    dbx.filesSearch({
      path: book_path + '/_book/_markdown',
      query: '.md',
      mode: 'filename'
     })
    .then( function(resp){
      if(resp.matches.length > 0){
        dbx.filesDelete({ path: book_path + '/_book/_markdown'});
      }
    }, function(resp){
      return true;
    })
    .then(function(){
      angular.forEach(book.asBberFiles(),function(f) {
        dbx.filesUpload({
          path: book_path + '/' + f.path,
          contents: f.contents
        });
      });
    });
  }


  function loadBook(){
    var dbx = getClient();
    listBooks().then(function(resp){
      loadFile(resp[0].metadata.path_lower)
      .then(function(resp){
        console.log(resp);
      });
    });
  }


  function loadFile(path){
    var dbx = getClient();
    return dbx.filesDownload({ path: path }).then(function(resp){
      return $q(function(resolve, reject){
        var reader = new FileReader();
        reader.addEventListener('loadend', function() {
          if(reader.error){
            reject(reader.error);
          } else {
            resolve(reader.result);
          }
        });
        reader.readAsText(resp.fileBlob);
      });
    });
  }


  function listBooks(){
    var dbx = getClient();
    var matches = [];
    function _search(start){
      return dbx.filesSearch({
        path: '',
        query: 'metadata.yml',
        mode: 'filename',
        start: start
      }).then(function(resp){
        matches = matches.concat(resp.matches);
        if(resp.more){
          return _search(resp.start);
        } else {
          return matches;
        }
      });
    }
    return _search(0);
  }


  function  parseQueryString(str) {
    var ret = Object.create(null);
    if (typeof str !== 'string') {
      return ret;
    }
    str = str.trim().replace(/^(\?|#|&)/, '');
    if (!str) {
      return ret;
    }
    str.split('&').forEach(function (param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      var key = parts.shift();
      var val = parts.length > 0 ? parts.join('=') : undefined;
      key = decodeURIComponent(key);
      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);
      if (ret[key] === undefined) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
    });
    return ret;
  }


});
