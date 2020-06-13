var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var voterSchema = new mongoose.Schema({
    name: String,
    aadhar: String,
    age: Number,
    gender: String,
    constituency: String,
    password: String,
    isVoted: {
        type: Boolean,
        default: false
    },
    candidateData: Array
});

voterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Voter", voterSchema);