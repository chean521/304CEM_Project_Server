'use strict';

const Express = require('express');
const cors = require('cors');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const parser = require('cookie-parser');
const Result = require('./component/VoteResult');
const TicketValid = require('./component/MakeVotes');
const Admins = require('./component/Admins');
const Connector = require('./component/includes/Connector');
var SessMgr = require('./component/SessionMgr');
var PkgInfo = require('./package.json');

class Server {
  constructor() {
    const ServerHeader =
      '**************************************\n' +
      '* Express API Server - Voting System *\n' +
      '*                                    *\n' +
      '* Project Development Purpose        *\n' +
      '* Not Allowed for modify, copy       *\n' +
      '* source code, only for references.  *\n' +
      '**************************************\n\n' +
      'Author: ' +
      PkgInfo.author +
      '\n' +
      'License: ' +
      PkgInfo.license +
      '\n' +
      'Version: ' +
      PkgInfo.version +
      '\n';
    console.log(ServerHeader);
    this._app = Express();
    this._app.use(Express.json());
    this._app.use(Express.urlencoded({ extended: true }));
    this._app.set('trust proxy', 1);
    this._app.use(parser());

    this._app.use(
      session({
        name: 'connect.sid',
        secret: 'abcde12345EFG!@',
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
          mongooseConnection: Connector.connection,
          autoRemove: 'native'
        }),
        cookie: {
          domain: 'webapi-oscar-client.herokuapp.com',
          maxAge: 300000,
          path: '/',
          httpOnly: true,
          secure: true
        }
      })
    );
    this._app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
      );
      next();
    });
  }

  Start() {
    console.log('[Express Server] Listening port.');
    this._app.listen(process.env.PORT || 12755);
  }

  Listen() {
    this._app.use('/VoteResult', Result);
    this._app.use('/MakeVote', TicketValid);
    this._app.use('/AdminMgr', Admins);
    this._app.use('/SessMgr', SessMgr);
    this._app.get('/', (req, res) => {
      res.end();
    });
  }
}

var Starter = new Server();
Starter.Listen();
Starter.Start();
