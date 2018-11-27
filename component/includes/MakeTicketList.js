const mongoose = require('./Connector');

const schema = mongoose.Schema({
  _id: {
    type: Object
  },
  target_activity: {
    type: String
  },
  vote_date: {
    type: String
  },
  created_date: {
    type: String
  }
});

const Data = mongoose.model('TicketData', schema, 'ticket');

module.exports = Data;
