'use strict';

module.exports = angular
.module('bBer.book',  ['diDocuments.sheet'])
.factory('Book', function(Sheet, diNotify) {

  return function(bookData) {

    var defaults = {
      id:                      new Date().getTime(),
      title:                  'Book Title',
      author:                  '',
      files:                   [],
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
    }

    //initialize
    angular.extend(this, defaults);
    var item = this.createItem();
    this.addItem(item);
    this.setCurrentDocument(item);

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
      return new Sheet(props);
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
     *    Remove all items frm the files array.
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
     *    Import a md file into dillinger.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */
    function mdFileReader(file){
      var reader = new FileReader()
      reader.onload = function(event) {
        var text = event.target.result
        if (isBinaryFile(text)) {
          return diNotify({
            message: 'Importing binary files will cause dillinger to become unresponsive',
            duration: 4000
          })
        }
        // Create a new document.
        var item = createItem();
        addItem(item);
        setCurrentDocument(item);
        // Set the new documents title and body.
        setCurrentDocumentTitle(file.name);
        setCurrentDocumentBody(text);
        // Refresh the editor and proview.
        $rootScope.$emit('document.refresh');
      }
      reader.readAsText(file);
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


    return angular.extend(this, bookData);
  };
});
