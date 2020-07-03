const express     = require("express"),
      router      = express.Router(),
      Candidate   = require("../models/candidate"),
      Voter       = require("../models/voter"),
      myBlock     = require("../models/b_chain"),
      middleware  = require("../middleware");

const vote = require("../blockchain");

// ROUTE FOR VOTING
router.route("/vote")
    .get(middleware.isLoggedIn, middleware.isNotAdmin, async (req, res, next) => {
        try{
            const candidates = await Candidate.find({constituency: req.user.constituency});
            if(!candidates) {
                req.flash("error", "No candidates found!!");
                res.redirect("back");
            }
            else {
                res.render("voting",{foundCandidates: candidates});
            }
        } catch(error){
            next(error);
        }
    })
    .post(middleware.isLoggedIn, middleware.isNotAdmin, async (req, res, next) => {
        try {
            if(req.user.isVoted === false) {
                const candidate = await Candidate.findById(req.body.candidate);
                if(!candidate) {
                    req.flash("error", "Candidate not found!");
                } else {
                    candidate.voteCount += 1;
                    await candidate.save();
                    const voter = await Voter.findById(req.user._id);
                    voter.isVoted = true;
                    const candidates = await Candidate.find({});
                    candidates.forEach(function(candidate){
                        voter.candidateData.push(candidate); 
                    });
                    await voter.save();
                    vote.addBlock(voter);
                    req.flash("success", "Your Vote has been Added Successfully");
                    res.redirect("back");
                }
            }
            else {
                req.flash("error","You already have voted");
                res.redirect("back");
            }
        } catch(error) {
            next(error);
        }
    });

//admin route
router.route("/admin")
    .get(middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
        res.render("addCandidates");
    })
    .post(middleware.isLoggedIn, middleware.isAdmin, async (req, res, next) => {
        try {
            const candidate = Candidate.create(req.body.candidate);
            if(!candidate){
                req.flash("error", "Something went wrong while adding candidate");
                res.redirect("back");
            } else {
                req.flash("success", "Candidate Added Successfully");
                res.redirect("back");
            }
        } catch(error) {
            next(error);
        }
    });

// ROUTE FOR RESULTS PAGE
router.get("/results", async (req, res, next) => {
    try {
        const blocks = await myBlock.find({});
        if(!blocks) {
            req.flash("error","No blocks found!");
            res.redirect("back");
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
    } catch(error) {
            next(error);
        }
});

module.exports = router;