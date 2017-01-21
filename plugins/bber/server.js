
'use strict';

var express = require('express')
  , app = module.exports = express()
  , fs = require('fs')
  , mime = require('mime-types')
  , path = require('path')
  , yaml = require('js-yaml')
  , exec = require('child_process').exec;

var cwd = process.cwd()
  , metadata_path = path.join(cwd, '_book', 'metadata.yml')
  , markdown_path = path.join(cwd, '_book', '_markdown')
  , asset_path = path.join(cwd, '_book')
  , site_path = path.join(cwd, '_site')
  , asset_dirs = ['_images' /*, '_fonts', '_javascripts' , '_stylesheets' */];

function listBooks(req, res) {
  res.send('');
}

function getBook(req, res) {
  var book = {
    meta: {},
    files: []
  };
  book.meta = yaml.safeLoad(fs.readFileSync(metadata_path, 'utf8'));
  fs.readdirSync(markdown_path).forEach(function (fname) {
    if (fname.match(/.*\.md/)) {
      var file = { title: fname };
      file.body = fs.readFileSync(path.join(markdown_path, fname), 'utf8');
      book.files.push(file);
    }
  });
  res.send(book);
}

function ensurePathExists(path) {
  try {
    fs.mkdirSync(path);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw (err);
    }
  }
}

function saveBook(req, res) {

  // make sure _book directory exists
  ensurePathExists(path.join(cwd, '_book'));

  // make sure _markdown directory exists
  ensurePathExists(markdown_path);

  //write metadata
  fs.writeFileSync(metadata_path, yaml.safeDump(req.body.meta), 'utf8');

  // delete existing markdown
  fs.readdirSync(markdown_path).forEach(function (fname) {
    ensurePathExists(markdown_path);
    if (fname.match(/.*\.md/)) {
      fs.unlinkSync(path.join(markdown_path, fname));
    }
  });

  // write new markdown
  req.body.files.forEach(function (f) {
    fs.writeFileSync(path.join(markdown_path, f.title), f.body, 'utf8');
  });
  res.send('OK');
}

function bberCommand(req, res) {
  var cmd = req.body.cmd;
  if (cmd in { site: 1, build: 1, publish: 1 }) {
    exec('bber ' + cmd, function (err, stdout, stderr) {
      if (err) { throw err; }
      if (stderr) { res.send(stderr); }
      if (stdout) { res.send(stdout); }
    });
  } else {
    throw ('bad command');
  }
}

function assetify(_path, _dir, _name) {
  var fpath = path.join(_path, _dir, _name);
  var mimetype = mime.lookup(fpath);
  var type = mimetype.substring(0, mimetype.indexOf('/'));
  return {
    id: Math.round(Math.random() * 1000000),
    name: _name,
    path: fpath,
    type: type,
    mimetype: mimetype
  };
}

function addAsset(req, res) {
  var body = req.body,
    buffer = new Buffer(body.content, 'binary'),
    type = body.type,
    name = body.name,
    dir = '';
  switch (type) {
    case 'image':
      dir = '_images';
      break;
    default:
      break;
  }

  fs.writeFile(path.join(asset_path, dir, name), buffer, 'utf8', function(err) {
    if (err) { return res.send(err); }
    var asset = assetify(asset_path, dir, name);
    return res.send(asset);
  });
}

function getAssets(req, res) {
  var assets = [];
  asset_dirs.forEach(function(dir) {
    fs.readdirSync(path.join(asset_path, dir)).forEach(function (name) {
      var asset = assetify(asset_path, dir, name);
      assets.push(asset);
    });
  });
  res.send(assets);
}

function removeAsset(req, res) {
  fs.unlink(req.body.path, function(err) {
    if (err) { throw err; }
    res.send('OK');
  });
}


app.use('/preview', express.static(site_path));
app.use('/_book', express.static(asset_path));
app.get('/bber/books', listBooks);
app.get('/bber/book', getBook);
app.post('/bber/book', saveBook);
app.post('/bber/command', bberCommand);
app.post('/bber/assets', addAsset);
app.get('/bber/assets', getAssets);
app.delete('/bber/assets', removeAsset);
