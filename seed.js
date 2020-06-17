var mongoose  = require("mongoose"),
    Candidate = require("./models/candidate"),
    Voter     = require("./models/voter"),
    myBlock   = require("./models/b_chain");

// ARRAY OF CANDIDATES
candidates = [
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

function seedDB(){
    myBlock.remove({}, function(err){
        if(err){
            console.log(err);
        } else{
            Candidate.remove({}, function(err){
                if(err){
                    console.log(err);
                } else {
                    Voter.remove({}, function(err){
                        if(err){
                            console.log(err);
                        } 
                        // else{
                        //     // INSERTING CANDIDATES INTO DATABASE
                        //     Candidate.create(candidates, function(err, allCandidates){
                        //         if(err) {
                        //             console.log(err);
                        //         } else {
                        //             console.log("Candidates inserted sucessfully");
                        //         }
                        //     });
                        // }
                    });
                }
            });
        }
    });
}

module.exports = seedDB;