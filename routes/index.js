const express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	Voter = require('../models/voter'),
	middleware = require('../middleware'),
	randomString = require('randomstring'),
	mailer = require('../misc/mailer');

const URL = process.env.WEBURL || 'http://localhost:3000/verify';
// ROUTE FOR REGISTRATION PAGE
router
	.route('/register')
	.get(middleware.isNotAuthenticated, (req, res) => {
		res.render('voter/register');
	})
	.post(middleware.isNotAuthenticated, async (req, res, next) => {
		try {
			if (req.body.voter.age >= 18) {
				const user1 = await Voter.findOne({ email: req.body.voter.email });
				const user = await Voter.findOne({ username: req.body.voter.username });
				if (user1) {
					req.flash('error', 'Email is already in use!');
					res.redirect('back');
					return;
				} else if (user) {
					req.flash('error', 'Aadhar number is already in use!');
					res.redirect('back');
					return;
				} else {
					const voter = await Voter.register(new Voter(req.body.voter), req.body.password);
					// GENERATE RANDOM TOKEN FOR OTP
					const secretToken = randomString.generate(6);
					voter.secretToken = secretToken;
					await voter.save();

					// Compose Email
					const html = `Hi there,
                <br/>
                Thank you for registering!
                <br/><br/>
                Please verify your Account by entering the following
                <br/>
                OTP Password: <b>${secretToken}</b>
                <br/>
                On the following page:
                <a href="${URL}">${URL}</a>
                <br/><br/>
                Have a pleasant day.`;

					// Send Email
					mailer.sendEmail('myvotechain@gmail.com', voter.email, 'Please verify your VoteChain Account!', html);
					req.flash('success', 'Registerd successfully, Check your Email');
					res.redirect('/login');
				}
			} else {
				req.flash('error', 'Age must be 18 or above');
				res.redirect('/register');
			}
		} catch (error) {
			next(error);
		}
	});

//ROUTE FOR VERIFY USER
router
	.route('/verify')
	.get(middleware.isNotAuthenticated, (req, res) => {
		res.render('voter/verify');
	})
	.post(middleware.isNotAuthenticated, async (req, res, next) => {
		try {
			const voter = await Voter.findOne({
				secretToken: req.body.secretToken
			});
			if (!voter) {
				req.flash('error', 'No user found!!');
				res.redirect('/verify');
			} else {
				voter.verified = true;
				voter.secretToken = '';
				await voter.save();
				req.flash('success', 'Sucessfully varified!!');
				res.redirect('/login');
			}
		} catch (error) {
			next(error);
		}
	});

// ROUTE FOR LOGIN
router
	.route('/login')
	.get(middleware.isNotAuthenticated, (req, res) => {
		res.render('voter/login');
	})
	.post(
		passport.authenticate('local', {
			failureRedirect: 'back',
			failureFlash: 'Invalid, Username or Password'
		}),
		middleware.isVerified,
		(req, res) => {
			if (req.body.username == 'admin') {
				res.redirect('/candidates');
			} else {
				res.redirect('/vote');
			}
		}
	);

// ROUTE FOR ADMIN LOGIN
router.get('/login/admin', middleware.isNotAuthenticated, (req, res) => {
	res.render('admin/admin_login');
});

// ROUTE FOR LOGOUT USER
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Logged you out!!');
	res.redirect('/');
});

module.exports = router;
