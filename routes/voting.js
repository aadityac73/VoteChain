var express     = require("express"),
    router      = express.Router(),
    Candidate   = require("../models/candidate"),
    Voter       = require("../models/voter"),
    myBlock     = require("../models/b_chain");

const vote = require("../blockchain");

// ROUTE FOR VOTING PAGE
router.get("/votechain/vote", isLoggedIn, function(req, res){
    Candidate.find({constituency: req.user.constituency}, function(err, candidates){
        if(err) {
            console.log(err);
        }
        else {
            res.render("voting",{crrUser: req.user, foundCandidates: candidates});
        }
    })
});

// ROUTE FOR ADDING NEW VOTE
router.post("/votechain/vote", function(req, res){
    if(req.user.isVoted === false) {
    Candidate.findById(req.body.candidate, function(err, candidate){
        if(err) {
            console.log(err);
        } else {
            candidate.voteCount += 1;
            candidate.save(function(err, candidate){
                if(err){
                    console.log(err);
                } else {
                    Voter.findById(req.user._id, function(err, voter){
                        voter.isVoted = true;
                        Candidate.find({}, function(err, candidates){
                            if(err) {
                                console.log(err);
                            } else {
                                candidates.forEach(function(candidate){
                                    voter.candidateData.push(candidate); 
                                })
                                voter.save();
                                vote.addBlock(voter);
                                res.redirect("/votechain/vote/success");
                            }
                        })
                    });
                }
            });
            
        }
    });
    }
    else {
        console.log("You already have voted");
        res.redirect("/votechain/error/voting");
    }

})

// ROUTE FOR RESULTS PAGE
router.get("/votechain/count", function(req, res){
    myBlock.find({}, function(err, blocks){
        if(err) {
            console.log(err);
        } else {
            if(blocks.length === 0) {
                console.log("No one have casted vote.");
                res.redirect("/votechain")
            }
            else {
                res.render("vote_count", {block: blocks[blocks.length - 1].data.candidateData, crrUser: req.user})
                // console.log({block: blocks[blocks.length - 1].data.candidateData});
            }
        }
    })
});

// FUNCTION FOR CHECHING ANY USER IS LOGGED IN OR NOT
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/votechain/login");
}

module.exports = router;