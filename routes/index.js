const express      = require("express"),
      router       = express.Router(),
      passport     = require("passport"),
      Voter        = require("../models/voter"),
      middleware   = require("../middleware"),
      randomString = require("randomstring"),
      mailer       = require("../misc/mailer");

// ROUTE FOR REGISTRATION PAGE
router.route("/register")
    .get(middleware.isNotAuthenticated, (req, res) => {
        res.render("register");
    })
    .post(middleware.isNotAuthenticated, async (req, res, next) => {
    try {
        if(req.body.voter.age >= 18) {
            const voter = await Voter.register(new Voter(req.body.voter), req.body.password)
            if(!voter) {
                req.flash("error", "Something went wrong!");
                res.redirect("back");
            }
            else {
                // GENERATE RANDOM TOKEN FOR OTP
                const secretToken = randomString.generate(6);
                voter.secretToken = secretToken;
                await voter.save();

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
        }
        else {
            req.flash("error","Age must be 18 or above");
            res.redirect("/votechain/register");
        }
    }
    catch(error) {
        next(error);
    }  
    });

//ROUTE FOR VERIFY USER
router.route("/verify")
    .get(middleware.isNotAuthenticated, (req, res) => { 
        res.render("verify");
    })
    .post(middleware.isNotAuthenticated, async (req, res, next) => {
        try{
            const voter = await Voter.findOne({secretToken: req.body.secretToken});
            if(!voter){
                req.flash("error", "No user found!!");
                res.redirect("/votechain/verify");
            } else {
                voter.verified = true;
                voter.secretToken = "";
                await voter.save();
                req.flash("success", "Sucessfully varified!!");
                res.redirect("/votechain/login");
            }
        } catch(error){
            next(error);
        }
    });

// ROUTE FOR LOGIN
router.route("/login")
    .get(middleware.isNotAuthenticated, (req, res) => {
        res.render("login");
    })
    .post(passport.authenticate("local", {
        failureRedirect: "/votechain/login",
        failureFlash: "Invalid, Username or Password"
        }), 
        middleware.isVerified, (req, res) => {
            if(req.body.username == 'admin'){
                res.redirect("/votechain/admin");
            }
            else{
                res.redirect("/votechain/vote");
            }
        });

// ROUTE FOR ADMIN LOGIN
router.get("/login/admin", middleware.isNotAuthenticated, (req, res) => {
    res.render("admin_login");
});

// ROUTE FOR LOGOUT USER
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out!!");
    res.redirect("/");
});

module.exports = router;