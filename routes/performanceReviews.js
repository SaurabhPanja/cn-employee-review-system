var express = require("express");
var router = express.Router();

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const PerformanceReview = require("../models/performanceReview");
const User = require("../models/users");

router.get("/new", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        req.flash("error", "You are not authorized to access this page");
        return res.redirect("/feedbacks");
    }

    User.find({ isAdmin: false }, function (err, users) {
        if (err) {
            return next(err);
        }
        return res.render("performanceReview/new", { allEmployees: users, success: req.flash("success"), error: req.flash("error") });
    });
    
});

router.post("/", ensureLoggedIn('/users/login'), function (req, res, next) {

    const requestedReviewFrom = req.body["requested-review-from"]
    const reviewFor = req.body["review-for"]

    const performanceReview = new PerformanceReview({
        for: reviewFor,
        requiredBy: Array.isArray(requestedReviewFrom) ? requestedReviewFrom : [requestedReviewFrom]
    });

    performanceReview.save(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Performance Review created successfully");
        res.redirect("/performanceReviews/");
    });
});

router.get("/", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        req.flash("error", "You are not authorized to access this page");
        return res.redirect("/feedbacks");
    }

    PerformanceReview.find({}).populate("for").populate("requiredBy").exec(function (err, reviews) {
        if (err) {
            return next(err);
        }
        return res.render("performanceReview/all", { reviews, success: req.flash("success"), error: req.flash("error") });
    });
    
});

router.get("/:id", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        req.flash("error", "You are not authorized to access this page");
        return res.redirect("/feedbacks");
    }

    const id = req.params.id;

    PerformanceReview.findById(id).populate("for").exec(function (err, review) {
        if (err) {
            return next(err);
        }
        User.find({ isAdmin: false }, function (err, users) {
            if (err) {
                return next(err);
            }
            return res.render("performanceReview/edit", { review, allEmployees: users, success: req.flash("success"), error: req.flash("error") });
        });
    });
    
});

router.post("/:id", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        req.flash("error", "You are not authorized to access this page");
        return res.redirect("/feedbacks");
    }

    const id = req.params.id;
    const requestedReviewFrom = req.body["requested-review-from"]
    const reviewFor = req.body["review-for"]

    PerformanceReview.findByIdAndUpdate(id,
        {
            for: reviewFor,
            requiredBy: Array.isArray(requestedReviewFrom) ? requestedReviewFrom : [requestedReviewFrom]
        },
        function (err, review) {
        if (err) {
            return next(err);
        }

        req

    });
    
});


module.exports = router;