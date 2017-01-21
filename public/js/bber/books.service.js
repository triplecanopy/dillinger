
'use strict';

/**
 *    Books Service.
 */

module.exports =
  angular
  .module('bBer.books', ['bBer.book'])
  .factory('booksService', function($rootScope, $http, Book, diNotify) {

  var service = {
    currentBook: {},
    books:       [],
    assets:      [],

    getItem:                 getItem,
    getItemByIndex:          getItemByIndex,
    getItemById:             getItemById,
    addItem:                 addItem,
    removeItem:              removeItem,
    createItem:              createItem,
    size:                    size,
    getItems:                getItems,
    getAssets:               getAssets,
    addAsset:                addAsset,
    addAssets:               addAssets,
    removeAsset:             removeAsset,
    removeItems:             removeItems,
    importFile:              importFile,
    setCurrentBook:          setCurrentBook,
    getCurrentBook:          getCurrentBook,
    setCurrentBookTitle:     setCurrentBookTitle,
    getCurrentBookTitle:     getCurrentBookTitle,
    setCurrentBookBody:      setCurrentBookBody,
    getCurrentBookBody:      getCurrentBookBody,
    setCurrentBookSHA:       setCurrentBookSHA,
    getCurrentBookSHA:       getCurrentBookSHA,
    setCurrentCursorValue:   setCurrentCursorValue,
    save:                    save,
  };

  return service;

  //////////////////////////////

  /**
   *    Get item from the files array.
   *
   *    @param  {Object}  item  The actual item.
   */
  function getItem(item) {
    return service.books[service.books.indexOf(item)];
  }

  /**
   *    Get item from the files array by index.
   *
   *    @param  {Integer}  index  The index number.
   */
  function getItemByIndex(index) {
    return service.books[index];
  }

  /**
   *    Get item from the files array by it's id.
   *
   *    @param  {Integer}  id  The id of the file (which is actually
   *                           Date().getTime())
   */
  function getItemById(id) {
    var tmp = null;

    angular.forEach(service.books, function(file) {
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
    return service.books.push(item);
  }

  /**
   *    Remove item from the files array.
   *
   *    @param  {Object}  item  The item to remove.
   */
  function removeItem(item) {
    return service.books.splice(service.books.indexOf(item), 1);
  }

  /**
   *    Remove item from the assets array.
   *
   *    @param  {Object}  item  The item to remove.
   */
  function removeAsset(item) {
    return service.assets.splice(service.assets.indexOf(item), 1);
  }

  /**
   *    Creates a new document item.
   *
   *    @param  {Object}  props  Item properties (`title`, `body`, `id`).
   */
  function createItem(props) {
    return new Book(props);
  }

  /**
   *    Get the files array length.
   */
  function size() {
    return service.books.length;
  }

  /**
   *    Get all files.
   */
  function getItems() {
    return service.books;
  }

  /**
   *    Get all assets.
   */
  function getAssets() {
    return service.assets;
  }

  /**
   *    Create asset list.
   */
  function addAssets(data) {
    service.assets = data;
    return service.assets;
  }

  /**
   *    Add an asset.
   */
  function addAsset(item) {
    return service.assets.push(item);
  }

  /**
   *    Remove all items from the files array.
   */
  function removeItems() {
    service.books = [];
    service.assets = [];
    service.currentBook = {};
    return false;
  }

  /**
   *    Update the current document.
   *
   *    @param  {Object}  item  The document object.
   *                            Must have a `title`, `body` and `id` property
   *                            to work.
   */
  function setCurrentBook(item) {
    service.currentBook = item;
    return item;
  }

  /**
   *    Get the current document.
   */
  function getCurrentBook() {
    return service.currentBook;
  }

  /**
   *    Update the current document title.
   *
   *    @param  {String}  title  The document title.
   */
  function setCurrentBookTitle(title) {
    service.currentBook.title = title;
    return title;
  }

  /**
   *    Update the current document CI trigger setting.
   *
   *    @param  {Boolean}  skipCI  Weather or not to skip CI
   */
  function setCurrentBookCI(skipCI) {
    service.currentBook.skipCI = skipCI;
    return skipCI;
  }
  /**
   *    Update the current document Github Commit Message
   *
   *    @param  {String}  githubCommitMessage  Github Commit Message
   */
  function setCurrentBookGithubCommitMessage(message) {
    service.currentBook.githubCommitMessage = message;
    return message;
  }

  /**
   *    Get the current document title.
   */
  function getCurrentBookTitle() {
    return service.currentBook.title.replace(/(\\|\/)/g, '_');
  }

  /**
   *    Update the current document body.
   *
   *    @param  {String}  body  The document body.
   */
  function setCurrentBookBody(body) {
    service.currentBook.body = body;
    return body;
  }

  /**
   *    Get the current document body.
   */
  function getCurrentBookBody() {
    service.setCurrentBookBody($rootScope.editor.getSession().getValue());
    return service.currentBook.body;
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
   *    Generic file import method. Checks for images and markdown.
   *
   *    @param  {File}  file  The file to import
   *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
   *
   *    @param {Boolean} showTip set to true to show a tip message
   *                      about dragging and dropping files.
   */

  function importFile(file) {
    if (!file) { return; }

    var reader = new FileReader(),
      mimetype = file.type;

    reader.onload = function(e) {
      var text = e.target.result;

      if (mimetype === 'text/markdown' && !isBinaryFile(text)) { // update MD view with new document
        var data = { body: text };
        $rootScope.$emit('document.insert', data);
      }

      fileUploader(file);
    };

    reader.readAsText(file);
  }

  /**
   *    Upload a file to a cloud service and return a URL.
   *
   *    @param  {File}  file  The file object
   *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
   *
   */
  function fileUploader(file) {
    var reader = new FileReader(),
      name = file.name,
      size = file.size,
      type = file.type.substring(0, file.type.indexOf('/')),
      mimetype = file.type;

    reader.onloadend = function() {
      return $http.post('/bber/assets', {
        name: name,
        size: size,
        type: type,
        mimetype: mimetype,
        content: reader.result
      }).success(function(resp) {
        addAsset(resp.data);
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });

      // var di = diNotify({
      //   message: 'Uploading Image to Dropbox...',
      //   duration: 5000
      // });
      // return $http.post('save/dropbox/image', {
      //   image_name: name,
      //   fileContents: reader.result
      // }).success(function(result) {

      //   if (angular.isDefined(di.$scope)) {
      //     di.$scope.$close();
      //   }
      //   if (result.data.error) {
      //     return diNotify({
      //       message: 'An Error occured: ' + result.data.error,
      //       duration: 5000
      //     });
      //   } else {
      //     var public_url = result.data.url;
      //     // Now take public_url and and wrap in markdown
      //     var template = '!['+name+']('+public_url+')';
      //     // Now take the ace editor cursor and make the current
      //     // value the template
      //     service.setCurrentCursorValue(template);

      //     // Track event in GA
      //     // if (window.ga) {
      //     //   ga('send', 'event', 'click', 'Upload Image To Dropbox', 'Upload To...')
      //     // }
      //     return diNotify({
      //       message: 'Successfully uploaded image to Dropbox.',
      //       duration: 4000
      //     });
      //   }
      // }).error(function(err) {
      //   return diNotify({
      //     message: 'An Error occured: ' + err
      //   });
      // });

    };

    reader.readAsBinaryString(file);
  }

  /**
   *    Update the current document SHA.
   *
   *    @param  {String}  sha  The document SHA.
   */
  function setCurrentBookSHA(sha) {
    service.currentBook.github.sha = sha;
    return sha;
  }

  /**
   *    Get the current document SHA.
   */
  function getCurrentBookSHA() {
    return service.currentBook.github.sha;
  }


  function save(manual) {
    // if (!angular.isDefined(manual)) {
    //   manual = false;
    // }
    // if (manual) {
    //   diNotify('Documents Saved.');
    // }
    // console.log('saving all the books');
    // localStorage.setItem('books', angular.toJson(service.books));
    // return localStorage.setItem('currentBook', angular.toJson(service.currentBook));
  }



});
