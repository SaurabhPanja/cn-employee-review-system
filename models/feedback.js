const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  text: { type: String, default: null },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  for: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});


const Feedback = mongoose.model('feedback', feedbackSchema);

module.exports = Feedback;
