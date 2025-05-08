const { Pool, types } = require('pg');
const config = require('./config.json')

const connection = new Pool({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db,
    ssl: {
      rejectUnauthorized: false,
    },
  });

module.exports = {connection}