var mongoose = require("mongoose");
var encrypt = require("mongoose-encryption");

var blockSchema = new mongoose.Schema({
    index: Number,
    timestamp: Number,
    data: Object,
    prevHash: String,
    hash: String
});

// var str1 = "my name is aditya premkumar chav";
// var str2 = "my name is aditya premkumar chavmy name is aditya premkumar chav";

// var encKey = Buffer.from(str1).toString('base64');
// var sigKey = Buffer.from(str2).toString('base64');

// blockSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['data'] });

module.exports = mongoose.model("myBlock", blockSchema);