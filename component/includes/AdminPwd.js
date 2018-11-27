const mongoose = require('./Connector');

const schema = mongoose.Schema({
  _id: {
    type: Object
  },
  password: {
    type: String
  }
});

const Data = mongoose.model('AdminPwd', schema, 'admins');

module.exports = Data;
