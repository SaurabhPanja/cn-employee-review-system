var express = require("express");
var router = express.Router();

const User = require("../models/users");
const passport = require("passport");
const { ensureLoggedIn } = require("connect-ensure-login");

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//list all users
router.get("/", ensureLoggedIn("/users/login"), function (req, res, next) {

  if(!req.user.isAdmin){
    return res.redirect("/feedbacks/");
  }
  User.find({}, function (err, users) {
    if (err) {
      return next(err);
    }
    const success = req.flash("success");
    const error = req.flash("error");
    const currentUser = req.user;
    
    res.render("users/users", { users, currentUser, success: success, error: error });
  });
});


router.get("/login", function (req, res, next) {
  if(req.user){
    req.flash("info", "You are already logged in");
    return res.redirect("/users");
  }
  const success = req.flash("success");
  const error = req.flash("error");

  res.render("users/login", { success: success, error: error });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  function (req, res) {
    req.flash("success", "You have successfully logged in");
    res.redirect("/users");
  }
);

router.get("/signup", function (req, res, next) {
  if(req.user){
    req.flash("info", "You are already logged in");
    return res.redirect("/users");
  }
  const success = req.flash("success");
  const error = req.flash("error");

  res.render("users/signup", { success: success, error: error });
});

router.post("/signup", function (req, res, next) {
  const username = req.body.email;
  const password = req.body.password;
  const name = req.body.name;


  if (!username || !password) {
    req.flash("error", "Please enter all the fields");
    return res.redirect("/users/signup");
  }

  User.register({ username, name  }, password , function (err, user) {
    if (err) {
      return next(err);
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "You have successfully signed up");
      res.redirect("/users");
    });
  });
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post("/:id", function (req, res, next) {
  const id = req.params.id;
  const isAdmin = req.body.isAdmin;

  User.findOneAndUpdate({ _id: id }, { isAdmin: isAdmin }, function (
    err,
    user
  ) {
    if (err) {
      return next(err);
    }
    req.flash("success", "User updated successfully");
    res.redirect("/users");
  }
  );
});

router.post("/:id/delete", function (req, res, next) {
  const id = req.params.id;

  User.findOneAndDelete({ _id: id }, function (
    err,
    user
  ) {
    if (err) {
      return next(err);
    }
    req.flash("error", "User deleted successfully");
    res.redirect("/users");
  }
  );
});

router.get("/feedbacks", ensureLoggedIn("/users/login") ,function (req, res, next) {

  const currentUserId = req.user._id
  User.findById(currentUserId).populate({
    path : 'requestedFeedback',
    populate : {
      path : 'for'
    }
  })
  .exec(function (
    err,
    user
  ) {
    if (err) {
      return next(err);
    }
    const { requestedFeedback } = user;

    return res.render("feedbacks/requested", { requestedFeedback , success: false, error: false })
  }
  );
});


module.exports = router;
