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
    // FUNCTION FOR ADDING NEW BLOCK
    async addBlock(data) {
        let index;
        let prevHash;
        const blocks = await myBlock.find({});
        if(!blocks) {
            console.log("No block found!");
        } else {
            if(blocks.length === 0) {
                index = 0;
                prevHash = 0;
            } else {
                prevHash = blocks[blocks.length - 1].hash;
                index = blocks.length;
            }
            const newBlock = new Block(index, data, prevHash);
            const block = await myBlock.create(newBlock);
            if(!block) {
                console.log("Vote does not submitted!");
            } else {
                const addedBlock = {
                    index: block.index,
                    timestamp: block.timestamp,
                    prevHash: block.prevHash,
                    hash: block.hash
                }
                console.log(addedBlock);
            }                
        }
    }
}

module.exports = new BlockChain();
