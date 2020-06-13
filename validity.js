var hash      = require("hash.js"),
    mongoose  = require("mongoose"),
    myBlock   = require("./models/b_chain");

function getHash(block) {
    return hash.sha256().update(JSON.stringify(block.data) + block.prevHash + block.index + block.timestamp).digest('hex');
}

// FUNCTION FOR TESTING VALIDITY OF BLOCKCHAIN
function chainIsValid(){
    myBlock.find({}, function(err, blocks){
        if(err) {
            console.log(err);
        }
        else {
            for(var i = 0; i < blocks.length; i++){
                if(blocks[i].hash !== getHash(blocks[i])){
                    console.log("Blockchain is Invalid");
                    return false;
                }
                
                if(i > 0 && blocks[i].prevHash !== blocks[i-1].hash){
                    console.log("Blockchain is Invalid");
                    return false;
                }
            }
            console.log("Blockchain is valid");
            return true;
        }
    });
}

module.exports = chainIsValid;