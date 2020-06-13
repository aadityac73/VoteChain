var mongoose = require("mongoose");

var candidateSchema = new mongoose.Schema({
    name: String,
    constituency: String,
    image: String,
    party: String,
    voteCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Candidate", candidateSchema);