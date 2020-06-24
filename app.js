var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    flash                 = require("connect-flash"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    Voter                 = require("./models/voter"),
    seedDB                = require("./seed"),
    chainIsValid          = require("./validity");

var votingRoutes = require("./routes/voting"),
    indexRoutes  = require("./routes");

const PORT = process.env.PORT || 3000;

//------------------------- MONGODB CONNECTION -------------------------------
const URI = process.env.DATABASEURL || 'mongodb://127.0.0.1:27017/votechain';
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//----------------------------------------------------------------------------

// seedDB();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

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

app.use(function(req, res, next){
    res.locals.currUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/votechain",votingRoutes);
app.use("/votechain",indexRoutes);

// ROOT ROUTE
app.get("/", function(req, res){
    res.redirect("/votechain");
});

// FOR STARTING LOCALHOST SERVER AT PORT 3000
app.listen(PORT, function(){
    console.log("The VoteChain Server Has Started!");
});

// console.log(chainIsValid());
