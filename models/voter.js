var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var voterSchema = new mongoose.Schema({
    name: {type: String, required:true},
    email: {type: String, unique:true, required:true},
    secretToken: String,
    username: {type: String, unique:true, required:true},
    age: Number,
    gender: String,
    constituency: {type: String, required:true},
    password: String,
    verified: {
        type: Boolean,
        default: false
    },
    isVoted: {
        type: Boolean,
        default: false
    },
    candidateData: Array
});

voterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Voter", voterSchema);