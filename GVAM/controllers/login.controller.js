var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var nodemailer = require('nodemailer');
 
router.get('/', function (req, res) {
    // log user out
    delete req.session.token;
 
    // move success message into local variable so it only appears once (single read)
    var viewData = { success: req.session.success };
    delete req.session.success;
    
    
    if(req.query.expired){
        return res.render('login', {error: 'Your session has expired'});
    }
    else{
        return res.render('login', viewData);
    }
});
 
router.post('/', function (req, res) {
    if (req.body.formType == 'login'){
        // authenticate using api to maintain clean separation between layers
        request.post({
            url: config.apiUrl + '/users/authenticate',
            form: req.body,
            json: true
        }, function (error, response, body) {
            if (error) {
                return res.render('login', { error: 'An error occurred' });
            }
    
            if (!body.token) {
                return res.render('login', { error: 'Username or password is incorrect', username: req.body.username, forgotPassUname: req.body.username });
            }
    
            // save JWT token in the session to make it available to the angular app
            req.session.token = body.token;
    
            // redirect to returnUrl
            var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
            res.redirect(returnUrl);
        });
    }
    else {
        var crypto = require("crypto");
        var tempPass = crypto.randomBytes(4).toString('hex');
        req.body.tempPass = tempPass;
    
        // authenticate using api to maintain clean separation between layers
        request.post({
            url: config.apiUrl + '/users/emailOn',
            form: req.body,
            json: true
        }, function (error, response, body) {
            if (error) {
                return res.render('login', { error: 'An error occurred' });
            }
     
            if (!response.body) {
                return res.render('login', { error: 'username is not registered', username: req.body.username, modal: true });
            }
    
            // return to login page with success message
            req.session.success = 'Email sent';
     
            // redirect to returnUrl
            var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
            res.redirect(returnUrl);
    
    
        });
    }
    
});

 
module.exports = router;