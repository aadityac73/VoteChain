var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    Voter        = require("../models/voter");

// ROOT ROUTE
router.get("/", function(req, res){
    res.redirect("/votechain");
});

// INDEX ROUTE
router.get("/votechain", function(req, res){
    res.render("index",{crrUser: req.user});
});

// ROUTE FOR REGISTRATION PAGE
router.get("/votechain/register", function(req, res){
    res.render("register",{crrUser: req.user});
});

// ROUTE FOR REGISTRATION
router.post("/votechain/register", function(req, res){
    if(req.body.age >= 18) {
        Voter.register(new Voter({username: req.body.aadhar, name:req.body.name, age:req.body.age, gender:req.body.gender, constituency: req.body.constituency}), req.body.password, function(err){
            if(err) {
                console.log(err);
                return res.redirect("/votechain/error/aadhar");
            }
            else {
                res.redirect("/votechain/success");
            }
        });
    }
    else {
        console.log("Age must be 18 or above");
        res.redirect("/votechain/register");
    }  
});

// ROUTE FOR LOGIN PAGE
router.get("/votechain/login", function(req, res){
    res.render("login",{crrUser: req.user});
});

// ROUTE FOR LOGIN
router.post("/votechain/login", passport.authenticate("local", {
    successRedirect: "/votechain/vote",
    failureRedirect: "/votechain/error/login"
}), function(req, res){
});

// ROUTE FOR LOGOUT USER
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/votechain");
});

module.exports = router;