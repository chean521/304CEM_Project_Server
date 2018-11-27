const mongoose = require('./Connector');

const schema = mongoose.Schema({
  _id: {
    type: Object
  },
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

const Data = mongoose.model('Data', schema, 'voteactivity');

module.exports = Data;
