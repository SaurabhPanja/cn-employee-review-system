const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, unique: true, lowercase: true },
  password: String,
  name: String,
  isAdmin: { type: Boolean, default: false },
  requestedFeedback: [{ type: mongoose.Schema.Types.ObjectId, ref: 'feedback' }],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('user', userSchema);

module.exports = User;
