var express = require('express')
  , app = module.exports = express()
  , fs = require('fs')
  , path = require('path')
  , yaml = require('js-yaml')
  , exec = require('child_process').exec


var cwd = process.cwd()
  , metadata_path = path.join(cwd,'_book','metadata.yml')
  , markdown_path = path.join(cwd,'_book','_markdown')
  , site_path = path.join(cwd,'_site');


function listBooks(req, res){
  res.send("");
}



function getBook(req, res){
  var book = {
    meta: {},
    files: []
  };
  book.meta = yaml.safeLoad( fs.readFileSync(metadata_path,'utf8') );
  fs.readdirSync(markdown_path).forEach( function(fname){
    if(fname.match(/.*\.md/)){
       var file = {title: fname};
       file.body = fs.readFileSync(path.join(markdown_path,fname),'utf8');
       book.files.push(file);
    }
  })
  res.send(book);
}



function saveBook(req,res){

  // make sure _book directory exists
  try {
    fs.mkdirSync(path.join(cwd,'_book'))
  } catch (err) {
    if(err.code != 'EEXIST'){
      throw(err);
    }
  }

  // make sure _markdown directory exists
  try {
    fs.mkdirSync(markdown_path)
  } catch (err) {
    if(err.code != 'EEXIST'){
      throw(err);
    }
  }

  //write metadata
  fs.writeFileSync(metadata_path, yaml.safeDump(req.body.meta), 'utf8');

  // delete existing markdown
  fs.readdirSync(markdown_path).forEach( function(fname){
    if(fname.match(/.*\.md/)){
      fs.unlinkSync(path.join(markdown_path, fname))
    }
  })

  // write new markdown
  req.body.files.forEach(function(f){
    fs.writeFileSync(path.join(markdown_path,f.title),f.body,'utf8');
  })

  res.send('OK');
}



function bberCommand(req, res){
    var cmd = req.body.cmd
    if(cmd in {site:1,build:1,publish:1}){
      exec(`bber ${cmd}`, function(err, stdout, stderr) {
        if (err) { throw err }
        if (stderr) { res.send(stderr) }
        if (stdout) { res.send(stdout) }
      });
    } else {
      throw('bad command');
    }

}


app.use('/preview', express.static(site_path))
app.get('/bber/books', listBooks);
app.get('/bber/book',  getBook);
app.post('/bber/book', saveBook);
app.post(`/bber/command`, bberCommand);
