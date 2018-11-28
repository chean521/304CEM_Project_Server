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
  }

  Start() {
    console.log('[Express Server] Listening port.');
    this._app.listen(process.env.PORT || 12755);
  }

  Listen() {
    cors_setting = {
      origin: ['https://webapi-oscar-client.herokuapp.com']
    };

    this._app.use('/VoteResult', cors(), Result);
    this._app.use('/MakeVote', cors(), TicketValid);
    this._app.use('/AdminMgr', cors(cors_setting), Admins);
    this._app.use('/SessMgr', cors(cors_setting), SessMgr);
    this._app.get('/', (req, res) => {
      res.end();
    });
  }
}

var Starter = new Server();
Starter.Listen();
Starter.Start();
