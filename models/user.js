const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;