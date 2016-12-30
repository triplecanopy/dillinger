
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

    getItem:                 getItem,
    getItemByIndex:          getItemByIndex,
    getItemById:             getItemById,
    addItem:                 addItem,
    removeItem:              removeItem,
    createItem:              createItem,
    size:                    size,
    getItems:                getItems,
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
   *    Remove all items frm the files array.
   */
  function removeItems() {
    service.books = [];
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
      setCurrentBook(item);

      // Set the new documents title and body.
      setCurrentBookTitle(file.name);
      setCurrentBookBody(text);

      // Refresh the editor and proview.
      $rootScope.$emit('document.refresh');

      }

    reader.readAsText(file);
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

  function importFile(file, showTip) {

    if (!file) {
      return;
    }

    var reader = new FileReader();

    // If it is text or image or something else
    reader.onloadend = function(event) {

      var data = event.target.result
        , firstFourBitsArray = (new Uint8Array(data)).subarray(0, 4)
        , type = ''
        , header = ''
        ;

      // Snag hex value
      for(var i = 0; i < firstFourBitsArray.length; i++) {
         header += firstFourBitsArray[i].toString(16);
      }

      // Determine image type or unknown
      switch (header) {
        case "89504e47":
          type = "image/png";
          break;
        case "47494638":
          type = "image/gif";
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
          type = "image/jpeg";
          break;
        default:
          type = "unknown";
          break;
      }

      if (showTip) {
        diNotify({ message: 'You can also drag and drop files into dillinger' });
      }

      if(type === 'unknown') {
        return mdFileReader(file)
      }
      else{
        // Do the upload of the image to cloud service
        // and return an URL of the image
        return imageUploader(file)
      }

    }

    // Read as array buffer so we can determine if image
    // from the bits
    reader.readAsArrayBuffer(file)

  }

  /**
   *    Upload a file to a cloud service and return a URL.
   *
   *    @param  {File}  file  The file object
   *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
   *
   */
  function imageUploader(file) {

    var reader = new FileReader()
      , name = file.name
      ;

    reader.onloadend = function() {

      var di = diNotify({
        message: 'Uploading Image to Dropbox...',
        duration: 5000
      });
      return $http.post('save/dropbox/image', {
        image_name: name,
        fileContents: reader.result
      }).success(function(result) {

        if (angular.isDefined(di.$scope)) {
          di.$scope.$close();
        }
        if (result.data.error) {
          return diNotify({
            message: 'An Error occured: ' + result.data.error,
            duration: 5000
          });
        } else {
          var public_url = result.data.url
          // Now take public_url and and wrap in markdown
          var template = '!['+name+']('+public_url+')'
          // Now take the ace editor cursor and make the current
          // value the template
          service.setCurrentCursorValue(template)

          // Track event in GA
          // if (window.ga) {
          //   ga('send', 'event', 'click', 'Upload Image To Dropbox', 'Upload To...')
          // }
          return diNotify({
            message: 'Successfully uploaded image to Dropbox.',
            duration: 4000
          });
        }
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });

    }
    reader.readAsDataURL(file)
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
