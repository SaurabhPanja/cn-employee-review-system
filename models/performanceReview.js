const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const performanceReviewSchema = new Schema({
    for: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    requiredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: 'feedback' }],
});


const performanceReview = mongoose.model('performanceReview', performanceReviewSchema);

module.exports = performanceReview;
