var express = require("express");
var router = express.Router();

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const Feedback = require("../models/feedback");
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
        return res.render("feedbacks/new", { allEmployees: users, success: req.flash("success"), error: req.flash("error") });
    });
    
});

router.post("/", ensureLoggedIn('/users/login'), function (req, res, next) {

    let requestedReviewFrom = req.body["requested-review-from"]
    requestedReviewFrom = Array.isArray(requestedReviewFrom) ? requestedReviewFrom : [requestedReviewFrom]
    const reviewFor = req.body["review-for"]

    const feedback = new Feedback({
        for: reviewFor,
    });

    feedback.save(function (err) {
        if (err) {
            return next(err);
        }
        requestedReviewFrom.forEach(userId => {
            User.findById(userId, function(err, user){
                if(err){
                    return next(err);
                }
                user.requestedFeedback.push(feedback._id)
                user.save()
            })
        });
        req.flash("success", "Performance Review created successfully");
        res.redirect("/feedbacks/");
    });
});

router.get("/", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        return res.redirect("/users/feedbacks");
    }

    Feedback.find({}).populate("for").exec(function (err, reviews) {
        if (err) {
            return next(err);
        }
        return res.render("feedbacks/all", { reviews, success: req.flash("success"), error: req.flash("error") });
    });
    
});

router.get("/:id", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        req.flash("error", "You are not authorized to access this page");
        return res.redirect("/feedbacks");
    }

    const id = req.params.id;

    Feedback.findById(id).populate('for').exec(function (err, review) {
        if (err) {
            return next(err);
        }
        User.find({ isAdmin: false }, function (err, users) {
            if (err) {
                return next(err);
            }
            return res.render("feedbacks/edit", { review, allEmployees: users, success: req.flash("success"), error: req.flash("error") });
        });
    });
    
});

router.post("/:id", ensureLoggedIn('/users/login'), function (req, res, next) {
    if(!req.user.isAdmin){
        req.flash("error", "You are not authorized to access this page");
        return res.redirect("/feedbacks");
    }
    const feedbackId = req.params.id;
    const requestedReviewFrom = req.body["requested-review-from"]
    const reviewFor = req.body["review-for"]
    
    Feedback.findByIdAndUpdate(feedbackId,
        {
            for: reviewFor,
        },
        function (err, review) {
            if (err) {
                return next(err);
            }
        console.log("Executed!")
            
        let requiredBy = Array.isArray(requestedReviewFrom) ? requestedReviewFrom : [requestedReviewFrom]

        requiredBy.forEach(userId=>{
            User.findById(userId, function(err, user){
                if(err){
                    return next(err)
                }
                if(user){
                    const alreadyRequestedFeedback = user.requestedFeedback
                    if(alreadyRequestedFeedback.includes(feedbackId)){
        
                    }else{
                        user.requestedFeedback.push(feedbackId)
                        user.save()
                    }
                }
            })
        })


        req.flash("success", "Your review has been updated successfully!")

        return res.redirect("/feedbacks/")

    });
    
});

module.exports = router;