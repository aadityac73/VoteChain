var express      = require("express"),
    router       = express.Router(),
    passport     = require("passport"),
    Voter        = require("../models/voter"),
    middleware   = require("../middleware"),
    randomString = require("randomstring"),
    mailer       = require("../misc/mailer");

// INDEX ROUTE
router.get("/", function(req, res){
    res.render("index");
});

// ROUTE FOR REGISTRATION PAGE
router.get("/register", middleware.isNotAuthenticated, function(req, res){
    res.render("register");
});

// ROUTE FOR REGISTRATION
router.post("/register", function(req, res){
    if(req.body.age >= 18) {
        const secretToken = randomString.generate(6);
        Voter.register(new Voter({username: req.body.aadhar, name:req.body.name, email:req.body.email,  secretToken:secretToken, age:req.body.age, gender:req.body.gender, constituency: req.body.constituency}), req.body.password, function(err, voter){
            if(err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
            else {
                // Compose Email
                const html = `Hi there,
                <br/>
                Thank you for registering!
                <br/><br/>
                Please verify your Account by entering the following OTP Password:
                <br/>
                OTP Password: <b>${secretToken}</b>
                <br/>
                On the following page:
                <a href="http://localhost:3000/votechain/verify">http://localhost:3000/votechain/verify</a>
                <br/><br/>
                Have a pleasant day.` 

                // Send Email
                mailer.sendEmail('myvotechain@gmail.com', voter.email, 'Please verify your VoteChain Account!', html);
                req.flash("success", "Registerd successfully, Check your Email");
                res.redirect("/votechain/login");
            }
        });
    }
    else {
        req.flash("error","Age must be 18 or above");
        res.redirect("/votechain/register");
    }  
});

router.get("/verify", middleware.isNotAuthenticated, function(req, res){
    res.render("verify");
});

router.post("/verify", middleware.isNotAuthenticated, function(req, res){
    Voter.findOne({secretToken: req.body.secretToken}, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "No user found!!");
            res.redirect("/votechain/verify");
        } else {
            foundUser.verified = true;
            foundUser.secretToken = "";
            foundUser.save(function(){
                req.flash("success", "Sucessfully varified!!");
                res.redirect("/votechain/login");
            });
        }
    });
});

// ROUTE FOR LOGIN PAGE
router.get("/login", middleware.isNotAuthenticated, function(req, res){
    res.render("login");
});

router.get("/login/admin", middleware.isNotAuthenticated, function(req, res){
    res.render("admin_login");
});

// ROUTE FOR LOGIN
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/votechain/login",
    failureFlash: "Invalid, Username or Password"
}), middleware.isVerified, function(req, res){
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