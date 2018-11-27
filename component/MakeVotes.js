var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongoose = require('mongoose');
var MakeVoteList = require('./includes/MakeVoteList');
var MakeTicketList = require('./includes/MakeTicketList');
var MakeCandList = require('./includes/MakeCandList');
var MakeVoted = require('./includes/MakeVoted');

router.use(function timeLog(req, res, next) {
  console.log('[Express Server] Read Ticket Validation - Time: ', Date.now());
  next();
});

router.get('/ValidateTicket', (req, res) => {
  console.log('[Express Server] Validating Ticket.');

  if (
    typeof req.query.EventKey === 'undefined' ||
    typeof req.query.TicketKey === 'undefined'
  ) {
    console.log(
      '[Express Server] Error: required parameters not found. ' +
        req.params.length
    );
    res
      .status(200)
      .json({ error: 'Empty required parameter EventKey and TicketKey' });
  } else {
    var event_key = String(req.query.EventKey);
    var tickey_key = String(req.query.TicketKey);

    if (event_key.length == 0 || tickey_key.length == 0) {
      console.log(
        '[Express Server] Error: required parameters should not be blank.'
      );
      res
        .status(200)
        .json({ error: 'Empty key required parameter EventKey and TicketKey' });
    } else {
      var today = new Date();
      var day = today.getDate();
      var mon = today.getMonth() + 1;
      var yrs = today.getFullYear();

      if (day < 10) {
        day = '0' + day;
      }

      if (mon < 10) {
        mon = '0' + mon;
      }

      var format_today = yrs + '-' + mon + '-' + day;

      var evt_details = {
        StartDate: null,
        EndDate: null
      };

      var ticket = {
        tg_evt: null,
        vote_date: null
      };

      var results = {
        ValidTicket: false,
        MatchTicketWithEvent: false,
        Started: false,
        Expired: false,
        Voted: false
      };

      var ticketId = new mongoose.Types.ObjectId(tickey_key);

      MakeTicketList.find({ _id: ticketId })
        .then(response => {
          ticket.tg_evt = response[0].target_activity;
          ticket.vote_date = response[0].vote_date;

          if (ticket.tg_evt == null) {
            results.ValidTicket = false;

            res.status(200).send(results);
          } else {
            results.ValidTicket = true;

            if (ticket.tg_evt == event_key) {
              results.MatchTicketWithEvent = true;

              var evt_id = new mongoose.Types.ObjectId(event_key);

              MakeVoteList.find({ _id: evt_id })
                .sort([['_id', -1]])
                .then(response => {
                  evt_details.StartDate = String(response[0].begin_date);
                  evt_details.EndDate = String(response[0].end_date);

                  var StartDate = moment(evt_details.StartDate, 'YYYY-MM-DD');
                  var EndDate = moment(evt_details.EndDate, 'YYYY-MM-DD');
                  var TodayDate = moment(format_today, 'YYYY-MM-DD');

                  if (TodayDate.diff(StartDate, 'days') > 0) {
                    results.Started = true;

                    if (TodayDate.diff(EndDate, 'days') > 0) {
                      results.Expired = true;
                      res.status(200).json(results);
                    } else {
                      results.Expired = false;

                      if (
                        !(ticket.vote_date == null) &&
                        !(ticket.vote_date == '')
                      ) {
                        results.Voted = true;
                        res.status(200).json(results);
                      } else {
                        results.Voted = false;
                        res.status(200).json(results);
                      }
                    }
                  } else {
                    results.Started = false;
                    res.status(200).json(results);
                  }
                })
                .catch(error => {
                  res.status(200).json(results);
                });
            } else {
              results.MatchTicketWithEvent = false;

              res.status(200).json(results);
            }
          }
        })
        .catch(error => {
          res.status(200).json(results);
        });

      console.log('[Express Server] Send Completed. ');
    }
  }
});

router.get('/CandidateList', (req, res) => {
  console.log('[Express Server] Get Candidate List for Votes.');
  if (typeof req.query.EventKey === 'undefined') {
    console.log(
      '[Express Server] Error: required parameters not found. ' +
        req.params.length
    );
    res.status(200).json({ error: 'Empty required parameter EventKey.' });
  } else {
    var evt_key = String(req.query.EventKey);

    MakeCandList.find({})
      .where({ target_activity: evt_key })
      .then(response => {
        res.status(200).json(response);
        console.log('[Express Server] Data fetch successfully.');
      })
      .catch(error => {
        res.status(200).json({ err: error });
        console.log('[Express Server] Data fetch failed.');
      });
  }
});

router.post('/UpdateVote', (req, res) => {
  if (
    typeof req.body.EventKey === 'undefined' ||
    typeof req.body.TicketKey === 'undefined' ||
    typeof req.body.SelectedCand === 'undefined'
  ) {
    console.log('[Express Server] Empty required parameters.');
    res.status(200).json({ error: 'ERROR: Empty required parameters.' });
  } else {
    var today = new Date();
    var day = today.getDate();
    var mon = today.getMonth() + 1;
    var yrs = today.getFullYear();

    if (day < 10) {
      day = '0' + day;
    }

    if (mon < 10) {
      mon = '0' + mon;
    }

    var format_today = yrs + '-' + mon + '-' + day;

    var evt_key = req.body.EventKey;
    var ticket_key = req.body.TicketKey;
    var selected_cand = req.body.SelectedCand;

    MakeTicketList.findById(
      new mongoose.Types.ObjectId(ticket_key),
      (err, tickets) => {
        if (err) {
          console.log('[Express Server] Unable to process change. ' + err);
          res.status(200).json({ result: false });
        } else {
          tickets.set({ vote_date: format_today });
          tickets.save((errs, updates) => {
            console.log('[Express Server] Ticket updated.');
          });
        }
      }
    );

    var newVoted = [
      {
        target_activity: evt_key,
        ticket_id: ticket_key,
        selected: selected_cand
      }
    ];

    MakeVoted.insertMany(newVoted, (err, docs) => {
      console.log('[Express Server] Candidate new vote added.');
      res.status(200).json({ result: true });
    });
  }
});

module.exports = router;
