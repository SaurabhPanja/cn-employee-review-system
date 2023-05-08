const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  text: String,
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});


const Feedback = mongoose.model('feedback', feedbackSchema);

module.exports = Feedback;
