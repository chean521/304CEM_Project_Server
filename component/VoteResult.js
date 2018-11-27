var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var router = express.Router();
var MakeVoteList = require('./includes/MakeVoteList');
var MakeCandList = require('./includes/MakeCandList');
var MakeVoted = require('./includes/MakeVoted');
var MakeTicketList = require('./includes/MakeTicketList');

router.use(function timeLog(req, res, next) {
  console.log('[Express Server] Read VoteResult - Time: ', Date.now());
  next();
});

router.get('/MakeVoteList', (req, res) => {
  console.log('[Express Server] Get Available Vote List.');

  MakeVoteList.find({})
    .sort([['_id', -1]])
    .then(response => {
      console.log('[Express Server] Send Response -  Available Vote List.');
      res.status(200).json(response);
    })
    .catch(error => {
      console.log('[Express Server] Error send response.');
      res.status(200).json({ err: error });
    });
});

router.get('/VoteListInDetails', (req, res) => {
  console.log('[Express Server] Get Available Vote List. (Advanced Search)');

  if (typeof req.query.EventKey === 'undefined') {
    console.log(
      '[Express Server] Invalid EventKey parameter (Advanced Search)'
    );
    res.status.json({ error: 'Invalid EventKey parameter (Advanced Search)' });
  } else {
    MakeVoteList.find({
      _id: new mongoose.Types.ObjectId(String(req.query.EventKey))
    })
      .sort([['_id', -1]])
      .then(response => {
        console.log(
          '[Express Server] Send Response -  Available Vote List (Advanced Search).'
        );
        res.status(200).json(response);
      })
      .catch(error => {
        console.log('[Express Server] Error send response.');
        res.status(200).json({ err: error });
      });
  }
});

router.get('/VoteListInDateRange', (req, res) => {
  console.log(
    '[Express Server] Get Available Vote List. (Advanced Search In Date)'
  );

  if (
    typeof req.query.StartDate === 'undefined' ||
    typeof req.query.EndDate === 'undefined'
  ) {
    console.log(
      '[Express Server] Invalid date parameter (Advanced Search In Date)'
    );
    res.status.json({
      error: 'Invalid date parameter (Advanced Search In Date)'
    });
  } else {
    var Start_Range = String(req.query.StartDate);
    var End_Range = String(req.query.EndDate);

    MakeVoteList.find({
      created_date: {
        $gte: new Date(Start_Range),
        $lte: new Date(End_Range)
      }
    })
      .sort([['_id', -1]])
      .then(response => {
        console.log(
          '[Express Server] Send Response -  Available Vote List (Advanced Search In Date).'
        );
        res.status(200).json(response);
      })
      .catch(error => {
        console.log('[Express Server] Error send response.');
        res.status(200).json({ err: error });
      });
  }
});

router.get('/VoteListInEvtType', (req, res) => {
  console.log(
    '[Express Server] Get Available Vote List. (Advanced Search In Event Type)'
  );

  if (typeof req.query.EventType === 'undefined') {
    console.log(
      '[Express Server] Invalid date parameter (Advanced Search In Event Type)'
    );
    res.status.json({
      error: 'Invalid date parameter (Advanced Search In Event Type)'
    });
  } else {
    var Event_Type = String(req.query.EventType);

    MakeVoteList.find({
      type: Event_Type
    })
      .sort([['_id', -1]])
      .then(response => {
        console.log(
          '[Express Server] Send Response -  Available Vote List (Advanced Search In Event Type).'
        );
        res.status(200).json(response);
      })
      .catch(error => {
        console.log('[Express Server] Error send response.');
        res.status(200).json({ err: error });
      });
  }
});

router.get('/VoteListAvailable', (req, res) => {
  console.log('[Express Server] Get Available Vote List.');
  var today = new Date();
  var date = today.getDate();
  var mon = today.getMonth() + 1;
  var year = today.getFullYear();

  var format_today = year + '-' + mon + '-' + date;

  MakeVoteList.find({})
    .sort([['_id', -1]])
    .then(response => {
      var data = response;
      var avail_list = [];

      if (data.length > 0) {
        data.forEach((val, ind) => {
          var End_Date = val.end_date;

          var mmt_end = moment(End_Date, 'YYYY-MM-DD');
          var mmt_tdy = moment(format_today, 'YYYY-MM-DD');

          if (mmt_tdy.diff(mmt_end, 'days') <= 0) {
            avail_list.push(data[ind]);
          }
        });
      }

      console.log('[Express Server] Available result sent.');
      res.status(200).json({ result: avail_list });
    })
    .catch(error => {
      console.log('[Express Server] Error send response.');
      res.status(200).json({ err: error });
    });
});

router.get('/EventDetails', (req, res) => {
  console.log('[Express Server] Get Available Vote Details.');

  if (typeof req.query.EventKey === 'undefined') {
    console.log('[Express Server] Invalid EventKey parameter');
    res.status(200).json({ error: 'Invalid EventKey parameter' });
  } else {
    var evt_id = String(req.query.EventKey);
    console.log('[Express Server] Request Specific Event: ' + evt_id);

    var compiled_data = {
      Event_Data: [],
      Candidate_Data: [],
      Vote_Data: []
    };

    var voted_list = [];
    var ticket_list = [];

    MakeVoteList.find({
      _id: new mongoose.Types.ObjectId(String(evt_id))
    })
      .sort([['_id', -1]])
      .then(response => {
        compiled_data.Event_Data = response;

        MakeCandList.find({})
          .where({ target_activity: evt_id })
          .then(response => {
            compiled_data.Candidate_Data = response;

            MakeVoted.find({})
              .where({ target_activity: evt_id })
              .then(response => {
                voted_list = response;

                MakeTicketList.find({})
                  .where({ target_activity: evt_id })
                  .then(response => {
                    ticket_list = response;

                    var Vote_Compiled = {
                      total_voters: 0,
                      total_voted: 0,
                      total_unvote: 0,
                      candidate_data: []
                    };

                    var voters = ticket_list.length;
                    var voted = voted_list.length;
                    var unvote = voters - voted;

                    Vote_Compiled.total_unvote = unvote;
                    Vote_Compiled.total_voted = voted;
                    Vote_Compiled.total_voters = voters;

                    for (
                      var i = 0;
                      i < compiled_data.Candidate_Data.length;
                      i++
                    ) {
                      var cand_tmp = {
                        cand_ind: '',
                        voted: 0
                      };

                      cand_tmp.cand_ind =
                        compiled_data.Candidate_Data[i].candidate_index;

                      var self_voted = 0;

                      for (var offset = 0; offset < voted; offset++) {
                        if (voted_list[offset].selected == cand_tmp.cand_ind) {
                          self_voted++;
                        }
                      }

                      cand_tmp.voted = self_voted;

                      Vote_Compiled.candidate_data.push(cand_tmp);
                    }

                    compiled_data.Vote_Data = Vote_Compiled;

                    console.log(
                      '[Express Server] Event Details sent successfully'
                    );
                    res.status(200).json(compiled_data);
                  })
                  .catch(error => {
                    console.log(
                      '[Express Server] Error fetch result ticket List.'
                    );
                    res.status(200).json({ err: error });
                  });
              })
              .catch(error => {
                console.log('[Express Server] Error fetch result Voted List.');
                res.status(200).json({ err: error });
              });
          })
          .catch(error => {
            console.log('[Express Server] Error fetch result Candidate List.');
            res.status(200).json({ err: error });
          });
      })
      .catch(error => {
        console.log('[Express Server] Error fetch result Vote List.');
        res.status(200).json({ err: error });
      });
  }
});

module.exports = router;
