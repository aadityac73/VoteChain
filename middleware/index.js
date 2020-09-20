var myBlock = require('../models/b_chain');

var middleware = {};

middleware.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You need to be logged in to do that');
	res.redirect('/login');
};

middleware.isAdmin = function(req, res, next) {
	if (req.user.username == 'admin') {
		return next();
	}
	req.flash('error', 'You are not an admin');
	res.redirect('back');
};

middleware.isNotAdmin = function(req, res, next) {
	if (req.user.username != 'admin') {
		return next();
	}
	req.flash('error', 'Admin cannot vote');
	res.redirect('back');
};

middleware.isNotAuthenticated = function(req, res, next) {
	if (req.isAuthenticated()) {
		req.flash(
			'error',
			'Sorry, but you are already logged in!'
		);
		res.redirect('back');
	} else {
		return next();
	}
};

middleware.isVerified = function(req, res, next) {
	if (!req.user.verified) {
		req.flash(
			'error',
			'Sorry, but you need to verify your acount first, Check your Email!'
		);
		req.logout();
		return res.redirect('/login');
	}
	return next();
};

middleware.electionNotStarted = async function(
	req,
	res,
	next
) {
	const blocks = await myBlock.find({});
	if (blocks.length > 0) {
		req.flash(
			'error',
			'Sorry, Election has started, You cannot add or remove candidate!'
		);
		return res.redirect('back');
	}
	return next();
};

module.exports = middleware;
