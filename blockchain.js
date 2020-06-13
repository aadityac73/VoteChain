var mongoose  = require("mongoose"),
    hash      = require("hash.js"),
    myBlock   = require("./models/b_chain");

// CLASS BLOCK REPRESENTS EACH BLOCK INSIDE A BLOCKCHAIN
class Block {
    constructor(index, data, prevHash) {
        this.index = index;
        this.timestamp = Math.floor(Date.now() / 1000);
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.getHash();
    }
    // FUNCTION FOR GENERATING HASH VALUE
    getHash() {
        return hash.sha256().update(JSON.stringify(this.data) + this.prevHash + this.index + this.timestamp).digest('hex');
    }
}

// CLASS BLOCKCHAIN REPRESENTS ENTIRE BLOCKCHAIN
class BlockChain {
    constructor() {
        this.chain = [];
    }
    // FUNCTION FOR ADDING NEW BLOCK
    addBlock(data) {
        let index;
        let prevHash;
        myBlock.find({}, function(err, block){
            if(err) {
                console.log(err);
            } else {
                if(block.length === 0) {
                    index = 0;
                    prevHash = 0;
                } else {
                    // console.log(block[block.length - 1].hash);
                    // console.log(block.length);
                    prevHash = block[block.length - 1].hash;
                    index = block.length;
                }
                let newBlock = new Block(index, data, prevHash);
                myBlock.create(newBlock, function(err, block) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(block);
                    }
                });
                 
            }
            
        });
        
    }
}

module.exports = new BlockChain();
