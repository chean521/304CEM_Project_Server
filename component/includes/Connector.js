const Mongoose = require('mongoose');

const host = 'ds153093.mlab.com:53093';
const user = 'db_admin';
const pwd = 'db_admin_123';
const schema = 'project_votesystem';

const Con_Str = `mongodb://${user}:${pwd}@${host}/${schema}`;

console.log(
  '[Express Server - DB Connector] Connecting to MongoDB Server - Mongoose.'
);

Mongoose.connect(
  Con_Str,
  { useNewUrlParser: true, useMongoClient: true }
)
  .then(() => {
    console.log(
      '[Express Server - DB Connector] Connected to MongoDB Server - Mongoose'
    );
  })
  .catch(error => {
    console.log(
      '[Express Server - DB Connector] Error connect to mongoose: ',
      error
    );
  });

module.exports = Mongoose;
