var bodyParser        = require("body-parser"),
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
seedDB                = require("./seed");

// MONGODB CONNECTION
mongoose.connect("mongodb://127.0.0.1:27017/votechain");
seedDB();

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

// CLASS BLOCK REPRESENTS EACH BLOCK INSIDE A BLOCKCHAIN
class Block {
    constructor(index, data, prevHash) {
        this.index = index;
        this.timestamp = Math.floor(Date.now() / 1000);
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.getHash();
    }
    // FUNCTION FOR GENERATING HASH VALUE
    getHash() {
        return hash.sha256().update(JSON.stringify(this.data) + this.prevHash + this.index + this.timestamp).digest('hex');
    }
}

// CLASS BLOCKCHAIN REPRESENTS ENTIRE BLOCKCHAIN
class BlockChain {
    constructor() {
        this.chain = [];
    }
    // FUNCTION FOR ADDING NEW BLOCK
    addBlock(data) {
        let index;
        let prevHash;
        myBlock.find({}, function(err, block){
            if(err) {
                console.log(err);
            } else {
                if(block.length === 0) {
                    index = 0;
                    prevHash = 0;
                } else {
                    // console.log(block[block.length - 1].hash);
                    // console.log(block.length);
                    prevHash = block[block.length - 1].hash;
                    index = block.length;
                }
                let newBlock = new Block(index, data, prevHash);
                myBlock.create(newBlock, function(err, block) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(block);
                    }
                });
                 
            }
            
        });
        
    }
}
function getHash(block) {
    return hash.sha256().update(JSON.stringify(block.data) + block.prevHash + block.index + block.timestamp).digest('hex');
}

// FUNCTION FOR TESTING VALIDITY OF BLOCKCHAIN
function chainIsValid(myBlockchain){
    myBlockchain.find({}, function(err, blocks){
        if(err) {
            console.log(err);
        }
        else {
            for(var i = 0; i < blocks.length; i++){
                if(blocks[i].hash !== getHash(blocks[i])){
                    console.log("Blockchain is Invalid");
                    return false;
                }
                
                if(i > 0 && blocks[i].prevHash !== blocks[i-1].hash){
                    console.log("Blockchain is Invalid");
                    return false;
                }
            }
            console.log("Blockchain is valid");
            return true;
        }
    });
}
// OBJECT FOR CLASS BLOCKCHAIN
const vote = new BlockChain();

// ROOT ROUTE
app.get("/", function(req, res){
    res.redirect("/votechain");
});

// INDEX ROUTE
app.get("/votechain", function(req, res){
    res.render("index",{crrUser: req.user});
});

// ROUTE FOR VOTING PAGE
app.get("/votechain/vote", isLoggedIn, function(req, res){
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
app.post("/votechain/vote", function(req, res){
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

// ROUTE FOR REGISTRATION PAGE
app.get("/votechain/register", function(req, res){
    res.render("register",{crrUser: req.user});
});

// ROUTE FOR REGISTRATION
app.post("/votechain/register", function(req, res){
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

// ROUTE FOR LOGIN PAGE
app.get("/votechain/login", function(req, res){
    res.render("login",{crrUser: req.user});
});

// ROUTE FOR LOGIN
app.post("/votechain/login", passport.authenticate("local", {
    successRedirect: "/votechain/vote",
    failureRedirect: "/votechain/error/login"
}), function(req, res){
});

// ROUTE FOR RESULTS PAGE
app.get("/votechain/count", function(req, res){
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

// ROUTE FOR LOGOUT USER
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/votechain");
});

// FUNCTION FOR CHECHING ANY USER IS LOGGED IN OR NOT
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/votechain/login");
}

// FOR STARTING LOCALHOST SERVER AT PORT 3000
app.listen(3000, function(){
    console.log("Server is running....");
});

// console.log(chainIsValid(myBlock));
