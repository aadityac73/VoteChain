var middleware = {};

middleware.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/votechain/login");
}

middleware.isAdmin = function(req, res, next){
    if(req.user.username == 'admin') {
        return next();
    }
    req.flash("error", "You are not an admin");
    res.redirect("back");
}

middleware.isNotAdmin = function(req, res, next){
    if(req.user.username != 'admin') {
        return next();
    }
    req.flash("error", "Admin cannot vote");
    res.redirect("back");
}

module.exports = middleware;