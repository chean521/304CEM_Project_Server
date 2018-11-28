var express = require('express');
var router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log(
    '[Express Server - Session Manager] Session Manager Requests - Time: ',
    Date.now()
  );
  next();
});

router.get('/', (req, res) => {
  if (typeof req.session.initialize === 'undefined') {
    console.log('[Express Server - Session Manager] Initialize Session');
    req.session.initialize = 'is_initialize';
    console.log(
      '[Express Server - Session Manager] Register Session. ID: ' +
        req.session.id
    );

    req.session.save(err => {
      if (err) console.log(err);
    });
  } else {
    console.log(
      '[Express Server - Session Manager] Session already initialize. '
    );
  }

  res.status(200).send(req);
});

router.get('/AddKey', (req, res) => {
  console.log('[Express Server - Session Manager] Adding new session data.');
  if (
    typeof req.query.SessKey === 'undefined' ||
    typeof req.query.SessVal === 'undefined'
  ) {
    console.log(
      '[Express Server - Session Manager] Required parameters not found, unable to add session data.'
    );
  } else {
    if (typeof req.session.initialize === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to add session data."
      );
    } else {
      var S_key = String(req.query.SessKey);
      var S_Val = String(req.query.SessVal);
      var exist = false;

      for (var key in req.session) {
        if (S_key == key) {
          exist = true;
          break;
        }
      }

      if (exist == true) {
        console.log(
          '[Express Server - Session Manager] Session key exist, unable to add new data.'
        );
      } else {
        req.session[S_key] = S_Val;
        req.session.save(err => {});
        console.log('[Express Server - Session Manager] Session data added.');
      }
    }
  }

  res.status(200).send(req);
});

router.get('/ModVal', (req, res) => {
  console.log('[Express Server - Session Manager] Modifying session data.');
  if (
    typeof req.query.SessKey === 'undefined' ||
    typeof req.query.SessVal === 'undefined'
  ) {
    console.log(
      '[Express Server - Session Manager] Required parameters not found, unable to modify session data.'
    );
  } else {
    if (typeof req.session.initialize === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to modify session data."
      );
    } else {
      var S_key = String(req.query.SessKey);
      var S_Val = String(req.query.SessVal);
      var exist = false;

      for (var key in req.session) {
        if (S_key == key) {
          req.session[S_Key] = S_Val;
          exist = true;
          break;
        }
      }

      if (exist == false) {
        console.log(
          '[Express Server - Session Manager] Unable to find provided key for modify.'
        );
      } else {
        req.session.save(err => {});
        console.log('[Express Server - Session Manager] Session data edited.');
      }
    }
  }

  res.send();
});

router.get('/GetVal', (req, res) => {
  console.log('[Express Server - Session Manager] Get session data.');
  if (typeof req.query.SessKey === 'undefined') {
    console.log(
      '[Express Server - Session Manager] Required parameters not found, unable to get session data.'
    );
    res.end();
  } else {
    if (typeof req.session.initialize === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to get session data."
      );
      res.end();
    } else {
      var S_key = String(req.query.SessKey);
      var result = {
        req_key: S_key,
        sess_key: req.session.id,
        data: null
      };

      for (var key in req.session) {
        if (key == S_key) {
          result.data = req.session[key];
          break;
        }
      }

      res.status(200).json(result);
      console.log('[Express Server - Session Manager] Session data sent.');
    }
  }
});

router.get('/DelKey', (req, res) => {
  console.log('[Express Server - Session Manager] Delete session data.');
  if (typeof req.query.SessKey === 'undefined') {
    console.log(
      '[Express Server - Session Manager] Required parameters not found, unable to delete session data.'
    );
  } else {
    if (typeof req.session.initialize === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to get session data."
      );
    } else {
      var S_key = String(req.query.SessKey);
      var isFound = false;
      var pos = '';

      for (var key in req.session) {
        if (key == S_key) {
          pos = key;
          isFound = true;
          break;
        }
      }

      if (isFound == true) {
        req.session[pos] = undefined;
        req.session.save(err => {});

        console.log('[Express Server - Session Manager] Session data deleted.');
      } else {
        console.log(
          '[Express Server - Session Manager] Key not found, unable to delete session data.'
        );
      }
    }
  }

  res.send();
});

router.get('/Destroy', (req, res) => {
  console.log('[Express Server - Session Manager] Destroy session.');
  if (typeof req.session.initialize === 'undefined') {
    console.log(
      "[Express Server - Session Manager] Session haven't initialize, unable to destroy session."
    );
  } else {
    req.session.destroy(e => {
      console.log('[Express Server - Session Manager] Session Destroyed.');
    });
  }

  res.send();
});

module.exports = router;
