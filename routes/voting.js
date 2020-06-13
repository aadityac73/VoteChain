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
            req.flash("error", "No candidates found!!");
            res.redirect("back");
        }
        else {
            res.render("voting",{foundCandidates: candidates});
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
                                req.flash("success", "Your Vote has been Added Successfully");
                                res.redirect("back");
                            }
                        })
                    });
                }
            });
            
        }
    });
    }
    else {
        req.flash("error","You already have voted");
        res.redirect("back");
    }

})

// ROUTE FOR RESULTS PAGE
router.get("/votechain/count", function(req, res){
    myBlock.find({}, function(err, blocks){
        if(err) {
            console.log(err);
        } else {
            if(blocks.length === 0) {
                req.flash("error","No one have casted vote.");
                res.redirect("back")
            }
            else {
                res.render("vote_count", {block: blocks[blocks.length - 1].data.candidateData})
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
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/votechain/login");
}

module.exports = router;