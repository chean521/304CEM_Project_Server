const mongoose = require('./Connector');

const schema = mongoose.Schema({
  _id: {
    type: Object
  },
  target_activity: {
    type: String
  },
  ticket_id: {
    type: String
  },
  selected: {
    type: String
  }
});

const Data = mongoose.model('VotedData', schema, 'votes');

module.exports = Data;
