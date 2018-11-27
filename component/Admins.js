var express = require('express');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var AdminPwd = require('./includes/AdminPwd');
var router = express.Router();
var MakeCandList = require('./includes/MakeCandList');
var MakeTicketList = require('./includes/MakeTicketList');
var MakeEventList = require('./includes/MakeVoteList');
var MakeVoted = require('./includes/MakeVoted');

router.use(function timeLog(req, res, next) {
  console.log(
    '[Express Server - Admin Manager] Read Admin Manager - Time: ',
    Date.now()
  );
  next();
});

router.get('/ValidAdmin', (req, res) => {
  console.log('[Express Server - Admin Manager] Validating admin login.');
  if (typeof req.query.Password === 'undefined') {
    console.log(
      '[Express Server - Admin Manager] Invalid parameters for validating.'
    );
    res.status(200).json({ res: false });
  } else {
    var pwd = String(req.query.Password);

    AdminPwd.find({})
      .where({ password: pwd })
      .sort({ _id: -1 })
      .then(response => {
        if (response.length > 0) {
          res.status(200).json({ res: true });
        } else {
          res.status(200).json({ res: false });
        }

        console.log('[Express Server - Admin Manager] Validated admin login.');
      })
      .catch(error => {
        res.status(200).json({ res: false });
        console.log('[Express Server - Admin Manager] Validated admin login.');
      });
  }
});

router.post('/SaveEvent', (req, res) => {
  console.log('[Express Server - Admin Manager] Adding new event data.');
  if (
    typeof req.body.EventData === 'undefined' ||
    typeof req.body.CandidateData === 'undefined'
  ) {
    console.log(
      '[Express Server - Admin Manager] Invalid parameters for adding data.'
    );
    res.status(200).json({ result: false });
  } else {
    var evt_data = req.body.EventData;
    var cand_data = req.body.CandidateData;

    if (typeof evt_data === 'object') {
      var connector = require('./includes/Connector');

      var ActivitySchema = new Schema({
        title: {
          type: String
        },
        description: {
          type: String
        },
        purpose: {
          type: String
        },
        type: {
          type: String
        },
        begin_date: {
          type: String
        },
        end_date: {
          type: String
        },
        remark: {
          type: String
        },
        created_date: {
          type: Date
        }
      });

      var Activity = connector.model(
        'ActivityVote',
        ActivitySchema,
        'voteactivity'
      );

      var ActivityData = new Activity();
      ActivityData.title = evt_data.title;
      ActivityData.description = evt_data.description;
      ActivityData.purpose = evt_data.purpose;
      ActivityData.type = evt_data.type;
      ActivityData.begin_date = evt_data.begin_date;
      ActivityData.end_date = evt_data.end_date;
      ActivityData.remark = evt_data.remark;
      ActivityData.created_date = new Date().toUTCString();

      ActivityData.save((err, data) => {
        delete mongoose.connection.models['ActivityVote'];

        if (err) {
          console.log(
            '[Express Server - Admin Manager] Unable to add new record into event. ' +
              err
          );
          res.status(200).json({ result: false });
        } else {
          var act_id = data._id;

          var NewCandSeq = [];

          for (var i = 0; i < cand_data.length; i++) {
            var Seq = {
              target_activity: act_id,
              candidate_index: cand_data[i].candidate_index,
              candidate_name: cand_data[i].candidate_name,
              age: cand_data[i].age,
              programme: cand_data[i].programme,
              school: cand_data[i].school,
              semester: cand_data[i].semester,
              current_cgpa: cand_data[i].current_cgpa
            };

            NewCandSeq.push(Seq);
          }

          MakeCandList.insertMany(NewCandSeq, (err, docs) => {
            if (err) {
              console.log(
                '[Express Server - Admin Manager] Unable to add new record into candidate. ' +
                  err
              );
              res.status(200).json({ result: false });
            } else {
              console.log('[Express Server - Admin Manager] New event added. ');
              res.status(200).json({ result: true });
            }
          });
        }
      });
    } else {
      console.log(
        '[Express Server - Admin Manager] Invalid data type parameters for adding data.'
      );
      res.status(200).json({ result: false });
    }
  }
});

router.post('/GenerateTicket', (req, res) => {
  console.log('[Express Server - Admin Manager] Generate vote ticket.');
  if (typeof req.body.TicketData === 'undefined') {
    console.log(
      '[Express Server - Admin Manager] Required parameter incorrect, unable to generate ticket.'
    );
    res.status(200).json({ result: 'error' });
  } else {
    var tg_act = req.body.TicketData.TgActivity;
    var vote_name = req.body.TicketData.VoterName;
    var prog = req.body.TicketData.Programme;

    var today = new Date();
    var date = today.getDate();
    var mon = today.getMonth() + 1;
    var year = today.getFullYear();

    var format_today = year + '-' + mon + '-' + date;

    var chk_list = {
      target_activity: tg_act,
      vote_date: null,
      created_date: format_today,
      voter_name: vote_name,
      programme: prog
    };

    var connector = require('./includes/Connector');

    var TicketSchema = new Schema({
      target_activity: {
        type: String
      },
      vote_date: {
        type: String
      },
      created_date: {
        type: String
      },
      voter_name: {
        type: String
      },
      programme: {
        type: String
      }
    });

    var Ticket = connector.model('AddTicket', TicketSchema, 'ticket');

    var TicketData = new Ticket();

    for (var index in chk_list) {
      TicketData[index] = chk_list[index];
    }

    TicketData.save((err, data) => {
      delete mongoose.connection.models['AddTicket'];

      if (err) {
        console.log(
          '[Express Server - Admin Manager] Unable to generate new ticket.'
        );
        res.status(200).json({ result: 'error' });
      } else {
        var ticket_id = data._id;

        var data_result = {
          result: true,
          ticket: ticket_id,
          tg_act: tg_act
        };

        console.log(
          '[Express Server - Admin Manager] Generated new ticket, ticket sent.'
        );
        res.status(200).json({ result: data_result });
      }
    });
  }
});

router.get('/TicketDistribution', (req, res) => {
  console.log('[Express Server - Admin Manager] Get Ticket Distribution List.');

  MakeTicketList.find({})
    .sort({ _id: -1 })
    .then(response => {
      var data = response;

      var Created_Amount = [0, 0, 0, 0];
      var Used_Amount = [0, 0, 0, 0];
      var Involved_Month = [0, 0, 0, 0];
      var Involved_Text = ['', '', '', ''];
      var Mon_Text = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];

      var today = new Date();

      for (var i = 3; i >= 0; i--) {
        var j = 0;

        if (today.getMonth() - (3 - i) < 0) {
          Involved_Month[i] = 11 - j + 1;
          j++;
          Involved_Text[i] =
            Mon_Text[Involved_Month[i] - 1] + ' ' + (today.getFullYear() - 1);
        } else {
          Involved_Month[i] = today.getMonth() - (3 - i) + 1;
          Involved_Text[i] =
            Mon_Text[Involved_Month[i] - 1] + ' ' + today.getFullYear();
        }
      }

      for (var j = 3; j >= 0; j--) {
        var ttl_create = 0;
        var used = 0;

        for (var i = 0; i < data.length; i++) {
          var Create_Date = new Date(data[i].created_date);

          if (Involved_Month[j] == Create_Date.getMonth() + 1) {
            ttl_create++;

            if (data[i].vote_date !== '' && data[i].vote_date !== null) {
              used++;
            }
          }
        }

        Created_Amount[j] = ttl_create;
        Used_Amount[j] = used;
      }

      var ResultData = {
        Total_created: Created_Amount,
        Total_used: Used_Amount,
        Month: Involved_Month,
        Text: Involved_Text
      };

      console.log(
        '[Express Server - Admin Manager] Ticket Distribution list sent.'
      );
      res.status(200).json({ result: ResultData });
    })
    .catch(error => {
      console.log('[Express Server - Admin Manager] Error sending response');
      res.status(200).json({ result: error });
    });
});

router.post('/DeleteEvent', (req, res) => {
  console.log('[Express Server - Admin Manager] Remove Selected Event.');
  if (typeof req.body.SelectedEvent === 'undefined') {
    console.log(
      '[Express Server - Admin Manager] Required parameter incorrect, unable to delete event.'
    );
    res.status(200).json({ result: false });
  } else {
    var event_id_list = req.body.SelectedEvent;
    var Converted_List = [];

    for (var i = 0; i < event_id_list.length; i++) {
      Converted_List.push(new mongoose.Types.ObjectId(event_id_list[i]));
    }

    MakeEventList.deleteMany({ _id: { $in: Converted_List } }, err => {
      if (err) {
        console.log(
          '[Express Server - Admin Manager] Unable to delete selected event. Message: ' +
            err
        );
        res.status(200).json({ result: false });
      } else {
        MakeCandList.deleteMany(
          { target_activity: { $in: event_id_list } },
          err => {
            if (err) {
              console.log(
                '[Express Server - Admin Manager] Unable to delete candidate list for selected event. Message: ' +
                  err
              );
              res.status(200).json({ result: false });
            } else {
              MakeVoted.deleteMany(
                { target_activity: { $in: event_id_list } },
                err => {
                  if (err) {
                    console.log(
                      '[Express Server - Admin Manager] Unable to remove voted list in selected event. Message: ' +
                        err
                    );
                    res.status(200).json({ result: false });
                  } else {
                    console.log(
                      '[Express Server - Admin Manager] Selected event deleted.'
                    );
                    res.status(200).json({ result: true });
                  }
                }
              );
            }
          }
        );
      }
    });
  }
});

module.exports = router;
