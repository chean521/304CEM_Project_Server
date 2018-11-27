const Express = require('express');
const cors = require('cors');
const passport = require('passport');
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
    this._app.use(cors());
    this._app.use(parser());
    this._app.use(
      session({
        name: 'express_tmp_cookie',
        secret: 'abcde12345EFG!@',
        resave: true,
        saveUninitialized: true,
        domain: 'https://webapi-oscar-server.herokuapp.com',
        store: new MongoStore({
          mongooseConnection: Connector.connection,
          autoRemove: 'native'
        }),
        cookie: {
          maxAge: 300000
        }
      })
    );
    this._app.use(passport.initialize());
    this._app.use(passport.session());
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
