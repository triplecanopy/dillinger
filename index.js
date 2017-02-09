
'use strict';

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
  , wss = new WebSocketServer({ port: 9000 });

var util = require('util');

module.exports = (function(){
  app.set('bind-address', 'localhost');
  app.set('port', port);

  app.set('views', path.join(__dirname,'/views'));
  app.set('view engine', 'ejs');

  // May not need to use favicon if using nginx for serving
  // static assets. Just comment it out below.
  app.use(favicon(path.join(__dirname, 'public/favicon.ico')));

  if (env === 'development') {
    app.use(logger('dev'));
  } else {
    app.use(logger('short'));
  }

  app.use(compress());

  app.use(bodyParser.json({ limit: '512mb' }));
  app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));

  // May not need to use serveStatic if using nginx for serving
  // static assets. Just comment it out below.
  app.use(express.static(path.join(__dirname, '/public')));

  // Setup local variables to be available in the views.
  app.locals.title = 'bber editor';
  app.locals.description = '';
  app.locals.dillinger_version = require('./package.json').version;
  app.locals.keywords = '';
  app.locals.author = '';


  app.locals.node_version = process.version.replace('v', '');
  app.locals.env = process.env.NODE_ENV;

  // At startup time so sync is ok.
  // app.locals.readme = fs.readFileSync(path.resolve(__dirname, './README.md'), 'utf-8')

  if ('development' == env) {
    app.use(errorHandler());
  }

  app.get('/', function(req,res) { res.render('index') });

  app.use(bber);


  // WebSockets

  // track user on the BE
  var activeUser = {};

  // FE callbacks
  var actions = {
    bindUserToSocket: bindUserToSocket,
    registerNewUser: registerNewUser
  };

  function requestUserData(ws, token) {
    ws.send(JSON.stringify({ action: 'sendUserData', token: token }))
  }

  // add an id to the websocket so that we can track it. id is the same as the
  // user's id
  function bindUserToSocket(data) {
    var ws = wss.clients.find(function(client) {
      return Number(client.token) === Number(data.token);
    });

    var index = wss.clients.indexOf(ws);

    if (!ws || index < 0) { return; }

    ws.userId = data.user.id;
    wss.clients[index] = ws;

    registerNewUser(data);
  }

  // set either active (can edit) or passive (cannot edit) user
  function registerNewUser(data) {
    var user = data.user;
    if (activeUser.id) {
      setInactiveUser(user);
    } else {
      setActiveUser(user);
    }
  }

  // yay
  function setActiveUser(user) {
    activeUser = user;
    updateUserPermissions({ user: user, access: 1, status: 1 });
    for (var i in wss.clients) {
      if (Number(wss.clients[i].userId) !== Number(user.id)) {
        wss.clients[i].send(JSON.stringify({ action: 'notifyPassiveUser' }))
      }
    }
  }

  // nope
  function setInactiveUser(user) {
    updateUserPermissions({ user: user, access: 0, status: 1 });
  }

  function updateUserPermissions(data) {
    var ws = wss.clients.find(function(client) {
      return Number(client.userId) === Number(data.user.id);
    });

    var index = wss.clients.indexOf(ws);
    if (!ws || index < 0) { return; }

    ws.send(JSON.stringify({
      action: 'updateUserPermissions',
      permissions: { access: data.access, status: data.status }
    }));
  }

  // when the editor leaves we reset the activeUser object
  function unsetActiveUser() {
    activeUser = {};
  }

  // notify passive users that they can take over if they like
  function requestNewActiveUser() {
    for (var i in wss.clients) {
      wss.clients[i].send(JSON.stringify({ action: 'requestNewActiveUser' }));
    }
  }

  // rudimentary handshake to set sync the user's id with an id that will be
  // set on the websocket
  wss.on('connection', function connection(ws) {
    var token = Math.round(new Date().getTime() + Math.random(1000));
    var index = wss.clients.length - 1;

    ws.token = token;
    wss.clients[index] = ws;

    // get the user id and add it to the ws
    requestUserData(ws, token);

    ws.on('message', function message(resp) {
      var data = JSON.parse(resp);
      // should add some sort of auth eventually, basically just calls BE method rn
      if (data.action && {}.hasOwnProperty.call(actions, data.action)) {
        actions[data.action].call(this, data)
      }
    });

    // tchüss!
    ws.on('close', function() {
      // unset BE user and ask passive users if they want to take over
      if (activeUser.id === this.userId) {
        unsetActiveUser();
        requestNewActiveUser();
      }
    });

    // let a user know that they can't edit if there's already an active user
    if (wss.clients.length > 1 && activeUser.id) {
      ws.send(JSON.stringify({ action: 'notifyPassiveUser' }))
    }
  });


  // export
  return app

})();
