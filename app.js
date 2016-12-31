/**
 * Main Application File for Dillinger.
 */

'use strict'

const logger = require('morgan')
  , favicon = require('serve-favicon')
  , compress = require('compression')
  , bodyParser = require('body-parser')
  , express = require('express')
  , errorHandler = require('errorhandler')
  , path = require('path')
  , fs = require('fs')
  , app = express()
  , bber = require('./plugins/bber/server.js')
  , env = process.env.NODE_ENV || 'development';

app.set('port', process.env.PORT || 8080)
app.set('bind-address', process.env.BIND_ADDRESS || 'localhost')

app.set('views', path.join(__dirname,'/views'))
app.set('view engine', 'ejs')

// May not need to use favicon if using nginx for serving
// static assets. Just comment it out below.
app.use(favicon(path.join(__dirname, 'public/favicon.ico')))

if(env === 'development'){
  app.use(logger('dev'))
}
else{
  app.use(logger('short'))
}

app.use(compress())

app.use(bodyParser.json({limit: '512mb'}));
app.use(bodyParser.urlencoded({limit: '512mb', extended: true}));

// May not need to use serveStatic if using nginx for serving
// static assets. Just comment it out below.
app.use(express.static(path.join(__dirname,'/public')))

// Setup local variables to be available in the views.
app.locals.title = 'bber editor'
app.locals.description = ''
app.locals.dillinger_version = require('./package.json').version
app.locals.keywords = ""
app.locals.author = ""


app.locals.node_version = process.version.replace('v', '')
app.locals.env = process.env.NODE_ENV

// At startup time so sync is ok.
// app.locals.readme = fs.readFileSync(path.resolve(__dirname, './README.md'), 'utf-8')

if ('development' == env) {
  app.use(errorHandler())
}

app.get('/', function(req,res){res.render('index')})

app.use(bber)

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'))
    console.log('\nhttp://' + app.get('bind-address') + ':' + app.get('port') + '\n')
})
