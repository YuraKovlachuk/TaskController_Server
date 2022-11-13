const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'img\\default-avatar.png'
  }
}, { timestamps: true });

const User = mongoose.model('User', noteSchema);

module.exports = {
  User,
};
