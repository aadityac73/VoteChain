var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    Voter        = require("../models/voter");

// INDEX ROUTE
router.get("/", function(req, res){
    res.render("index");
});

// ROUTE FOR REGISTRATION PAGE
router.get("/register", function(req, res){
    res.render("register");
});

// ROUTE FOR REGISTRATION
router.post("/register", function(req, res){
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
router.get("/login", function(req, res){
    res.render("login");
});

router.get("/login/admin", function(req, res){
    res.render("admin_login");
});

// ROUTE FOR LOGIN
router.post("/login", passport.authenticate("local"), function(req, res){
    if(req.body.username == 'admin'){
        res.redirect("/votechain/admin");
    }
    else{
        res.redirect("/votechain/vote");
    }
});

// ROUTE FOR LOGOUT USER
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!!");
    res.redirect("/votechain");
});

module.exports = router;