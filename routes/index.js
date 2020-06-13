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
    res.render("index");
});

// ROUTE FOR REGISTRATION PAGE
router.get("/votechain/register", function(req, res){
    res.render("register");
});

// ROUTE FOR REGISTRATION
router.post("/votechain/register", function(req, res){
    if(req.body.age >= 18) {
        Voter.register(new Voter({username: req.body.aadhar, name:req.body.name, age:req.body.age, gender:req.body.gender, constituency: req.body.constituency}), req.body.password, function(err, voter){
            if(err) {
                req.flash("error", "Aadhar number already exists");
                res.redirect("back");
            }
            else {
                req.flash("success", "You have Successfully Registerd to the VoteChain "+voter.name);
                res.redirect("/votechain/login");
            }
        });
    }
    else {
        req.flash("error","Age must be 18 or above");
        res.redirect("/votechain/register");
    }  
});

// ROUTE FOR LOGIN PAGE
router.get("/votechain/login", function(req, res){
    res.render("login");
});

// ROUTE FOR LOGIN
router.post("/votechain/login", passport.authenticate("local", {
    successRedirect: "/votechain/vote",
    failureRedirect: "/votechain/login",
    failureFlash: "Invalid Username or Password"
}), function(req, res){
});

// ROUTE FOR LOGOUT USER
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!!");
    res.redirect("/votechain");
});

module.exports = router;