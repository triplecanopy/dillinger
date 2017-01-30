
'use strict'

var logger = require('morgan')
  , favicon = require('serve-favicon')
  , compress = require('compression')
  , bodyParser = require('body-parser')
  , express = require('express')
  , errorHandler = require('errorhandler')
  , path = require('path')
  , fs = require('fs')
  , app = express()
  , bber = require('./plugins/bber/server.js')
  , env = process.env.NODE_ENV || 'development'
  , port = 8080

  // websocket vars
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 9000 })


module.exports = (function(){
  app.set('bind-address', 'localhost')
  app.set('port', port)

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

  app.get('/', function(req,res) { res.render('index') })

  app.use(bber)

  // websockets
  wss.broadcast = function(data) {
    for (var i in this.clients) {
      this.clients[i].send(data);
    }
  }

  wss.on('connection', function connection(ws) {
    var resp = {
      action: 'post',
      permissions: {
        access: 1,
        status: 1
      }
    };
    if (wss.clients.length === 1) {
      resp.permissions.access = 1;
      resp.permissions.status = 1;
      wss.clients[0].send(JSON.stringify(resp))
    } else {
      wss.clients.forEach(function each(client) {
        resp.permissions.access = 0;
        resp.permissions.status = 1;
        if (client === ws) {
          ws.send(JSON.stringify(resp))
        }
      })
    }

    ws.on('close', function message(data) {
      wss.broadcast('Connection closed: ' + wss.clients.length + ' user(s) online.')
    })

    ws.on('message', function message(data) {
      wss.clients.forEach(function each(client) {
        if (client !== ws) {
          client.send(data)
        }
      })
    })
  })


  // export
  return app

})();
