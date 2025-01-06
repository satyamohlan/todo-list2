const mongoose = require('mongoose');

const record = new mongoose.Schema({
  task: {
    type: String,

  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
    required: true
  }
});


const task = mongoose.model('task', record);

module.exports = task;