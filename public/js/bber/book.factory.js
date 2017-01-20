'use strict';

var yaml = require('js-yaml');
require('lodash');

module.exports = angular
.module('bBer.book',  ['bBer.sheet'])
.factory('Book', function(BookSheet, diNotify) {

  return function(bookData) {

    var defaults = {
      id:                      new Date().getTime(),
      title:                  'Book Title',
      folderName:             'book_title',
      author:                  '',
      files:                   [],
      meta:                    {},
      currentDocument:         {},
      getItem:                 getItem,
      getItemByIndex:          getItemByIndex,
      getItemById:             getItemById,
      addItem:                 addItem,
      removeItem:              removeItem,
      createItem:              createItem,
      size:                    size,
      getItems:                getItems,
      removeItems:             removeItems,
      setCurrentDocument:      setCurrentDocument,
      getCurrentDocument:      getCurrentDocument,
      setCurrentDocumentTitle: setCurrentDocumentTitle,
      getCurrentDocumentTitle: getCurrentDocumentTitle,
      setCurrentDocumentBody:  setCurrentDocumentBody,
      getCurrentDocumentBody:  getCurrentDocumentBody,
      setCurrentDocumentSHA:   setCurrentDocumentSHA,
      getCurrentDocumentSHA:   getCurrentDocumentSHA,
      setCurrentCursorValue:   setCurrentCursorValue,
      asBberFiles:             asBberFiles
    };

    //initialize with a single document
    angular.extend(this, defaults);
    this.addItem( this.createItem() );
    angular.extend(this, bookData);

    /**
     *    Get item from the files array.
     *
     *    @param  {Object}  item  The actual item.
     */
    function getItem(item) {
      return this.files[this.files.indexOf(item)];
    }

    /**
     *    Get item from the files array by index.
     *
     *    @param  {Integer}  index  The index number.
     */
    function getItemByIndex(index) {
      return this.files[index];
    }

    /**
     *    Get item from the files array by it's id.
     *
     *    @param  {Integer}  id  The id of the file (which is actually
     *                           Date().getTime())
     */
    function getItemById(id) {
      var tmp = null;

      angular.forEach(this.files, function(file) {
        if (file.id === id) {
          tmp = file;
          return false;
        }
      });

      return tmp;
    }

    /**
     *    Add item to the files array.
     *
     *    @param  {Object}  item  The item to add.
     */
    function addItem(item) {
      return this.files.push(item);
    }

    /**
     *    Remove item from the files array.
     *
     *    @param  {Object}  item  The item to remove.
     */
    function removeItem(item) {
      return this.files.splice(this.files.indexOf(item), 1);
    }

    /**
     *    Creates a new document item.
     *
     *    @param  {Object}  props  Item properties (`title`, `body`, `id`).
     */
    function createItem(props) {
      var pad = _.padStart(String(this.size()+1), 4,'0');
      var title = {title: 'section-' + pad + '.md'};
      return new BookSheet(angular.extend({},props,title));
    }

    /**
     *    Get the files array length.
     */
    function size() {
      return this.files.length;
    }

    /**
     *    Get all files.
     */
    function getItems() {
      return this.files;
    }

    /**
     *    Get all assets.
     */
    function getAssets() {
      return this.assets;
    }

    /**
     *    Remove all items from the files array.
     */
    function removeItems() {
      this.files = [];
      this.currentDocument = {};
      return false;
    }

    /**
     *    Update the current document.
     *
     *    @param  {Object}  item  The document object.
     *                            Must have a `title`, `body` and `id` property
     *                            to work.
     */
    function setCurrentDocument(item) {
      this.currentDocument = item;
      return item;
    }

    /**
     *    Get the current document.
     */
    function getCurrentDocument() {
      if(angular.equals(this.currentDocument, {}) && this.files.length > 0){
        this.currentDocument = this.files[0]
      }
      return this.currentDocument;
    }

    /**
     *    Update the current document title.
     *
     *    @param  {String}  title  The document title.
     */
    function setCurrentDocumentTitle(title) {
      this.currentDocument.title = title;
      return title;
    }

    /**
     *    Update the current document CI trigger setting.
     *
     *    @param  {Boolean}  skipCI  Weather or not to skip CI
     */
    function setCurrentDocumentCI(skipCI) {
      this.currentDocument.skipCI = skipCI;
      return skipCI;
    }
    /**
     *    Update the current document Github Commit Message
     *
     *    @param  {String}  githubCommitMessage  Github Commit Message
     */
    function setCurrentDocumentGithubCommitMessage(message) {
      this.currentDocument.githubCommitMessage = message;
      return message;
    }

    /**
     *    Get the current document title.
     */
    function getCurrentDocumentTitle() {
      return this.currentDocument.title.replace(/(\\|\/)/g, '_');
    }

    /**
     *    Update the current document body.
     *
     *    @param  {String}  body  The document body.
     */
    function setCurrentDocumentBody(body) {
      this.currentDocument.body = body;
      return body;
    }

    /**
     *    Get the current document body.
     */
    function getCurrentDocumentBody() {
      this.setCurrentDocumentBody($rootScope.editor.getSession().getValue());
      return this.currentDocument.body;
    }

    /**
     *    Append current value to cursor location.
     */
    function setCurrentCursorValue(value) {
      var position = $rootScope.editor.getCursorPosition()
      $rootScope.editor.getSession().insert(position, value)
      return value;
    }

    function isBinaryFile(text) {
      var len = text.length;
      var column = 0;
      for (var i = 0; i < len; i++) {
          column = (text.charAt(i) === '\n' ? 0 : column + 1);
          if (column > 500) {
            return true;
          }
      }
      return false;
    }

    /**
     *    Update the current document SHA.
     *
     *    @param  {String}  sha  The document SHA.
     */
    function setCurrentDocumentSHA(sha) {
      this.currentDocument.github.sha = sha;
      return sha;
    }

    /**
     *    Get the current document SHA.
     */
    function getCurrentDocumentSHA() {
      return this.currentDocument.github.sha;
    }


    /**
    *   return book as list of files organized as a bber project
    *
    **/
    function asBberFiles(){
      var _files = [];
      var _meta = [{
          term: 'creator',
          value: this.authors,
          term_property: 'role',
          term_property_value: 'aut'
        },{
          term: 'title',
          value: this.title,
          term_property: 'title-type',
          term_property_value: 'main'
        }];

      _files.push({
        path:'metadata.yml',
        contents: yaml.safeDump(angular.toJson(_meta))
      });

      angular.forEach(this.files, function(f){
        _files.push({
          path: '_book/_markdown/' + f.title,
          contents: f.body
        })
      })
      return _files;
    }


  };
});
