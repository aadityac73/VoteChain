const express = require('express'),
	router = express.Router(),
	Candidate = require('../models/candidate'),
	Voter = require('../models/voter'),
	myBlock = require('../models/b_chain'),
	middleware = require('../middleware');

const { json } = require('body-parser');
const vote = require('../blockchain');

// ROUTE FOR VOTING
router
	.route('/vote')
	.get(
		middleware.isLoggedIn,
		middleware.isNotAdmin,
		async (req, res, next) => {
			try {
				const candidates = await Candidate.find({
					constituency: req.user.constituency
				});
				if (!candidates) {
					req.flash('error', 'No candidates found!!');
					res.redirect('back');
				} else {
					res.render('voter/voting', {
						foundCandidates: candidates
					});
				}
			} catch (error) {
				next(error);
			}
		}
	)
	.post(
		middleware.isLoggedIn,
		middleware.isNotAdmin,
		async (req, res, next) => {
			try {
				if (req.user.isVoted === false) {
					const candidate = await Candidate.findById(
						req.body.candidate
					);
					if (!candidate) {
						req.flash('error', 'Candidate not found!');
					} else {
						candidate.voteCount += 1;
						await candidate.save();
						const voter = await Voter.findById(
							req.user._id
						);
						voter.isVoted = true;
						const candidates = await Candidate.find({});
						candidates.forEach(function(candidate) {
							voter.candidateData.push(candidate);
						});
						await voter.save();
						vote.addBlock(voter);
						req.flash(
							'success',
							'Your Vote has been Added Successfully'
						);
						res.redirect('back');
					}
				} else {
					req.flash('error', 'You already have voted');
					res.redirect('back');
				}
			} catch (error) {
				next(error);
			}
		}
	);

router.get(
	'/candidates',
	middleware.isLoggedIn,
	middleware.isAdmin,
	(req, res) => {
		myBlock.find({}, (err, blocks) => {
			if (err) {
				req.flash('error', 'Something went wrong!');
				res.redirect('back');
			} else {
				if (blocks.length === 0) {
					Candidate.find({}, (err, candidates) => {
						if (err) {
							req.flash('error', 'Something went wrong!');
							res.redirect('back');
						} else {
							res.render('admin/candidates', {
								allCandidates: candidates
							});
						}
					});
				} else {
					res.render('admin/candidates', {
						allCandidates:
							blocks[blocks.length - 1].data.candidateData
					});
				}
			}
		});
	}
);

router.get(
	'/voters',
	middleware.isLoggedIn,
	middleware.isAdmin,
	(req, res) => {
		Voter.find({}, (err, voters) => {
			if (err) {
				req.flash('error', 'Something went wrong!');
				res.redirect('back');
			} else {
				res.render('admin/voters', { voters: voters });
			}
		});
	}
);
//admin route
router
	.route('/candidates/add')
	.get(
		middleware.isLoggedIn,
		middleware.isAdmin,
		middleware.electionNotStarted,
		(req, res) => {
			res.render('admin/addCandidates');
		}
	)
	.post(
		middleware.isLoggedIn,
		middleware.isAdmin,
		middleware.electionNotStarted,
		async (req, res, next) => {
			try {
				const candidate = Candidate.create(
					req.body.candidate
				);
				if (!candidate) {
					req.flash(
						'error',
						'Something went wrong while adding candidate'
					);
					res.redirect('back');
				} else {
					req.flash(
						'success',
						'Candidate Added Successfully'
					);
					res.redirect('back');
				}
			} catch (error) {
				next(error);
			}
		}
	);

router.delete(
	'/candidates/:id',
	middleware.isLoggedIn,
	middleware.isAdmin,
	middleware.electionNotStarted,
	(req, res) => {
		Candidate.findByIdAndRemove(req.params.id, (err) => {
			if (err) {
				req.flash('error', 'Something went wrong!');
				console.log(err);
				res.redirect('back');
			} else {
				req.flash(
					'sucess',
					'Candidate deleted successfully!'
				);
				res.redirect('back');
			}
		});
	}
);

// ROUTE FOR RESULTS PAGE
router.get('/results', async (req, res, next) => {
	try {
		const blocks = await myBlock.find({});
		if (!blocks) {
			req.flash('error', 'No blocks found!');
			res.redirect('back');
		} else {
			if (blocks.length === 0) {
				req.flash('error', 'No one have casted vote.');
				res.redirect('back');
			} else {
				res.render('vote_count', {
					candidates: JSON.stringify(
						blocks[blocks.length - 1].data.candidateData
					)
				});
				// console.log({block: blocks[blocks.length - 1].data.candidateData});
			}
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
