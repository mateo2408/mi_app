require('dotenv').config();
const mongoose = require('mongoose');
const { getSummary } = require('./BACKEND/controllers/dashboard.controller');
const { connectDatabase } = require('./BACKEND/config/db');

async function test() {
  await connectDatabase();
  const req = {};
  const res = {
    json: (data) => {
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    },
    status: (code) => ({
      json: (data) => {
        console.log("ERROR:", code, data);
        process.exit(1);
      }
    })
  };
  await getSummary(req, res);
}
test().catch(console.error);
