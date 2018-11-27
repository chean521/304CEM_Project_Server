const mongoose = require('./Connector');

const schema = mongoose.Schema({
  _id: {
    type: Object
  },
  target_activity: {
    type: String
  },
  candidate_index: {
    type: String
  },
  candidate_name: {
    type: String
  },
  programme: {
    type: String
  },
  current_cgpa: {
    type: String
  },
  age: {
    type: String
  },
  school: {
    type: String
  },
  semester: {
    type: String
  }
});

const Data = mongoose.model('CandidateData', schema, 'candidate');

module.exports = Data;
