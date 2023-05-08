var express = require("express");
var router = express.Router();

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const Feedback = require("../models/feedback");

router.get("/new", ensureLoggedIn('/users/login'), function (req, res, next) {
    res.render("feedbacks/new", { success: req.flash("success"), error: req.flash("error") });
});

router.post("/", ensureLoggedIn('/users/login'), function (req, res, next) {
    const feedback = new Feedback({
        text: req.body.text,
        by: req.user._id,
        to: req.body.to
    });

    feedback.save(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Feedback sent successfully");
        res.redirect("/users");
    });
});

module.exports = router;