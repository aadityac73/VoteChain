const mongoose  = require("mongoose"),
      Candidate = require("./models/candidate"),
      Voter     = require("./models/voter"),
      myBlock   = require("./models/b_chain");

// ARRAY OF CANDIDATES
const allCandidates = [
    {
        name: "Narendra Modi",
        constituency: "Varanasi",
        image: "/images/modi.jpeg",
        party: "BJP"
    },
    {
        name: "Murli Manohar Joshi",
        constituency: "Varanasi",
        image: "/images/murli.jpeg",
        party: "INCP"
    },
    {
        name: "Aditya Thakre",
        image: "/images/aditya.jpeg",
        constituency: "Worli",
        party: "ShivSena"
    },
    {
        name: "Sachin Ahir",
        constituency: "Worli",
        image: "/images/sachin.jpeg",
        party: "NCP"
    },
    {
        name: "Rahul Gandhi",
        constituency: "Amethi",
        image: "/images/rahul.jpeg",
        party: "INCP"
    },
    {
        name: "Smriti Irani",
        constituency: "Amethi",
        image: "/images/smriti.jpeg",
        party: "BJP"
    }];

async function seedDB() {
    await myBlock.remove({});
    await Candidate.remove({});
    await Voter.remove({}); 
    console.log("Seeding Done!!");

    // INSERTING CANDIDATES INTO DATABASE
    const candidates = await Candidate.create(allCandidates);
    if(!candidates) {
        console.log("Something went wrong!");
    } else {
        console.log("Candidates inserted sucessfully");
    }
}
            
module.exports = seedDB;