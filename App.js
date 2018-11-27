const Express = require('express');
const Result = require('./component/VoteResult');
const TicketValid = require('./component/MakeVotes');
const Admins = require('./component/Admins');
var session = require('express-session');
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
    this._app.use(
      session({
        secret: '123abc',
        resave: true,
        saveUninitialized: false,
        cookie: {
          maxAge: 300000
        }
      })
    );
    /*
    this._app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      next();
    });
    */
  }

  Start() {
    console.log('[Express Server] Listening port 5000.');
    this._app.listen(process.env.port || 8899);
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
