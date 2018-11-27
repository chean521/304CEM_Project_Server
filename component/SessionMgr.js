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
  if (typeof req.session.data === 'undefined') {
    console.log('[Express Server - Session Manager] Initialize Session');
    console.log(
      '[Express Server - Session Manager] Register Session. ID: ' +
        req.session.id
    );
    console.log(
      '[Express Server - Session Manager] Max active session time: ' +
        req.session.cookie.maxAge / 1000 / 60 +
        ' minute(s)'
    );
    req.session.data = [];
    req.session.save();
  } else {
    console.log(
      '[Express Server - Session Manager] Session already initialize. '
    );
  }

  res.end();
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
    if (typeof req.session.data === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to add session data."
      );
    } else {
      var S_key = String(req.query.SessKey);
      var S_Val = String(req.query.SessVal);
      var exist = false;

      for (var i = 0; i < req.session.data.length; i++) {
        if (S_key == req.session.data[i].key) {
          exist = true;
          break;
        }
      }

      if (exist == true) {
        console.log(
          '[Express Server - Session Manager] Session key exist, unable to add new data.'
        );
      } else {
        req.session.data.push({ key: S_key, val: S_Val });
        console.log('[Express Server - Session Manager] Session data added.');
      }
    }
  }

  res.end();
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
    if (typeof req.session.data === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to modify session data."
      );
    } else {
      var S_key = String(req.query.SessKey);
      var S_Val = String(req.query.SessVal);
      var exist = false;

      for (var i = 0; i < req.session.data.length; i++) {
        if (S_key == req.session.data[i].key) {
          req.session.data[i].val = S_Val;
          exist = true;
          break;
        }
      }

      if (exist == false) {
        console.log(
          '[Express Server - Session Manager] Unable to find provided key for modify.'
        );
      } else {
        console.log('[Express Server - Session Manager] Session data edited.');
      }
    }
  }

  res.end();
});

router.get('/GetVal', (req, res) => {
  console.log('[Express Server - Session Manager] Get session data.');
  if (typeof req.query.SessKey === 'undefined') {
    console.log(
      '[Express Server - Session Manager] Required parameters not found, unable to get session data.'
    );
    res.end();
  } else {
    if (typeof req.session.data === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to get session data."
      );
      res.end();
    } else {
      var S_key = String(req.query.SessKey);
      var sess_data = req.session.data;
      var result = {
        req_key: S_key,
        sess_key: req.session.id,
        data: null
      };

      for (var i = 0; i < sess_data.length; i++) {
        if (sess_data[i].key == S_key) {
          result.data = sess_data[i].val;
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
    if (typeof req.session.data === 'undefined') {
      console.log(
        "[Express Server - Session Manager] Session haven't initialize, unable to get session data."
      );
    } else {
      var S_key = String(req.query.SessKey);
      var sess_data = req.session.data;
      var pos = 0;
      var isFound = false;

      for (var i = 0; i < sess_data.length; i++) {
        if (sess_data[i].key == S_key) {
          pos = i;
          isFound = true;
          break;
        }
      }

      if (isFound == true) {
        req.session.data.splice(pos, 1);

        console.log('[Express Server - Session Manager] Session data deleted.');
      } else {
        console.log(
          '[Express Server - Session Manager] Key not found, unable to delete session data.'
        );
      }
    }
  }

  res.end();
});

router.get('/Destroy', (req, res) => {
  console.log('[Express Server - Session Manager] Destroy session.');
  if (typeof req.session.data === 'undefined') {
    console.log(
      "[Express Server - Session Manager] Session haven't initialize, unable to destroy session."
    );
  } else {
    req.session.destroy(e => {
      console.log('[Express Server - Session Manager] Session Destroyed.');
    });
  }

  res.end();
});

module.exports = router;
