var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/User");

var userController = {};

// Restrict access to root page
userController.home = function (req, res) {
    res.render('index', { user: req.user });
};

// Go to registration page
userController.register = function (req, res) {
    res.render('register');
};

// Post registration
userController.doRegister = function (req, res) {
    User.register(new User({ username: req.body.username, name: req.body.name }), req.body.password, function (err, user) {
        if (err) {
            return res.render('register', { user: user });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
};
var errMsg = "";
// Go to login page
userController.login = function (req, res) {
    if (req.isAuthenticated()) {
        console.log('Is Authenticated')
        res.redirect('/');
    }
    //res.render('login');
    res.render('login', { root: req.session.messages || [] });
};

// Post login
userController.doLogin = function (req, res) {
    passport.authenticate('local', {
        response: res,
        failureRedirect: '/login?err=401',
        failureMessage: "Invalid username or password"
    })(req, res, function () {
        console.log(req.user);
        res.redirect('/');
    });
};

// logout
userController.logout = function (req, res) {
    req.session.destroy(function (err) {
        req.logout();
        res.redirect('/login');
    })
};

module.exports = userController;