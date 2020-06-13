var bodyParser            = require("body-parser"),
    hash                  = require("hash.js"),
    passport              = require("passport"),
    mongoose              = require("mongoose"),
    express               = require("express"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Candidate             = require("./models/candidate"),
    Voter                 = require("./models/voter"),
    myBlock               = require("./models/b_chain"),
    app                   = express(),
    seedDB                = require("./seed"),
    chainIsValid          = require("./validity");

var votingRoutes = require("./routes/voting"),
    indexRoutes  = require("./routes");

// MONGODB CONNECTION
mongoose.connect("mongodb://127.0.0.1:27017/votechain");
// seedDB();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "my first blockchain",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Voter.authenticate()));
passport.serializeUser(Voter.serializeUser());
passport.deserializeUser(Voter.deserializeUser());

app.use(votingRoutes);
app.use(indexRoutes);

// ROUTE FOR AADHAR ERROR
app.get("/votechain/error/aadhar", function(req, res){
    res.render("aadharError",{crrUser: req.user});
});

// ROUTE FOR LOGIN ERROR
app.get("/votechain/error/login", function(req, res){
    res.render("loginError",{crrUser: req.user});
});

// ROUTE FOR VOTING ERROR
app.get("/votechain/error/voting", function(req, res){
    res.render("votingError",{crrUser: req.user});
});

// ROUTE FOR SUCCESSFUL REGISTRATION
app.get("/votechain/success", function(req, res){
    res.render("success",{crrUser: req.user});
});

// ROUTE FOR SUCCESSFUL REGISTRATION
app.get("/votechain/vote/success", function(req, res){
    res.render("voteSuccess",{crrUser: req.user});
});

// FOR STARTING LOCALHOST SERVER AT PORT 3000
app.listen(3000, function(){
    console.log("Server is running....");
});

// console.log(chainIsValid());
